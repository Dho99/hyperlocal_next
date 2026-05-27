import { z } from "zod";
import { ValidationStatus } from "@/lib/generated/prisma";

export const processValidationSchema = z
    .object({
        status: z.nativeEnum(ValidationStatus),
        notes: z
            .string()
            .max(1000, "Catatan tidak boleh lebih dari 1000 karakter")
            .optional()
            .nullable(),

        // Certification fields (Conditionally required if status is APPROVED)
        certificateNo: z.string().optional().nullable(),
        issuer: z.string().optional().nullable(),
        issuedAt: z.date().optional().nullable(),
        expiredAt: z.date().optional().nullable(),
        documentUrl: z.string().optional().nullable().or(z.literal("")),
    })
    .superRefine((data, ctx) => {
        if (data.status === "APPROVED") {
            if (!data.certificateNo || data.certificateNo.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Nomor Sertifikat wajib diisi jika disetujui",
                    path: ["certificateNo"],
                });
            }
            if (!data.issuer || data.issuer.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Penerbit wajib diisi jika disetujui",
                    path: ["issuer"],
                });
            }
            if (!data.issuedAt) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Tanggal Terbit wajib diisi jika disetujui",
                    path: ["issuedAt"],
                });
            }
            if (!data.expiredAt) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Tanggal Kedaluwarsa wajib diisi jika disetujui",
                    path: ["expiredAt"],
                });
            }
            if (
                data.issuedAt &&
                data.expiredAt &&
                data.issuedAt > data.expiredAt
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message:
                        "Tanggal Kedaluwarsa tidak boleh sebelum Tanggal Terbit",
                    path: ["expiredAt"],
                });
            }
        }
    });

export type ProcessValidationInput = z.infer<typeof processValidationSchema>;
