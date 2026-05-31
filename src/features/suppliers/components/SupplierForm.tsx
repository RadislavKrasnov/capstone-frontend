import { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { RootState } from '../../../app/store';
import { UiButton } from '../../../shared/components/UiButton';
import {
    supplierSchema,
    type SupplierFormValues,
} from '../schemas/supplier.schema';
import {
    useCreateSupplierMutation,
    useUpdateSupplierMutation,
} from '../api/suppliersApi';
import type { Supplier } from '../types/supplier.types';
import {
    SUPPLIER_UI_TYPES,
    mapSupplierTypeToBackend,
    mapSupplierTypeToUi,
} from '../types/supplierType.mapper';

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

type SupplierFormProps = {
    mode: 'add' | 'edit';
    supplier?: Supplier | null;
    onCancel: () => void;
    onSuccess: () => void;
};

export function SupplierForm({
                                 mode,
                                 supplier,
                                 onCancel,
                                 onSuccess,
                             }: SupplierFormProps) {
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const [serverError, setServerError] = useState<string | null>(null);

    const [createSupplier, { isLoading: isCreating }] =
        useCreateSupplierMutation();
    const [updateSupplier, { isLoading: isUpdating }] =
        useUpdateSupplierMutation();

    const isSaving = isCreating || isUpdating;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: supplier?.name ?? '',
            type: mapSupplierTypeToUi(supplier?.type),
            contactEmail: supplier?.contactEmail ?? '',
            contactPhone: supplier?.contactPhone ?? '',
        },
    });

    const onSubmit = async (values: SupplierFormValues) => {
        setServerError(null);

        const payload = {
            name: values.name.trim(),
            type: mapSupplierTypeToBackend(values.type),
            contactEmail: values.contactEmail?.trim() || undefined,
            contactPhone: values.contactPhone?.trim() || undefined,
        };

        try {
            if (mode === 'add') {
                if (!currentUser?.agencyId) {
                    setServerError('Agency is missing for the current user.');
                    return;
                }

                await createSupplier({
                    agencyId: currentUser.agencyId,
                    ...payload,
                }).unwrap();
            } else if (supplier) {
                await updateSupplier({
                    uuid: supplier.uuid,
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

            <FormField label="Name" error={errors.name?.message}>
                <input
                    {...register('name')}
                    className="form-input"
                    placeholder="Hotel Central Prague"
                />
            </FormField>

            <FormField label="Type" error={errors.type?.message}>
                <select {...register('type')} className="form-input">
                    {SUPPLIER_UI_TYPES.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </FormField>

            <FormField label="Contact Email" error={errors.contactEmail?.message}>
                <input
                    {...register('contactEmail')}
                    type="email"
                    className="form-input"
                    placeholder="sales@supplier.example"
                />
            </FormField>

            <FormField label="Contact Phone" error={errors.contactPhone?.message}>
                <input
                    {...register('contactPhone')}
                    className="form-input"
                    placeholder="+420 777 111 222"
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
                            ? 'Create Supplier'
                            : 'Save Supplier'}
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
