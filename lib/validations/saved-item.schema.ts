import { z } from "zod";

export const savedItemSchema = z.object({
  targetSlug: z.string().min(1, "targetSlug is required"),
  targetType: z.enum(["DESTINASI", "UMKM"]),
});
