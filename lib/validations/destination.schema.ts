import { z } from "zod";

export const destinationSchema = z.object({
    name: z.string().min(2, "Nama destinasi minimal 2 karakter"),
    slug: z
        .string()
        .min(2, "Slug minimal 2 karakter")
        .regex(
            /^[a-z0-9-]+$/,
            "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung",
        ),
    categoryId: z.string().uuid("Pilih kategori yang valid"),
    description: z.any().optional(),
    address: z.string().min(5, "Alamat minimal 5 karakter"),
    city: z.string().min(2, "Kota minimal 2 karakter"),
    province: z.string().min(2, "Provinsi minimal 2 karakter"),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    facilityIds: z.array(z.string().uuid()).default([]),
    images: z.array(z.string()),
});

export type DestinationFormValues = z.infer<typeof destinationSchema>;
