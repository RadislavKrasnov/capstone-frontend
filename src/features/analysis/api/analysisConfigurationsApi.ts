import { baseApi } from '../../../shared/api/baseApi';
import type {
    AnalysisConfiguration,
    CreateAnalysisConfigurationRequest,
    DeleteAnalysisConfigurationArgs,
    GetAnalysisConfigurationsRequest,
    GetAnalysisConfigurationsResponse,
    UpdateAnalysisConfigurationArgs,
} from '../types/analysisConfiguration.types';

export const analysisConfigurationsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAnalysisConfigurations: builder.query<
            GetAnalysisConfigurationsResponse,
            GetAnalysisConfigurationsRequest
        >({
            query: (params) => ({
                url: '/analysis-configurations',
                method: 'GET',
                params: {
                    page: params.page ?? 1,
                    limit: params.limit ?? 100,
                    agencyId: params.agencyId,
                    isDefault: params.isDefault,
                },
            }),
        }),

        createAnalysisConfiguration: builder.mutation<
            AnalysisConfiguration,
            CreateAnalysisConfigurationRequest
        >({
            query: (body) => ({
                url: '/analysis-configurations',
                method: 'POST',
                data: body,
            }),
        }),

        updateAnalysisConfiguration: builder.mutation<
            AnalysisConfiguration,
            UpdateAnalysisConfigurationArgs
        >({
            query: ({ uuid, body }) => ({
                url: `/analysis-configurations/${uuid}`,
                method: 'PATCH',
                data: body,
            }),
        }),

        deleteAnalysisConfiguration: builder.mutation<
            { message: string },
            DeleteAnalysisConfigurationArgs
        >({
            query: ({ uuid }) => ({
                url: `/analysis-configurations/${uuid}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useGetAnalysisConfigurationsQuery,
    useCreateAnalysisConfigurationMutation,
    useUpdateAnalysisConfigurationMutation,
    useDeleteAnalysisConfigurationMutation,
} = analysisConfigurationsApi;
