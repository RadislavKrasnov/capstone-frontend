import { z } from 'zod';

export const agencyUserSchema = z.object({
    firstName: z.string().trim().min(1, 'First name is required').max(100),
    lastName: z.string().trim().min(1, 'Last name is required').max(100),
    email: z.string().trim().email('Enter a valid email').max(255),
    username: z.string().trim().min(3, 'Username is too short').max(80),
    password: z
        .string()
        .trim()
        .optional()
        .refine((value) => !value || value.length >= 6, {
            message: 'Password must contain at least 6 characters',
        }),
    role: z.enum(['OWNER', 'MANAGER']),
    agencyId: z.number().int().min(1),
    phoneNumber: z.string().trim().optional(),
    dateOfBirth: z.string().trim().optional(),
    isActive: z.boolean(),
});

export type AgencyUserFormValues = z.infer<typeof agencyUserSchema>;