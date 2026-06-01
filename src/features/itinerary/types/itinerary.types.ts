import type { PaginatedResponse } from '../../../shared/types/pagination.types';

export type ItineraryItemType =
    | 'ACTIVITY'
    | 'TRANSFER'
    | 'MEAL'
    | 'FREE_TIME'
    | 'HOTEL'
    | 'FLIGHT';

export type ItineraryIntensity = 'LOW' | 'MEDIUM' | 'HIGH';

export type TourDay = {
    id: number;
    uuid: string;
    packageId: number;
    package?: {
        id: number;
        uuid: string;
        title: string;
        slug: string;
    };
    dayNumber: number;
    title: string;
    description?: string | null;
    isRestDay: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ItineraryItem = {
    id: number;
    uuid: string;
    dayId: number;
    day?: {
        id: number;
        uuid: string;
        dayNumber: number;
        title: string;
        isRestDay: boolean;
    };
    itemOrder: number;
    type: ItineraryItemType;
    title: string;
    description?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    durationMinutes?: number | null;
    locationName?: string | null;
    startLocation?: string | null;
    endLocation?: string | null;
    intensity?: ItineraryIntensity | null;
    isMajorActivity: boolean;
    createdAt: string;
    updatedAt: string;
};

export type GetTourDaysRequest = {
    page?: number;
    limit?: number;
    packageId?: number;
};

export type GetTourDaysResponse = PaginatedResponse<TourDay>;

export type CreateTourDayRequest = {
    packageId: number;
    dayNumber: number;
    title: string;
    description?: string | null;
    isRestDay?: boolean;
};

export type UpdateTourDayRequest = Partial<CreateTourDayRequest>;

export type UpdateTourDayArgs = {
    uuid: string;
    body: UpdateTourDayRequest;
};

export type DeleteTourDayArgs = {
    uuid: string;
};

export type GetItineraryItemsRequest = {
    page?: number;
    limit?: number;
    dayId?: number;
    type?: ItineraryItemType;
};

export type GetItineraryItemsResponse = PaginatedResponse<ItineraryItem>;

export type CreateItineraryItemRequest = {
    dayId: number;
    itemOrder: number;
    type: ItineraryItemType;
    title: string;
    description?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    durationMinutes?: number | null;
    locationName?: string | null;
    startLocation?: string | null;
    endLocation?: string | null;
    intensity?: ItineraryIntensity | null;
    isMajorActivity?: boolean;
};

export type UpdateItineraryItemRequest = Partial<CreateItineraryItemRequest>;

export type UpdateItineraryItemArgs = {
    uuid: string;
    body: UpdateItineraryItemRequest;
};

export type DeleteItineraryItemArgs = {
    uuid: string;
};
