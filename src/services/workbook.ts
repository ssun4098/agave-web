import { api } from "./api";
import type { CommonResponse, PageResponse } from "../types/common";
import type { WorkbookCreateRequest, WorkbookUpdateRequest, WorkbookDetail, MyWorkbookSearch, WorkbookSummary } from "../types/workbook";

const PREFIX = '/workbooks';

export const WorkbookService = {
    create: (body: WorkbookCreateRequest) => api.post<CommonResponse<WorkbookDetail>>(`${PREFIX}`, body),
    update: (id: number, body: WorkbookUpdateRequest) => api.patch<CommonResponse<WorkbookDetail>>(`${PREFIX}/${id}`, body),
    delete: (id: number) => api.delete<CommonResponse<null>>(`${PREFIX}/${id}`),
    myList: (param: MyWorkbookSearch) => api.get<CommonResponse<PageResponse<WorkbookSummary>>>(`${PREFIX}/me`, param),
    myDetail: (id: number) => api.get<CommonResponse<WorkbookDetail>>(`${PREFIX}/me/${id}`)
}