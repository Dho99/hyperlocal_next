import { z } from "zod";

export const umkmSchema = z.object({
    name: z.string().min(2, "Nama UMKM minimal 2 karakter"),
    slug: z
        .string()
        .min(2, "Slug minimal 2 karakter")
        .regex(
            /^[a-z0-9-]+$/,
            "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung",
        ),
    ownerId: z.string().optional().nullable(),
    destinationId: z.string().uuid("Pilih destinasi yang valid").optional().nullable(),
    categoryId: z.string().uuid("Pilih kategori yang valid").optional().nullable(),
    description: z.string().min(10, "Deskripsi minimal 10 karakter").optional().nullable(),
    address: z.string().min(5, "Alamat minimal 5 karakter").optional().nullable(),
    phone: z.string().min(10, "Nomor telepon minimal 10 karakter").optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
});

export type UmkmFormValues = z.infer<typeof umkmSchema>;
