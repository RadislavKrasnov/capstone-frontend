import type { PaginatedResponse } from '../../../shared/types/pagination.types';
import type { Supplier } from '../../suppliers/types/supplier.types';
import type { TourDay } from '../../itinerary/types/itinerary.types';

export type CostCategory =
    | 'HOTEL'
    | 'FLIGHT'
    | 'TRANSPORT'
    | 'GUIDE'
    | 'MEAL'
    | 'ACTIVITY'
    | 'INSURANCE'
    | 'OTHER';

export type CostType = 'FIXED' | 'PER_PERSON' | 'PER_GROUP' | 'PER_DAY';

export type CostItem = {
    id: number;
    uuid: string;
    packageId: number;
    package?: {
        id: number;
        uuid: string;
        title: string;
        slug: string;
    };
    supplierId?: number | null;
    supplier?: Pick<Supplier, 'id' | 'uuid' | 'name' | 'type'> | null;
    dayId?: number | null;
    day?: Pick<TourDay, 'id' | 'uuid' | 'dayNumber' | 'title'> | null;
    itineraryItemId?: number | null;
    itineraryItem?: {
        id: number;
        uuid: string;
        itemOrder: number;
        type: string;
        title: string;
    } | null;
    category: CostCategory;
    name: string;
    description?: string | null;
    costType: CostType;
    quantity: number | string;
    unitCost: number | string;
    currencyCode: string;
    isRequired: boolean;
    createdAt: string;
    updatedAt: string;
};

export type GetCostItemsRequest = {
    page?: number;
    limit?: number;
    packageId?: number;
    supplierId?: number;
    dayId?: number;
    category?: CostCategory;
    costType?: CostType;
};

export type GetCostItemsResponse = PaginatedResponse<CostItem>;

export type CreateCostItemRequest = {
    packageId: number;
    supplierId?: number | null;
    dayId?: number | null;
    itineraryItemId?: number | null;
    category: CostCategory;
    name: string;
    description?: string | null;
    costType: CostType;
    quantity?: number;
    unitCost: number;
    currencyCode?: string;
    isRequired?: boolean;
};

export type UpdateCostItemRequest = Partial<CreateCostItemRequest>;

export type UpdateCostItemArgs = {
    uuid: string;
    body: UpdateCostItemRequest;
};

export type DeleteCostItemArgs = {
    uuid: string;
};
