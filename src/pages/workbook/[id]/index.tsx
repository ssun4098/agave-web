import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Title from "../../../components/Title";
import Button from "../../../components/ui/Button";
import { WorkbookService } from "../../../services/workbook";
import type { WorkbookDetail } from "../../../types/workbook";

function WorkbookDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [workbook, setWorkbook] = useState<WorkbookDetail | null>(null);

    useEffect(() => {
        WorkbookService.myDetail(Number(id)).then(res => {
            if (res.data) setWorkbook(res.data);
        });
    }, [id]);

    async function handleDelete() {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        await WorkbookService.delete(Number(id));
        navigate('/workbook');
    }

    if (!workbook) return null;

    const sortedQuestions = [...workbook.questions].sort((a, b) => a.sortOrder - b.sortOrder);

    return <>
        <div className="flex items-center justify-between">
            <Title title={workbook.name} subTitle="" />
            <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => navigate('/workbook')}>
                    <span className="material-symbols-outlined">arrow_back</span>
                    뒤로가기
                </Button>
                <Button variant="secondary" onClick={() => navigate(`/workbook/${id}/attempts`)}>
                    <span className="material-symbols-outlined">history</span>
                    시험 기록
                </Button>
                <Button variant="secondary" onClick={() => navigate(`/workbook/${id}/edit`)}>
                    <span className="material-symbols-outlined">edit</span>
                    수정
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                    <span className="material-symbols-outlined">delete</span>
                    삭제
                </Button>
            </div>
        </div>

        {/* 배지 */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${workbook.public ? 'bg-primary/10 text-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                <span className="material-symbols-outlined text-[14px]">{workbook.public ? 'public' : 'lock'}</span>
                {workbook.public ? '공개' : '비공개'}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-surface-container-highest text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">quiz</span>
                {workbook.questions.length}문제
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-surface-container-highest text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                {workbook.createdAt.slice(0, 10).replace(/-/g, '.')}
            </span>
        </div>

        <div className="grid grid-cols-12 gap-8 mt-6">
            {/* 내용 */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
                <div className="bg-surface-container-low rounded-2xl p-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-4">내용</h2>
                    {workbook.content
                        ? <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: workbook.content }} />
                        : <p className="text-sm text-on-surface-variant">내용이 없습니다.</p>
                    }
                </div>
            </div>

            {/* 문제 목록 */}
            <div className="col-span-12 lg:col-span-4">
                <div className="bg-surface-container-low rounded-2xl p-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-4">문제 목록</h2>
                    {sortedQuestions.length === 0 ? (
                        <p className="text-sm text-on-surface-variant text-center py-4">등록된 문제가 없습니다.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {sortedQuestions.map((q, idx) => (
                                <div
                                    key={q.id}
                                    className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3 hover:bg-surface-container-high transition-colors cursor-pointer"
                                    onClick={() => navigate(`/question/${q.id}`)}
                                >
                                    <span className="text-[11px] font-bold text-primary w-5 text-center shrink-0">{idx + 1}</span>
                                    <span className="text-xs font-semibold text-on-surface flex-1 truncate">{q.name}</span>
                                    <span className="material-symbols-outlined text-[16px] text-outline shrink-0">chevron_right</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </>;
}

export default WorkbookDetailPage;
