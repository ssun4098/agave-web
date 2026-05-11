export interface CategoryDetailDto {
    categoryId: number;
    name: string;
    icon: string;
    sortOrder: number;
    child: CategoryDetailDto[];
    createdAt: string;
    updatedAt: string;
}

export interface CategorySearchRequest {
    page: number
    size: number
    name?: string
}