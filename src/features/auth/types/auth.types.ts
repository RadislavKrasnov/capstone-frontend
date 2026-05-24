export type UserRole = 'MANAGER' | 'OWNER';

export type AuthUser = {
    id: number;
    uuid: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string | null;
    phoneNumber: string | null;
    role: UserRole;
    agencyId: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type LoginResponse = {
    accessToken: string;
    user: AuthUser;
};

export type RefreshResponse = LoginResponse;

export type LogoutResponse = {
    message: string;
};