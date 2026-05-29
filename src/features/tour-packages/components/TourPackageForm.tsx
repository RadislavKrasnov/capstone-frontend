import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { RootState } from '../../../app/store';
import { UiButton } from '../../../shared/components/UiButton';
import {
    tourPackageSchema,
    type TourPackageFormValues,
} from '../schemas/tourPackage.schema';
import {
    useCreateTourPackageMutation,
    useUpdateTourPackageMutation,
} from '../api/tourPackagesApi';
import type { TourPackage } from '../types/tourPackage.types';

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

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

type TourPackageFormProps = {
    mode: 'add' | 'edit';
    tourPackage?: TourPackage | null;
    onCancel: () => void;
    onSuccess: () => void;
};

export function TourPackageForm({
                                    mode,
                                    tourPackage,
                                    onCancel,
                                    onSuccess,
                                }: TourPackageFormProps) {
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const [serverError, setServerError] = useState<string | null>(null);

    const [createTourPackage, { isLoading: isCreating }] =
        useCreateTourPackageMutation();

    const [updateTourPackage, { isLoading: isUpdating }] =
        useUpdateTourPackageMutation();

    const isSaving = isCreating || isUpdating;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<TourPackageFormValues>({
        resolver: zodResolver(tourPackageSchema),
        defaultValues: {
            title: tourPackage?.title ?? '',
            slug: tourPackage?.slug ?? '',
            description: tourPackage?.description ?? '',
            destinationCountry: tourPackage?.destinationCountry ?? '',
            destinationCity: tourPackage?.destinationCity ?? '',
            durationDays: tourPackage?.durationDays ?? 3,
            expectedGroupSize: tourPackage?.expectedGroupSize ?? 12,
            sellingPricePerPerson: tourPackage?.sellingPricePerPerson ?? 499.99,
            currencyCode: tourPackage?.currencyCode ?? 'EUR',
            status: tourPackage?.status ?? 'DRAFT',
            internalNotes: tourPackage?.internalNotes ?? '',
        },
    });

    const title = watch('title');

    const generatedSlug = useMemo(() => slugify(title), [title]);

    const handleGenerateSlug = () => {
        setValue('slug', generatedSlug, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const onSubmit = async (values: TourPackageFormValues) => {
        setServerError(null);

        const payload = {
            title: values.title.trim(),
            slug: values.slug.trim(),
            description: values.description?.trim() || undefined,
            destinationCountry: values.destinationCountry?.trim() || undefined,
            destinationCity: values.destinationCity?.trim() || undefined,
            durationDays: values.durationDays,
            expectedGroupSize: values.expectedGroupSize,
            sellingPricePerPerson: values.sellingPricePerPerson,
            currencyCode: values.currencyCode,
            status: values.status,
            internalNotes: values.internalNotes?.trim() || undefined,
        };

        try {
            if (mode === 'add') {
                if (!currentUser?.agencyId) {
                    setServerError('Agency is missing for the current user.');
                    return;
                }

                await createTourPackage({
                    agencyId: currentUser.agencyId,
                    ...payload,
                }).unwrap();
            } else if (tourPackage) {
                await updateTourPackage({
                    uuid: tourPackage.uuid,
                    body: payload,
                }).unwrap();
            }

            onSuccess();
        } catch (error) {
            setServerError(getErrorMessage(error));
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                    <span>{serverError}</span>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <FormField label="Package Name" error={errors.title?.message}>
                    <input
                        {...register('title')}
                        className="form-input"
                        placeholder="Paris Weekend Tour"
                    />
                </FormField>

                <FormField label="Slug" error={errors.slug?.message}>
                    <div className="flex gap-2">
                        <input
                            {...register('slug')}
                            className="form-input font-mono text-xs"
                            placeholder="paris-weekend-tour"
                        />
                        <button
                            type="button"
                            onClick={handleGenerateSlug}
                            disabled={!generatedSlug}
                            className="shrink-0 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Generate
                        </button>
                    </div>
                </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    label="Destination Country"
                    error={errors.destinationCountry?.message}
                >
                    <input
                        {...register('destinationCountry')}
                        className="form-input"
                        placeholder="France"
                    />
                </FormField>

                <FormField
                    label="Destination City"
                    error={errors.destinationCity?.message}
                >
                    <input
                        {...register('destinationCity')}
                        className="form-input"
                        placeholder="Paris"
                    />
                </FormField>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <FormField label="Duration" error={errors.durationDays?.message}>
                    <input
                        type="number"
                        {...register('durationDays', { valueAsNumber: true })}
                        className="form-input"
                        min={1}
                    />
                </FormField>

                <FormField
                    label="Group Size"
                    error={errors.expectedGroupSize?.message}
                >
                    <input
                        type="number"
                        {...register('expectedGroupSize', { valueAsNumber: true })}
                        className="form-input"
                        min={1}
                    />
                </FormField>

                <FormField
                    label="Price / Person"
                    error={errors.sellingPricePerPerson?.message}
                >
                    <input
                        type="number"
                        step="0.01"
                        {...register('sellingPricePerPerson', {
                            valueAsNumber: true,
                        })}
                        className="form-input"
                        min={0}
                    />
                </FormField>

                <FormField label="Currency" error={errors.currencyCode?.message}>
                    <select {...register('currencyCode')} className="form-input">
                        {['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'].map(
                            (currency) => (
                                <option key={currency} value={currency}>
                                    {currency}
                                </option>
                            ),
                        )}
                    </select>
                </FormField>
            </div>

            <FormField label="Status" error={errors.status?.message}>
                <select {...register('status')} className="form-input">
                    <option value="DRAFT">DRAFT</option>
                    <option value="ANALYZED">ANALYZED</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                </select>
            </FormField>

            <FormField label="Description" error={errors.description?.message}>
                <textarea
                    {...register('description')}
                    rows={3}
                    className="form-input resize-none"
                    placeholder="A short description of the tour package..."
                />
            </FormField>

            <FormField label="Internal Notes" error={errors.internalNotes?.message}>
                <textarea
                    {...register('internalNotes')}
                    rows={3}
                    className="form-input resize-none bg-amber-50/40"
                    placeholder="Internal comments, reminders, or context for your team..."
                />
            </FormField>

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
                            ? 'Create Package'
                            : 'Save Package'}
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
