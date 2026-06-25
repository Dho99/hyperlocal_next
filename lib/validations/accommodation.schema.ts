import { z } from "zod";

export const accommodationSchema = z.object({
    name: z.string().min(2, "Nama penginapan minimal 2 karakter"),
    slug: z
        .string()
        .min(2, "Slug minimal 2 karakter")
        .regex(
            /^[a-z0-9-]+$/,
            "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung",
        ),
    address: z.string().min(5, "Alamat minimal 5 karakter").optional().or(z.literal("")),
    city: z.string().min(2, "Kota minimal 2 karakter").optional().or(z.literal("")),
    province: z.string().min(2, "Provinsi minimal 2 karakter").optional().or(z.literal("")),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    phone: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    estimatedCost: z.number().positive("Harga harus positif").optional().nullable(),
    description: z.any().optional().nullable(),
    images: z
        .preprocess(
            (val) => (val == null ? [] : val),
            z.array(z.object({ imageUrl: z.string(), isPrimary: z.boolean().optional(), caption: z.string().optional() })),
        )
        .default([]),
    facilityIds: z.array(z.string().uuid()).optional().default([]),
});

export type AccommodationFormValues = z.infer<typeof accommodationSchema>;
