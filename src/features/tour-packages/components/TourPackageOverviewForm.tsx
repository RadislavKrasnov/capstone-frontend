import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { UiButton } from '../../../shared/components/UiButton';
import { PackageStatusBadge } from './PackageStatusBadge';
import {
    tourPackageSchema,
    type TourPackageFormValues,
} from '../schemas/tourPackage.schema';
import { useUpdateTourPackageMutation } from '../api/tourPackagesApi';
import type { TourPackage } from '../types/tourPackage.types';

function getErrorMessage(error: unknown) {
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

function formatDate(value?: string) {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));
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

function buildFormValues(tourPackage: TourPackage): TourPackageFormValues {
    return {
        title: tourPackage.title,
        slug: tourPackage.slug,
        description: tourPackage.description ?? '',
        destinationCountry: tourPackage.destinationCountry ?? '',
        destinationCity: tourPackage.destinationCity ?? '',
        durationDays: tourPackage.durationDays,
        expectedGroupSize: tourPackage.expectedGroupSize,
        sellingPricePerPerson: Number(tourPackage.sellingPricePerPerson),
        currencyCode: tourPackage.currencyCode,
        status: tourPackage.status,
        internalNotes: tourPackage.internalNotes ?? '',
    };
}

type TourPackageOverviewFormProps = {
    tourPackage: TourPackage;
};

