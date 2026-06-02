import { z } from 'zod';

export const packageContentItemSchema = z.object({
    text: z.string().trim().min(1, 'Text is required').max(255),
    displayOrder: z.number().int().min(1, 'Display order is required'),
});

export type PackageContentItemFormValues = z.infer<
    typeof packageContentItemSchema
>;
