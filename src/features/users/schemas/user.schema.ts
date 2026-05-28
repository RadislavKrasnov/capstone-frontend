import { z } from 'zod';

export const agencyUserSchema = z.object({
    firstName: z.string().trim().min(1, 'users.errors.firstNameRequired').max(100),
    lastName: z.string().trim().min(1, 'users.errors.lastNameRequired').max(100),
    email: z.string().trim().email('users.errors.emailInvalid').max(255),
    username: z.string().trim().min(3, 'users.errors.usernameTooShort').max(80),
    password: z
        .string()
        .trim()
        .optional()
        .refine((value) => !value || value.length >= 6, {
            message: 'users.errors.passwordTooShort',
        }),
    role: z.enum(['OWNER', 'MANAGER']),
    agencyId: z.number().int().min(1),
    phoneNumber: z.string().trim().optional(),
    dateOfBirth: z.string().trim().optional(),
    isActive: z.boolean(),
});

export type AgencyUserFormValues = z.infer<typeof agencyUserSchema>;