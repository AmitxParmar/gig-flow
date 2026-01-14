export interface ApiResponse<T> {
    message: string
    data: T
}

export interface PaginationMeta {
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface PaginatedApiResponse<T> extends ApiResponse<T> {
    pagination: PaginationMeta
}