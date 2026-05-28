import { baseApi } from '../../../shared/api/baseApi';
import type {
    AgencyUser,
    CreateUserRequest,
    DeleteUserArgs,
    GetUsersRequest,
    GetUsersResponse,
    UpdateUserArgs,
} from '../types/user.types';

export const usersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query<GetUsersResponse, GetUsersRequest>({
            query: (params) => ({
                url: '/users',
                method: 'GET',
                params: {
                    page: params.page ?? 1,
                    limit: params.limit ?? 100,
                    agencyId: params.agencyId,
                },
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map((user) => ({
                            type: 'User' as const,
                            id: user.uuid,
                        })),
                        { type: 'User' as const, id: 'LIST' },
                    ]
                    : [{ type: 'User' as const, id: 'LIST' }],
        }),

        createUser: builder.mutation<AgencyUser, CreateUserRequest>({
            query: (body) => ({
                url: '/users',
                method: 'POST',
                data: body,
            }),
            invalidatesTags: [{ type: 'User', id: 'LIST' }],
        }),

        updateUser: builder.mutation<AgencyUser, UpdateUserArgs>({
            query: ({ uuid, body }) => ({
                url: `/users/${uuid}`,
                method: 'PATCH',
                data: body,
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: 'User', id: arg.uuid },
                { type: 'User', id: 'LIST' },
            ],
        }),

        deleteUser: builder.mutation<void, DeleteUserArgs>({
            query: ({ uuid }) => ({
                url: `/users/${uuid}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'User', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
} = usersApi;
