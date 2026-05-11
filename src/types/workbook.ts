export interface WorkbookCreateRequest {
    name: string
    content: string
    questions: number[]
    public: boolean
}

export interface WorkbookUpdateRequest {
    name: string
    content: string
    questions: number[]
    public: boolean
}

export interface WorkbookSummary {
    id: number
    name: string
    public: boolean
    questionCount: number
    createdAt: string
}

export interface WorkbookDetail {
    id: number
    name: string
    content: string
    public: boolean
    createdAt: string
    questions: Question[]
}

export interface MyWorkbookSearch {
    title?: string
    page: number
    size: number
}

interface Question {
    id: number
    name: string
    sortOrder: number
}