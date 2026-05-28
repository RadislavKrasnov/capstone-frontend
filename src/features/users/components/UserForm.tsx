import { useState } from 'react';
import { AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import type { RootState } from '../../../app/store';
import { UiButton } from '../../../shared/components/UiButton';
import {
    agencyUserSchema,
    type AgencyUserFormValues,
} from '../schemas/user.schema';
import {
    useCreateUserMutation,
    useUpdateUserMutation,
} from '../api/usersApi';
import type { AgencyUser } from '../types/user.types';

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

    return 'users.errors.fallback';
}

type UserFormProps = {
    mode: 'add' | 'edit';
    user?: AgencyUser | null;
    onCancel: () => void;
    onSuccess: () => void;
};

export function UserForm({ mode, user, onCancel, onSuccess }: UserFormProps) {
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const { t } = useTranslation();

    const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

    const isSaving = isCreating || isUpdating;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AgencyUserFormValues>({
        resolver: zodResolver(agencyUserSchema),
        defaultValues: {
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            email: user?.email ?? '',
            username: user?.username ?? '',
            password: '',
            role: user?.role ?? 'MANAGER',
            agencyId: user?.agencyId ?? currentUser?.agencyId ?? 0,
            phoneNumber: user?.phoneNumber ?? '',
            dateOfBirth: user?.dateOfBirth ?? '',
            isActive: user?.isActive ?? true,
        },
    });

    const onSubmit = async (values: AgencyUserFormValues) => {
        setServerError(null);

        const password = values.password?.trim();

        if (mode === 'add' && !password) {
            setServerError('users.errors.passwordRequiredForNewUser');
            return;
        }

        const payload = {
            ...values,
            password: password || undefined,
            phoneNumber: values.phoneNumber?.trim() || undefined,
            dateOfBirth: values.dateOfBirth?.trim() || undefined,
        };

        try {
            if (mode === 'add') {
                await createUser({
                    ...payload,
                    password: password as string,
                }).unwrap();
            } else if (user) {
                await updateUser({
                    uuid: user.uuid,
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
                    <span>{t(serverError)}</span>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <FormField label={t('users.fields.firstName')} error={errors.firstName?.message ? t(errors.firstName.message) : undefined}>
                    <input
                        {...register('firstName')}
                        className="form-input"
                        placeholder={t('users.placeholders.firstName')}
                    />
                </FormField>

                <FormField label={t('users.fields.lastName')} error={errors.lastName?.message ? t(errors.lastName.message) : undefined}>
                    <input
                        {...register('lastName')}
                        className="form-input"
                        placeholder={t('users.placeholders.lastName')}
                    />
                </FormField>
            </div>

            <FormField label={t('users.fields.email')} error={errors.email?.message ? t(errors.email.message) : undefined}>
                <input
                    {...register('email')}
                    className="form-input"
                    placeholder={t('users.placeholders.email')}
                />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
                <FormField label={t('users.fields.username')} error={errors.username?.message ? t(errors.username.message) : undefined}>
                    <input
                        {...register('username')}
                        className="form-input"
                        placeholder={t('users.placeholders.username')}
                    />
                </FormField>

                <FormField label={t('users.fields.role')} error={errors.role?.message ? t(errors.role.message) : undefined}>
                    <select {...register('role')} className="form-input">
                        <option value="MANAGER">MANAGER</option>
                        <option value="OWNER">OWNER</option>
                    </select>
                </FormField>
            </div>

            <FormField
                label={t('users.fields.password')}
                error={errors.password?.message ? t(errors.password.message) : undefined}
                hint={mode === 'edit' ? t('users.hints.keepCurrentPassword') : undefined}
            >
                <div className="relative">
                    <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        className="form-input pr-10"
                        placeholder={t('users.placeholders.password')}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100"
                        aria-label={
                            showPassword
                                ? t('common.hidePassword')
                                : t('common.showPassword')
                        }
                    >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                </div>
            </FormField>

            <input
                type="hidden"
                {...register('agencyId', { valueAsNumber: true })}
            />

            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <input
                    type="checkbox"
                    {...register('isActive')}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                {t('users.status.activeUser')}
            </label>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
                <UiButton variant="secondary" onClick={onCancel} disabled={isSaving}>
                    {t('users.actions.cancel')}
                </UiButton>
                <UiButton
                    type="submit"
                    disabled={isSaving}
                    icon={<CheckCircle size={13} />}
                >
                    {isSaving ? t('users.actions.saving') : t('users.actions.saveUser')}
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
