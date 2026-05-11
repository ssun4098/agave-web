import { useEffect, useRef, useState } from "react";
import Button from "../../components/ui/Button";
// TODO: 서버 구현 후 아래 주석 해제
// import { AttemptService } from "../../services/attempt";
import type { AttemptDetail, ExamQuestionDetail } from "../../types/attempt";

interface Props {
    attemptId: number;
    workbookName: string;
    submittedAt: Date;
    // TODO: 서버 구현 후 아래 두 props 제거
    mockQuestions?: ExamQuestionDetail[];
    mockAnswers?: string[];
    onReset: () => void;
}

export default function ResultPhase({ attemptId, workbookName, submittedAt, mockQuestions, mockAnswers, onReset }: Props) {
    const [result, setResult] = useState<AttemptDetail | null>(null);
    const [error, _setError] = useState(''); // TODO: 서버 구현 후 _setError 사용
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // TODO: 서버 구현 후 아래 목 블록 제거하고 그 아래 실제 호출 활성화
        // ── 목 시작 ──────────────────────────────────────────────────
        const mockTimer = setTimeout(() => {
            const questions = mockQuestions ?? [];
            const answers = mockAnswers ?? [];
            setResult({
                id: attemptId,
                workbookId: 0,
                status: 'COMPLETED',
                createdAt: submittedAt.toISOString(),
                answers: questions.map((q, i) => {
                    const answer = answers[i] ?? '';
                    return {
                        question: {
                            questionId: q.id,
                            title: q.title,
                            content: q.content,
                            answer: '',
                            category: q.category,
                        },
                        answer,
                        score: 0,
                        status: 'PENDING' as const,
                    };
                }),
            });
        }, 2500);
        return () => {
            clearTimeout(mockTimer);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
        // ── 목 끝 ────────────────────────────────────────────────────

        // TODO: 서버 구현 후 위 목 블록 제거 후 아래 활성화
        // const fetch = async () => {
        //     try {
        //         const res = await AttemptService.getMyAttempt(attemptId);
        //         if (res.data) setResult(res.data);
        //     } catch {
        //         setError('채점 결과를 불러오는 중 오류가 발생했습니다.');
        //         if (intervalRef.current) clearInterval(intervalRef.current);
        //     }
        // };
        // fetch();
        // intervalRef.current = setInterval(fetch, 3000);
        // return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attemptId]);

    const isGrading = !result || result.status === 'SUBMITTED' || result.status === 'GRADING';

    const totalScore = result?.answers.reduce((sum, a) => sum + a.score, 0) ?? 0;
    const questionCount = result?.answers.length ?? 0;
    const avgScore = questionCount > 0 ? totalScore / questionCount : 0;
    const maxScore = result ? Math.max(...result.answers.map(a => a.score)) : 0;
    const minScore = result ? Math.min(...result.answers.map(a => a.score)) : 0;

    const categoryStats = result
        ? Object.values(
            result.answers.reduce<Record<number, { id: number; name: string; icon: string; totalScore: number; total: number }>>(
                (acc, a) => {
                    const cat = a.question.category;
                    if (!cat) return acc;
                    if (!acc[cat.id]) acc[cat.id] = { id: cat.id, name: cat.name, icon: cat.icon, totalScore: 0, total: 0 };
                    acc[cat.id].total += 1;
                    acc[cat.id].totalScore += a.score;
                    return acc;
                },
                {}
            )
        ).sort((a, b) => b.total - a.total)
        : [];

    const scoreColor = (score: number) => {
        if (score <= 40) return 'bg-error/10 text-error';
        if (score <= 60) return 'bg-yellow-500/10 text-yellow-600';
        if (score <= 80) return 'bg-green-500/10 text-green-600';
        return 'bg-primary/10 text-primary';
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header — full width */}
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm shadow-primary/5">
                <div className="flex items-center gap-3">
                    <span className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span
                            className="material-symbols-outlined text-primary text-2xl"
                            style={{ fontVariationSettings: '"FILL" 1' }}
                        >
                            task_alt
                        </span>
                    </span>
                    <div>
                        <h2 className="font-bold text-on-surface text-lg">{workbookName}</h2>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                            제출 시각:{' '}
                            {submittedAt.toLocaleString('ko-KR', {
                                year: 'numeric', month: '2-digit', day: '2-digit',
                                hour: '2-digit', minute: '2-digit', second: '2-digit',
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Grading / Result */}
            {error ? (
                <div className="bg-error/5 rounded-3xl p-8 flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-error text-4xl">error</span>
                    <p className="text-sm font-semibold text-error">{error}</p>
                    <Button variant="secondary" onClick={onReset}>처음으로</Button>
                </div>
            ) : isGrading ? (
                <div className="bg-surface-container-lowest rounded-3xl p-12 shadow-sm shadow-primary/5 flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                    <p className="font-bold text-on-surface">채점 중...</p>
                    <p className="text-sm text-on-surface-variant">잠시만 기다려 주세요.</p>
                </div>
            ) : (
                <>
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Left: Score Summary */}
                    <div className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-6 space-y-4">
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

                        <Button
                            variant="secondary"
                            className="w-full !py-3.5 flex items-center justify-center gap-2"
                            onClick={onReset}
                        >
                            <span className="material-symbols-outlined text-[18px]">refresh</span>
                            처음으로
                        </Button>
                    </div>

                    {/* Right: Per-question results */}
                    <div className="flex-1 min-w-0 bg-surface-container-lowest rounded-3xl shadow-sm shadow-primary/5 overflow-hidden">
                        <div className="px-6 py-5 border-b border-outline-variant/20">
                            <h3 className="font-bold text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[20px]">list_alt</span>
                                문제별 채점 결과
                            </h3>
                        </div>
                        <div className="divide-y divide-outline-variant/15 max-h-[70vh] overflow-y-auto">
                            {result!.answers.map((a) => (
                                <div key={a.question.questionId} className="px-6 py-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold text-on-surface">
                                            {a.question.title}
                                        </p>
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
                {/* Category accuracy — full width */}
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
                                        <p className="text-xs text-on-surface-variant mt-2 font-semibold">
                                            {cat.total}문제
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                </>
            )}
        </div>
    );
}
