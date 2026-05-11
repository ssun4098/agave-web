export type AttemptStatus = 'SUBMITTED' | 'GRADING' | 'PASSED' | 'FAILED';

export interface AttemptSummary {
    id: number;
    workbookId: number;
    status: AttemptStatus;
    createdAt: string;
    questionCount: number;
}

// answer 필드 없음 — 네트워크 노출 방지용 시험 전용 타입
export interface ExamQuestionDetail {
    id: number;
    title: string;
    content: string;
    limitedMinute: number;
    sortOrder: number;
    category: {
        id: number;
        name: string;
        icon: string;
    };
}

export interface ExamQuestionsResponse {
    workbookName: string;
    questions: ExamQuestionDetail[];
}

export interface AttemptSubmitRequest {
    workbookId: number;
    answers: AttemptAnswer[];
}

export interface AttemptAnswer {
    questionId: number;
    answer: string;
}

export type GradingStatus = 'SUBMITTED' | 'GRADING' | 'COMPLETED';
export type AnswerGradingStatus = 'PENDING' | 'GRADED';

export interface AttemptDetailQuestion {
    questionId: number;
    title: string;
    content: string;
    answer: string;
    category: {
        id: number;
        name: string;
        icon: string;
    };
}

export interface AttemptDetailAnswer {
    question: AttemptDetailQuestion;
    answer: string;
    score: number;
    status: AnswerGradingStatus;
}

export interface AttemptDetail {
    id: number;
    workbookId: number;
    status: GradingStatus;
    createdAt: string;
    answers: AttemptDetailAnswer[];
}

export interface AttemptResult {
    id: number;
    status: GradingStatus;
    totalScore: number | null;
    maxScore: number | null;
    submittedAt: string;
    gradedAt: string | null;
    questions: AttemptQuestionResult[];
}

export interface AttemptQuestionResult {
    questionId: number;
    title: string;
    correct: boolean;
    score: number;
    maxScore: number;
    myAnswer: string;
    correctAnswer: string;
    category: {
        id: number;
        name: string;
        icon: string;
    };
}
