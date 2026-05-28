import type { AuthAgency, UserRole } from '../../auth/types/auth.types';
import type { PaginatedResponse } from '../../../shared/types/pagination.types';

export type AgencyUser = {
    id: number;
    uuid: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string | null;
    phoneNumber?: string | null;
    role: UserRole;
    agencyId: number;
    isActive: boolean;
    agency?: Pick<AuthAgency, 'id' | 'uuid' | 'name' | 'slug'>;
    createdAt: string;
    updatedAt: string;
};

export type GetUsersRequest = {
    page?: number;
    limit?: number;
    agencyId?: number;
};

export type GetUsersResponse = PaginatedResponse<AgencyUser>;

export type CreateUserRequest = {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    role?: UserRole;
    agencyId: number;
    isActive?: boolean;
};

export type UpdateUserRequest = Partial<CreateUserRequest>;

export type UpdateUserArgs = {
    uuid: string;
    body: UpdateUserRequest;
};

export type DeleteUserArgs = {
    uuid: string;
};
