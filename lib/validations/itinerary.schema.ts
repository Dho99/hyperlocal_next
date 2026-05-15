import { z } from "zod";

export const itineraryItemSchema = z.object({
  destinationId: z.string().uuid(),
  dayNumber: z.number().int().min(1),
  orderIndex: z.number().int().min(0),
  estimatedTime: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export const createItinerarySchema = z.object({
  title: z.string().min(1),
  city: z.string().optional(),
  province: z.string().optional(),
  startDate: z.string().datetime().optional().or(z.string().date().optional()),
  endDate: z.string().datetime().optional().or(z.string().date().optional()),
  items: z.array(itineraryItemSchema),
});

export const recommendItinerarySchema = z.object({
  city: z.string().optional(),
  province: z.string().optional(),
  durationDays: z.number().int().min(1).default(1),
  halalOnly: z.boolean().default(true),
  categoryIds: z.array(z.string().uuid()).optional(),
  maxDestinations: z.number().int().min(1).max(20).default(5),
});
