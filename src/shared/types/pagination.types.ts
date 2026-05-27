export type PaginationMeta = {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
};

export type PaginatedResponse<T> = {
    data: T[];
    meta: PaginationMeta;
};
