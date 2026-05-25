export type UserRole = 'MANAGER' | 'OWNER';

export type AuthUser = {
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
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type AuthAgency = {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    phoneNumber: string | null;
    website: string | null;
    country: string | null;
    city: string | null;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type LoginResponse = {
    accessToken: string;
    user: AuthUser;
};

export type SignupAgencyOwnerRequest = {
    agency: {
        name: string;
        slug: string;
        phoneNumber?: string;
        website?: string;
        country?: string;
        city?: string;
    };
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    phoneNumber?: string;
};

export type SignupAgencyOwnerResponse = {
    accessToken: string;
    user: AuthUser;
    agency: AuthAgency;
};

export type RefreshResponse = LoginResponse;

export type LogoutResponse = {
    message: string;
};
