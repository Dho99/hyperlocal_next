import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/api-error";
import { z } from "zod";
import {
    getLocationNames,
    extractCityFromQuery,
    isWithinLocation,
    isNameWithinLocation,
    isAddressWithinLocation,
} from "@/lib/utils/ai-location";
import { createGeminiModel } from "@/lib/utils/ai-gemini";
import { mapToCandidateData } from "@/lib/utils/ai-candidates";
import type { AIRecommendation } from "@/types/ai";
import { haversineDistance } from "@/lib/utils/haversine-distance";
import { getReachabilityConfig } from "@/lib/services/acesh/reachability-config-service";
import { getPublicAceshScores, publicDisplayScore } from "@/lib/services/acesh/public-score-service";

const exploreQuerySchema = z.object({
    q: z.string().min(1, "Query wajib diisi"),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
});

/** Default radius (km) used when no reachability configuration exists. */
const DEFAULT_NEARBY_RADIUS_KM = 10;

interface ExploreDestination {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    province: string | null;
    halalScore: number | null;
    aceshScore: number | null;
    aceshClassification: string | null;
    aceshVerificationStatus: "PENDING" | "VERIFIED" | null;
    rating: number | null;
    imageUrl: string | null;
    categoryName: string | null;
    facilities: Array<{
        id: string;
        name: string;
        distanceKm: number | null;
    }>;
    nearbyUmkms: Array<{
        id: string;
        name: string;
        slug: string;
        categoryName: string | null;
        distanceKm: number | null;
    }>;
}

interface ExploreResponseItem {
    destination: ExploreDestination;
    matchScore: number;
    aiReason: string;
}

interface ExploreResponse {
    query: string;
    data: ExploreResponseItem[];
    fallbackSuggestion?: string;
}

const EXPLORE_STOP_WORDS = new Set([
    "cari",
    "carikan",
    "temukan",
    "tampilkan",
    "lihat",
    "tunjukkan",
    "rekomendasi",
    "rekomendasikan",
    "di",
    "ke",
    "dari",
    "untuk",
    "yang",
    "ada",
    "halal",
    "wisata",
    "destinasi",
    "tempat",
    "lokasi",
    "tolong",
    "bantu",
]);

