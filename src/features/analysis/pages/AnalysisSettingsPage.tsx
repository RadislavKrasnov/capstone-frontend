import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelector } from 'react-redux';

import type { RootState } from '../../../app/store';
import { UiBadge } from '../../../shared/components/UiBadge';
import { UiButton } from '../../../shared/components/UiButton';
import {
    analysisConfigurationSchema,
    type AnalysisConfigurationFormValues,
} from '../schemas/analysisConfiguration.schema';
import {
    useCreateAnalysisConfigurationMutation,
    useDeleteAnalysisConfigurationMutation,
    useGetAnalysisConfigurationsQuery,
    useUpdateAnalysisConfigurationMutation,
} from '../api/analysisConfigurationsApi';
import type { AnalysisConfiguration } from '../types/analysisConfiguration.types';

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

function toNumber(value: number | string | null | undefined) {
    return Number(value ?? 0);
}

function toFormValues(
    configuration?: AnalysisConfiguration | null,
): AnalysisConfigurationFormValues {
    return {
        name: configuration?.name ?? '',
        agencyId: '',
        minTargetMarginPercent: toNumber(
            configuration?.minTargetMarginPercent ?? 15,
        ),
        goodMarginPercent: toNumber(configuration?.goodMarginPercent ?? 25),
        maxDailyFatigueScore: configuration?.maxDailyFatigueScore ?? 65,
        maxTransferMinutesPerDay:
            configuration?.maxTransferMinutesPerDay ?? 180,
        minBufferMinutes: configuration?.minBufferMinutes ?? 30,
        isDefault: configuration?.isDefault ?? false,
    };
}

