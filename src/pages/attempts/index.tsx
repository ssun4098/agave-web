import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import Title from "../../components/Title";
import { WorkbookService } from "../../services/workbook";
// TODO: 서버 구현 후 QuestionService 제거
import { QuestionService } from "../../services/question";
import { AttemptService } from "../../services/attempt";
import type { WorkbookSummary } from "../../types/workbook";
import type { ExamQuestionDetail } from "../../types/attempt";
import SetupPhase from "./SetupPhase";
import ExamPhase from "./ExamPhase";
import ResultPhase from "./ResultPhase";

type Phase = 'setup' | 'loading' | 'exam' | 'result';

type ExamQuestion = ExamQuestionDetail;

function AttemptsPage() {
    const [searchParams] = useSearchParams();
    const [phase, setPhase] = useState<Phase>('setup');

    // Setup
    const [workbooks, setWorkbooks] = useState<WorkbookSummary[]>([]);
    const [selectedWorkbookId, setSelectedWorkbookId] = useState<number | null>(
        searchParams.get('workbookId') ? Number(searchParams.get('workbookId')) : null
    );
    const [order, setOrder] = useState<'sequential' | 'random'>('sequential');
    const [navEnabled, setNavEnabled] = useState(true);

    // Exam
    const [workbookName, setWorkbookName] = useState('');
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const [submittedAt, setSubmittedAt] = useState<Date | null>(null);
    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [inputMode, setInputMode] = useState<'text' | 'mic'>('text');
    const [isRecording, setIsRecording] = useState(false);
    const [interimText, setInterimText] = useState('');
    const [micError, setMicError] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerExpired, setTimerExpired] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        WorkbookService.myList({ page: 0, size: 100 }).then(res => {
            if (res.data) setWorkbooks(res.data.content);
        });
    }, []);

    useEffect(() => {
        if (phase !== 'exam' || questions.length === 0) return;
        const q = questions[currentIndex];
        if (timerRef.current) clearInterval(timerRef.current);
        setTimerExpired(false);
        if (q.limitedMinute > 0) {
            setTimeLeft(q.limitedMinute * 60);
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        setTimerExpired(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            setTimeLeft(0);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [phase, currentIndex, questions]);

    useEffect(() => {
        if (!timerExpired) return;
        setTimerExpired(false);
        alert('제한 시간이 만료되었습니다.');
        setCurrentIndex(prev => {
            if (prev < questions.length - 1) return prev + 1;
            return prev;
        });
        if (currentIndex >= questions.length - 1) {
            submitExam();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timerExpired]);

    const handleStart = async () => {
        if (!selectedWorkbookId) return;
        setPhase('loading');
        const res = await WorkbookService.myDetail(selectedWorkbookId);
        if (!res.data) { setPhase('setup'); return; }

        setWorkbookName(res.data.name);
        let qList = [...res.data.questions].sort((a, b) => a.sortOrder - b.sortOrder);
        if (order === 'random') qList = qList.sort(() => Math.random() - 0.5);

        // TODO: 서버 구현 후 아래 목 블록 전체를 단일 호출로 교체
        // const examRes = await AttemptService.getExamQuestions(selectedWorkbookId);
        // if (!examRes.data) { setPhase('setup'); return; }
        // setWorkbookName(examRes.data.workbookName);
        // let qList = examRes.data.questions;
        // if (order === 'random') qList = [...qList].sort(() => Math.random() - 0.5);
        // setQuestions(qList);
        // ── 목 시작 ──
        const fullQuestions: ExamQuestionDetail[] = await Promise.all(
            qList.map(async q => {
                const qRes = await QuestionService.getMyDetail(q.id);
                const d = qRes.data!;
                return {
                    id: q.id,
                    title: d.title,
                    content: d.content,
                    limitedMinute: d.limitedMinute,
                    sortOrder: q.sortOrder,
                    category: d.category,
                };
            })
        );
        // ── 목 끝 ──

        setQuestions(fullQuestions);
        setAnswers(new Array(fullQuestions.length).fill(''));
        setCurrentIndex(0);
        setInputMode('text');
        setIsRecording(false);
        setPhase('exam');
    };

    const handleAnswerChange = (val: string) => {
        setAnswers(prev => { const next = [...prev]; next[currentIndex] = val; return next; });
    };

    const stopRecording = () => {
        recognitionRef.current?.stop();
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setIsRecording(false);
        setInterimText('');
    };

    const startRecording = async () => {
        setMicError('');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setMicError('이 브라우저는 음성 인식을 지원하지 않습니다.');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
        } catch {
            setMicError('마이크 접근 권한이 필요합니다.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.interimResults = true;
        recognition.continuous = true;
        recognitionRef.current = recognition;

        recognition.onresult = (e: any) => {
            let interim = '';
            let final = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
                const t = e.results[i][0].transcript;
                if (e.results[i].isFinal) final += t;
                else interim += t;
            }
            if (final) {
                handleAnswerChange((answers[currentIndex] ?? '') + final);
            }
            setInterimText(interim);
        };

        recognition.onerror = (e: any) => {
            if (e.error !== 'aborted') setMicError(`오류: ${e.error}`);
            stopRecording();
        };

        recognition.onend = () => {
            setIsRecording(false);
            setInterimText('');
        };

        recognition.start();
        setIsRecording(true);
    };

    const submitExam = async () => {
        stopRecording();
        if (timerRef.current) clearInterval(timerRef.current);
        setSubmittedAt(new Date());

        const res = await AttemptService.submit({
            workbookId: selectedWorkbookId!,
            answers: questions.map((q, i) => ({ questionId: q.id, answer: answers[i] ?? '' })),
        });
        if (res.data) setAttemptId(res.data.id);

        setPhase('result');
    };

    const handleSubmit = () => {
        if (!confirm('시험을 제출하시겠습니까?')) return;
        submitExam();
    };

    const toggleRecording = () => {
        if (isRecording) stopRecording();
        else startRecording();
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const currentQ = questions[currentIndex];
    const isTimeWarning = currentQ?.limitedMinute > 0 && timeLeft > 0 && timeLeft <= 10;

    if (phase === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
                <p className="text-sm text-on-surface-variant font-semibold">문제를 불러오는 중...</p>
            </div>
        );
    }

    if (phase === 'setup') {
        return <>
            <Title title="시험보기" subTitle="문제집을 선택하고 시험을 시작하세요" />
            <SetupPhase
                workbooks={workbooks}
                selectedWorkbookId={selectedWorkbookId}
                setSelectedWorkbookId={setSelectedWorkbookId}
                order={order}
                setOrder={setOrder}
                navEnabled={navEnabled}
                setNavEnabled={setNavEnabled}
                handleStart={handleStart}
            />
        </>;
    }

    if (phase === 'result' && attemptId !== null && submittedAt) {
        return <>
            <Title title="제출 완료" subTitle="시험이 성공적으로 제출되었습니다" />
            <ResultPhase
                attemptId={attemptId}
                workbookName={workbookName}
                submittedAt={submittedAt}
                // TODO: 서버 채점 구현 후 아래 두 props 제거
                mockQuestions={questions}
                mockAnswers={answers}
                onReset={() => {
                    setPhase('setup');
                    setQuestions([]);
                    setAnswers([]);
                    setAttemptId(null);
                    setSubmittedAt(null);
                }}
            />
        </>;
    }

    return (
        <ExamPhase
            questions={questions}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            answers={answers}
            handleAnswerChange={handleAnswerChange}
            inputMode={inputMode}
            setInputMode={setInputMode}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            interimText={interimText}
            micError={micError}
            timeLeft={timeLeft}
            isTimeWarning={isTimeWarning}
            navEnabled={navEnabled}
            toggleRecording={toggleRecording}
            handleSubmit={handleSubmit}
            formatTime={formatTime}
        />
    );
}

export default AttemptsPage;
