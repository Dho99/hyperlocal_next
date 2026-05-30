import { z } from "zod";
import { FACILITY_TYPES } from "@/lib/config/halal-readiness";

export const facilitySchema = z.object({
    name: z.string().min(3, "Nama fasilitas minimal 3 karakter"),
    description: z.string().optional().nullable(),
    facilityType: z.enum(FACILITY_TYPES).optional().nullable(),
    weight: z.coerce.number().int().min(0).max(100).optional().nullable(),
    maxDistance: z.coerce.number().min(0, "Minimal 0 km").max(100, "Maksimal 100 km").default(5.0),
});

export type FacilityFormData = z.infer<typeof facilitySchema>;
