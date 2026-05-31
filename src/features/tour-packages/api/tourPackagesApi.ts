import { baseApi } from '../../../shared/api/baseApi';
import type {
    CreateTourPackageRequest,
    DeleteTourPackageArgs,
    GetTourPackagesRequest,
    GetTourPackagesResponse,
    TourPackage,
    UpdateTourPackageArgs,
} from '../types/tourPackage.types';

export const tourPackagesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getTourPackages: builder.query<
            GetTourPackagesResponse,
            GetTourPackagesRequest
        >({
            query: (params) => ({
                url: '/tour-packages',
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
                        ...result.data.map((tourPackage) => ({
                            type: 'TourPackage' as const,
                            id: tourPackage.uuid,
                        })),
                        { type: 'TourPackage' as const, id: 'LIST' },
                    ]
                    : [{ type: 'TourPackage' as const, id: 'LIST' }],
        }),

        getTourPackage: builder.query<TourPackage, string>({
            query: (uuid) => ({
                url: `/tour-packages/${uuid}`,
                method: 'GET',
            }),
            providesTags: (_result, _error, uuid) => [
                { type: 'TourPackage', id: uuid },
            ],
        }),

        createTourPackage: builder.mutation<
            TourPackage,
            CreateTourPackageRequest
        >({
            query: (body) => ({
                url: '/tour-packages',
                method: 'POST',
                data: body,
            }),
            invalidatesTags: [{ type: 'TourPackage', id: 'LIST' }],
        }),

        updateTourPackage: builder.mutation<TourPackage, UpdateTourPackageArgs>({
            query: ({ uuid, body }) => ({
                url: `/tour-packages/${uuid}`,
                method: 'PATCH',
                data: body,
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: 'TourPackage', id: arg.uuid },
                { type: 'TourPackage', id: 'LIST' },
            ],
        }),

        deleteTourPackage: builder.mutation<void, DeleteTourPackageArgs>({
            query: ({ uuid }) => ({
                url: `/tour-packages/${uuid}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'TourPackage', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetTourPackagesQuery,
    useGetTourPackageQuery,
    useCreateTourPackageMutation,
    useUpdateTourPackageMutation,
    useDeleteTourPackageMutation,
} = tourPackagesApi;
