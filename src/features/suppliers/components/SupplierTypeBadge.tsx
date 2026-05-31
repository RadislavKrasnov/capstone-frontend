import { UiBadge } from '../../../shared/components/UiBadge';
import type { SupplierType } from '../types/supplier.types';

const variantByType: Record<SupplierType, 'blue' | 'violet' | 'green' | 'amber' | 'cyan' | 'gray'> = {
    HOTEL: 'blue',
    TRANSPORT: 'violet',
    ACTIVITY: 'green',
    RESTAURANT: 'amber',
    GUIDE: 'cyan',
    OTHER: 'gray',
};

export function SupplierTypeBadge({ type }: { type?: SupplierType | null }) {
    if (!type) {
        return <UiBadge variant="gray">OTHER</UiBadge>;
    }

    return (
        <UiBadge variant={variantByType[type]}>
            {type}
        </UiBadge>
    );
}
