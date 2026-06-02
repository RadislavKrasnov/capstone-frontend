import { baseApi } from '../../../shared/api/baseApi';
import type {
    CreatePackageContentItemRequest,
    DeletePackageContentItemArgs,
    GetPackageContentItemsRequest,
    GetPackageContentItemsResponse,
    PackageContentItem,
    UpdatePackageContentItemArgs,
} from '../types/packageContent.types';

export const packageContentApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPackageHighlights: builder.query<
            GetPackageContentItemsResponse,
            GetPackageContentItemsRequest
        >({
            query: (params) => ({
                url: '/package-highlights',
                method: 'GET',
                params: {
                    page: params.page ?? 1,
                    limit: params.limit ?? 100,
                    packageId: params.packageId,
                },
            }),
        }),

        createPackageHighlight: builder.mutation<
            PackageContentItem,
            CreatePackageContentItemRequest
        >({
            query: (body) => ({
                url: '/package-highlights',
                method: 'POST',
                data: body,
            }),
        }),

        updatePackageHighlight: builder.mutation<
            PackageContentItem,
            UpdatePackageContentItemArgs
        >({
            query: ({ uuid, body }) => ({
                url: `/package-highlights/${uuid}`,
                method: 'PATCH',
                data: body,
            }),
        }),

        deletePackageHighlight: builder.mutation<
            void,
            DeletePackageContentItemArgs
        >({
            query: ({ uuid }) => ({
                url: `/package-highlights/${uuid}`,
                method: 'DELETE',
            }),
        }),

        getPackageInclusions: builder.query<
            GetPackageContentItemsResponse,
            GetPackageContentItemsRequest
        >({
            query: (params) => ({
                url: '/package-inclusions',
                method: 'GET',
                params: {
                    page: params.page ?? 1,
                    limit: params.limit ?? 100,
                    packageId: params.packageId,
                },
            }),
        }),

        createPackageInclusion: builder.mutation<
            PackageContentItem,
            CreatePackageContentItemRequest
        >({
            query: (body) => ({
                url: '/package-inclusions',
                method: 'POST',
                data: body,
            }),
        }),

        updatePackageInclusion: builder.mutation<
            PackageContentItem,
            UpdatePackageContentItemArgs
        >({
            query: ({ uuid, body }) => ({
                url: `/package-inclusions/${uuid}`,
                method: 'PATCH',
                data: body,
            }),
        }),

        deletePackageInclusion: builder.mutation<
            void,
            DeletePackageContentItemArgs
        >({
            query: ({ uuid }) => ({
                url: `/package-inclusions/${uuid}`,
                method: 'DELETE',
            }),
        }),

        getPackageExclusions: builder.query<
            GetPackageContentItemsResponse,
            GetPackageContentItemsRequest
        >({
            query: (params) => ({
                url: '/package-exclusions',
                method: 'GET',
                params: {
                    page: params.page ?? 1,
                    limit: params.limit ?? 100,
                    packageId: params.packageId,
                },
            }),
        }),

        createPackageExclusion: builder.mutation<
            PackageContentItem,
            CreatePackageContentItemRequest
        >({
            query: (body) => ({
                url: '/package-exclusions',
                method: 'POST',
                data: body,
            }),
        }),

        updatePackageExclusion: builder.mutation<
            PackageContentItem,
            UpdatePackageContentItemArgs
        >({
            query: ({ uuid, body }) => ({
                url: `/package-exclusions/${uuid}`,
                method: 'PATCH',
                data: body,
            }),
        }),

        deletePackageExclusion: builder.mutation<
            void,
            DeletePackageContentItemArgs
        >({
            query: ({ uuid }) => ({
                url: `/package-exclusions/${uuid}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useGetPackageHighlightsQuery,
    useCreatePackageHighlightMutation,
    useUpdatePackageHighlightMutation,
    useDeletePackageHighlightMutation,

    useGetPackageInclusionsQuery,
    useCreatePackageInclusionMutation,
    useUpdatePackageInclusionMutation,
    useDeletePackageInclusionMutation,

    useGetPackageExclusionsQuery,
    useCreatePackageExclusionMutation,
    useUpdatePackageExclusionMutation,
    useDeletePackageExclusionMutation,
} = packageContentApi;
