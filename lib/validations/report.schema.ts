import { z } from "zod";

export const reportTargetTypeSchema = z.enum(["DESTINATION", "UMKM", "ACCOMMODATION"]);

export const createReportSchema = z.object({
  targetId: z.string().min(1, "Target ID is required"),
  targetType: reportTargetTypeSchema,
  reason: z.string().min(1, "Reason is required"),
  description: z.string().optional(),
});

export const updateReportStatusSchema = z.object({
  status: z.enum(["PENDING", "INVESTIGATING", "RESOLVED", "REJECTED"]),
  adminNotes: z.string().optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
