import { z } from 'zod';

export const tourPackageSchema = z.object({
    title: z.string().trim().min(1, 'packages.errors.titleRequired').max(255),
    slug: z
        .string()
        .trim()
        .min(3, 'packages.errors.slugTooShort')
        .max(255)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'packages.errors.slugInvalid'),
    description: z.string().trim().optional(),
    destinationCountry: z.string().trim().optional(),
    destinationCity: z.string().trim().optional(),
    durationDays: z.number().int().min(1, 'packages.errors.durationRequired'),
    expectedGroupSize: z.number().int().min(1, 'packages.errors.groupSizeRequired'),
    sellingPricePerPerson: z.number().min(0, 'packages.errors.priceRequired'),
    currencyCode: z
        .string()
        .trim()
        .regex(/^[A-Z]{3}$/, 'packages.errors.currencyInvalid'),
    status: z.enum(['DRAFT', 'ANALYZED', 'PUBLISHED', 'ARCHIVED']),
    internalNotes: z.string().trim().optional(),
});

export type TourPackageFormValues = z.infer<typeof tourPackageSchema>;
