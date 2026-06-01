import { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { UiButton } from '../../../shared/components/UiButton';
import {
    tourDaySchema,
    type TourDayFormValues,
} from '../schemas/itinerary.schema';
import {
    useCreateTourDayMutation,
    useUpdateTourDayMutation,
} from '../api/itineraryApi';
import type { TourDay } from '../types/itinerary.types';

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

type TourDayFormProps = {
    mode: 'add' | 'edit';
    packageId: number;
    day?: TourDay | null;
    nextDayNumber?: number;
    onCancel: () => void;
    onSuccess: () => void;
};

export function TourDayForm({
                                mode,
                                packageId,
                                day,
                                nextDayNumber,
                                onCancel,
                                onSuccess,
                            }: TourDayFormProps) {
    const [serverError, setServerError] = useState<string | null>(null);

    const [createTourDay, { isLoading: isCreating }] = useCreateTourDayMutation();
    const [updateTourDay, { isLoading: isUpdating }] = useUpdateTourDayMutation();

    const isSaving = isCreating || isUpdating;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TourDayFormValues>({
        resolver: zodResolver(tourDaySchema),
        defaultValues: {
            dayNumber: day?.dayNumber ?? nextDayNumber ?? 1,
            title: day?.title ?? '',
            description: day?.description ?? '',
            isRestDay: day?.isRestDay ?? false,
        },
    });

    const onSubmit = async (values: TourDayFormValues) => {
        setServerError(null);

        const payload = {
            packageId,
            dayNumber: values.dayNumber,
            title: values.title.trim(),
            description: values.description?.trim() || undefined,
            isRestDay: values.isRestDay,
        };

        try {
            if (mode === 'add') {
                await createTourDay(payload).unwrap();
            } else if (day) {
                await updateTourDay({
                    uuid: day.uuid,
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

            <div className="grid grid-cols-[120px_1fr] gap-4">
                <FormField label="Day #" error={errors.dayNumber?.message}>
                    <input
                        type="number"
                        min={1}
                        {...register('dayNumber', { valueAsNumber: true })}
                        className="form-input"
                    />
                </FormField>

                <FormField label="Title" error={errors.title?.message}>
                    <input
                        {...register('title')}
                        className="form-input"
                        placeholder="Arrival and city orientation"
                    />
                </FormField>
            </div>

            <FormField label="Description" error={errors.description?.message}>
                <textarea
                    {...register('description')}
                    rows={3}
                    className="form-input resize-none"
                    placeholder="Short description for this day..."
                />
            </FormField>

            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <input
                    type="checkbox"
                    {...register('isRestDay')}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                Rest day
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
                    {isSaving ? 'Saving...' : mode === 'add' ? 'Create Day' : 'Save Day'}
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
