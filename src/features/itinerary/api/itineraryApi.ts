import { baseApi } from '../../../shared/api/baseApi';
import type {
    CreateItineraryItemRequest,
    CreateTourDayRequest,
    DeleteItineraryItemArgs,
    DeleteTourDayArgs,
    GetItineraryItemsRequest,
    GetItineraryItemsResponse,
    GetTourDaysRequest,
    GetTourDaysResponse,
    ItineraryItem,
    TourDay,
    UpdateItineraryItemArgs,
    UpdateTourDayArgs,
} from '../types/itinerary.types';

export const itineraryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getTourDays: builder.query<GetTourDaysResponse, GetTourDaysRequest>({
            query: (params) => ({
                url: '/tour-days',
                method: 'GET',
                params: {
                    page: params.page ?? 1,
                    limit: params.limit ?? 100,
                    packageId: params.packageId,
                },
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map((day) => ({
                            type: 'TourDay' as const,
                            id: day.uuid,
                        })),
                        { type: 'TourDay' as const, id: 'LIST' },
                    ]
                    : [{ type: 'TourDay' as const, id: 'LIST' }],
        }),

        createTourDay: builder.mutation<TourDay, CreateTourDayRequest>({
            query: (body) => ({
                url: '/tour-days',
                method: 'POST',
                data: body,
            }),
            invalidatesTags: [
                { type: 'TourDay', id: 'LIST' },
                { type: 'Analysis', id: 'LIST' },
            ],
        }),

        updateTourDay: builder.mutation<TourDay, UpdateTourDayArgs>({
            query: ({ uuid, body }) => ({
                url: `/tour-days/${uuid}`,
                method: 'PATCH',
                data: body,
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: 'TourDay', id: arg.uuid },
                { type: 'TourDay', id: 'LIST' },
                { type: 'Analysis', id: 'LIST' },
            ],
        }),

        deleteTourDay: builder.mutation<void, DeleteTourDayArgs>({
            query: ({ uuid }) => ({
                url: `/tour-days/${uuid}`,
                method: 'DELETE',
            }),
            invalidatesTags: [
                { type: 'TourDay', id: 'LIST' },
                { type: 'ItineraryItem', id: 'LIST' },
                { type: 'Analysis', id: 'LIST' },
            ],
        }),

        getItineraryItems: builder.query<
            GetItineraryItemsResponse,
            GetItineraryItemsRequest
        >({
            query: (params) => ({
                url: '/itinerary-items',
                method: 'GET',
                params: {
                    page: params.page ?? 1,
                    limit: params.limit ?? 100,
                    dayId: params.dayId,
                    type: params.type,
                },
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map((item) => ({
                            type: 'ItineraryItem' as const,
                            id: item.uuid,
                        })),
                        { type: 'ItineraryItem' as const, id: 'LIST' },
                    ]
                    : [{ type: 'ItineraryItem' as const, id: 'LIST' }],
        }),

        createItineraryItem: builder.mutation<
            ItineraryItem,
            CreateItineraryItemRequest
        >({
            query: (body) => ({
                url: '/itinerary-items',
                method: 'POST',
                data: body,
            }),
            invalidatesTags: [
                { type: 'ItineraryItem', id: 'LIST' },
                { type: 'Analysis', id: 'LIST' },
            ],
        }),

        updateItineraryItem: builder.mutation<
            ItineraryItem,
            UpdateItineraryItemArgs
        >({
            query: ({ uuid, body }) => ({
                url: `/itinerary-items/${uuid}`,
                method: 'PATCH',
                data: body,
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: 'ItineraryItem', id: arg.uuid },
                { type: 'ItineraryItem', id: 'LIST' },
                { type: 'Analysis', id: 'LIST' },
            ],
        }),

        deleteItineraryItem: builder.mutation<void, DeleteItineraryItemArgs>({
            query: ({ uuid }) => ({
                url: `/itinerary-items/${uuid}`,
                method: 'DELETE',
            }),
            invalidatesTags: [
                { type: 'ItineraryItem', id: 'LIST' },
                { type: 'Analysis', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetTourDaysQuery,
    useCreateTourDayMutation,
    useUpdateTourDayMutation,
    useDeleteTourDayMutation,
    useGetItineraryItemsQuery,
    useCreateItineraryItemMutation,
    useUpdateItineraryItemMutation,
    useDeleteItineraryItemMutation,
} = itineraryApi;
