import { baseApi } from '../../../shared/api/baseApi';
import type {
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    RefreshResponse,
    SignupAgencyOwnerRequest,
    SignupAgencyOwnerResponse,
} from '../types/auth.types';

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (body) => ({
                url: '/auth/login',
                method: 'POST',
                data: body,
            }),
            invalidatesTags: ['Auth', 'User'],
        }),

        signupAgencyOwner: builder.mutation<
            SignupAgencyOwnerResponse,
            SignupAgencyOwnerRequest
        >({
            query: (body) => ({
                url: '/auth/signup-agency-owner',
                method: 'POST',
                data: body,
            }),
            invalidatesTags: ['Auth', 'User', 'Agency'],
        }),

        refresh: builder.mutation<RefreshResponse, void>({
            query: () => ({
                url: '/auth/refresh',
                method: 'POST',
            }),
            invalidatesTags: ['Auth', 'User'],
        }),

        logout: builder.mutation<LogoutResponse, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            invalidatesTags: ['Auth', 'User'],
        }),
    }),
});

export const {
    useLoginMutation,
    useSignupAgencyOwnerMutation,
    useRefreshMutation,
    useLogoutMutation,
} = authApi;
