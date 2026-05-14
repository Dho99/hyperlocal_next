import { z } from "zod";

export const facilitySchema = z.object({
    destinationId: z.string().min(1, "Destinasi harus dipilih"),
    name: z.string().min(3, "Nama fasilitas minimal 3 karakter"),
    description: z.string().optional().nullable(),
    facilityType: z.string().optional().nullable(),
});

export type FacilityFormData = z.infer<typeof facilitySchema>;
