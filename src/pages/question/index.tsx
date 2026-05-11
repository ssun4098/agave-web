import { useState, useRef, useEffect } from "react";
import Title from "../../components/Title";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Table from "../../components/ui/Table";
import { QuestionService } from "../../services/question";
import { CategoryService } from "../../services/category";
import type { QuestionSummary } from "../../types/question";
import type { CategoryDetailDto } from "../../types/category";

const SORT_OPTIONS = ['최신순', '오래된순', '인기순', '가나다순'];
const PAGE_SIZE = 10;

function CategoryTreeItem({
    item,
    selected,
    onToggle,
}: {
    item: CategoryDetailDto;
    selected: Set<number>;
    onToggle: (id: number) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = item.child?.length > 0;
    const checked = selected.has(item.categoryId);

    return (
        <div>
            <div className="flex items-center gap-2 px-4 py-2.5 hover:bg-surface-container-low rounded-xl cursor-pointer"
                onClick={() => onToggle(item.categoryId)}
            >
                <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors
                    ${checked ? 'bg-primary border-primary' : 'border-outline-variant bg-surface-container-lowest'}`}>
                    {checked && <span className="material-symbols-outlined text-white text-[12px]">check</span>}
                </div>
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="text-sm font-semibold text-on-surface flex-1">{item.name}</span>
                {hasChildren && (
                    <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
                        className="p-0.5 text-outline hover:text-on-surface transition-colors"
                    >
                        <span className={`material-symbols-outlined text-[18px] transition-transform ${expanded ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>
                )}
            </div>
            {hasChildren && expanded && (
                <div className="ml-6 border-l border-outline-variant/20 pl-2">
                    {item.child.map(child => (
                        <CategoryTreeItem key={child.categoryId} item={child} selected={selected} onToggle={onToggle} />
                    ))}
                </div>
            )}
        </div>
    );
}

function filterCategories(categories: CategoryDetailDto[], query: string): CategoryDetailDto[] {
    if (!query) return categories;
    const q = query.toLowerCase();
    return categories.reduce<CategoryDetailDto[]>((acc, cat) => {
        const matchedChildren = (cat.child ?? []).filter(c => c.name.toLowerCase().includes(q));
        if (cat.name.toLowerCase().includes(q)) {
            acc.push({ ...cat, child: cat.child ?? [] });
        } else if (matchedChildren.length > 0) {
            acc.push({ ...cat, child: matchedChildren });
        }
        return acc;
    }, []);
}