export function AnalysisSettingsPage() {
    const [selectedConfiguration, setSelectedConfiguration] =
        useState<AnalysisConfiguration | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const currentAgency = useSelector((state: RootState) => state.auth.agency);
    const currentAgencyId = currentUser?.agencyId;

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetAnalysisConfigurationsQuery(
        {
            page: 1,
            limit: 100,
            agencyId: currentAgencyId,
        },
        {
            skip: !currentAgencyId,
        },
    );

    const [createConfiguration, { isLoading: isCreating }] =
        useCreateAnalysisConfigurationMutation();
    const [updateConfiguration, { isLoading: isUpdating }] =
        useUpdateAnalysisConfigurationMutation();
    const [deleteConfiguration, { isLoading: isDeleting }] =
        useDeleteAnalysisConfigurationMutation();

    const isSaving = isCreating || isUpdating;

    const configurations = useMemo(
        () =>
            [...(data?.data ?? [])].sort((a, b) => {
                if (a.isDefault !== b.isDefault) {
                    return a.isDefault ? -1 : 1;
                }

                return a.name.localeCompare(b.name);
            }),
        [data?.data],
    );

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<AnalysisConfigurationFormValues>({
        resolver: zodResolver(analysisConfigurationSchema),
        defaultValues: toFormValues(null),
    });

    useEffect(() => {
        reset(toFormValues(selectedConfiguration));
    }, [selectedConfiguration, reset]);

    const startNewConfiguration = () => {
        setSelectedConfiguration(null);
        setServerError(null);
        setSuccessMessage(null);
        reset(toFormValues(null));
    };

    const selectConfiguration = (configuration: AnalysisConfiguration) => {
        setSelectedConfiguration(configuration);
        setServerError(null);
        setSuccessMessage(null);
    };

    const onSubmit = async (values: AnalysisConfigurationFormValues) => {
        setServerError(null);
        setSuccessMessage(null);

        const payload = {
            name: values.name.trim(),
            agencyId: currentAgencyId,
            minTargetMarginPercent: values.minTargetMarginPercent,
            goodMarginPercent: values.goodMarginPercent,
            maxDailyFatigueScore: values.maxDailyFatigueScore,
            maxTransferMinutesPerDay: values.maxTransferMinutesPerDay,
            minBufferMinutes: values.minBufferMinutes,
            isDefault: values.isDefault,
        };

        try {
            if (selectedConfiguration) {
                await updateConfiguration({
                    uuid: selectedConfiguration.uuid,
                    body: payload,
                }).unwrap();

                setSuccessMessage('Configuration was updated successfully.');
            } else {
                await createConfiguration(payload).unwrap();

                setSuccessMessage('Configuration was created successfully.');
            }

            await refetch();
            setSelectedConfiguration(null);
            reset(toFormValues(null));
        } catch (error) {
            setServerError(getErrorMessage(error));
        }
    };

    const handleDelete = async () => {
        if (!selectedConfiguration) {
            return;
        }

        setServerError(null);
        setSuccessMessage(null);

        try {
            await deleteConfiguration({ uuid: selectedConfiguration.uuid }).unwrap();

            setSuccessMessage('Configuration was deleted successfully.');
            setSelectedConfiguration(null);
            reset(toFormValues(null));
            await refetch();
        } catch (error) {
            setServerError(getErrorMessage(error));
        }
    };

    if (!currentAgencyId) {
        return (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
                Agency is missing for the current user. Please sign in again.
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-[18px] font-semibold text-slate-900">
                        Analysis Settings
                    </h1>
                    <p className="mt-1 text-[13px] text-slate-400">
                        Configure thresholds used during package analysis
                    </p>
                </div>

                <UiButton
                    icon={<Plus size={15} />}
                    onClick={startNewConfiguration}
                    className="h-10 px-5"
                >
                    New Configuration
                </UiButton>
            </div>

            {successMessage && (
                <div className="flex items-start gap-2 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            {serverError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                    <span>{serverError}</span>
                </div>
            )}

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                {isLoading ? (
                    <div className="px-5 py-16 text-center text-sm text-slate-400">
                        Loading analysis configurations...
                    </div>
                ) : isError ? (
                    <div className="flex items-center justify-between px-5 py-6 text-sm text-red-600">
                        <span>Unable to load analysis configurations.</span>
                        <UiButton
                            size="sm"
                            variant="secondary"
                            onClick={() => refetch()}
                        >
                            Retry
                        </UiButton>
                    </div>
                ) : configurations.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                        <p className="text-sm font-medium text-slate-800">
                            No configurations yet
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                            Create the first configuration to control analysis thresholds.
                        </p>
                    </div>
                ) : (
                    <>
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                {[
                                    'Name',
                                    'Agency',
                                    'Default',
                                    'Min Target Margin',
                                    'Good Margin',
                                    'Max Fatigue',
                                    'Max Transfer',
                                ].map((header) => (
                                    <th
                                        key={header}
                                        className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-50">
                            {configurations.map((configuration) => {
                                const isSelected =
                                    selectedConfiguration?.uuid === configuration.uuid;

                                return (
                                    <tr
                                        key={configuration.uuid}
                                        onClick={() => selectConfiguration(configuration)}
                                        className={[
                                            'cursor-pointer transition hover:bg-slate-50',
                                            isSelected ? 'bg-blue-50/60' : '',
                                        ].join(' ')}
                                    >
                                        <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                                            {configuration.name}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-500">
                                            {configuration.agency?.name ?? currentAgency?.name ?? 'Current agency'}
                                        </td>

                                        <td className="px-5 py-4">
                                            {configuration.isDefault ? (
                                                <UiBadge variant="green">
                                                    Yes
                                                </UiBadge>
                                            ) : (
                                                <span className="text-sm text-slate-400">
                                                    —
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-sm font-medium text-slate-600">
                                            {toNumber(
                                                configuration.minTargetMarginPercent,
                                            )}
                                            %
                                        </td>

                                        <td className="px-5 py-4 text-sm font-medium text-slate-600">
                                            {toNumber(configuration.goodMarginPercent)}
                                            %
                                        </td>

                                        <td className="px-5 py-4 text-sm font-medium text-slate-600">
                                            {configuration.maxDailyFatigueScore}
                                        </td>

                                        <td className="px-5 py-4 text-sm font-medium text-slate-600">
                                            {configuration.maxTransferMinutesPerDay} min
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>

                        <div className="border-t border-slate-100 px-5 py-4 text-[13px] text-slate-400">
                            {isFetching
                                ? 'Refreshing configurations...'
                                : 'Click a row to edit it in the form below.'}
                        </div>
                    </>
                )}
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            >
                <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                    <h2 className="text-[15px] font-semibold text-slate-900">
                        {selectedConfiguration
                            ? `Edit Configuration — ${selectedConfiguration.name}`
                            : 'New Configuration'}
                    </h2>
                    <p className="mt-1 text-[13px] text-slate-400">
                        {selectedConfiguration
                            ? 'Update thresholds and save your changes.'
                            : 'Fill in the thresholds and save to add.'}
                    </p>
                </div>

                <div className="space-y-6 px-5 py-5">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label="Configuration Name"
                            error={errors.name?.message}
                        >
                            <input
                                {...register('name')}
                                className="form-input"
                                placeholder="e.g. Default v1"
                            />
                        </FormField>

                        <FormField label="Agency">
                            <div className="flex min-h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                                {currentAgency?.name ?? `Agency #${currentAgencyId}`}
                            </div>
                        </FormField>
                    </div>

                    <div className="border-t border-slate-100 pt-5">
                        <SectionTitle>Margin Thresholds</SectionTitle>

                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <FormField
                                label="Minimum Target Margin"
                                hint="Packages below this trigger a warning."
                                error={errors.minTargetMarginPercent?.message}
                            >
                                <InputWithSuffix suffix="%">
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        step="0.01"
                                        {...register('minTargetMarginPercent', {
                                            valueAsNumber: true,
                                        })}
                                        className="form-input pr-10"
                                    />
                                </InputWithSuffix>
                            </FormField>

                            <FormField
                                label="Good Margin"
                                hint="Packages above this are considered healthy."
                                error={errors.goodMarginPercent?.message}
                            >
                                <InputWithSuffix suffix="%">
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        step="0.01"
                                        {...register('goodMarginPercent', {
                                            valueAsNumber: true,
                                        })}
                                        className="form-input pr-10"
                                    />
                                </InputWithSuffix>
                            </FormField>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-5">
                        <SectionTitle>Fatigue & Schedule Thresholds</SectionTitle>

                        <div className="mt-4 grid grid-cols-3 gap-4">
                            <FormField
                                label="Max Daily Fatigue Score"
                                hint="Days above this score are flagged critical."
                                error={errors.maxDailyFatigueScore?.message}
                            >
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    {...register('maxDailyFatigueScore', {
                                        valueAsNumber: true,
                                    })}
                                    className="form-input"
                                />
                            </FormField>

                            <FormField
                                label="Max Transfer Minutes Per Day"
                                hint="Excess triggers a transfer load warning."
                                error={errors.maxTransferMinutesPerDay?.message}
                            >
                                <InputWithSuffix suffix="min">
                                    <input
                                        type="number"
                                        min={0}
                                        {...register('maxTransferMinutesPerDay', {
                                            valueAsNumber: true,
                                        })}
                                        className="form-input pr-12"
                                    />
                                </InputWithSuffix>
                            </FormField>

                            <FormField
                                label="Minimum Buffer Minutes"
                                hint="Free time required between activities."
                                error={errors.minBufferMinutes?.message}
                            >
                                <InputWithSuffix suffix="min">
                                    <input
                                        type="number"
                                        min={0}
                                        {...register('minBufferMinutes', {
                                            valueAsNumber: true,
                                        })}
                                        className="form-input pr-12"
                                    />
                                </InputWithSuffix>
                            </FormField>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-5">
                        <label className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                {...register('isDefault')}
                                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                            />

                            <span>
                                <span className="block text-sm font-medium text-slate-700">
                                    Set as Default
                                </span>
                                <span className="mt-1 block text-[13px] text-slate-400">
                                    This configuration will be used for new analyses unless overridden.
                                </span>
                            </span>
                        </label>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-4">
                    <div>
                        {selectedConfiguration && (
                            <UiButton
                                type="button"
                                variant="danger"
                                icon={<Trash2 size={13} />}
                                disabled={isDeleting || isSaving}
                                onClick={handleDelete}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Configuration'}
                            </UiButton>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedConfiguration && (
                            <UiButton
                                type="button"
                                variant="secondary"
                                onClick={startNewConfiguration}
                                disabled={isSaving}
                            >
                                Cancel Edit
                            </UiButton>
                        )}

                        <UiButton
                            type="submit"
                            icon={<CheckCircle2 size={14} />}
                            disabled={isSaving || (selectedConfiguration ? !isDirty : false)}
                        >
                            {isSaving
                                ? 'Saving...'
                                : selectedConfiguration
                                    ? 'Save Changes'
                                    : 'Create Configuration'}
                        </UiButton>
                    </div>
                </div>
            </form>
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {children}
        </h3>
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
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {label}
            </label>

            {hint && <p className="mb-2 text-[13px] text-slate-400">{hint}</p>}

            {children}

            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

function InputWithSuffix({
                             suffix,
                             children,
                         }: {
    suffix: string;
    children: React.ReactNode;
}) {
    return (
        <div className="relative">
            {children}
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                {suffix}
            </span>
        </div>
    );
}
