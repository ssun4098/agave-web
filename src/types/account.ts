export interface AccountDetail {
    id: number
    email: string
    name: string
    createdAt: string
    avatarLink?: string
}

export interface AccountUpdate {
    name: string
    avatar?: File
}