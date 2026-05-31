import { z } from "zod";
import { InteractionType, SentimentLabel } from "@/lib/generated/prisma/client";

export const userInteractionSchema = z.object({
  targetId: z.string().min(1),
  targetType: z.enum(["DESTINASI", "UMKM"]),
  actionType: z.enum(["CLICK_ROUTE", "CLICK_WHATSAPP", "BOOKMARK"]),
});

export const interactionSchema = z.object({
  type: z.nativeEnum(InteractionType),
  keyword: z.string().optional(),
  source: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const hottestQuerySchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]).default("weekly"),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const trendRecalculateSchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]).optional(),
});

export const searchTrendQuerySchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]).default("weekly"),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const reviewSentimentSchema = z.object({
  label: z.nativeEnum(SentimentLabel),
  score: z.number().min(0).max(1),
  keywords: z.array(z.string()),
  summary: z.string().optional(),
});

export const halalReadinessQuerySchema = z.object({
  regionType: z.enum(["city", "province"]).default("city"),
});
