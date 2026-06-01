import { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { UiButton } from '../../../shared/components/UiButton';
import type { Supplier } from '../../suppliers/types/supplier.types';
import type { TourDay } from '../../itinerary/types/itinerary.types';
import {
    costItemSchema,
    type CostItemFormValues,
} from '../schemas/cost.schema';
import {
    useCreateCostItemMutation,
    useUpdateCostItemMutation,
} from '../api/costItemsApi';
import type { CostCategory, CostItem, CostType } from '../types/cost.types';

const costCategories: CostCategory[] = [
    'HOTEL',
    'FLIGHT',
    'TRANSPORT',
    'GUIDE',
    'MEAL',
    'ACTIVITY',
    'INSURANCE',
    'OTHER',
];

const costTypes: CostType[] = ['FIXED', 'PER_PERSON', 'PER_GROUP', 'PER_DAY'];

const currencies = ['EUR', 'USD', 'GBP', 'AUD', 'CHF', 'JPY', 'SGD'];

export function getErrorMessage(error: unknown) {
    if (
        typeof error === 'object' &&
        error !== null &&
        'data' in error &&
        typeof error.data === 'object' &&
        error.data !== null &&
        'message' in error.data
    ) {
        const message = error.data.message;

        if (Array.isArray(message)) {
            return message.join(', ');
        }

        if (typeof message === 'string') {
            return message;
        }
    }

    return 'Something went wrong. Please try again.';
}

function toSelectValue(value?: number | null) {
    return value ? String(value) : '';
}

function emptyToUndefined(value?: string | null) {
    const trimmedValue = value?.trim();

    return trimmedValue ? trimmedValue : undefined;
}

function optionalNumber(value?: string) {
    return value ? Number(value) : undefined;
}

type CostItemFormProps = {
    mode: 'add' | 'edit';
    packageId: number;
    defaultCurrencyCode: string;
    costItem?: CostItem | null;
    suppliers: Supplier[];
    days: TourDay[];
    onCancel: () => void;
    onSuccess: () => void;
};

export function CostItemForm({
                                 mode,
                                 packageId,
                                 defaultCurrencyCode,
                                 costItem,
                                 suppliers,
                                 days,
                                 onCancel,
                                 onSuccess,
                             }: CostItemFormProps) {
    const [serverError, setServerError] = useState<string | null>(null);

    const [createCostItem, { isLoading: isCreating }] =
        useCreateCostItemMutation();
    const [updateCostItem, { isLoading: isUpdating }] =
        useUpdateCostItemMutation();

    const isSaving = isCreating || isUpdating;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CostItemFormValues>({
        resolver: zodResolver(costItemSchema),
        defaultValues: {
            supplierId: toSelectValue(costItem?.supplierId),
            dayId: toSelectValue(costItem?.dayId),
            category: costItem?.category ?? 'HOTEL',
            name: costItem?.name ?? '',
            description: costItem?.description ?? '',
            costType: costItem?.costType ?? 'PER_PERSON',
            quantity: Number(costItem?.quantity ?? 1),
            unitCost: Number(costItem?.unitCost ?? 0),
            currencyCode: costItem?.currencyCode ?? defaultCurrencyCode,
            isRequired: costItem?.isRequired ?? true,
        },
    });

    const onSubmit = async (values: CostItemFormValues) => {
        setServerError(null);

        const payload = {
            packageId,
            supplierId: optionalNumber(values.supplierId) ?? null,
            dayId: optionalNumber(values.dayId) ?? null,
            category: values.category,
            name: values.name.trim(),
            description: emptyToUndefined(values.description),
            costType: values.costType,
            quantity: values.quantity,
            unitCost: values.unitCost,
            currencyCode: values.currencyCode.trim().toUpperCase(),
            isRequired: values.isRequired,
        };

        try {
            if (mode === 'add') {
                await createCostItem(payload).unwrap();
            } else if (costItem) {
                await updateCostItem({
                    uuid: costItem.uuid,
                    body: payload,
                }).unwrap();
            }

            onSuccess();
        } catch (error) {
            setServerError(getErrorMessage(error));
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                    <span>{serverError}</span>
                </div>
            )}

            <div className="grid grid-cols-[1fr_170px] gap-4">
                <FormField label="Name" error={errors.name?.message}>
                    <input
                        {...register('name')}
                        className="form-input"
                        placeholder="Hotel stay — The Layar Villa"
                    />
                </FormField>

                <FormField label="Category" error={errors.category?.message}>
                    <select {...register('category')} className="form-input">
                        {costCategories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField label="Supplier" error={errors.supplierId?.message}>
                    <select {...register('supplierId')} className="form-input">
                        <option value="">Unassigned supplier</option>
                        {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField label="Tour Day" error={errors.dayId?.message}>
                    <select {...register('dayId')} className="form-input">
                        <option value="">No specific day</option>
                        {days.map((day) => (
                            <option key={day.id} value={day.id}>
                                Day {day.dayNumber} — {day.title}
                            </option>
                        ))}
                    </select>
                </FormField>
            </div>

            <div className="grid grid-cols-[160px_130px_1fr_120px] gap-4">
                <FormField label="Cost Type" error={errors.costType?.message}>
                    <select {...register('costType')} className="form-input">
                        {costTypes.map((costType) => (
                            <option key={costType} value={costType}>
                                {costType}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField label="Quantity" error={errors.quantity?.message}>
                    <input
                        type="number"
                        step="0.01"
                        min={0.01}
                        {...register('quantity', { valueAsNumber: true })}
                        className="form-input"
                    />
                </FormField>

                <FormField label="Unit Cost" error={errors.unitCost?.message}>
                    <input
                        type="number"
                        step="0.01"
                        min={0}
                        {...register('unitCost', { valueAsNumber: true })}
                        className="form-input"
                    />
                </FormField>

                <FormField label="Currency" error={errors.currencyCode?.message}>
                    <select {...register('currencyCode')} className="form-input">
                        {currencies.map((currency) => (
                            <option key={currency} value={currency}>
                                {currency}
                            </option>
                        ))}
                    </select>
                </FormField>
            </div>

            <FormField label="Description" error={errors.description?.message}>
                <textarea
                    {...register('description')}
                    rows={3}
                    className="form-input resize-none"
                    placeholder="Notes about this cost item..."
                />
            </FormField>

            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <input
                    type="checkbox"
                    {...register('isRequired')}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                Required cost
            </label>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
                <UiButton variant="secondary" onClick={onCancel} disabled={isSaving}>
                    Cancel
                </UiButton>
                <UiButton
                    type="submit"
                    disabled={isSaving}
                    icon={<CheckCircle size={13} />}
                >
                    {isSaving
                        ? 'Saving...'
                        : mode === 'add'
                            ? 'Add Cost Item'
                            : 'Save Cost Item'}
                </UiButton>
            </div>
        </form>
    );
}

function FormField({
                       label,
                       error,
                       children,
                   }: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                {label}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
