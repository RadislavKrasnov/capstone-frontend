import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './axiosBaseQuery';

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: axiosBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
    }),
    tagTypes: [
        'Auth',
        'User',
        'Agency',
        'TourPackage',
        'TourDay',
        'ItineraryItem',
        'Supplier',
        'CostItem',
        'Analysis',
    ],
    endpoints: () => ({}),
});
