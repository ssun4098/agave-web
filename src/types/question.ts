export interface QuestionCreateRequest {
    title: string
    content: string
    answer: string
    isPublic: boolean
    limitedMinute: number
}

export interface QuestionUpdateRequest {
    title: string
    content: string
    answer: string
    isPublic: boolean
    limitedMinute: number
}

export interface QuestionDetail {
    title: string
    content: string
    answer: string
    isPublic: boolean
    limitedMinute: number
    createdAt: string
    owner: Owner
    category: CategoryInfo
}

export interface MyQuestionSearch {
    title?: string
    categoryIds?: number[]
    page: number
    size: number
}

export interface QuestionSummary {
    id: number
    title: string
    isPublic: boolean
    limitedMinute: number
    createdAt: string
    owner: Owner
    category: CategoryInfo
}

interface Owner {
    id: number
    name: string
}

interface CategoryInfo {
    id: number
    name: string
    icon: string
}