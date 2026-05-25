import { z } from 'zod';

const optionalText = z.string().trim().optional();

export const signupAgencyOwnerSchema = z.object({
    agency: z.object({
        name: z
            .string()
            .trim()
            .min(1, 'Agency name is required')
            .max(150, 'Agency name is too long'),

        slug: z
            .string()
            .trim()
            .min(3, 'Slug must contain at least 3 characters')
            .max(180, 'Slug is too long')
            .regex(
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                'Use lowercase letters, numbers, and hyphens only',
            ),

        phoneNumber: optionalText,

        website: z
            .string()
            .trim()
            .optional()
            .refine(
                (value) => !value || /^https?:\/\/.+\..+/.test(value),
                'Enter a valid website URL, for example https://travel-pro.com',
            ),

        country: optionalText,
        city: optionalText,
    }),

    email: z
        .string()
        .trim()
        .min(1, 'Email is required')
        .email('Enter a valid email address')
        .max(255, 'Email is too long'),

    username: z
        .string()
        .trim()
        .min(3, 'Username must contain at least 3 characters')
        .max(80, 'Username is too long')
        .regex(
            /^[a-zA-Z0-9._-]+$/,
            'Use letters, numbers, dots, underscores, or hyphens only',
        ),

    password: z
        .string()
        .min(6, 'Password must contain at least 6 characters')
        .max(100, 'Password is too long'),

    firstName: z
        .string()
        .trim()
        .min(1, 'First name is required')
        .max(100, 'First name is too long'),

    lastName: z
        .string()
        .trim()
        .min(1, 'Last name is required')
        .max(100, 'Last name is too long'),

    phoneNumber: optionalText,
});

export type SignupAgencyOwnerFormValues = z.infer<
    typeof signupAgencyOwnerSchema
>;
