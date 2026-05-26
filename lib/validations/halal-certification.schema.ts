import { z } from "zod";
import { CertificationStatus } from "@/lib/generated/prisma";

export const createCertificationSchema = z.object({
    umkmId: z.string().min(1, { message: "UMKM ID wajib diisi" }),
    certificateNo: z.string().min(1, { message: "Nomor sertifikat wajib diisi" }).optional().or(z.literal("")),
    issuer: z.string().min(1, { message: "Penerbit wajib diisi" }).optional().or(z.literal("")),
    issuedAt: z.coerce.date({ invalid_type_error: "Format tanggal tidak valid" }).optional().nullable(),
    expiredAt: z.coerce.date({ invalid_type_error: "Format tanggal tidak valid" }).optional().nullable(),
    status: z.nativeEnum(CertificationStatus).default(CertificationStatus.PENDING),
    documentUrl: z.string().url({ message: "URL dokumen tidak valid" }).optional().or(z.literal("")).nullable(),
});

export const updateCertificationSchema = createCertificationSchema.partial();

export type CreateCertificationInput = z.infer<typeof createCertificationSchema>;
export type UpdateCertificationInput = z.infer<typeof updateCertificationSchema>;
