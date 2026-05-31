import type { SupplierType, SupplierUiType } from './supplier.types';

export const SUPPLIER_UI_TYPES: SupplierUiType[] = [
    'HOTEL',
    'TRANSPORT',
    'GUIDE',
    'ACTIVITY',
    'RESTAURANT',
    'OTHER',
];

export const SUPPLIER_UI_TO_BACKEND_TYPE: Record<SupplierUiType, SupplierType> = {
    HOTEL: 'HOTEL',
    TRANSPORT: 'TRANSPORT',
    GUIDE: 'GUIDE',
    ACTIVITY: 'ACTIVITY_PROVIDER',
    RESTAURANT: 'RESTAURANT',
    OTHER: 'OTHER',
};

export const SUPPLIER_BACKEND_TO_UI_TYPE: Record<SupplierType, SupplierUiType> = {
    HOTEL: 'HOTEL',
    TRANSPORT: 'TRANSPORT',
    GUIDE: 'GUIDE',
    ACTIVITY_PROVIDER: 'ACTIVITY',
    RESTAURANT: 'RESTAURANT',
    OTHER: 'OTHER',
};

export const SUPPLIER_TYPE_LABELS: Record<SupplierUiType, string> = {
    HOTEL: 'HOTEL',
    TRANSPORT: 'TRANSPORT',
    GUIDE: 'GUIDE',
    ACTIVITY: 'ACTIVITY',
    RESTAURANT: 'RESTAURANT',
    OTHER: 'OTHER',
};

export function mapSupplierTypeToBackend(type: SupplierUiType): SupplierType {
    return SUPPLIER_UI_TO_BACKEND_TYPE[type];
}

export function mapSupplierTypeToUi(type?: SupplierType | null): SupplierUiType {
    return type ? SUPPLIER_BACKEND_TO_UI_TYPE[type] : 'OTHER';
}
