import { z } from "zod";
import {
    AceshIndicatorGroup,
    AceshEvidenceType,
    AceshTravelMode,
} from "@/lib/generated/prisma";

const enumValues = <T extends Record<string, string>>(e: T) => z.nativeEnum(e);

export const aceshIndicatorSchema = z.object({
    code: z
        .string()
        .min(2, "Kode minimal 2 karakter")
        .max(64)
        .regex(
            /^[A-Z0-9_]+$/,
            "Kode hanya boleh huruf besar, angka, dan garis bawah",
        ),
    name: z.string().min(2, "Nama indikator minimal 2 karakter"),
    group: enumValues(AceshIndicatorGroup),
    description: z.string().nullable().optional(),
    weight: z.coerce.number().positive("Bobot harus positif").default(1),
    isActive: z.boolean().default(true),
});

export const aceshIndicatorUpdateSchema = aceshIndicatorSchema.partial();

export const indicatorValueSchema = z
    .number()
    .int("Nilai indikator harus bilangan bulat")
    .min(0, "Nilai minimal 0")
    .max(4, "Nilai maksimal 4");

export const aceshIndicatorScoreSchema = z.object({
    indicatorId: z.string().uuid("Indikator tidak valid"),
    value: indicatorValueSchema,
    notes: z.string().nullable().optional(),
});

export const aceshIndicatorScoreBatchSchema = z.object({
    scores: z.array(aceshIndicatorScoreSchema).max(200),
});

export const aceshEvidenceSchema = z.object({
    destinationId: z.string().uuid("Destinasi tidak valid").optional(),
    evidenceType: enumValues(AceshEvidenceType),
    source: z.string().max(255).nullable().optional(),
    sourceReliabilityScore: z
        .number()
        .min(0, "Skor minimal 0")
        .max(100, "Skor maksimal 100")
        .nullable()
        .optional(),
    documentUrl: z.string().url("URL dokumen tidak valid").nullable().optional(),
    photoUrl: z.string().url("URL foto tidak valid").nullable().optional(),
    latitude: z
        .number()
        .min(-90, "Latitude minimal -90")
        .max(90, "Latitude maksimal 90")
        .nullable()
        .optional(),
    longitude: z
        .number()
        .min(-180, "Longitude minimal -180")
        .max(180, "Longitude maksimal 180")
        .nullable()
        .optional(),
    managementConfirmed: z.boolean().default(false),
    fieldValidated: z.boolean().default(false),
    dataDate: z.coerce.date().nullable().optional(),
    validatedAt: z.coerce.date().nullable().optional(),
    validatorId: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
});

export const aceshEvidenceUpdateSchema = aceshEvidenceSchema
    .omit({ destinationId: true })
    .partial();

export const reachabilityConfigSchema = z.object({
    facilityType: z
        .string()
        .min(1, "Jenis fasilitas wajib diisi")
        .max(64)
        .transform((v) => v.trim().toUpperCase()),
    label: z.string().max(128).nullable().optional(),
    maxDistanceMeters: z
        .number()
        .int()
        .min(0, "Radius minimal 0 meter")
        .nullable()
        .optional(),
    maxTravelMinutes: z
        .number()
        .int()
        .min(0, "Waktu minimal 0 menit")
        .nullable()
        .optional(),
    travelMode: enumValues(AceshTravelMode),
    isActive: z.boolean().default(true),
});

export const reachabilityConfigUpdateSchema = reachabilityConfigSchema
    .omit({ facilityType: true })
    .partial();

export const aceshRecalculateSchema = z.object({
    notes: z.string().nullable().optional(),
});

export const aceshAssessmentResponseSchema = z.object({
    acesScore: z.number(),
    hyperlocalScore: z.number(),
    baseScore: z.number(),
    evidenceConfidenceScore: z.number(),
    evidenceFactor: z.number(),
    verifiedScore: z.number().nullable(),
    classification: z.string(),
    verificationStatus: z.enum(["PENDING", "VERIFIED"]),
    calculatedAt: z.string(),
    calculationVersion: z.string(),
});
