import { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { UiButton } from '../../../shared/components/UiButton';
import {
    packageContentItemSchema,
    type PackageContentItemFormValues,
} from '../schemas/packageContent.schema';
import {
    useCreatePackageExclusionMutation,
    useCreatePackageHighlightMutation,
    useCreatePackageInclusionMutation,
    useUpdatePackageExclusionMutation,
    useUpdatePackageHighlightMutation,
    useUpdatePackageInclusionMutation,
} from '../api/packageContentApi';
import type {
    PackageContentItem,
    PackageContentType,
} from '../types/packageContent.types';

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

type PackageContentItemFormProps = {
    type: PackageContentType;
    mode: 'add' | 'edit';
    packageId: number;
    item?: PackageContentItem | null;
    nextDisplayOrder?: number;
    onCancel: () => void;
    onSuccess: () => void;
};

export function PackageContentItemForm({
                                           type,
                                           mode,
                                           packageId,
                                           item,
                                           nextDisplayOrder,
                                           onCancel,
                                           onSuccess,
                                       }: PackageContentItemFormProps) {
    const [serverError, setServerError] = useState<string | null>(null);

    const [createHighlight, { isLoading: isCreatingHighlight }] =
        useCreatePackageHighlightMutation();
    const [updateHighlight, { isLoading: isUpdatingHighlight }] =
        useUpdatePackageHighlightMutation();

    const [createInclusion, { isLoading: isCreatingInclusion }] =
        useCreatePackageInclusionMutation();
    const [updateInclusion, { isLoading: isUpdatingInclusion }] =
        useUpdatePackageInclusionMutation();

    const [createExclusion, { isLoading: isCreatingExclusion }] =
        useCreatePackageExclusionMutation();
    const [updateExclusion, { isLoading: isUpdatingExclusion }] =
        useUpdatePackageExclusionMutation();

    const isSaving =
        isCreatingHighlight ||
        isUpdatingHighlight ||
        isCreatingInclusion ||
        isUpdatingInclusion ||
        isCreatingExclusion ||
        isUpdatingExclusion;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PackageContentItemFormValues>({
        resolver: zodResolver(packageContentItemSchema),
        defaultValues: {
            text: item?.text ?? '',
            displayOrder: item?.displayOrder ?? nextDisplayOrder ?? 1,
        },
    });

    const onSubmit = async (values: PackageContentItemFormValues) => {
        setServerError(null);

        const payload = {
            packageId,
            text: values.text.trim(),
            displayOrder: values.displayOrder,
        };

        try {
            if (mode === 'add') {
                if (type === 'highlight') {
                    await createHighlight(payload).unwrap();
                }

                if (type === 'inclusion') {
                    await createInclusion(payload).unwrap();
                }

                if (type === 'exclusion') {
                    await createExclusion(payload).unwrap();
                }
            } else if (item) {
                if (type === 'highlight') {
                    await updateHighlight({
                        uuid: item.uuid,
                        body: payload,
                    }).unwrap();
                }

                if (type === 'inclusion') {
                    await updateInclusion({
                        uuid: item.uuid,
                        body: payload,
                    }).unwrap();
                }

                if (type === 'exclusion') {
                    await updateExclusion({
                        uuid: item.uuid,
                        body: payload,
                    }).unwrap();
                }
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

            <FormField label="Text" error={errors.text?.message}>
                <input
                    {...register('text')}
                    className="form-input"
                    placeholder="Guided walking tour through historic city center"
                />
            </FormField>

            <FormField label="Display Order" error={errors.displayOrder?.message}>
                <input
                    type="number"
                    min={1}
                    {...register('displayOrder', { valueAsNumber: true })}
                    className="form-input"
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
                            ? 'Add Item'
                            : 'Save Item'}
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
