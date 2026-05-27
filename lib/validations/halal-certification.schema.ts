import { z } from "zod";
import { CertificationStatus } from "@/lib/generated/prisma";

export const createCertificationSchema = z.object({
    umkmId: z.string().min(1, { message: "UMKM ID wajib diisi" }),
    certificateNo: z.string().optional().or(z.literal("")).nullable(),
    issuer: z.string().optional().or(z.literal("")).nullable(),
    issuedAt: z.date().optional().nullable(),
    expiredAt: z.date().optional().nullable(),
    status: z.nativeEnum(CertificationStatus),
    documentUrl: z.string().optional().or(z.literal("")).nullable(),
});

export const updateCertificationSchema = createCertificationSchema.partial();

export type CreateCertificationInput = z.infer<typeof createCertificationSchema>;
export type UpdateCertificationInput = z.infer<typeof updateCertificationSchema>;
