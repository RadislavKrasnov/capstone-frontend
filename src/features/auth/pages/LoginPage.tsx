import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import type { AppDispatch } from '../../../app/store';
import { setLoginCredentials } from '../authSlice';
import { AuthLogo } from '../components/AuthLogo';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';
import { useLoginMutation } from '../api/authApi';

function getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (
        typeof error === 'object' &&
        error !== null &&
        'data' in error
    ) {
        const data = (error as { data?: unknown }).data;

        if (
            typeof data === 'object' &&
            data !== null &&
            'message' in data
        ) {
            const message = (data as { message?: unknown }).message;

            if (Array.isArray(message)) {
                return message.join(', ');
            }

            if (typeof message === 'string') {
                return message;
            }
        }

        if (typeof data === 'string') {
            return data;
        }
    }

    return fallbackMessage;
}

export function LoginPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [login, { isLoading }] = useLoginMutation();
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const translateError = (message?: string) => {
        return message ? t(message) : undefined;
    };

    const onSubmit = async (values: LoginFormValues) => {
        setServerError(null);

        try {
            const response = await login(values).unwrap();

            dispatch(setLoginCredentials(response));

            navigate('/packages');
        } catch (error) {
            setServerError(getErrorMessage(error, t('auth.errors.loginFailed')));
        }
    };

    const emailError = translateError(errors.email?.message);
    const passwordError = translateError(errors.password?.message);
    const visibleError = serverError ?? emailError ?? passwordError;

    return (
        <section className="w-full max-w-[425px]">
            <div className="text-center">
                <AuthLogo />

                <h1 className="mt-5 text-[22px] font-semibold leading-none tracking-[-0.01em] text-slate-900">
                    {t('auth.appName')}
                </h1>

                <p className="mt-3 text-[15px] font-normal text-slate-400">
                    {t('auth.loginSubtitle')}
                </p>
            </div>

            <div className="mt-9 rounded-2xl border border-slate-200 bg-white px-9 py-9 shadow-[0_1px_4px_rgba(15,23,42,0.08),0_1px_2px_rgba(15,23,42,0.06)]">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-[15px] font-medium text-slate-700"
                        >
                            {t('auth.email')}
                        </label>

                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder={t('auth.placeholders.email')}
                            aria-invalid={Boolean(emailError)}
                            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            {...register('email')}
                        />
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label
                                htmlFor="password"
                                className="block text-[15px] font-medium text-slate-700"
                            >
                                {t('auth.password')}
                            </label>

                            <button
                                type="button"
                                className="text-[13px] font-medium text-blue-600 transition hover:text-blue-700"
                            >
                                {t('auth.forgotPassword')}
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                placeholder={t('auth.placeholders.password')}
                                aria-invalid={Boolean(passwordError)}
                                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 pr-11 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                {...register('password')}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((current) => !current)}
                                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-slate-600"
                                aria-label={
                                    showPassword
                                        ? t('common.hidePassword')
                                        : t('common.showPassword')
                                }
                            >
                                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </div>
                    </div>

                    {visibleError && (
                        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                            <span>{visibleError}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 text-[15px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isLoading ? t('auth.signingIn') : t('auth.login')}
                    </button>
                </form>
            </div>

            <p className="mt-8 text-center text-[15px] text-slate-400">
                {t('auth.noAccount')}
                <Link
                    to="/signup"
                    className="ml-1 font-medium text-blue-600 transition hover:text-blue-700"
                >
                    {t('auth.createAccount')}
                </Link>
            </p>

            <p className="mt-10 text-center text-[13px] text-slate-300">
                {t('auth.internalUseOnly')}
            </p>
        </section>
    );
}
