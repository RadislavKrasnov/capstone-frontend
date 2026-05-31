import { baseApi } from '../../../shared/api/baseApi';
import type {
    CreateSupplierRequest,
    DeleteSupplierArgs,
    GetSuppliersRequest,
    GetSuppliersResponse,
    Supplier,
    UpdateSupplierArgs,
} from '../types/supplier.types';

export const suppliersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSuppliers: builder.query<GetSuppliersResponse, GetSuppliersRequest>({
            query: (params) => ({
                url: '/suppliers',
                method: 'GET',
                params: {
                    page: params.page ?? 1,
                    limit: params.limit ?? 100,
                    agencyId: params.agencyId,
                    type: params.type,
                    name: params.name,
                },
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map((supplier) => ({
                            type: 'Supplier' as const,
                            id: supplier.uuid,
                        })),
                        { type: 'Supplier' as const, id: 'LIST' },
                    ]
                    : [{ type: 'Supplier' as const, id: 'LIST' }],
        }),

        getSupplier: builder.query<Supplier, string>({
            query: (uuid) => ({
                url: `/suppliers/${uuid}`,
                method: 'GET',
            }),
            providesTags: (_result, _error, uuid) => [
                { type: 'Supplier', id: uuid },
            ],
        }),

        createSupplier: builder.mutation<Supplier, CreateSupplierRequest>({
            query: (body) => ({
                url: '/suppliers',
                method: 'POST',
                data: body,
            }),
            invalidatesTags: [{ type: 'Supplier', id: 'LIST' }],
        }),

        updateSupplier: builder.mutation<Supplier, UpdateSupplierArgs>({
            query: ({ uuid, body }) => ({
                url: `/suppliers/${uuid}`,
                method: 'PATCH',
                data: body,
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: 'Supplier', id: arg.uuid },
                { type: 'Supplier', id: 'LIST' },
            ],
        }),

        deleteSupplier: builder.mutation<void, DeleteSupplierArgs>({
            query: ({ uuid }) => ({
                url: `/suppliers/${uuid}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Supplier', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetSuppliersQuery,
    useGetSupplierQuery,
    useCreateSupplierMutation,
    useUpdateSupplierMutation,
    useDeleteSupplierMutation,
} = suppliersApi;
