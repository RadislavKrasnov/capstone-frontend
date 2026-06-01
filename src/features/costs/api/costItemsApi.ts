import { baseApi } from '../../../shared/api/baseApi';
import type {
    CostItem,
    CreateCostItemRequest,
    DeleteCostItemArgs,
    GetCostItemsRequest,
    GetCostItemsResponse,
    UpdateCostItemArgs,
} from '../types/cost.types';

export const costItemsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCostItems: builder.query<GetCostItemsResponse, GetCostItemsRequest>({
            query: (params) => ({
                url: '/cost-items',
                method: 'GET',
                params: {
                    page: params.page ?? 1,
                    limit: params.limit ?? 100,
                    packageId: params.packageId,
                    supplierId: params.supplierId,
                    dayId: params.dayId,
                    category: params.category,
                    costType: params.costType,
                },
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map((costItem) => ({
                            type: 'CostItem' as const,
                            id: costItem.uuid,
                        })),
                        { type: 'CostItem' as const, id: 'LIST' },
                    ]
                    : [{ type: 'CostItem' as const, id: 'LIST' }],
        }),

        createCostItem: builder.mutation<CostItem, CreateCostItemRequest>({
            query: (body) => ({
                url: '/cost-items',
                method: 'POST',
                data: body,
            }),
            invalidatesTags: [
                { type: 'CostItem', id: 'LIST' },
                { type: 'Analysis', id: 'LIST' },
            ],
        }),

        updateCostItem: builder.mutation<CostItem, UpdateCostItemArgs>({
            query: ({ uuid, body }) => ({
                url: `/cost-items/${uuid}`,
                method: 'PATCH',
                data: body,
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: 'CostItem', id: arg.uuid },
                { type: 'CostItem', id: 'LIST' },
                { type: 'Analysis', id: 'LIST' },
            ],
        }),

        deleteCostItem: builder.mutation<void, DeleteCostItemArgs>({
            query: ({ uuid }) => ({
                url: `/cost-items/${uuid}`,
                method: 'DELETE',
            }),
            invalidatesTags: [
                { type: 'CostItem', id: 'LIST' },
                { type: 'Analysis', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetCostItemsQuery,
    useCreateCostItemMutation,
    useUpdateCostItemMutation,
    useDeleteCostItemMutation,
} = costItemsApi;
