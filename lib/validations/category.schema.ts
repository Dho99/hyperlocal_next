import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
  slug: z.string().min(2, "Slug minimal 2 karakter").regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung"),
  description: z.string().optional(),
});