export function TourPackageOverviewForm({
                                            tourPackage,
                                        }: TourPackageOverviewFormProps) {
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [savedAt, setSavedAt] = useState(tourPackage.updatedAt);

    const [updateTourPackage, { isLoading }] = useUpdateTourPackageMutation();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isDirty },
    } = useForm<TourPackageFormValues>({
        resolver: zodResolver(tourPackageSchema),
        defaultValues: buildFormValues(tourPackage),
    });

    useEffect(() => {
        reset(buildFormValues(tourPackage));
        setSavedAt(tourPackage.updatedAt);
    }, [reset, tourPackage]);

    const title = watch('title');
    const description = watch('description') ?? '';
    const currentStatus = watch('status');

    const generatedSlug = useMemo(() => slugify(title), [title]);

    const onGenerateSlug = () => {
        setValue('slug', generatedSlug, {
            shouldDirty: true,
            shouldValidate: true,
        });
        setSuccessMessage(null);
    };

    const onSubmit = async (values: TourPackageFormValues) => {
        setServerError(null);
        setSuccessMessage(null);

        try {
            const updatedPackage = await updateTourPackage({
                uuid: tourPackage.uuid,
                body: {
                    title: values.title.trim(),
                    slug: values.slug.trim(),
                    description: values.description?.trim() || undefined,
                    destinationCountry: values.destinationCountry?.trim() || undefined,
                    destinationCity: values.destinationCity?.trim() || undefined,
                    durationDays: values.durationDays,
                    expectedGroupSize: values.expectedGroupSize,
                    sellingPricePerPerson: values.sellingPricePerPerson,
                    currencyCode: values.currencyCode.trim().toUpperCase(),
                    status: values.status,
                    internalNotes: values.internalNotes?.trim() || undefined,
                },
            }).unwrap();

            reset(buildFormValues(updatedPackage));
            setSavedAt(updatedPackage.updatedAt);
            setSuccessMessage('Package was updated successfully.');
        } catch (error) {
            setServerError(getErrorMessage(error));
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-[980px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
        >
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                <div>
                    <h2 className="text-[15px] font-semibold text-slate-900">
                        Basic Information
                    </h2>
                    <p className="mt-1 text-[12px] text-slate-400">
                        Core details used across analysis, proposals and exports
                    </p>
                </div>

                <PackageStatusBadge status={currentStatus} />
            </div>

            <div className="space-y-6 px-6 py-5">
                {successMessage && (
                    <div className="flex items-start gap-2 rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-sm text-green-700">
                        <CheckCircle size={15} className="mt-0.5 shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {serverError && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                        <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                        <span>{serverError}</span>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-5">
                    <FormField label="Title" error={errors.title?.message}>
                        <input
                            {...register('title', {
                                onChange: () => setSuccessMessage(null),
                            })}
                            className="form-input h-10"
                            placeholder="Bali Cultural Immersion"
                        />
                    </FormField>

                    <FormField
                        label="Slug"
                        hint="Auto-generated"
                        error={errors.slug?.message}
                    >
                        <div className="flex gap-2">
                            <input
                                {...register('slug', {
                                    onChange: () => setSuccessMessage(null),
                                })}
                                className="form-input h-10 font-mono text-xs"
                                placeholder="bali-cultural-immersion"
                            />

                            <button
                                type="button"
                                onClick={onGenerateSlug}
                                disabled={!generatedSlug}
                                className="rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Generate
                            </button>
                        </div>
                    </FormField>
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <FormField
                        label="Destination Country"
                        error={errors.destinationCountry?.message}
                    >
                        <input
                            {...register('destinationCountry', {
                                onChange: () => setSuccessMessage(null),
                            })}
                            className="form-input h-10"
                            placeholder="Indonesia"
                        />
                    </FormField>

                    <FormField
                        label="Destination City"
                        error={errors.destinationCity?.message}
                    >
                        <input
                            {...register('destinationCity', {
                                onChange: () => setSuccessMessage(null),
                            })}
                            className="form-input h-10"
                            placeholder="Bali"
                        />
                    </FormField>
                </div>

                <div className="grid grid-cols-[170px_170px_1fr_90px_170px] gap-4">
                    <FormField label="Duration" error={errors.durationDays?.message}>
                        <div className="relative">
                            <input
                                type="number"
                                min={1}
                                {...register('durationDays', {
                                    valueAsNumber: true,
                                    onChange: () => setSuccessMessage(null),
                                })}
                                className="form-input h-10 pr-12"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                days
                            </span>
                        </div>
                    </FormField>

                    <FormField
                        label="Group Size"
                        error={errors.expectedGroupSize?.message}
                    >
                        <div className="relative">
                            <input
                                type="number"
                                min={1}
                                {...register('expectedGroupSize', {
                                    valueAsNumber: true,
                                    onChange: () => setSuccessMessage(null),
                                })}
                                className="form-input h-10 pr-11"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                pax
                            </span>
                        </div>
                    </FormField>

                    <FormField
                        label="Selling Price / Person"
                        error={errors.sellingPricePerPerson?.message}
                    >
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                $
                            </span>
                            <input
                                type="number"
                                min={0}
                                step="0.01"
                                {...register('sellingPricePerPerson', {
                                    valueAsNumber: true,
                                    onChange: () => setSuccessMessage(null),
                                })}
                                className="form-input h-10 pl-8"
                            />
                        </div>
                    </FormField>

                    <FormField label="Currency" error={errors.currencyCode?.message}>
                        <select
                            {...register('currencyCode', {
                                onChange: () => setSuccessMessage(null),
                            })}
                            className="form-input h-10"
                        >
                            {['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'].map((currency) => (
                                <option key={currency} value={currency}>
                                    {currency}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <FormField label="Status" error={errors.status?.message}>
                        <select
                            {...register('status', {
                                onChange: () => setSuccessMessage(null),
                            })}
                            className="form-input h-10"
                        >
                            <option value="DRAFT">DRAFT</option>
                            <option value="ANALYZED">ANALYZED</option>
                            <option value="PUBLISHED">PUBLISHED</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                    </FormField>
                </div>

                <div className="border-t border-slate-100 pt-5">
                    <FormField
                        label="Description"
                        hint="Shown in proposals and client-facing exports"
                        error={errors.description?.message}
                    >
                        <textarea
                            {...register('description', {
                                onChange: () => setSuccessMessage(null),
                            })}
                            rows={4}
                            maxLength={500}
                            className="form-input resize-none"
                            placeholder="A short description of the tour package..."
                        />
                        <p className="mt-2 text-right text-xs text-slate-300">
                            {description.length} characters
                        </p>
                    </FormField>
                </div>

                <FormField
                    label="Internal Notes"
                    hint="Not visible to clients"
                    error={errors.internalNotes?.message}
                >
                    <textarea
                        {...register('internalNotes', {
                            onChange: () => setSuccessMessage(null),
                        })}
                        rows={3}
                        className="form-input resize-none"
                        placeholder="Internal comments, reminders, or context for your team..."
                    />
                </FormField>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
                <p className="text-xs text-slate-400">
                    Last saved:{' '}
                    <span className="font-semibold text-slate-600">
                        {formatDate(savedAt)}
                    </span>
                </p>

                <UiButton
                    type="submit"
                    disabled={isLoading || !isDirty}
                    icon={<CheckCircle size={13} />}
                    className="h-10 px-5"
                >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </UiButton>
            </div>
        </form>
    );
}

function FormField({
                       label,
                       hint,
                       error,
                       children,
                   }: {
    label: string;
    hint?: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                {label}
                {hint && (
                    <span className="ml-1 normal-case tracking-normal text-slate-400">
                        {hint}
                    </span>
                )}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
