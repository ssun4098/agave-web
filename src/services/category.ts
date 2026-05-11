import { api } from "./api";
import type { CategorySearchRequest, CategoryDetailDto } from "../types/category";
import type { PageResponse } from "../types/common";

const PREFIX = "/categories"

export const CategoryService = {
    getList: (param: CategorySearchRequest) => api.get<PageResponse<CategoryDetailDto>>(`${PREFIX}`, param),
}