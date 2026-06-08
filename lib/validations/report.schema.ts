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

export const reportCategorySchema = z.enum([
  "destinations",
  "umkms",
  "coverage-areas",
  "accommodations",
  "reviews",
  "interactions",
]);

export const exportFormatSchema = z.enum(["csv", "xlsx", "pdf"]);

export const generateReportSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  categories: z.array(reportCategorySchema).min(1, "At least one category is required"),
  format: exportFormatSchema.optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
export type GenerateReportInput = z.infer<typeof generateReportSchema>;
