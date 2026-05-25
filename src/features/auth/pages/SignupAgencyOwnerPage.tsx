import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';

import type { AppDispatch } from '../../../app/store';
import { setSignupAgencyOwnerCredentials } from '../authSlice';
import { AuthLogo } from '../components/AuthLogo';
import { useSignupAgencyOwnerMutation } from '../api/authApi';
import {
    signupAgencyOwnerSchema,
    type SignupAgencyOwnerFormValues,
} from '../schemas/signup-agency-owner.schema';

function emptyToUndefined(value?: string) {
    const trimmedValue = value?.trim();

    return trimmedValue ? trimmedValue : undefined;
}

function getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'data' in error) {
        const data = (error as { data?: unknown }).data;

        if (typeof data === 'object' && data !== null && 'message' in data) {
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

    return 'Unable to create account. Please check the form and try again.';
}

function createSlug(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

export function SignupAgencyOwnerPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [signupAgencyOwner, { isLoading }] = useSignupAgencyOwnerMutation();
    const dispatch = useDispatch<AppDispatch>();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<SignupAgencyOwnerFormValues>({
        resolver: zodResolver(signupAgencyOwnerSchema),
        defaultValues: {
            agency: {
                name: '',
                slug: '',
                phoneNumber: '',
                website: '',
                country: '',
                city: '',
            },
            email: '',
            username: '',
            password: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
        },
    });

    const agencyName = watch('agency.name');

    const generatedSlug = useMemo(() => createSlug(agencyName), [agencyName]);

    const onGenerateSlug = () => {
        setValue('agency.slug', generatedSlug, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const onSubmit = async (values: SignupAgencyOwnerFormValues) => {
        setServerError(null);

        try {
            const response = await signupAgencyOwner({
                agency: {
                    name: values.agency.name.trim(),
                    slug: values.agency.slug.trim(),
                    phoneNumber: emptyToUndefined(values.agency.phoneNumber),
                    website: emptyToUndefined(values.agency.website),
                    country: emptyToUndefined(values.agency.country),
                    city: emptyToUndefined(values.agency.city),
                },
                email: values.email.trim(),
                username: values.username.trim(),
                password: values.password,
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim(),
                phoneNumber: emptyToUndefined(values.phoneNumber),
            }).unwrap();

            dispatch(setSignupAgencyOwnerCredentials(response));

            navigate('/packages');
        } catch (error) {
            setServerError(getErrorMessage(error));
        }
    };

    const visibleError =
        serverError ??
        errors.agency?.name?.message ??
        errors.agency?.slug?.message ??
        errors.agency?.website?.message ??
        errors.email?.message ??
        errors.username?.message ??
        errors.password?.message ??
        errors.firstName?.message ??
        errors.lastName?.message ??
        errors.phoneNumber?.message;

    return (
        <section className="w-full max-w-[560px]">
            <div className="text-center">
                <AuthLogo />

                <h1 className="mt-5 text-[22px] font-semibold leading-none tracking-[-0.01em] text-slate-900">
                    Tour Package Analyzer
                </h1>

                <p className="mt-3 text-[15px] font-normal text-slate-400">
                    Create your agency workspace
                </p>
            </div>

            <div className="mt-9 rounded-2xl border border-slate-200 bg-white px-9 py-8 shadow-[0_1px_4px_rgba(15,23,42,0.08),0_1px_2px_rgba(15,23,42,0.06)]">
                <form className="space-y-7" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                            Agency information
                        </h2>

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="agencyName"
                                    className="mb-2 block text-[15px] font-medium text-slate-700"
                                >
                                    Agency name
                                </label>
                                <input
                                    id="agencyName"
                                    type="text"
                                    placeholder="Travel Pro"
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    {...register('agency.name')}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <div className="mb-2 flex items-center justify-between">
                                    <label
                                        htmlFor="agencySlug"
                                        className="block text-[15px] font-medium text-slate-700"
                                    >
                                        Agency slug
                                    </label>

                                    <button
                                        type="button"
                                        onClick={onGenerateSlug}
                                        disabled={!generatedSlug}
                                        className="text-[13px] font-medium text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-300"
                                    >
                                        Generate from name
                                    </button>
                                </div>

                                <input
                                    id="agencySlug"
                                    type="text"
                                    placeholder="travel-pro"
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    {...register('agency.slug')}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="country"
                                    className="mb-2 block text-[15px] font-medium text-slate-700"
                                >
                                    Country
                                </label>
                                <input
                                    id="country"
                                    type="text"
                                    placeholder="Ukraine"
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    {...register('agency.country')}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="city"
                                    className="mb-2 block text-[15px] font-medium text-slate-700"
                                >
                                    City
                                </label>
                                <input
                                    id="city"
                                    type="text"
                                    placeholder="Kharkiv"
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    {...register('agency.city')}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="agencyPhone"
                                    className="mb-2 block text-[15px] font-medium text-slate-700"
                                >
                                    Agency phone
                                </label>
                                <input
                                    id="agencyPhone"
                                    type="tel"
                                    placeholder="+380501112233"
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    {...register('agency.phoneNumber')}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="website"
                                    className="mb-2 block text-[15px] font-medium text-slate-700"
                                >
                                    Website
                                </label>
                                <input
                                    id="website"
                                    type="url"
                                    placeholder="https://travel-pro.com"
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    {...register('agency.website')}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                            Owner account
                        </h2>

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="firstName"
                                    className="mb-2 block text-[15px] font-medium text-slate-700"
                                >
                                    First name
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    placeholder="John"
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    {...register('firstName')}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="lastName"
                                    className="mb-2 block text-[15px] font-medium text-slate-700"
                                >
                                    Last name
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    placeholder="Smith"
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    {...register('lastName')}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-[15px] font-medium text-slate-700"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="owner@example.com"
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    {...register('email')}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="username"
                                    className="mb-2 block text-[15px] font-medium text-slate-700"
                                >
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="owner"
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    {...register('username')}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="ownerPhone"
                                    className="mb-2 block text-[15px] font-medium text-slate-700"
                                >
                                    Owner phone
                                </label>
                                <input
                                    id="ownerPhone"
                                    type="tel"
                                    placeholder="+380501112233"
                                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    {...register('phoneNumber')}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-[15px] font-medium text-slate-700"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 pr-11 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                        {...register('password')}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((current) => !current)
                                        }
                                        className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 transition hover:text-slate-600"
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={17} />
                                        ) : (
                                            <Eye size={17} />
                                        )}
                                    </button>
                                </div>
                            </div>
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
                        {isLoading ? 'Creating account…' : 'Create account'}
                    </button>
                </form>
            </div>

            <p className="mt-8 text-center text-[15px] text-slate-400">
                Already have an account?
                <Link
                    to="/login"
                    className="ml-1 font-medium text-blue-600 transition hover:text-blue-700"
                >
                    Login
                </Link>
            </p>

            <p className="mt-10 text-center text-[13px] text-slate-300">
                WanderCraft Agency · Internal Use Only
            </p>
        </section>
    );
}
