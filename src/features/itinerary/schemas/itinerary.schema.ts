import { z } from 'zod';

const optionalTime = z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^([01]\d|2[0-3]):[0-5]\d$/.test(value), {
        message: 'Use HH:mm format',
    });

export const tourDaySchema = z.object({
    dayNumber: z.number().int().min(1, 'Day number is required'),
    title: z.string().trim().min(1, 'Day title is required').max(255),
    description: z.string().trim().optional(),
    isRestDay: z.boolean(),
});

export const itineraryItemSchema = z.object({
    itemOrder: z.number().int().min(1, 'Order is required'),
    type: z.enum(['ACTIVITY', 'TRANSFER', 'MEAL', 'FREE_TIME', 'HOTEL', 'FLIGHT']),
    title: z.string().trim().min(1, 'Item title is required').max(255),
    description: z.string().trim().optional(),
    startTime: optionalTime,
    endTime: optionalTime,
    durationMinutes: z.number().int().min(1).optional().nullable(),
    locationName: z.string().trim().optional(),
    startLocation: z.string().trim().optional(),
    endLocation: z.string().trim().optional(),
    intensity: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().nullable(),
    isMajorActivity: z.boolean(),
});

export type TourDayFormValues = z.infer<typeof tourDaySchema>;
export type ItineraryItemFormValues = z.infer<typeof itineraryItemSchema>;
