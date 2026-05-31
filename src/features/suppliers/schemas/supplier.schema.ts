import { z } from 'zod';

const optionalEmail = z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
        message: 'Enter a valid email',
    });

export const supplierSchema = z.object({
    name: z.string().trim().min(1, 'Supplier name is required').max(255),
    type: z.enum(['HOTEL', 'TRANSPORT', 'GUIDE', 'ACTIVITY', 'RESTAURANT', 'OTHER']),
    contactEmail: optionalEmail,
    contactPhone: z.string().trim().max(100).optional(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
