import type { AuthAgency } from '../../auth/types/auth.types';
import type { PaginatedResponse } from '../../../shared/types/pagination.types';

export type SupplierType =
    | 'HOTEL'
    | 'TRANSPORT'
    | 'GUIDE'
    | 'ACTIVITY_PROVIDER'
    | 'RESTAURANT'
    | 'OTHER';

export type SupplierUiType =
    | 'HOTEL'
    | 'TRANSPORT'
    | 'GUIDE'
    | 'ACTIVITY'
    | 'RESTAURANT'
    | 'OTHER';

export type Supplier = {
    id: number;
    uuid: string;
    agencyId: number;
    name: string;
    type?: SupplierType | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    agency?: Pick<AuthAgency, 'id' | 'uuid' | 'name' | 'slug'>;
    createdAt: string;
    updatedAt: string;
};

export type GetSuppliersRequest = {
    page?: number;
    limit?: number;
    agencyId?: number;
    type?: SupplierType;
    name?: string;
};

export type GetSuppliersResponse = PaginatedResponse<Supplier>;

export type CreateSupplierRequest = {
    agencyId: number;
    name: string;
    type?: SupplierType | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
};

export type UpdateSupplierRequest = Partial<CreateSupplierRequest>;

export type UpdateSupplierArgs = {
    uuid: string;
    body: UpdateSupplierRequest;
};

export type DeleteSupplierArgs = {
    uuid: string;
};
