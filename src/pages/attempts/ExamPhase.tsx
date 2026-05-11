import Button from "../../components/ui/Button";
import type { ExamQuestionDetail } from "../../types/attempt";

type ExamQuestion = ExamQuestionDetail;

interface Props {
    questions: ExamQuestion[];
    currentIndex: number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
    answers: string[];
    handleAnswerChange: (val: string) => void;
    inputMode: 'text' | 'mic';
    setInputMode: (mode: 'text' | 'mic') => void;
    isRecording: boolean;
    setIsRecording: (v: boolean) => void;
    interimText: string;
    micError: string;
    timeLeft: number;
    isTimeWarning: boolean;
    navEnabled: boolean;
    toggleRecording: () => void;
    handleSubmit: () => void;
    formatTime: (secs: number) => string;
}

export default function ExamPhase({
    questions,
    currentIndex,
    setCurrentIndex,
    answers,
    handleAnswerChange,
    inputMode,
    setInputMode,
    isRecording,
    setIsRecording,
    interimText,
    micError,
    timeLeft,
    isTimeWarning,
    navEnabled,
    toggleRecording,
    handleSubmit,
    formatTime,
}: Props) {
    const currentQ = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="max-w-3xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-on-surface-variant">진행률</span>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">
                        {currentIndex + 1} / {questions.length}
                    </span>
                </div>
                {currentQ?.limitedMinute > 0 && (
                    <div className={`flex items-center gap-2 font-mono font-bold text-xl transition-colors ${isTimeWarning ? 'text-red-500 animate-pulse' : 'text-on-surface'}`}>
                        <span className="material-symbols-outlined text-[20px]">timer</span>
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Question Card */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm shadow-primary/5">
                <div className="mb-5">
                    <h2 className="text-lg font-bold text-on-surface leading-relaxed">
                        {currentQ?.title}
                    </h2>
                </div>
                {currentQ?.content && (
                    <p className="text-sm text-on-surface-variant leading-relaxed bg-surface-container-low rounded-2xl px-5 py-4">
                        {currentQ.content}
                    </p>
                )}
            </div>

            {/* Answer */}
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm shadow-primary/5">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-on-surface-variant">답변 입력</span>
                    <div className="flex gap-2">
                        {(['text', 'mic'] as const).map(mode => (
                            <button
                                key={mode}
                                onClick={() => { setInputMode(mode); setIsRecording(false); }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer
                                    ${inputMode === mode ? 'bg-primary text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
                            >
                                <span className="material-symbols-outlined text-[15px]">
                                    {mode === 'text' ? 'edit' : 'mic'}
                                </span>
                                {mode === 'text' ? '작성' : '마이크'}
                            </button>
                        ))}
                    </div>
                </div>

                {inputMode === 'text' ? (
                    <textarea
                        className="w-full h-32 px-4 py-3 rounded-2xl bg-surface-container-low text-on-surface text-sm resize-none outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                        placeholder="답변을 입력하세요..."
                        value={answers[currentIndex] ?? ''}
                        onChange={e => handleAnswerChange(e.target.value)}
                    />
                ) : (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <button
                            onClick={toggleRecording}
                            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer
                                ${isRecording
                                    ? 'bg-red-500 text-white shadow-red-500/30 scale-110 animate-pulse'
                                    : 'bg-primary text-white shadow-primary/30 hover:scale-105'
                                }`}
                        >
                            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                                {isRecording ? 'stop_circle' : 'mic'}
                            </span>
                        </button>
                        <p className="text-sm text-on-surface-variant">
                            {isRecording ? '녹음 중... 클릭하여 중지' : '클릭하여 녹음 시작'}
                        </p>
                        {micError && (
                            <p className="text-xs text-red-500 font-semibold">{micError}</p>
                        )}
                        {(answers[currentIndex] || interimText) && (
                            <div className="w-full rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface leading-relaxed">
                                <span>{answers[currentIndex]}</span>
                                {interimText && (
                                    <span className="text-on-surface-variant opacity-60 italic">{interimText}</span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pb-8">
                <Button
                    variant="secondary"
                    disabled={!navEnabled || currentIndex === 0}
                    onClick={() => setCurrentIndex(i => i - 1)}
                >
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        이전
                    </span>
                </Button>

                {currentIndex < questions.length - 1 ? (
                    <Button
                        variant="secondary"
                        disabled={!navEnabled}
                        onClick={() => setCurrentIndex(i => i + 1)}
                    >
                        <span className="flex items-center gap-1">
                            다음
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </span>
                    </Button>
                ) : (
                    <Button variant="primary" onClick={handleSubmit}>
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            제출하기
                        </span>
                    </Button>
                )}
            </div>
        </div>
    );
}
