import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/api-error";
import { z } from "zod";
import {
    getLocationNames,
    extractCityFromQuery,
} from "@/lib/utils/ai-location";
import { createGeminiModel } from "@/lib/utils/ai-gemini";
import { mapToCandidateData } from "@/lib/utils/ai-candidates";
import type { AIRecommendation } from "@/types/ai";

const exploreQuerySchema = z.object({
    q: z.string().min(1, "Query wajib diisi"),
});

interface ExploreDestination {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    province: string | null;
    halalScore: number | null;
    rating: number | null;
    imageUrl: string | null;
    categoryName: string | null;
    facilityNames: string[];
}

interface ExploreResponseItem {
    destination: ExploreDestination;
    matchScore: number;
    aiReason: string;
}

interface ExploreResponse {
    query: string;
    data: ExploreResponseItem[];
}

function buildPrompt(candidates: string, userQuery: string): string {
    return `Anda adalah asisten rekomendasi wisata halal. Analisis query pengguna terhadap kandidat destinasi berikut. Pilih dan urutkan berdasarkan kecocokan dengan query.

Pertimbangan:
- Lokasi (kota/provinsi dalam query pengguna)
- Skor Halal (semakin tinggi semakin baik)
- Fasilitas yang relevan (misal: "ramah anak" → fasilitas bermain/aman; "halal" → masjid, kuliner halal)

⚠️ HANYA gunakan ID dari kandidat di bawah. JANGAN membuat ID palsu.

KANDIDAT DESTINASI:
${candidates}

QUERY PENGGUNA:
${userQuery}

Response HARUS array JSON tanpa teks lain:
[{ "destinationId": "uuid", "matchScore": 85, "aiReason": "Alasan singkat dalam Bahasa Indonesia mengapa destinasi ini cocok dengan query pengguna" }]
Urutkan dari matchScore tertinggi ke terendah. Maksimal 5 hasil.`;
}

function toExploreDestination(d: {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    province: string | null;
    halalScore: number | null;
    rating: number | null;
    images?: Array<{ imageUrl: string }>;
    category?: { name: string } | null;
    destinationHalalFacilities?: Array<{
        facility: { name: string };
    }>;
}): ExploreDestination {
    return {
        id: d.id,
        name: d.name,
        slug: d.slug,
        city: d.city,
        province: d.province,
        halalScore: d.halalScore,
        rating: d.rating,
        imageUrl: d.images?.[0]?.imageUrl ?? null,
        categoryName: d.category?.name ?? null,
        facilityNames:
            d.destinationHalalFacilities
                ?.map((dhf) => dhf.facility.name)
                .filter(Boolean) ?? [],
    };
}

function buildFallback(
    candidates: Array<Parameters<typeof toExploreDestination>[0]>,
): ExploreResponseItem[] {
    return candidates
        .sort((a, b) => (b.halalScore ?? 0) - (a.halalScore ?? 0))
        .slice(0, 5)
        .map((d) => ({
            destination: toExploreDestination(d),
            matchScore: d.halalScore ?? 0,
            aiReason: "Destinasi dengan skor halal tertinggi",
        }));
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get("q") ?? "";
        const parsed = exploreQuerySchema.safeParse({ q });

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Query tidak valid", issues: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const { q: query } = parsed.data;

        const knownLocations = await getLocationNames();
        const matchedLocation = extractCityFromQuery(query, knownLocations);

        const whereLocation = matchedLocation
            ? {
                  OR: [
                      {
                          city: {
                              contains: matchedLocation,
                              mode: "insensitive" as const,
                          },
                      },
                      {
                          province: {
                              contains: matchedLocation,
                              mode: "insensitive" as const,
                          },
                      },
                  ],
              }
            : {};

        const candidates = await prisma.destination.findMany({
            where: {
                status: "APPROVED",
                ...whereLocation,
            },
            include: {
                category: true,
                images: { take: 1 },
                destinationHalalFacilities: {
                    include: { facility: true },
                },
            },
            take: 20,
            orderBy: { halalScore: "desc" },
        });

        if (candidates.length === 0) {
            return NextResponse.json<ExploreResponse>(
                { query, data: [] },
                { status: 200 },
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            const data = buildFallback(candidates);
            return NextResponse.json<ExploreResponse>(
                { query, data },
                { status: 200 },
            );
        }

        try {
            const candidateData = candidates.map(mapToCandidateData);
            const prompt = buildPrompt(JSON.stringify(candidateData), query);

            const model = createGeminiModel();
            if (!model) {
                const data = buildFallback(candidates);
                return NextResponse.json<ExploreResponse>(
                    { query, data },
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
                const data = buildFallback(candidates);
                return NextResponse.json<ExploreResponse>(
                    { query, data },
                    { status: 200 },
                );
            }

            const destinationMap = new Map(candidates.map((d) => [d.id, d]));

            const recommendations: ExploreResponseItem[] = aiResult
                .filter((r) => destinationMap.has(r.destinationId))
                .slice(0, 5)
                .map((r) => {
                    const d = destinationMap.get(r.destinationId)!;
                    return {
                        destination: toExploreDestination(d),
                        matchScore: r.matchScore,
                        aiReason: r.aiReason,
                    };
                });

            while (recommendations.length < 5) {
                const remaining = candidates.filter(
                    (d) =>
                        !recommendations.some((r) => r.destination.id === d.id),
                );
                if (remaining.length === 0) break;
                recommendations.push({
                    destination: toExploreDestination(remaining[0]),
                    matchScore: remaining[0].halalScore ?? 0,
                    aiReason: "Destinasi dengan skor halal tertinggi",
                });
            }

            return NextResponse.json<ExploreResponse>(
                { query, data: recommendations },
                { status: 200 },
            );
        } catch {
            const data = buildFallback(candidates);
            return NextResponse.json<ExploreResponse>(
                { query, data },
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
