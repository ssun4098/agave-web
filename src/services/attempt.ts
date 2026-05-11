import { api } from "./api";
import type { CommonResponse } from "../types/common";
import type { AttemptSubmitRequest, AttemptResult, AttemptSummary, AttemptDetail, ExamQuestionsResponse } from "../types/attempt";

const PREFIX = '/attempts';

export const AttemptService = {
    // 시험용 문제 조회 — answer 미포함, 서버에서 정렬 순서 포함하여 반환
    getExamQuestions: (workbookId: number) =>
        api.get<CommonResponse<ExamQuestionsResponse>>(`${PREFIX}/workbooks/${workbookId}/questions`),
    submit: (body: AttemptSubmitRequest) =>
        api.post<CommonResponse<{ id: number }>>(`${PREFIX}`, body),
    getResult: (id: number) =>
        api.get<CommonResponse<AttemptResult>>(`${PREFIX}/${id}`),
    getMyAttempts: (workbookId: number) =>
        api.get<CommonResponse<AttemptSummary[]>>(`${PREFIX}/me`, { workbookId }),
    getMyAttempt: (attemptId: number) =>
        api.get<CommonResponse<AttemptDetail>>(`${PREFIX}/me/${attemptId}`),
};
