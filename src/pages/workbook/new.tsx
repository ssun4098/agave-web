import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import Title from "../../components/Title";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Editor from "../../components/ui/Editor";
import { WorkbookService } from "../../services/workbook";
import { QuestionService } from "../../services/question";
import type { QuestionSummary } from "../../types/question";

export type WorkbookFormInputs = {
    name: string;
    content: string;
    public: boolean;
    questions: number[];
};

export type SelectedQuestion = { id: number; title: string };

const DEFAULT_INPUTS: WorkbookFormInputs = {
    name: '',
    content: '',
    public: true,
    questions: [],
};

const PAGE_SIZE = 10;

type Props = {
    initialInputs?: Partial<WorkbookFormInputs>;
    initialQuestions?: SelectedQuestion[];
    onSubmit?: (inputs: WorkbookFormInputs) => Promise<void> | void;
};

function QuestionSelectPanel({
    selectedIds,
    selectedQuestions,
    onAdd,
    onRemove,
    onReorder,
}: {
    selectedIds: number[];
    selectedQuestions: SelectedQuestion[];
    onAdd: (q: QuestionSummary) => void;
    onRemove: (id: number) => void;
    onReorder: (from: number, to: number) => void;
}) {
    const [search, setSearch] = useState('');
    const [items, setItems] = useState<QuestionSummary[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const pageRef = useRef(0);
    const loadingRef = useRef(false);
    const searchRef = useRef('');
    const dragIndexRef = useRef<number | null>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const load = useCallback(async (page: number, q: string, reset: boolean) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        try {
            const res = await QuestionService.getMyList({ title: q || undefined, page, size: PAGE_SIZE });
            if (res.data) {
                setItems(prev => reset ? res.data!.content : [...prev, ...res.data!.content]);
                setHasMore(!res.data.last);
                pageRef.current = page;
            }
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        searchRef.current = search;
        loadingRef.current = false;
        setItems([]);
        pageRef.current = 0;
        load(0, search, true);
    }, [search, load]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && hasMore && !loadingRef.current) {
                load(pageRef.current + 1, searchRef.current, false);
            }
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, items, load]);

    return (
        <div className="flex flex-col gap-4">
            {/* 선택된 문제 목록 */}
            <div>
                <label className="block text-xs font-bold text-on-surface mb-2">
                    선택된 문제
                    <span className="ml-2 text-primary font-bold">{selectedIds.length}개</span>
                </label>
                {selectedQuestions.length === 0 ? (
                    <div className="bg-surface-container rounded-xl px-4 py-5 text-xs text-on-surface-variant text-center">
                        아래에서 문제를 선택해주세요.
                    </div>
                ) : (
                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                        {selectedQuestions.map((q, idx) => (
                            <div
                                key={q.id}
                                draggable
                                onDragStart={() => { dragIndexRef.current = idx; }}
                                onDragOver={e => { e.preventDefault(); setDragOverIndex(idx); }}
                                onDrop={() => {
                                    if (dragIndexRef.current !== null && dragIndexRef.current !== idx) {
                                        onReorder(dragIndexRef.current, idx);
                                    }
                                    dragIndexRef.current = null;
                                    setDragOverIndex(null);
                                }}
                                onDragEnd={() => { dragIndexRef.current = null; setDragOverIndex(null); }}
                                className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-colors cursor-grab active:cursor-grabbing ${dragOverIndex === idx ? 'bg-primary/15 ring-1 ring-primary/30' : 'bg-primary/5'}`}
                            >
                                <span className="material-symbols-outlined text-[16px] text-outline shrink-0">drag_indicator</span>
                                <span className="text-[10px] font-bold text-primary w-5 text-center shrink-0">{idx + 1}</span>
                                <span className="text-xs font-semibold text-on-surface flex-1 truncate">{q.title}</span>
                                <button
                                    type="button"
                                    onClick={() => onRemove(q.id)}
                                    className="text-error/60 hover:text-error transition-colors shrink-0 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 문제 검색 및 추가 */}
            <div>
                <label className="block text-xs font-bold text-on-surface mb-2">문제 검색</label>
                <div className="relative mb-2">
                    <input
                        className="w-full bg-surface-container-lowest border-0 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold text-on-surface focus:ring-2 focus:ring-primary/20 transition-all shadow-sm placeholder:text-outline-variant outline-none"
                        placeholder="문제 제목 검색..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                </div>
                <div ref={listRef} className="max-h-52 overflow-y-auto bg-surface-container-lowest rounded-xl shadow-sm">
                    {items.length === 0 && !loading && (
                        <p className="text-center text-xs text-outline-variant py-6">검색 결과가 없습니다.</p>
                    )}
                    {items.map(q => {
                        const isSelected = selectedIds.includes(q.id);
                        return (
                            <div
                                key={q.id}
                                className={`flex items-center gap-3 px-4 py-3 border-b border-outline-variant/10 last:border-0 transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-surface-container'}`}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-on-surface truncate">{q.title}</p>
                                    <p className="text-[10px] text-outline-variant mt-0.5">{q.category.icon} {q.category.name}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => isSelected ? onRemove(q.id) : onAdd(q)}
                                    className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${isSelected ? 'bg-error/10 text-error hover:bg-error/20' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                                >
                                    <span className="material-symbols-outlined text-[16px]">{isSelected ? 'remove' : 'add'}</span>
                                </button>
                            </div>
                        );
                    })}
                    {loading && (
                        <div className="flex justify-center py-3">
                            <span className="material-symbols-outlined text-outline animate-spin">progress_activity</span>
                        </div>
                    )}
                    <div ref={sentinelRef} />
                </div>
            </div>
        </div>
    );
}

