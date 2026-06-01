import { UiBadge } from '../../../shared/components/UiBadge';
import type { CostCategory } from '../types/cost.types';

const variantByCategory: Record<
    CostCategory,
    'blue' | 'cyan' | 'gray' | 'violet' | 'green' | 'amber' | 'red'
> = {
    HOTEL: 'blue',
    FLIGHT: 'cyan',
    TRANSPORT: 'gray',
    GUIDE: 'violet',
    MEAL: 'green',
    ACTIVITY: 'amber',
    INSURANCE: 'red',
    OTHER: 'gray',
};

export function CostCategoryBadge({ category }: { category: CostCategory }) {
    return <UiBadge variant={variantByCategory[category]}>{category}</UiBadge>;
}
