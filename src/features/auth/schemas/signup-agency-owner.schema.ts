import { z } from 'zod';

const optionalText = z.string().trim().optional();

export const signupAgencyOwnerSchema = z.object({
    agency: z.object({
        name: z
            .string()
            .trim()
            .min(1, 'auth.errors.agencyNameRequired')
            .max(150, 'auth.errors.agencyNameTooLong'),

        slug: z
            .string()
            .trim()
            .min(3, 'auth.errors.agencySlugTooShort')
            .max(180, 'auth.errors.agencySlugTooLong')
            .regex(
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                'auth.errors.agencySlugInvalid',
            ),

        phoneNumber: optionalText,

        website: z
            .string()
            .trim()
            .optional()
            .refine(
                (value) => !value || /^https?:\/\/.+\..+/.test(value),
                'auth.errors.websiteInvalid',
            ),

        country: optionalText,
        city: optionalText,
    }),

    email: z
        .string()
        .trim()
        .min(1, 'auth.errors.emailRequired')
        .email('auth.errors.emailInvalid')
        .max(255, 'auth.errors.emailTooLong'),

    username: z
        .string()
        .trim()
        .min(3, 'auth.errors.usernameTooShort')
        .max(80, 'auth.errors.usernameTooLong')
        .regex(
            /^[a-zA-Z0-9._-]+$/,
            'auth.errors.usernameInvalid',
        ),

    password: z
        .string()
        .min(6, 'auth.errors.passwordTooShort')
        .max(100, 'auth.errors.passwordTooLong'),

    firstName: z
        .string()
        .trim()
        .min(1, 'auth.errors.firstNameRequired')
        .max(100, 'auth.errors.firstNameTooLong'),

    lastName: z
        .string()
        .trim()
        .min(1, 'auth.errors.lastNameRequired')
        .max(100, 'auth.errors.lastNameTooLong'),

    phoneNumber: optionalText,
});

export type SignupAgencyOwnerFormValues = z.infer<
    typeof signupAgencyOwnerSchema
>;
