import { z } from "zod";

export const facilitySchema = z.object({
    name: z.string().min(3, "Nama fasilitas minimal 3 karakter"),
    description: z.string().optional().nullable(),
    facilityType: z.string().optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
});

export type FacilityFormData = z.infer<typeof facilitySchema>;
