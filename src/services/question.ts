import { api } from "./api";
import type { QuestionCreateRequest, QuestionUpdateRequest, QuestionDetail, MyQuestionSearch, QuestionSummary } from "../types/question";
import type { CommonResponse, PageResponse } from "../types/common";

const PREFIX = '/questions'

export const QuestionService =  {
    create: (body: QuestionCreateRequest) => api.post<CommonResponse<QuestionDetail>>(`${PREFIX}`, body),
    update: (id: number, body: QuestionUpdateRequest) => api.patch<CommonResponse<QuestionDetail>>(`${PREFIX}/${id}`, body),
    getMyList: (param: MyQuestionSearch) => api.get<CommonResponse<PageResponse<QuestionSummary>>>(`${PREFIX}/me`, param),
    getMyDetail: (id: number) => api.get<CommonResponse<QuestionDetail>>(`${PREFIX}/me/${id}`),
    delete: (id: number) => api.delete<CommonResponse<null>>(`${PREFIX}/${id}`)
}
