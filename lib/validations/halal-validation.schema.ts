import { z } from "zod";

export const ValidationStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);

const categoryScoreSchema = z.object({
    facilityType: z.string(),
    label: z.string(),
    score: z.number().min(0).max(100),
    weight: z.number(),
});

const baseValidationSchema = z.object({
    id: z.string().optional(),
    certificationId: z
        .string()
        .min(1, "Certification ID is required")
        .optional()
        .nullable(),
    destinationId: z.string().optional().nullable(),
    validatorId: z.string().optional().nullable(),
    status: ValidationStatusEnum,
    adminScore: z.number().int().min(0).max(100).optional().nullable(),
    categoryScores: z.array(categoryScoreSchema).optional().nullable(),
    notes: z
        .string()
        .max(500, "Notes cannot exceed 500 characters")
        .optional()
        .nullable(),
    validatedAt: z.date().optional().nullable(),
    issuedAt: z.date().optional(),
    expiredAt: z.date().optional(),
    createdAt: z.date().optional(),
});

export const createValidationSchema = baseValidationSchema
    .omit({
        validatorId: true,
        validatedAt: true,
    })
    .extend({
        certificationId: z
            .string()
            .min(1, "Certification ID is required")
            .optional()
            .nullable(),
        destinationId: z.string().optional().nullable(),
        status: ValidationStatusEnum.optional(),
    });

export const updateValidationSchema = baseValidationSchema.partial();

export const processDestinationValidationSchema = z.object({
    status: z.enum(["APPROVED", "REJECTED", "PENDING"]),
    notes: z
        .string()
        .max(500, "Notes cannot exceed 500 characters")
        .optional()
        .nullable(),
    adminScore: z.number().min(0).max(100).optional().nullable(),
    categoryScores: z.array(categoryScoreSchema).optional().nullable(),
    issuedAt: z.date().optional(),
    expiredAt: z.date().optional(),
    documentUrl: z.string().url("Invalid URL format").optional().nullable(),
});

export type CreateValidationInput = z.infer<typeof createValidationSchema>;
export type UpdateValidationInput = z.infer<typeof updateValidationSchema>;
export type ValidationSchema = z.infer<typeof baseValidationSchema>;
export type ProcessDestinationValidationInput = z.infer<
    typeof processDestinationValidationSchema
>;
export type ValidationStatus = z.infer<typeof ValidationStatusEnum>;