function CategoryModal({
    categories,
    initial,
    onApply,
    onClose,
}: {
    categories: CategoryDetailDto[];
    initial: Set<number>;
    onApply: (ids: Set<number>) => void;
    onClose: () => void;
}) {
    const [selected, setSelected] = useState<Set<number>>(new Set(initial));
    const [search, setSearch] = useState('');

    function toggle(id: number) {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function reset() {
        setSelected(new Set());
    }

    const filtered = filterCategories(categories, search);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative bg-surface-container-lowest rounded-3xl shadow-xl w-full max-w-md mx-4 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/20">
                    <h2 className="font-bold text-on-surface text-base">카테고리 선택</h2>
                    <button type="button" onClick={onClose} className="text-outline hover:text-on-surface transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 pt-3 pb-1">
                    <div className="relative">
                        <input
                            autoFocus
                            type="text"
                            placeholder="카테고리 검색..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-surface-container border-0 rounded-xl py-2.5 pl-9 pr-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant outline-none"
                        />
                        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                    </div>
                </div>

                {/* Tree */}
                <div className="overflow-y-auto max-h-80 p-3">
                    {filtered.length === 0 && (
                        <p className="text-center text-sm text-outline-variant py-8">검색 결과가 없습니다.</p>
                    )}
                    {filtered.map(cat => (
                        <CategoryTreeItem key={cat.categoryId} item={cat} selected={selected} onToggle={toggle} />
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/20">
                    <button type="button" onClick={reset} className="text-xs font-semibold text-outline hover:text-on-surface transition-colors">
                        초기화
                    </button>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={onClose}>취소</Button>
                        <Button variant="primary" onClick={() => onApply(selected)}>
                            적용 {selected.size > 0 && `(${selected.size})`}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Index() {
    const [sortOpen, setSortOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState('최신순');
    const sortRef = useRef<HTMLDivElement>(null);

    const [categories, setCategories] = useState<CategoryDetailDto[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const [items, setItems] = useState<QuestionSummary[]>([]);
    const [page, setPage] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTitle, setSearchTitle] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        CategoryService.getList({ page: 0, size: 100 }).then(res => {
            if (res) setCategories(res.content);
        });
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
                setSortOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const categoryIds = selectedIds.size > 0 ? Array.from(selectedIds) : undefined;
        QuestionService.getMyList({ title: searchTitle || undefined, categoryIds, page: page - 1, size: PAGE_SIZE })
            .then(res => {
                if (res.data) {
                    setItems(res.data.content);
                    setTotalElements(res.data.totalElements);
                    setTotalPages(res.data.totalPages);
                }
            });
    }, [page, searchTitle, selectedIds, refreshKey]);

    // 선택된 id → 이름 매핑 (children 포함)
    function findLabel(id: number): string {
        for (const cat of categories) {
            if (cat.categoryId === id) return `${cat.icon} ${cat.name}`;
            for (const child of cat.child ?? []) {
                if (child.categoryId === id) return `${child.icon} ${child.name}`;
            }
        }
        return String(id);
    }

    function removeId(id: number) {
        setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
        setPage(1);
    }

    function handleApply(ids: Set<number>) {
        setSelectedIds(ids);
        setModalOpen(false);
        setPage(1);
    }

    const actions = <>
        <Button variant="secondary">엑셀 다운로드</Button>
        <Button variant="primary">대량 등록</Button>
    </>

    return <>
        <Title title="질문 관리" subTitle="등록된 질문 목록입니다" actions={actions} />
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Input wrapperClassName="flex-1" icon="search" placeholder="제목으로 검색..." type="text" value={searchTitle} onChange={e => { setSearchTitle(e.target.value); setPage(1); }} />
            <div ref={sortRef} className="relative">
              <div
                onClick={() => setSortOpen(v => !v)}
                className="bg-surface-container-low px-6 py-4 rounded-2xl flex items-center justify-between min-w-[180px] shadow-sm shadow-primary/5 cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <div className="flex flex-col">
                  <label className="text-[10px] uppercase tracking-wider text-outline font-bold leading-none mb-1">정렬 기준</label>
                  <span className="text-on-surface font-bold text-sm leading-none">{selectedSort}</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant ml-4">
                  {sortOpen ? 'expand_less' : 'expand_more'}
                </span>
              </div>
              {sortOpen && (
                <div className="absolute right-0 mt-2 w-full bg-surface-container rounded-2xl shadow-lg overflow-hidden z-10">
                  {SORT_OPTIONS.map(option => (
                    <div
                      key={option}
                      onClick={() => { setSelectedSort(option); setSortOpen(false); }}
                      className={`px-6 py-3 text-sm font-semibold cursor-pointer transition-colors
                        ${option === selectedSort
                          ? 'text-primary bg-primary/5'
                          : 'text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">카테고리</label>
            <div className="flex items-center gap-2 flex-wrap">
                <Button variant="secondary" onClick={() => setModalOpen(true)}>
                    <span className="material-symbols-outlined text-[18px]">category</span>
                    카테고리 선택
                    {selectedIds.size > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold leading-none">
                            {selectedIds.size}
                        </span>
                    )}
                </Button>
                {Array.from(selectedIds).map(id => (
                    <span key={id} className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                        {findLabel(id)}
                        <button type="button" onClick={() => removeId(id)} className="hover:text-error transition-colors">
                            <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                    </span>
                ))}
            </div>
          </div>
        </div>

        <Table
            items={items}
            totalElements={totalElements}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onRefresh={() => setRefreshKey(k => k + 1)}
        />

        {modalOpen && (
            <CategoryModal
                categories={categories}
                initial={selectedIds}
                onApply={handleApply}
                onClose={() => setModalOpen(false)}
            />
        )}
    </>
}

export default Index;
