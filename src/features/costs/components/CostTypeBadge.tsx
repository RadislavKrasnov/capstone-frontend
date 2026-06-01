import { UiBadge } from '../../../shared/components/UiBadge';
import type { CostType } from '../types/cost.types';

const labelByType: Record<CostType, string> = {
    FIXED: 'Fixed',
    PER_PERSON: 'Per Person',
    PER_GROUP: 'Per Group',
    PER_DAY: 'Per Day',
};

const variantByType: Record<CostType, 'blue' | 'violet' | 'gray' | 'cyan'> = {
    FIXED: 'gray',
    PER_PERSON: 'blue',
    PER_GROUP: 'violet',
    PER_DAY: 'cyan',
};

export function CostTypeBadge({ costType }: { costType: CostType }) {
    return <UiBadge variant={variantByType[costType]}>{labelByType[costType]}</UiBadge>;
}
