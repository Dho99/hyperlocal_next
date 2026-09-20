import { z } from "zod";

export const surveyScoresSchema = z.object({
    indicators: z.record(z.string(), z.number().min(0).max(4)),
    evidence: z.record(z.string(), z.number().min(0).max(100)),
});

export const createSurveySchema = z.object({
    destinationId: z.string().uuid("Destinasi tidak valid").optional(),
    scores: surveyScoresSchema,
    comment: z.string().max(1000, "Komentar maksimal 1000 karakter").nullable().optional(),
});

export type CreateSurveyInput = z.infer<typeof createSurveySchema>;
