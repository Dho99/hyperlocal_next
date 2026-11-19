import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma";

export type AiFeature =
    | "ROUTE_FINDER"
    | "EXPLORE"
    | "RECOMMENDATION"
    | "AI_TEST";

export type AiProvider = "groq" | "gemini" | "none";

export type AiRequestStatus =
    | "SUCCESS"
    | "RULE_BASED"
    | "FALLBACK"
    | "ERROR"
    | "SKIPPED";

export interface AiRequestLogInput {
    feature: AiFeature;
    userQuery: string;
    intent: string;
    redirectTo?: string;
    provider: AiProvider;
    model?: string | null;
    status: AiRequestStatus;
    latencyMs?: number | null;
    attemptCount?: number;
    isValid?: boolean;
    errorMessage?: string | null;
    payload?: Prisma.InputJsonValue | null;
}

const MAX_QUERY_LENGTH = 500;

export function sanitizeAiQuery(query: string): string {
    return query.trim().slice(0, MAX_QUERY_LENGTH);
}

/**
 * Writes one AI request log row and a structured console event.
 * Logging must never break the request path.
 */
export async function logAiRequest(input: AiRequestLogInput): Promise<void> {
    const userQuery = sanitizeAiQuery(input.userQuery);
    const redirectTo = input.redirectTo ?? "";
    const attemptCount = input.attemptCount ?? 0;
    const latencyMs = input.latencyMs ?? null;

    console.log(
        JSON.stringify({
            event: "ai_request",
            feature: input.feature,
            provider: input.provider,
            model: input.model ?? null,
            status: input.status,
            latencyMs,
            attemptCount,
            intent: input.intent,
        }),
    );

    try {
        await prisma.aiIntentLog.create({
            data: {
                userQuery,
                intent: input.intent,
                redirectTo,
                payload: input.payload ?? undefined,
                isValid: input.isValid ?? true,
                errorMessage: input.errorMessage ?? null,
                feature: input.feature,
                provider: input.provider,
                model: input.model ?? null,
                status: input.status,
                latencyMs,
                attemptCount,
            },
        });
    } catch (error) {
        console.error("[AI_REQUEST_LOG] DB write failed:", error);
    }
}
