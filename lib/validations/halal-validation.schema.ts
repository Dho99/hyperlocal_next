import { z } from "zod";

export const ValidationStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const createValidationSchema = z.object({
    certificationId: z.string().min(1, "Certification ID is required"),
    notes: z
        .string()
        .max(500, "Notes cannot exceed 500 characters")
        .optional()
        .nullable(),
});

export const updateValidationSchema = z.object({
    status: ValidationStatusEnum,
    notes: z
        .string()
        .max(500, "Notes cannot exceed 500 characters")
        .optional()
        .nullable(),
});

export type CreateValidationInput = z.infer<typeof createValidationSchema>;
export type UpdateValidationInput = z.infer<typeof updateValidationSchema>;