function WorkbookNew({ initialInputs, initialQuestions, onSubmit }: Props) {
    const isEdit = !!initialInputs;
    const navigate = useNavigate();
    const [inputs, setInputs] = useState<WorkbookFormInputs>({ ...DEFAULT_INPUTS, ...initialInputs });
    const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>(initialQuestions ?? []);

    function set<K extends keyof WorkbookFormInputs>(key: K, value: WorkbookFormInputs[K]) {
        setInputs(prev => ({ ...prev, [key]: value }));
    }

    function handleAddQuestion(q: QuestionSummary) {
        setSelectedQuestions(prev => [...prev, { id: q.id, title: q.title }]);
        setInputs(prev => ({ ...prev, questions: [...prev.questions, q.id] }));
    }

    function handleRemoveQuestion(id: number) {
        setSelectedQuestions(prev => prev.filter(q => q.id !== id));
        setInputs(prev => ({ ...prev, questions: prev.questions.filter(qid => qid !== id) }));
    }

    function handleReorderQuestion(from: number, to: number) {
        setSelectedQuestions(prev => {
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
        });
        setInputs(prev => {
            const next = [...prev.questions];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return { ...prev, questions: next };
        });
    }

    async function handleSubmit() {
        if (!inputs.name.trim()) { alert('제목을 입력해주세요.'); return; }
        if (onSubmit) {
            await onSubmit(inputs);
        } else {
            await WorkbookService.create(inputs);
            alert('성공적으로 등록되었습니다.');
            navigate('/workbook');
        }
    }

    return <>
        <Title title={isEdit ? '문제집 수정' : '문제집 등록'} subTitle="문제를 모아 나만의 문제집을 만들어보세요." />
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-6">
                <div className="flex flex-col gap-2">
                    <label className="block text-xs font-bold text-on-surface px-1">제목</label>
                    <Input inputSize="large" placeholder="문제집 제목을 입력해주세요." type="text" value={inputs.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="block text-xs font-bold text-on-surface px-1">내용</label>
                    <Editor content={inputs.content} onChange={v => set('content', v)} />
                </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-surface-container-low rounded-2xl p-6 space-y-6">
                    {/* 공개 설정 */}
                    <div>
                        <label className="block text-xs font-bold text-on-surface mb-4">공개 설정</label>
                        <div className="flex rounded-xl overflow-hidden bg-surface-container-high p-1 gap-1">
                            <button
                                type="button"
                                onClick={() => set('public', true)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${inputs.public ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                            >
                                <span className="material-symbols-outlined text-[16px]">public</span>
                                공개
                            </button>
                            <button
                                type="button"
                                onClick={() => set('public', false)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${!inputs.public ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                            >
                                <span className="material-symbols-outlined text-[16px]">lock</span>
                                비공개
                            </button>
                        </div>
                    </div>

                    {/* 문제 선택 */}
                    <QuestionSelectPanel
                        selectedIds={inputs.questions}
                        selectedQuestions={selectedQuestions}
                        onAdd={handleAddQuestion}
                        onRemove={handleRemoveQuestion}
                        onReorder={handleReorderQuestion}
                    />

                    {/* 저장/취소 */}
                    <div className="flex flex-col gap-3 pt-2">
                        <Button variant="primary" className="w-full justify-center" onClick={handleSubmit}>
                            <span className="material-symbols-outlined">save</span>
                            저장하기
                        </Button>
                        <Button variant="secondary" className="w-full justify-center" onClick={() => navigate('/workbook')}>
                            <span className="material-symbols-outlined">close</span>
                            취소
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </>;
}

export default WorkbookNew;
