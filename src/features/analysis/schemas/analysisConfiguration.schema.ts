import { z } from 'zod';

export const analysisConfigurationSchema = z
    .object({
        name: z.string().trim().min(1, 'Configuration name is required').max(255),
        agencyId: z.string().optional(),
        minTargetMarginPercent: z.number().min(0).max(100),
        goodMarginPercent: z.number().min(0).max(100),
        maxDailyFatigueScore: z.number().int().min(0).max(100),
        maxTransferMinutesPerDay: z.number().int().min(0),
        minBufferMinutes: z.number().int().min(0),
        isDefault: z.boolean(),
    })
    .refine(
        (values) => values.goodMarginPercent >= values.minTargetMarginPercent,
        {
            message: 'Good margin must be greater than or equal to minimum target margin',
            path: ['goodMarginPercent'],
        },
    );

export type AnalysisConfigurationFormValues = z.infer<
    typeof analysisConfigurationSchema
>;
