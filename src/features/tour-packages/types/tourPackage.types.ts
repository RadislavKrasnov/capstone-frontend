import type { AuthAgency } from '../../auth/types/auth.types';
import type { PaginatedResponse } from '../../../shared/types/pagination.types';

export type PackageStatus = 'DRAFT' | 'ANALYZED' | 'PUBLISHED' | 'ARCHIVED';

export type TourPackage = {
    id: number;
    uuid: string;
    agencyId: number;
    title: string;
    slug: string;
    description?: string | null;
    destinationCountry?: string | null;
    destinationCity?: string | null;
    durationDays: number;
    expectedGroupSize: number;
    sellingPricePerPerson: number;
    currencyCode: string;
    status: PackageStatus;
    internalNotes?: string | null;
    agency?: Pick<AuthAgency, 'id' | 'uuid' | 'name' | 'slug'>;
    createdAt: string;
    updatedAt: string;
};

export type GetTourPackagesRequest = {
    page?: number;
    limit?: number;
    agencyId?: number;
};

export type GetTourPackagesResponse = PaginatedResponse<TourPackage>;

export type CreateTourPackageRequest = {
    agencyId: number;
    title: string;
    slug: string;
    description?: string;
    destinationCountry?: string;
    destinationCity?: string;
    durationDays: number;
    expectedGroupSize: number;
    sellingPricePerPerson: number;
    currencyCode?: string;
    status?: PackageStatus;
    internalNotes?: string;
};

export type UpdateTourPackageRequest = Partial<CreateTourPackageRequest>;

export type UpdateTourPackageArgs = {
    uuid: string;
    body: UpdateTourPackageRequest;
};

export type DeleteTourPackageArgs = {
    uuid: string;
};
