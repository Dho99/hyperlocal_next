import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    getPublicAceshScores,
    publicDisplayScore,
} from "@/lib/services/acesh/public-score-service";
import { getErrorMessage } from "@/lib/api-error";
import { z } from "zod";
import { createGeminiModel } from "@/lib/utils/ai-gemini";
import { mapToCandidateDestination } from "@/lib/utils/ai-candidates";
import { isWithinLocation } from "@/lib/utils/ai-location";
import type { CandidateDestination } from "@/lib/utils/ai-candidates";
import type { AIRecommendation } from "@/types/ai";

const requestSchema = z.object({
    preferences: z.array(z.string()).default([]),
    limit: z.number().min(1).max(20).default(5),
});

interface RecommenderResponse {
    data: Array<{
        destinationId: string;
        reason: string;
        matchScore: number;
    }>;
}

function buildPrompt(
    candidates: CandidateDestination[],
    preferences: string[],
    limit: number,
): string {
    return `Anda adalah kurator wisata halal yang membantu merekomendasikan destinasi.

Tugas Anda adalah menganalisis preferensi pengguna terhadap data destinasi berikut,
lalu pilih TOP ${limit} destinasi yang paling sesuai.

⚠️ PERATURAN PENTING:
- HANYA gunakan ID dari kandidat yang diberikan di bawah ini.
- JANGAN PERNAH membuat atau menebak ID destinasi palsu.
- Jika tidak ada kandidat yang cocok, kembalikan array kosong [].

KANDIDAT DESTINASI (JSON):
${JSON.stringify(candidates)}

PREFERENSI PENGGUNA:
${preferences.length > 0 ? preferences.join(", ") : "Tidak ada preferensi khusus, tampilkan rekomendasi terbaik"}

Response HARUS berupa array JSON dengan format berikut, tanpa teks tambahan:
[
  {
    "destinationId": "uuid-destinasi",
    "reason": "Alasan personal dalam Bahasa Indonesia mengapa destinasi ini cocok",
    "matchScore": 85
  }
]

Urutkan dari matchScore tertinggi ke terendah.`;
}

function buildFallback(
    candidates: Array<{ id: string; halalScore: number | null }>,
    scores: Map<
        string,
        import("@/lib/services/acesh/public-score-service").PublicAceshScore
    >,
    limit: number,
) {
    return candidates
        .sort(
            (a, b) =>
                publicDisplayScore(scores.get(b.id), b.halalScore) -
                publicDisplayScore(scores.get(a.id), a.halalScore),
        )
        .slice(0, limit)
        .map((d) => ({
            destinationId: d.id,
            reason: "Destinasi dengan skor ACES-H tertinggi",
            matchScore: publicDisplayScore(scores.get(d.id), d.halalScore),
        }));
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = requestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request", issues: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const { preferences, limit } = parsed.data;

        const categoryIds = preferences.filter((p) =>
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                p,
            ),
        );

        const candidates = await prisma.destination.findMany({
            where: {
                status: "APPROVED",
                ...(categoryIds.length > 0 && {
                    categoryId: { in: categoryIds },
                }),
            },
            include: {
                category: true,
                images: { orderBy: { isPrimary: "desc" }, take: 1 },
                destinationHalalFacilities: {
                    include: { facility: true },
                },
            },
            take: 50,
        });

        if (candidates.length === 0) {
            return NextResponse.json({ data: [] }, { status: 200 });
        }

        const scores = await getPublicAceshScores(candidates.map((d) => d.id));
        const ranked = [...candidates].sort(
            (a, b) =>
                publicDisplayScore(scores.get(b.id), b.halalScore) -
                publicDisplayScore(scores.get(a.id), a.halalScore),
        );
        candidates.splice(0, candidates.length, ...ranked.slice(0, 20));

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { data: buildFallback(candidates, scores, limit) },
                { status: 200 },
            );
        }

        const candidateData = candidates.map(mapToCandidateDestination);

        try {
            const prompt = buildPrompt(candidateData, preferences, limit);

            const model = createGeminiModel();
            if (!model) {
                return NextResponse.json(
                    { data: buildFallback(candidates, scores, limit) },
                    { status: 200 },
                );
            }

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            let aiResult: AIRecommendation[];
            try {
                aiResult = JSON.parse(text) as AIRecommendation[];
                if (!Array.isArray(aiResult)) {
                    throw new Error("Response is not an array");
                }
            } catch {
                return NextResponse.json(
                    { data: buildFallback(candidates, scores, limit) },
                    { status: 200 },
                );
            }

            const destinationMap = new Map(candidates.map((d) => [d.id, d]));

            const recommendations = aiResult
                .filter((r) => destinationMap.has(r.destinationId))
                .slice(0, limit)
                .map((r) => ({
                    destinationId: r.destinationId,
                    reason: r.aiReason,
                    matchScore: r.matchScore,
                }));

            while (recommendations.length < limit) {
                const remaining = candidates.filter(
                    (d) =>
                        !recommendations.some((r) => r.destinationId === d.id),
                );
                if (remaining.length === 0) break;
                recommendations.push({
                    destinationId: remaining[0].id,
                    reason: "Destinasi dengan skor ACES-H tertinggi",
                    matchScore: publicDisplayScore(
                        scores.get(remaining[0].id),
                        remaining[0].halalScore,
                    ),
                });
            }

            return NextResponse.json(
                { data: recommendations },
                { status: 200 },
            );
        } catch {
            return NextResponse.json(
                { data: buildFallback(candidates, scores, limit) },
                { status: 200 },
            );
        }
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