function buildPrompt(
    candidates: string,
    userQuery: string,
    isNearby = false,
    matchedLocation?: string | null,
): string {
    const geoInstruction = matchedLocation
        ? `\n⚠️ GEOGRAPHIC STRICTNESS — GUNAKAN PENGETAHUAN ANDA:
Pengguna mencari di "${matchedLocation}".

Untuk SETIAP kandidat, periksa apakah lokasinya termasuk dalam "${matchedLocation}":
  ✅ Jika field "city" atau "province" tersedia — gunakan data tersebut untuk memverifikasi
  ✅ Jika city DAN province KOSONG (null) — gunakan pengetahuan Anda berdasarkan nama, deskripsi, dan alamat destinasi
  ❌ JANGAN merekomendasikan jika Anda yakin destinasi BERADA DI LUAR ${matchedLocation}

Contoh untuk "${matchedLocation}":
  { name: "Alun-alun ${matchedLocation}", city: null } → Pengetahuan: ini di ${matchedLocation} ✅
  { name: "Pantai Timur Pangandaran", city: null } → Pengetahuan: Pangandaran BUKAN ${matchedLocation} ❌
  { name: "Fun Park Grand Nusa Indah", city: "Cileungsi" } → Data: Cileungsi BUKAN ${matchedLocation} ❌
  { name: "Tangkuban Parahu", city: null } → Pengetahuan: ini di Lembang, BUKAN ${matchedLocation} ❌

❌ KESALAHAN NYATA YANG PERNAH TERJADI:
Query: "destinasi halal di tasikmalaya"
SALAH: "Pantai Timur Pangandaran" direkomendasikan → Pangandaran BUKAN Tasikmalaya
SALAH: "Fun Park Grand Nusa Indah (Cileungsi)" direkomendasikan → Cileungsi BUKAN Tasikmalaya
Jika Anda TIDAK YAKIN lokasi suatu destinasi, JANGAN rekomendasikan.`
        : `\n⚠️ GEOGRAPHIC STRICTNESS: Perhatikan lokasi yang disebutkan dalam query.
Jika TIDAK ADA kandidat yang berlokasi di area geografis yang dimaksud, kamu HARUS mengembalikan array kosong [].`;

    let prompt = `Anda adalah asisten rekomendasi wisata halal yang STRICT. Analisis query pengguna terhadap kandidat destinasi berikut.

Pertimbangan:
- Lokasi (kota/provinsi dalam query pengguna)
- Skor Halal (semakin tinggi semakin baik)
- Fasilitas yang relevan (misal: "ramah anak" → fasilitas bermain/aman; "halal" → masjid, kuliner halal)
${geoInstruction}
⚠️ HANYA gunakan ID dari kandidat di bawah. JANGAN membuat ID palsu.`;

    if (isNearby) {
        prompt += `

📍 The user is searching for nearby locations. I have pre-filtered the candidates to only include those within the configured nearby radius of the user's current coordinates. Emphasize proximity in your aiReason.`;
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

function toExploreDestination(
    d: {
        id: string;
        name: string;
        slug: string;
        city: string | null;
        province: string | null;
        halalScore: number | null;
        rating: number | null;
        latitude: unknown;
        longitude: unknown;
        images?: Array<{ imageUrl: string }>;
        category?: { name: string } | null;
        destinationHalalFacilities?: Array<{
            id: string;
            name: string | null;
            latitude: number | null;
            longitude: number | null;
            distanceMeters: number | null;
            facility: {
                name: string;
                latitude: unknown;
                longitude: unknown;
            };
        }>;
        umkms?: Array<{
            id: string;
            name: string;
            slug: string;
            latitude: unknown;
            longitude: unknown;
            category?: { name: string } | null;
        }>;
    },
    score: import("@/lib/services/acesh/public-score-service").PublicAceshScore | undefined,
): ExploreDestination {
    return {
        id: d.id,
        name: d.name,
        slug: d.slug,
        city: d.city,
        province: d.province,
        halalScore: d.halalScore,
        aceshScore: score ? publicDisplayScore(score, d.halalScore) : null,
        aceshClassification: score?.classification ?? null,
        aceshVerificationStatus: score?.verificationStatus ?? null,
        rating: d.rating,
        imageUrl: d.images?.[0]?.imageUrl ?? null,
        categoryName: d.category?.name ?? null,
        facilities: (d.destinationHalalFacilities ?? [])
            .map((dhf) => {
                const distanceKm = getDistanceFromDestination(
                    d.latitude,
                    d.longitude,
                    dhf.latitude ?? dhf.facility.latitude,
                    dhf.longitude ?? dhf.facility.longitude,
                    dhf.distanceMeters,
                );
                return {
                    id: dhf.id,
                    name: dhf.name?.trim() || dhf.facility.name,
                    distanceKm,
                };
            })
            .sort(sortByDistance),
        nearbyUmkms: (d.umkms ?? [])
            .map((umkm) => ({
                id: umkm.id,
                name: umkm.name,
                slug: umkm.slug,
                categoryName: umkm.category?.name ?? null,
                distanceKm: getDistanceFromDestination(
                    d.latitude,
                    d.longitude,
                    umkm.latitude,
                    umkm.longitude,
                ),
            }))
            .sort(sortByDistance),
    };
}

function getDistanceFromDestination(
    destinationLat: unknown,
    destinationLng: unknown,
    targetLat: unknown,
    targetLng: unknown,
    storedDistanceMeters?: number | null,
): number | null {
    if (storedDistanceMeters != null) return storedDistanceMeters / 1000;

    const coordinates = [
        destinationLat,
        destinationLng,
        targetLat,
        targetLng,
    ].map((value) => (value == null ? Number.NaN : Number(value)));
    if (!coordinates.every(Number.isFinite)) return null;

    return haversineDistance(
        coordinates[0],
        coordinates[1],
        coordinates[2],
        coordinates[3],
    );
}

function sortByDistance(
    a: { distanceKm: number | null },
    b: { distanceKm: number | null },
): number {
    return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
}

const exploreDestinationInclude = {
    category: true,
    images: { orderBy: { isPrimary: "desc" as const }, take: 1 },
    destinationHalalFacilities: {
        include: { facility: true },
    },
    umkms: {
        where: { validationStatus: "APPROVED" },
        include: { category: true },
        orderBy: [{ rating: "desc" as const }, { createdAt: "desc" as const }],
        take: 6,
    },
};

function buildFallback(
    candidates: Array<Parameters<typeof toExploreDestination>[0]>,
    scores: Map<string, import("@/lib/services/acesh/public-score-service").PublicAceshScore>,
): ExploreResponseItem[] {
    return candidates
        .sort(
            (a, b) =>
                publicDisplayScore(scores.get(b.id), b.halalScore) -
                publicDisplayScore(scores.get(a.id), a.halalScore),
        )
        .slice(0, 5)
        .map((d) => ({
            destination: toExploreDestination(d, scores.get(d.id)),
            matchScore: publicDisplayScore(scores.get(d.id), d.halalScore),
            aiReason: "Destinasi dengan skor ACES-H tertinggi",
        }));
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get("q") ?? "";
        const latRaw = searchParams.get("lat");
        const lngRaw = searchParams.get("lng");
        const parsed = exploreQuerySchema.safeParse({
            q,
            lat: latRaw ?? undefined,
            lng: lngRaw ?? undefined,
        });

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Query tidak valid", issues: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const { q: query, lat, lng } = parsed.data;
        const isNearby = lat != null && lng != null;

        // Resolve the configurable nearby radius (meters → km) from the reachability
        // settings; falls back to the default when unconfigured.
        const nearbyConfig = await getReachabilityConfig("DESTINATION_NEARBY");
        const nearbyRadiusKm = isNearby
            ? (nearbyConfig.maxDistanceMeters && nearbyConfig.maxDistanceMeters > 0
                  ? nearbyConfig.maxDistanceMeters / 1000
                  : DEFAULT_NEARBY_RADIUS_KM)
            : DEFAULT_NEARBY_RADIUS_KM;

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
                      {
                          AND: [
                              { city: null },
                              { province: null },
                              { name: { contains: matchedLocation, mode: "insensitive" as const } },
                          ],
                      },
                  ],
              }
            : {};

        let candidates = await prisma.destination.findMany({
            where: {
                status: "APPROVED",
                ...whereLocation,
            },
            include: exploreDestinationInclude,
            take: 20,
        });

        // Name-based augmentation when no location matched — surfaces specific destination names
        if (!matchedLocation) {
            const nameTokens = query
                .toLowerCase()
                .split(/\s+/)
                .filter((t) => t.length > 2 && !EXPLORE_STOP_WORDS.has(t));

            if (nameTokens.length > 0) {
                const nameQuery = nameTokens.join(" ");
                const nameMatches = await prisma.destination.findMany({
                    where: {
                        status: "APPROVED",
                        name: { contains: nameQuery, mode: "insensitive" },
                    },
                    include: exploreDestinationInclude,
                    take: 5,
                });

                if (nameMatches.length > 0) {
                    const existingIds = new Set(candidates.map((c) => c.id));
                    const fresh = nameMatches.filter(
                        (m) => !existingIds.has(m.id),
                    );
                    candidates = [...fresh, ...candidates].slice(0, 25);
                }
            }
        }

        if (isNearby) {
            candidates = candidates.filter((d) => {
                if (d.latitude == null || d.longitude == null) return false;
                const dist = haversineDistance(
                    lat!,
                    lng!,
                    Number(d.latitude),
                    Number(d.longitude),
                );
                // Configurable nearby radius from the reachability settings
                // (falls back to 10 km when no configuration exists).
                return dist <= nearbyRadiusKm;
            });
        }

        const scores = await getPublicAceshScores(candidates.map((c) => c.id));
        candidates.sort(
            (a, b) =>
                publicDisplayScore(scores.get(b.id), b.halalScore) -
                publicDisplayScore(scores.get(a.id), a.halalScore),
        );

        if (candidates.length === 0) {
            const fallbackSuggestion = matchedLocation
                ? "Destinasi belum bisa sistem rekomendasikan karena belum tervalidasi atau destinasi belum terdata"
                : undefined;
            return NextResponse.json<ExploreResponse>(
                { query, data: [], fallbackSuggestion },
                { status: 200 },
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            const data = buildFallback(candidates, scores);
            return NextResponse.json<ExploreResponse>(
                { query, data },
                { status: 200 },
            );
        }

        try {
            const candidateData = candidates.map(mapToCandidateData);
            const prompt = buildPrompt(
                JSON.stringify(candidateData),
                query,
                isNearby,
                matchedLocation,
            );

            const model = createGeminiModel();
            if (!model) {
                const data = buildFallback(candidates, scores);
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
                const data = buildFallback(candidates, scores);
                return NextResponse.json<ExploreResponse>(
                    { query, data },
                    { status: 200 },
                );
            }

            const destinationMap = new Map(candidates.map((d) => [d.id, d]));

            const recommendations: ExploreResponseItem[] = aiResult
                .filter((r) => {
                    const d = destinationMap.get(r.destinationId);
                    if (!d) return false;
                    // Guardrail: exclude destinations outside the requested location
                    if (
                        matchedLocation &&
                        !isWithinLocation(d.city, d.province, matchedLocation)
                    ) {
                        return false;
                    }
                    // Guardrail: name + description + address location conflict detection
                    if (matchedLocation && knownLocations.length > 0) {
                        const desc =
                            typeof d.description === "object" && d.description !== null
                                ? JSON.stringify(d.description)
                                : (d.description as string | null);
                        if (
                            !isNameWithinLocation(
                                d.name,
                                desc,
                                matchedLocation,
                                knownLocations,
                            )
                        ) {
                            return false;
                        }
                        if (
                            !isAddressWithinLocation(
                                d.address,
                                matchedLocation,
                            )
                        ) {
                            return false;
                        }
                    }
                    return true;
                })
                .slice(0, 5)
                .map((r) => {
                    const d = destinationMap.get(r.destinationId)!;
                    return {
                        destination: toExploreDestination(d, scores.get(d.id)),
                        matchScore: r.matchScore,
                        aiReason: r.aiReason,
                    };
                });

            const data =
                recommendations.length > 0
                    ? recommendations
                    : buildFallback(candidates, scores);

            return NextResponse.json<ExploreResponse>(
                { query, data },
                { status: 200 },
            );
        } catch (error) {
            console.error("AI recommendation error:", getErrorMessage(error));
            const data = buildFallback(candidates, scores);
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
