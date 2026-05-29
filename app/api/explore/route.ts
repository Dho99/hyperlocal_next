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
import { haversineDistance } from "@/lib/utils/haversine-distance";

const exploreQuerySchema = z.object({
    q: z.string().min(1, "Query wajib diisi"),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
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

function buildPrompt(candidates: string, userQuery: string, isNearby = false): string {
    let prompt = `Anda adalah asisten rekomendasi wisata halal yang STRICT. Analisis query pengguna terhadap kandidat destinasi berikut.

Pertimbangan:
- Lokasi (kota/provinsi dalam query pengguna)
- Skor Halal (semakin tinggi semakin baik)
- Fasilitas yang relevan (misal: "ramah anak" → fasilitas bermain/aman; "halal" → masjid, kuliner halal)

⚠️ GEOGRAPHIC STRICTNESS: Perhatikan lokasi yang disebutkan dalam query. Jika TIDAK ADA kandidat yang berlokasi di area geografis yang dimaksud, kamu HARUS mengembalikan array kosong [].

⚠️ HANYA gunakan ID dari kandidat di bawah. JANGAN membuat ID palsu.`;

    if (isNearby) {
        prompt += `

📍 The user is searching for nearby locations. I have pre-filtered the candidates to only include those within a 10km radius of the user's current coordinates. Emphasize proximity in your aiReason.`;
    }

    prompt += `

KANDIDAT DESTINASI:
${candidates}

QUERY PENGGUNA:
${userQuery}

Response HARUS array JSON tanpa teks lain:
[{ "destinationId": "uuid", "matchScore": 85, "aiReason": "Alasan singkat dalam Bahasa Indonesia mengapa destinasi ini cocok dengan query pengguna" }]
Urutkan dari matchScore tertinggi ke terendah. Maksimal 5 hasil.`;

    return prompt;
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
        const latRaw = searchParams.get("lat");
        const lngRaw = searchParams.get("lng");
        const parsed = exploreQuerySchema.safeParse({ q, lat: latRaw, lng: lngRaw });

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Query tidak valid", issues: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const { q: query, lat, lng } = parsed.data;
        const isNearby = lat != null && lng != null;

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

        let candidates = await prisma.destination.findMany({
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

        if (isNearby) {
            candidates = candidates.filter((d) => {
                if (d.latitude == null || d.longitude == null) return false;
                const dist = haversineDistance(
                    lat!,
                    lng!,
                    Number(d.latitude),
                    Number(d.longitude),
                );
                return dist <= 10;
            });
        }

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
            const prompt = buildPrompt(JSON.stringify(candidateData), query, isNearby);

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

            return NextResponse.json<ExploreResponse>(
                { query, data: recommendations },
                { status: 200 },
            );
        } catch (error) {
            console.error("AI recommendation error:", getErrorMessage(error));
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
