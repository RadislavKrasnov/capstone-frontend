import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { UiButton } from '../../../shared/components/UiButton';
import {
    itineraryItemSchema,
    type ItineraryItemFormValues,
} from '../schemas/itinerary.schema';
import {
    useCreateItineraryItemMutation,
    useUpdateItineraryItemMutation,
} from '../api/itineraryApi';
import type {
    ItineraryIntensity,
    ItineraryItem,
    ItineraryItemType,
} from '../types/itinerary.types';
import { getErrorMessage } from './TourDayForm';

const itemTypes: ItineraryItemType[] = [
    'ACTIVITY',
    'MEAL',
    'TRANSFER',
    'FREE_TIME',
    'HOTEL',
    'FLIGHT',
];

const intensityOptions: Array<ItineraryIntensity | ''> = [
    '',
    'LOW',
    'MEDIUM',
    'HIGH',
];

type ItineraryItemFormProps = {
    mode: 'add' | 'edit';
    dayId: number;
    item?: ItineraryItem | null;
    nextItemOrder?: number;
    onCancel: () => void;
    onSuccess: () => void;
};

function toTimeInputValue(value?: string | null) {
    return value ? value.slice(0, 5) : '';
}

function emptyToUndefined(value?: string | null) {
    const trimmedValue = value?.trim();

    return trimmedValue ? trimmedValue : undefined;
}

function calculateDurationMinutes(startTime?: string, endTime?: string) {
    if (!startTime || !endTime) {
        return null;
    }

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;

    if (endTotal <= startTotal) {
        return null;
    }

    return endTotal - startTotal;
}

export function ItineraryItemForm({
                                      mode,
                                      dayId,
                                      item,
                                      nextItemOrder,
                                      onCancel,
                                      onSuccess,
                                  }: ItineraryItemFormProps) {
    const [serverError, setServerError] = useState<string | null>(null);

    const [createItineraryItem, { isLoading: isCreating }] =
        useCreateItineraryItemMutation();
    const [updateItineraryItem, { isLoading: isUpdating }] =
        useUpdateItineraryItemMutation();

    const isSaving = isCreating || isUpdating;

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ItineraryItemFormValues>({
        resolver: zodResolver(itineraryItemSchema),
        defaultValues: {
            itemOrder: item?.itemOrder ?? nextItemOrder ?? 1,
            type: item?.type ?? 'ACTIVITY',
            title: item?.title ?? '',
            description: item?.description ?? '',
            startTime: toTimeInputValue(item?.startTime),
            endTime: toTimeInputValue(item?.endTime),
            durationMinutes: item?.durationMinutes ?? null,
            locationName: item?.locationName ?? '',
            startLocation: item?.startLocation ?? '',
            endLocation: item?.endLocation ?? '',
            intensity: item?.intensity ?? null,
            isMajorActivity: item?.isMajorActivity ?? false,
        },
    });

    const startTime = watch('startTime');
    const endTime = watch('endTime');

    const calculatedDuration = useMemo(
        () => calculateDurationMinutes(startTime, endTime),
        [startTime, endTime],
    );

    const onSubmit = async (values: ItineraryItemFormValues) => {
        setServerError(null);

        const payload = {
            dayId,
            itemOrder: values.itemOrder,
            type: values.type,
            title: values.title.trim(),
            description: emptyToUndefined(values.description),
            startTime: emptyToUndefined(values.startTime),
            endTime: emptyToUndefined(values.endTime),
            durationMinutes: values.durationMinutes ?? calculatedDuration ?? undefined,
            locationName: emptyToUndefined(values.locationName),
            startLocation: emptyToUndefined(values.startLocation),
            endLocation: emptyToUndefined(values.endLocation),
            intensity: values.intensity || undefined,
            isMajorActivity: values.isMajorActivity,
        };

        try {
            if (mode === 'add') {
                await createItineraryItem(payload).unwrap();
            } else if (item) {
                await updateItineraryItem({
                    uuid: item.uuid,
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

            <div className="grid grid-cols-[110px_1fr_160px] gap-4">
                <FormField label="Order" error={errors.itemOrder?.message}>
                    <input
                        type="number"
                        min={1}
                        {...register('itemOrder', { valueAsNumber: true })}
                        className="form-input"
                    />
                </FormField>

                <FormField label="Title" error={errors.title?.message}>
                    <input
                        {...register('title')}
                        className="form-input"
                        placeholder="Guided walking tour"
                    />
                </FormField>

                <FormField label="Type" error={errors.type?.message}>
                    <select {...register('type')} className="form-input">
                        {itemTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </FormField>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <FormField label="Start Time" error={errors.startTime?.message}>
                    <input
                        type="time"
                        {...register('startTime')}
                        className="form-input"
                    />
                </FormField>

                <FormField label="End Time" error={errors.endTime?.message}>
                    <input type="time" {...register('endTime')} className="form-input" />
                </FormField>

                <FormField
                    label="Duration"
                    error={errors.durationMinutes?.message}
                    hint={
                        calculatedDuration
                            ? `Auto: ${calculatedDuration} min`
                            : undefined
                    }
                >
                    <input
                        type="number"
                        min={1}
                        {...register('durationMinutes', {
                            valueAsNumber: true,
                        })}
                        className="form-input"
                        placeholder="120"
                    />
                </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField label="Location" error={errors.locationName?.message}>
                    <input
                        {...register('locationName')}
                        className="form-input"
                        placeholder="Old Town"
                    />
                </FormField>

                <FormField label="Intensity" error={errors.intensity?.message}>
                    <select {...register('intensity')} className="form-input">
                        {intensityOptions.map((intensity) => (
                            <option key={intensity || 'NONE'} value={intensity}>
                                {intensity || '—'}
                            </option>
                        ))}
                    </select>
                </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField label="Start Location" error={errors.startLocation?.message}>
                    <input
                        {...register('startLocation')}
                        className="form-input"
                        placeholder="Airport"
                    />
                </FormField>

                <FormField label="End Location" error={errors.endLocation?.message}>
                    <input
                        {...register('endLocation')}
                        className="form-input"
                        placeholder="Hotel"
                    />
                </FormField>
            </div>

            <FormField label="Description" error={errors.description?.message}>
                <textarea
                    {...register('description')}
                    rows={3}
                    className="form-input resize-none"
                    placeholder="Notes, included details, client-facing context..."
                />
            </FormField>

            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <input
                    type="checkbox"
                    {...register('isMajorActivity')}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                Major activity
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
                    {isSaving ? 'Saving...' : mode === 'add' ? 'Add Item' : 'Save Item'}
                </UiButton>
            </div>
        </form>
    );
}

function FormField({
                       label,
                       error,
                       hint,
                       children,
                   }: {
    label: string;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                {label}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            {!error && hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
    );
}
