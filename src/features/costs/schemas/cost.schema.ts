import { z } from 'zod';

export const costItemSchema = z.object({
    supplierId: z.string().optional(),
    dayId: z.string().optional(),
    category: z.enum([
        'HOTEL',
        'FLIGHT',
        'TRANSPORT',
        'GUIDE',
        'MEAL',
        'ACTIVITY',
        'INSURANCE',
        'OTHER',
    ]),
    name: z.string().trim().min(1, 'Cost item name is required').max(255),
    description: z.string().trim().optional(),
    costType: z.enum(['FIXED', 'PER_PERSON', 'PER_GROUP', 'PER_DAY']),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    unitCost: z.number().min(0, 'Unit cost must be greater than or equal to 0'),
    currencyCode: z
        .string()
        .trim()
        .regex(/^[A-Z]{3}$/, 'Use 3-letter currency code'),
    isRequired: z.boolean(),
});

export type CostItemFormValues = z.infer<typeof costItemSchema>;
