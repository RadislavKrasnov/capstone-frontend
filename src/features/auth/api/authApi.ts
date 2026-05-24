import { baseApi } from '../../../shared/api/baseApi';
import type {
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    RefreshResponse,
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
    useRefreshMutation,
    useLogoutMutation,
} = authApi;
