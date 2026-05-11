import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Title from "../../../../components/Title";
import Button from "../../../../components/ui/Button";
import { AttemptService } from "../../../../services/attempt";
import type { AttemptDetail } from "../../../../types/attempt";

export default function AttemptDetailPage() {
    const { id, attemptId } = useParams();
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        AttemptService.getMyAttempt(Number(attemptId))
            .then(res => { if (res.data) setAttempt(res.data); })
            .finally(() => setLoading(false));
    }, [attemptId]);

    if (loading) return (
        <div className="flex items-center justify-center h-64 gap-3">
            <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
        </div>
    );

    if (!attempt) return null;

    const totalScore = attempt.answers.reduce((sum, a) => sum + a.score, 0);
    const questionCount = attempt.answers.length;
    const avgScore = questionCount > 0 ? totalScore / questionCount : 0;
    const maxScore = questionCount > 0 ? Math.max(...attempt.answers.map(a => a.score)) : 0;
    const minScore = questionCount > 0 ? Math.min(...attempt.answers.map(a => a.score)) : 0;

    const categoryStats = Object.values(
        attempt.answers.reduce<Record<number, { id: number; name: string; icon: string; totalScore: number; total: number }>>(
            (acc, a) => {
                const cat = a.question.category;
                if (!acc[cat.id]) acc[cat.id] = { id: cat.id, name: cat.name, icon: cat.icon, totalScore: 0, total: 0 };
                acc[cat.id].total += 1;
                acc[cat.id].totalScore += a.score;
                return acc;
            },
            {}
        )
    ).sort((a, b) => b.total - a.total);

    const submittedAt = new Date(attempt.createdAt).toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

    const scoreColor = (score: number) => {
        if (score <= 40) return 'bg-error/10 text-error';
        if (score <= 60) return 'bg-yellow-500/10 text-yellow-600';
        if (score <= 80) return 'bg-green-500/10 text-green-600';
        return 'bg-primary/10 text-primary';
    };

    return <>
        <div className="flex items-center justify-between">
            <Title title="시험 결과 상세" subTitle={submittedAt} />
            <Button variant="secondary" onClick={() => navigate(`/workbook/${id}/attempts`)}>
                <span className="material-symbols-outlined">arrow_back</span>
                목록으로
            </Button>
        </div>

        <div className="max-w-5xl mt-6 space-y-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Left: Score Summary */}
                <div className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-6">
                    <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm shadow-primary/5">
                        <h3 className="font-bold text-on-surface mb-5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">grade</span>
                            채점 결과
                        </h3>
                        <div className="flex items-end justify-center gap-1.5 mb-6">
                            <span className="text-6xl font-black text-primary leading-none">{avgScore.toFixed(1)}</span>
                            <span className="text-xl font-bold text-on-surface-variant mb-1">%</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-surface-container-low rounded-2xl px-2 py-4 text-center">
                                <p className="text-xl font-bold text-on-surface">{questionCount}</p>
                                <p className="text-xs text-on-surface-variant mt-1 font-semibold">전체</p>
                            </div>
                            <div className="bg-primary/8 rounded-2xl px-2 py-4 text-center">
                                <p className="text-xl font-bold text-primary">{maxScore.toFixed(1)}%</p>
                                <p className="text-xs text-primary/70 mt-1 font-semibold">최고</p>
                            </div>
                            <div className="bg-surface-container-low rounded-2xl px-2 py-4 text-center">
                                <p className="text-xl font-bold text-on-surface-variant">{minScore.toFixed(1)}%</p>
                                <p className="text-xs text-on-surface-variant mt-1 font-semibold">최저</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Per-question results */}
                <div className="flex-1 min-w-0 bg-surface-container-lowest rounded-3xl shadow-sm shadow-primary/5 overflow-hidden">
                    <div className="px-6 py-5 border-b border-outline-variant/20">
                        <h3 className="font-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">list_alt</span>
                            문제별 채점 결과
                        </h3>
                    </div>
                    <div className="divide-y divide-outline-variant/15">
                        {attempt.answers.map(a => (
                            <div key={a.question.questionId} className="px-6 py-4">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-on-surface">{a.question.title}</p>
                                    <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor(a.score)}`}>
                                        {a.score.toFixed(1)}%
                                    </span>
                                </div>
                                <p className="text-xs text-on-surface-variant mt-1.5">
                                    <span className="font-semibold">내 답변: </span>
                                    {a.answer || <span className="italic opacity-60">미답변</span>}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Category stats */}
            {categoryStats.length > 0 && (
                <div className="bg-surface-container-lowest rounded-3xl shadow-sm shadow-primary/5 overflow-hidden">
                    <div className="px-6 py-5 border-b border-outline-variant/20">
                        <h3 className="font-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">category</span>
                            카테고리별 평균 일치율
                        </h3>
                    </div>
                    <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryStats.map(cat => {
                            const avg = cat.totalScore / cat.total;
                            const colorClass = avg <= 40 ? 'bg-error text-error' : avg <= 60 ? 'bg-yellow-500 text-yellow-600' : avg <= 80 ? 'bg-green-500 text-green-600' : 'bg-primary text-primary';
                            const [bgClass, textClass] = colorClass.split(' ');
                            return (
                                <div key={cat.id} className="bg-surface-container-low rounded-2xl px-5 py-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0">{cat.icon}</span>
                                            <span className="text-sm font-semibold text-on-surface truncate">{cat.name}</span>
                                        </div>
                                        <span className={`flex-shrink-0 text-sm font-black ml-2 ${textClass}`}>
                                            {avg.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${bgClass}`}
                                            style={{ width: `${avg}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-on-surface-variant mt-2 font-semibold">{cat.total}문제</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    </>;
}
