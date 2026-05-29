import { z } from "zod";

export const createReviewSchema = z
    .object({
        destinationId: z.string().uuid().optional(),
        umkmId: z.string().uuid().optional(),
        rating: z.coerce.number().int().min(1).max(5),
        comment: z
            .string()
            .trim()
            .max(1000, "Ulasan maksimal 1000 karakter")
            .optional(),
    })
    .refine((data) => data.destinationId || data.umkmId, {
        message: "Destination atau UMKM wajib dipilih",
        path: ["destinationId"],
    });

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
