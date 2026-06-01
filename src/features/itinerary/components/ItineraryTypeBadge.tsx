import { UiBadge } from '../../../shared/components/UiBadge';
import type { ItineraryItemType } from '../types/itinerary.types';

const variantByType: Record<
    ItineraryItemType,
    'blue' | 'gray' | 'green' | 'violet' | 'amber' | 'cyan'
> = {
    ACTIVITY: 'blue',
    TRANSFER: 'gray',
    MEAL: 'green',
    FREE_TIME: 'violet',
    HOTEL: 'amber',
    FLIGHT: 'cyan',
};

const labelByType: Record<ItineraryItemType, string> = {
    ACTIVITY: 'Activity',
    TRANSFER: 'Transfer',
    MEAL: 'Meal',
    FREE_TIME: 'Free Time',
    HOTEL: 'Hotel',
    FLIGHT: 'Flight',
};

export function ItineraryTypeBadge({ type }: { type: ItineraryItemType }) {
    return <UiBadge variant={variantByType[type]}>{labelByType[type]}</UiBadge>;
}
