import type { PaginatedResponse } from '../../../shared/types/pagination.types';

export type PackageContentType = 'highlight' | 'inclusion' | 'exclusion';

export type PackageContentItem = {
    id: number;
    uuid: string;
    packageId: number;
    package?: {
        id: number;
        uuid: string;
        title: string;
        slug: string;
    };
    text: string;
    displayOrder: number;
};

export type GetPackageContentItemsRequest = {
    page?: number;
    limit?: number;
    packageId?: number;
};

export type GetPackageContentItemsResponse =
    PaginatedResponse<PackageContentItem>;

export type CreatePackageContentItemRequest = {
    packageId: number;
    text: string;
    displayOrder: number;
};

export type UpdatePackageContentItemRequest =
    Partial<CreatePackageContentItemRequest>;

export type UpdatePackageContentItemArgs = {
    uuid: string;
    body: UpdatePackageContentItemRequest;
};

export type DeletePackageContentItemArgs = {
    uuid: string;
};
