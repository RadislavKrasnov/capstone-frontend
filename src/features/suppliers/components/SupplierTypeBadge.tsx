import { UiBadge } from '../../../shared/components/UiBadge';
import {
    SUPPLIER_TYPE_LABELS,
    mapSupplierTypeToUi,
} from '../types/supplierType.mapper';
import type { SupplierType, SupplierUiType } from '../types/supplier.types';

const variantByType: Record<
    SupplierUiType,
    'blue' | 'violet' | 'green' | 'amber' | 'cyan' | 'gray'
> = {
    HOTEL: 'blue',
    TRANSPORT: 'violet',
    GUIDE: 'cyan',
    ACTIVITY: 'green',
    RESTAURANT: 'amber',
    OTHER: 'gray',
};

export function SupplierTypeBadge({ type }: { type?: SupplierType | null }) {
    const uiType = mapSupplierTypeToUi(type);

    return (
        <UiBadge variant={variantByType[uiType]}>
            {SUPPLIER_TYPE_LABELS[uiType]}
        </UiBadge>
    );
}
