import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Title from "../../../../components/Title";
import Button from "../../../../components/ui/Button";
import { AttemptService } from "../../../../services/attempt";
import type { AttemptSummary } from "../../../../types/attempt";

export default function AttemptHistoryPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        AttemptService.getMyAttempts(Number(id)).then(res => {
            if (res.data) setAttempts(res.data);
        }).finally(() => setLoading(false));
    }, [id]);

    return <>
        <div className="flex items-center justify-between">
            <Title title="시험 기록" subTitle="이 문제집으로 본 시험 결과 목록입니다" />
            <Button variant="secondary" onClick={() => navigate(`/workbook/${id}`)}>
                <span className="material-symbols-outlined">arrow_back</span>
                문제집으로
            </Button>
        </div>

        <div className="mt-6 bg-surface-container-lowest rounded-3xl shadow-sm shadow-primary/5 overflow-hidden">
            {loading ? (
                <div className="flex items-center justify-center py-16 gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
                    <p className="text-sm text-on-surface-variant font-semibold">불러오는 중...</p>
                </div>
            ) : attempts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <span className="material-symbols-outlined text-outline text-5xl">history</span>
                    <p className="text-sm text-on-surface-variant font-semibold">시험 기록이 없습니다.</p>
                    <Button variant="primary" onClick={() => navigate(`/attempts?workbookId=${id}`)}>
                        <span className="material-symbols-outlined">play_arrow</span>
                        시험 보기
                    </Button>
                </div>
            ) : (
                <div className="divide-y divide-outline-variant/15">
                    {attempts.map((attempt, idx) => (
                        <button
                            key={attempt.id}
                            onClick={() => navigate(`/workbook/${id}/attempts/${attempt.id}`)}
                            className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors text-left cursor-pointer"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <span className="flex-shrink-0 text-xs font-bold text-on-surface-variant w-6 text-right">
                                    {attempts.length - idx}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-on-surface">
                                        {new Date(attempt.createdAt).toLocaleString('ko-KR', {
                                            year: 'numeric', month: '2-digit', day: '2-digit',
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </p>
                                    <p className="text-xs text-on-surface-variant mt-0.5">
                                        {attempt.questionCount}문제
                                    </p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-outline text-[20px] flex-shrink-0">
                                chevron_right
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    </>;
}
