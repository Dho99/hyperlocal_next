import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { getErrorMessage } from "@/lib/api-error";
import { z } from "zod";
import OpenAI from "openai";
import { mapToCandidateData } from "@/lib/utils/ai-candidates";
import { haversineDistance } from "@/lib/utils/haversine-distance";
import {
    extractCityFromQuery,
    getLocationNames,
    isNameWithinLocation,
    isAddressWithinLocation,
} from "@/lib/utils/ai-location";

const querySchema = z.object({
    query: z.string().min(1, "Query wajib diisi"),
});

interface ItineraryItemPayload {
    orderIndex: number;
    destinationId: string;
    notes: string;
}

interface DestinationInfo {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    imageUrl: string | null;
    categoryName: string | null;
    latitude: number | null;
    longitude: number | null;
}

interface ItineraryFacility {
    id: string;
    name: string;
    instanceName: string | null;
    type: string | null;
    distanceMeters: number | null;
    travelMinutes: number | null;
    latitude: number | null;
    longitude: number | null;
}

interface ItineraryUmkm {
    id: string;
    name: string;
    slug: string;
    categoryName: string | null;
    rating: number | null;
    reviewCount: number | null;
    primaryImage: string | null;
    validCertification: boolean;
    distanceMeters: number | null;
}

interface ItineraryPayload {
    title: string;
    days: number;
    items: ItineraryItemPayload[];
    destinations: Record<string, DestinationInfo>;
    facilities: Record<string, ItineraryFacility[]>;
    umkms: Record<string, ItineraryUmkm[]>;
}

interface RouteFinderResponse {
    intent:
        | "DESTINATION_SEARCH"
        | "ITINERARY_RECOMMENDATION"
        | "FACILITY_CHECK";
    redirectTo: string;
    payload: ItineraryPayload | null;
}

function getLocationSearchTerms(location: string): string[] {
    const normalized = location.trim();
    const withoutPrefix = normalized
        .replace(/^(?:kota|kabupaten|kab\.?)[\s]+/i, "")
        .trim();

    return [
        ...new Set(
            [normalized, withoutPrefix].filter((term) => term.length >= 3),
        ),
    ];
}

const ROUTE_FINDER_STOP_WORDS = new Set([
    "cari",
    "carikan",
    "temukan",
    "tampilkan",
    "lihat",
    "tunjukkan",
    "rekomendasi",
    "rekomendasikan",
    "sarankan",
    "saran",
    "di",
    "ke",
    "dari",
    "untuk",
    "yang",
    "ada",
    "sekitar",
    "halal",
    "wisata",
    "destinasi",
    "tempat",
    "lokasi",
    "tolong",
    "bantu",
    "dong",
    "deh",
    "ya",
    "yuk",
]);

async function findDestinationByName(
    query: string,
    matchedLocation?: string | null,
): Promise<string | null> {
    const normalized = query
        .toLowerCase()
        .split(/\s+/)
        .filter((t) => t.length > 1 && !ROUTE_FINDER_STOP_WORDS.has(t))
        .join(" ")
        .trim();

    if (normalized.length < 3) return null;

    const where: Prisma.DestinationWhereInput = {
        status: "APPROVED",
        name: { contains: normalized, mode: "insensitive" },
    };

    // Only match within the requested location
    if (matchedLocation) {
        where.OR = [
            { city: { contains: matchedLocation, mode: "insensitive" } },
            { province: { contains: matchedLocation, mode: "insensitive" } },
            { AND: [{ city: null }, { province: null }] },
        ];
    }

    const matches = await prisma.destination.findMany({
        where,
        select: { name: true, slug: true, city: true, province: true },
        take: 5,
    });

    if (matches.length === 0) return null;

    for (const m of matches) {
        if (m.name.toLowerCase() === normalized) {
            // If location was specified, verify match is within that location
            if (matchedLocation) {
                const loc = matchedLocation.toLowerCase();
                const city = m.city?.toLowerCase() ?? "";
                const province = m.province?.toLowerCase() ?? "";
                if (city.includes(loc) || province.includes(loc)) return m.slug;
                continue;
            }
            return m.slug;
        }
    }

    const best = matches[0];
    if (normalized.length / best.name.length >= 0.6) {
        if (matchedLocation) {
            const loc = matchedLocation.toLowerCase();
            const city = best.city?.toLowerCase() ?? "";
            const province = best.province?.toLowerCase() ?? "";
            if (city.includes(loc) || province.includes(loc)) return best.slug;
            return null;
        }
        return best.slug;
    }

    return null;
}

function buildSystemPrompt(
    candidates: string,
    matchedLocation?: string | null,
): string {
    const locationInstruction = matchedLocation
        ? `\n⚠️ LOKASI — GUNAKAN PENGETAHUAN ANDA:
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
Query: "rekomendasi perjalanan halal tasikmalaya 2 hari"
SALAH: "Pantai Timur Pangandaran" direkomendasikan → Pangandaran BUKAN Tasikmalaya
SALAH: "Fun Park Grand Nusa Indah (Cileungsi)" direkomendasikan → Cileungsi BUKAN Tasikmalaya
Jika Anda TIDAK YAKIN lokasi suatu destinasi, JANGAN rekomendasikan.`
        : "";

    return `Anda adalah asisten rekomendasi wisata halal yang cerdas. Analisis query pengguna dan klasifikasikan ke dalam salah satu intent berikut:

1. DESTINATION_SEARCH — pengguna mencari atau ingin melihat destinasi wisata, kuliner, atau penginapan.
2. ITINERARY_RECOMMENDATION — pengguna ingin rencana perjalanan / itinerary / rute wisata yang terstruktur (misalnya "1 hari", "2 hari", "3 hari", atau menyebutkan durasi).
3. FACILITY_CHECK — pengguna ingin mengecek ketersediaan fasilitas halal tertentu di suatu destinasi (misalnya musala, tempat wudu, sertifikat halal, dll).

Contoh klasifikasi:
- "cari destinasi wisata di Bandung" → DESTINATION_SEARCH
- "rekomendasi tempat makan halal" → DESTINATION_SEARCH
- "itinerary 2 hari di Jogja" → ITINERARY_RECOMMENDATION
- "rencana perjalanan 3 hari ke Malang" → ITINERARY_RECOMMENDATION
- "apakah ada masjid di Pantai Kuta?" → FACILITY_CHECK
- "cek musala di dekat sini" → FACILITY_CHECK
- "rekomendasi destinasi" → DESTINATION_SEARCH
- "solo trip 1 hari di Bandung" → ITINERARY_RECOMMENDATION

Petunjuk penting:
- Jika query mengandung kata seperti "rute", "itinerary", "rencana perjalanan", "trips", "jalan-jalan ke", "tour", atau menyebutkan durasi (1 hari, 2 hari, 3 hari, sehari, full day), gunakan ITINERARY_RECOMMENDATION.
- Kata "rekomendasi" atau "rekomendasikan" SAJA tidak cukup untuk ITINERARY_RECOMMENDATION. Contoh: "rekomendasikan destinasi halal di Bandung" adalah DESTINATION_SEARCH.
- Jika query menanyakan ketersediaan atau keberadaan fasilitas tertentu (musala, masjid, tempat wudu, toilet, parkir, sertifikat halal) di suatu tempat, gunakan FACILITY_CHECK.
- Untuk FACILITY_CHECK, ekstrak slug destinasi dan nama fasilitas dari query.
- Untuk ITINERARY_RECOMMENDATION, pilah destinasi dari kandidat yang diberikan, atur secara kronologis berdasarkan lokasi dan jam operasional, dan berikan notes yang informatif dalam Bahasa Indonesia.
- Data \`facilities[].distanceMeters\` adalah jarak fasilitas ke destinasi. Untuk ITINERARY_RECOMMENDATION, prioritaskan fasilitas relevan yang lebih dekat dan sebutkan nama serta jaraknya dalam notes bila datanya tersedia.
- Untuk DESTINATION_SEARCH, gunakan query asli pengguna secara penuh di redirectTo, jangan singkat atau ubah kata kunci.
- Jika Anda tidak yakin dengan intent yang paling tepat, default ke DESTINATION_SEARCH. Jangan memaksakan FACILITY_CHECK atau ITINERARY_RECOMMENDATION jika tidak ada indikasi kuat.${locationInstruction}

⚠️ HANYA gunakan destinationId yang tercantum dalam daftar kandidat di bawah. JANGAN membuat ID palsu.

⚠️ PENTING: Setiap destinasi hanya boleh muncul SATU KALI dalam satu rencana perjalanan. Jangan merekomendasikan destinasi yang sama di hari yang berbeda.

KANDIDAT DESTINASI:
${candidates}

Response HARUS JSON tanpa teks lain, dengan format EXACT berikut:

Untuk DESTINATION_SEARCH:
{ "intent": "DESTINATION_SEARCH", "redirectTo": "/explore?q=KATA_KUNCI", "payload": null }

Untuk ITINERARY_RECOMMENDATION:
{ "intent": "ITINERARY_RECOMMENDATION", "redirectTo": "/itinerary-recommendation", "payload": { "title": "Judul Rencana Perjalanan", "days": 1, "items": [ { "orderIndex": 1, "destinationId": "uuid-kandidat", "notes": "Catatan dalam Bahasa Indonesia" } ] } }

Untuk FACILITY_CHECK:
{ "intent": "FACILITY_CHECK", "redirectTo": "/facility-check?slug=slug-destinasi&facility=fasilitas", "payload": null }

HANYA output JSON, tanpa markdown, tanpa penjelasan.`;
}

function buildFallbackSearch(query: string): RouteFinderResponse {
    const keywords = query
        .toLowerCase()
        .replace(/cari|temukan|tolong|carikan|rekomendasi/gi, "")
        .trim();
    const slug = encodeURIComponent(keywords.slice(0, 80));
    return {
        intent: "DESTINATION_SEARCH",
        redirectTo: `/explore?q=${slug}`,
        payload: null,
    };
}

function isWorshipFacility(type: string | null, name: string): boolean {
    const value = `${type ?? ""} ${name}`.toLowerCase();
    return (
        value.includes("masjid") ||
        value.includes("mushola") ||
        value.includes("musholla") ||
        value.includes("mosque") ||
        value.includes("prayer")
    );
}

interface EnrichedDestination {
    id: string;
    latitude: Prisma.Decimal | null;
    longitude: Prisma.Decimal | null;
    destinationHalalFacilities?: Array<{
        name: string | null;
        distanceMeters: number | null;
        travelMinutes: number | null;
        latitude: number | null;
        longitude: number | null;
        facility: {
            id: string;
            name: string;
            facilityType: string | null;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
        };
    }>;
    umkms?: Array<{
        id: string;
        name: string;
        slug: string;
        rating: number | null;
        reviewCount: number | null;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        category: { name: string } | null;
        images: Array<{ imageUrl: string }>;
        certifications: Array<{ id: string }>;
    }>;
}

function buildItineraryFacilities(
    destination: EnrichedDestination,
): ItineraryFacility[] {
    return (destination.destinationHalalFacilities ?? [])
        .map((dhf) => {
            const facilityLat =
                dhf.latitude ??
                (dhf.facility.latitude != null
                    ? Number(dhf.facility.latitude)
                    : null);
            const facilityLng =
                dhf.longitude ??
                (dhf.facility.longitude != null
                    ? Number(dhf.facility.longitude)
                    : null);
            return {
                id: dhf.facility.id,
                name: dhf.facility.name,
                instanceName: dhf.name,
                type: dhf.facility.facilityType,
                distanceMeters: dhf.distanceMeters,
                travelMinutes: dhf.travelMinutes,
                latitude: facilityLat,
                longitude: facilityLng,
            };
        })
        .sort((a, b) => {
            const worshipA = isWorshipFacility(a.type, a.name) ? 1 : 0;
            const worshipB = isWorshipFacility(b.type, b.name) ? 1 : 0;
            if (worshipA !== worshipB) return worshipB - worshipA;
            return (
                (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity)
            );
        })
        .slice(0, 3);
}

function buildItineraryUmkms(
    destination: EnrichedDestination,
): ItineraryUmkm[] {
    const destLat =
        destination.latitude != null ? Number(destination.latitude) : null;
    const destLng =
        destination.longitude != null ? Number(destination.longitude) : null;

    return (destination.umkms ?? [])
        .map((u) => {
            const umkmLat = u.latitude != null ? Number(u.latitude) : null;
            const umkmLng = u.longitude != null ? Number(u.longitude) : null;
            const distanceMeters =
                destLat != null &&
                destLng != null &&
                umkmLat != null &&
                umkmLng != null
                    ? Math.round(
                          haversineDistance(
                              destLat,
                              destLng,
                              umkmLat,
                              umkmLng,
                          ) * 1000,
                      )
                    : null;
            return {
                id: u.id,
                name: u.name,
                slug: u.slug,
                categoryName: u.category?.name ?? null,
                rating: u.rating,
                reviewCount: u.reviewCount,
                primaryImage: u.images?.[0]?.imageUrl ?? null,
                validCertification: (u.certifications?.length ?? 0) > 0,
                distanceMeters,
            };
        })
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 3);
}

function isExplicitItineraryQuery(query: string): boolean {
    return /\b(itinerary|rute|rencana\s+perjalanan|trip|jalan-jalan|tour|sehari|full\s+day|\d+\s*hari)\b/i.test(
        query,
    );
}

function extractRequestedDays(query: string): number {
    const numericDays = query.match(/\b(\d+)\s*hari\b/i)?.[1];
    if (numericDays) return Math.min(Math.max(Number(numericDays), 1), 30);
    return /\b(sehari|full\s+day)\b/i.test(query) ? 1 : 1;
}

function formatFacilityDistance(distanceMeters: number): string {
    return distanceMeters >= 1000
        ? `${(distanceMeters / 1000).toFixed(1)} km`
        : `${distanceMeters} m`;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = querySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Query tidak valid", issues: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const { query } = parsed.data;

        const knownLocations = await getLocationNames();
        const matchedLocation = extractCityFromQuery(query, knownLocations);

        // Pre-AI: direct destination name lookup — bypass LLM for exact/strong name matches
        const directSlug = await findDestinationByName(query, matchedLocation);
        if (directSlug) {
            console.log("[AI_INTENT_TRACE] Pre-AI name match →", directSlug);
            try {
                await prisma.aiIntentLog.create({
                    data: {
                        userQuery: query,
                        intent: "DESTINATION_SEARCH",
                        redirectTo: `/destinasi/${directSlug}`,
                    },
                });
            } catch {
                // Silently ignore
            }
            return NextResponse.json<RouteFinderResponse>({
                intent: "DESTINATION_SEARCH",
                redirectTo: `/destinasi/${directSlug}`,
                payload: null,
            });
        }

        const locationTerms = matchedLocation
            ? getLocationSearchTerms(matchedLocation)
            : [];
        const whereLocation = matchedLocation
            ? {
                  OR: locationTerms.flatMap((term) => [
                      {
                          city: {
                              contains: term,
                              mode: "insensitive" as const,
                          },
                      },
                      {
                          AND: [
                              { city: null },
                              {
                                  OR: [
                                      {
                                          province: {
                                              contains: term,
                                              mode: "insensitive" as const,
                                          },
                                      },
                                      {
                                          address: {
                                              contains: term,
                                              mode: "insensitive" as const,
                                          },
                                      },
                                      {
                                          name: {
                                              contains: term,
                                              mode: "insensitive" as const,
                                          },
                                      },
                                      {
                                          coverageArea: {
                                              name: {
                                                  contains: term,
                                                  mode: "insensitive" as const,
                                              },
                                              isActive: true,
                                          },
                                      },
                                  ],
                              },
                          ],
                      },
                  ]),
              }
            : {};

        const candidates = await prisma.destination.findMany({
            where: {
                status: "APPROVED",
                ...whereLocation,
            },
            include: {
                category: true,
                images: { orderBy: { isPrimary: "desc" }, take: 1 },
                destinationHalalFacilities: {
                    include: { facility: true },
                },
            },
            take: 30,
        });

        if (candidates.length === 0) {
            console.log("[AI_INTENT_TRACE] No candidates found, skip AI");
            if (matchedLocation) {
                return NextResponse.json(
                    {
                        error: `Belum ada destinasi yang disetujui di ${matchedLocation}. Coba wilayah lain.`,
                        code: "LOCATION_NOT_FOUND",
                    },
                    { status: 404 },
                );
            }
            return NextResponse.json<RouteFinderResponse>(
                buildFallbackSearch(query),
                { status: 200 },
            );
        }

        function buildFallbackItinerary(): RouteFinderResponse {
            const days = extractRequestedDays(query);
            const selected = candidates.slice(
                0,
                Math.min(candidates.length, Math.max(days, 5)),
            );
            const destinations: Record<string, DestinationInfo> = {};
            const facilities: Record<string, ItineraryFacility[]> = {};
            const umkms: Record<string, ItineraryUmkm[]> = {};

            const items = selected.map((candidate, index) => {
                destinations[candidate.id] = {
                    id: candidate.id,
                    name: candidate.name,
                    slug: candidate.slug,
                    city: candidate.city,
                    imageUrl: candidate.images?.[0]?.imageUrl ?? null,
                    categoryName: candidate.category?.name ?? null,
                    latitude:
                        candidate.latitude != null
                            ? Number(candidate.latitude)
                            : null,
                    longitude:
                        candidate.longitude != null
                            ? Number(candidate.longitude)
                            : null,
                };
                facilities[candidate.id] = buildItineraryFacilities(candidate);
                umkms[candidate.id] = [];

                const closestFacility = [
                    ...candidate.destinationHalalFacilities,
                ]
                    .filter((item) => item.distanceMeters != null)
                    .sort(
                        (a, b) =>
                            (a.distanceMeters ?? Infinity) -
                            (b.distanceMeters ?? Infinity),
                    )[0];
                const facilityNote =
                    closestFacility?.distanceMeters != null
                        ? ` Fasilitas terdekat: ${closestFacility.name ?? closestFacility.facility.name} (${formatFacilityDistance(closestFacility.distanceMeters)} dari destinasi).`
                        : "";

                return {
                    orderIndex: index + 1,
                    destinationId: candidate.id,
                    notes: `${candidate.name} dipilih berdasarkan lokasi dan kesiapan wisata halal.${facilityNote}`,
                };
            });

            return {
                intent: "ITINERARY_RECOMMENDATION",
                redirectTo: "/itinerary-recommendation",
                payload: {
                    title: matchedLocation
                        ? `Rencana Perjalanan ${days} Hari di ${matchedLocation}`
                        : `Rencana Perjalanan ${days} Hari`,
                    days,
                    items,
                    destinations,
                    facilities,
                    umkms,
                },
            };
        }

        if (!process.env.GROQ_API_KEY) {
            console.log(
                "[AI_INTENT_TRACE] GROQ_API_KEY not configured, skip AI",
            );
            return NextResponse.json<RouteFinderResponse>(
                isExplicitItineraryQuery(query)
                    ? buildFallbackItinerary()
                    : buildFallbackSearch(query),
                { status: 200 },
            );
        }

        const aiClient = new OpenAI({
            apiKey: process.env.GROQ_API_KEY,
            baseURL: "https://api.groq.com/openai/v1",
        });

        const candidateData = candidates.map(mapToCandidateData);
        const systemPrompt = buildSystemPrompt(
            JSON.stringify(candidateData),
            matchedLocation,
        );

        async function attemptAiCall(
            correctiveMessage?: string,
        ): Promise<{ json: string; raw: string } | null> {
            const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
                [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: query },
                ];
            if (correctiveMessage) {
                messages.push({
                    role: "user",
                    content: correctiveMessage,
                });
            }

            try {
                const response = await aiClient.chat.completions.create({
                    model: "llama-3.1-8b-instant",
                    response_format: { type: "json_object" },
                    messages,
                });
                const raw = response.choices[0]?.message?.content;
                if (!raw) return null;
                return { json: raw, raw };
            } catch {
                return null;
            }
        }

        function deduplicateItems(
            items: ItineraryItemPayload[],
        ): ItineraryItemPayload[] {
            const seen = new Set<string>();
            return items.filter((item) => {
                if (seen.has(item.destinationId)) return false;
                seen.add(item.destinationId);
                return true;
            });
        }

        function isWithinLocation(
            destination: (typeof candidates)[number],
            location: string,
        ): boolean {
            const city = destination.city;
            const province = destination.province;
            const loc = location.toLowerCase().trim();
            const c = city?.toLowerCase().trim() ?? "";
            const p = province?.toLowerCase().trim() ?? "";

            // Kota yang terisi adalah sumber utama. Jangan izinkan alamat atau
            // coverage area memasukkan destinasi dari kota yang berbeda.
            if (city) return c.includes(loc) || p.includes(loc);

            // Untuk data lama tanpa kota, kandidat sudah lolos pencocokan
            // provinsi, alamat, nama, atau coverage area di query database.
            return true;
        }

        async function tryParseWithRetry(): Promise<{
            aiResult: RouteFinderResponse;
            rawText: string;
        } | null> {
            const first = await attemptAiCall();
            if (!first) return null;

            let aiResult: RouteFinderResponse;
            try {
                aiResult = JSON.parse(first.json) as RouteFinderResponse;
            } catch {
                const retry = await attemptAiCall(
                    "Your previous response was not valid JSON. Respond with ONLY valid JSON matching the exact format specified. No markdown, no explanation.",
                );
                if (!retry) return null;
                try {
                    aiResult = JSON.parse(retry.json) as RouteFinderResponse;
                } catch {
                    return null;
                }
            }

            const requiredKeys: (keyof RouteFinderResponse)[] = [
                "intent",
                "redirectTo",
                "payload",
            ];
            const isValidStructure = requiredKeys.every(
                (key) => key in aiResult,
            );
            if (!isValidStructure) {
                const missing = requiredKeys
                    .filter((k) => !(k in aiResult))
                    .join(", ");
                const retry = await attemptAiCall(
                    `Your response is missing these required fields: ${missing}. Respond with ONLY valid JSON that includes ALL of: ${requiredKeys.join(", ")}.`,
                );
                if (!retry) return null;
                try {
                    const retryParsed = JSON.parse(
                        retry.json,
                    ) as RouteFinderResponse;
                    const retryValid = requiredKeys.every(
                        (k) => k in retryParsed,
                    );
                    if (!retryValid) return null;
                    aiResult = retryParsed;
                } catch {
                    return null;
                }
            }

            const validIntents = [
                "DESTINATION_SEARCH",
                "ITINERARY_RECOMMENDATION",
                "FACILITY_CHECK",
            ] as const;
            if (
                !validIntents.includes(
                    aiResult.intent as (typeof validIntents)[number],
                )
            ) {
                const retry = await attemptAiCall(
                    `"${aiResult.intent}" is not a valid intent. Valid intents are: ${validIntents.join(", ")}. Respond with ONLY valid JSON.`,
                );
                if (!retry) return null;
                try {
                    const retryParsed = JSON.parse(
                        retry.json,
                    ) as RouteFinderResponse;
                    if (
                        !validIntents.includes(
                            retryParsed.intent as (typeof validIntents)[number],
                        )
                    )
                        return null;
                    aiResult = retryParsed;
                } catch {
                    return null;
                }
            }

            return { aiResult, rawText: first.raw };
        }

        console.log("[AI_INTENT_TRACE] AI invoked");

        const parsedResult = await tryParseWithRetry();

        if (!parsedResult) {
            console.log(
                "[AI_INTENT_TRACE] All AI attempts failed, falling back",
            );
            try {
                await prisma.aiIntentLog.create({
                    data: {
                        userQuery: query,
                        intent: "RUNTIME_ERROR",
                        redirectTo: "",
                        isValid: false,
                        errorMessage: "AI failed after retry",
                    },
                });
            } catch {
                // Silently ignore
            }
            return NextResponse.json<RouteFinderResponse>(
                isExplicitItineraryQuery(query)
                    ? buildFallbackItinerary()
                    : buildFallbackSearch(query),
                { status: 200 },
            );
        }

        const { aiResult } = parsedResult;

        console.log("[AI_INTENT_TRACE] AI success:", aiResult.intent);
        console.log("[AI_INTENT_AUDIT]", {
            timestamp: new Date(),
            query,
            parsedIntent: aiResult.intent,
            redirectTo: aiResult.redirectTo,
        });

        try {
            await prisma.aiIntentLog.create({
                data: {
                    userQuery: query,
                    intent: aiResult.intent,
                    redirectTo: aiResult.redirectTo ?? "",
                    payload:
                        aiResult.payload as unknown as Prisma.InputJsonValue,
                },
            });
        } catch (err) {
            console.error("[AI_INTENT_AUDIT] DB log failed:", err);
        }

        if (aiResult.intent === "FACILITY_CHECK") {
            return NextResponse.json<RouteFinderResponse>(aiResult);
        }

        if (aiResult.intent === "ITINERARY_RECOMMENDATION") {
            const validIds = new Set(candidates.map((d) => d.id));
            const requestedItems = aiResult.payload?.items ?? [];
            const requestedDays = Math.max(aiResult.payload?.days ?? 1, 1);
            let validItems = requestedItems.filter((item) =>
                validIds.has(item.destinationId),
            );

            // Guardrail: deduplicate destinations across days
            validItems = deduplicateItems(validItems);

            // Guardrail: filter by location if location was matched
            if (matchedLocation) {
                validItems = validItems.filter((item) => {
                    const dest = candidates.find(
                        (c) => c.id === item.destinationId,
                    );
                    return dest
                        ? isWithinLocation(dest, matchedLocation)
                        : false;
                });
            }

            // Guardrail: name + description + address location conflict detection
            if (matchedLocation && knownLocations.length > 0) {
                validItems = validItems.filter((item) => {
                    const dest = candidates.find(
                        (c) => c.id === item.destinationId,
                    );
                    if (!dest) return false;
                    const desc =
                        typeof dest.description === "object" &&
                        dest.description !== null
                            ? JSON.stringify(dest.description)
                            : (dest.description as string | null);
                    if (
                        !isNameWithinLocation(
                            dest.name,
                            desc,
                            matchedLocation,
                            knownLocations,
                        )
                    ) {
                        return false;
                    }
                    if (
                        !isAddressWithinLocation(dest.address, matchedLocation)
                    ) {
                        return false;
                    }
                    return true;
                });
            }

            const selectedIds = new Set(
                validItems.map((item) => item.destinationId),
            );
            const targetItemCount = Math.min(
                candidates.length,
                Math.max(requestedItems.length, requestedDays),
            );

            for (const candidate of candidates) {
                if (validItems.length >= targetItemCount) break;
                if (selectedIds.has(candidate.id)) continue;
                if (
                    matchedLocation &&
                    !isWithinLocation(candidate, matchedLocation)
                ) {
                    continue;
                }

                selectedIds.add(candidate.id);
                validItems.push({
                    orderIndex: validItems.length + 1,
                    destinationId: candidate.id,
                    notes: `${candidate.name} dipilih sebagai alternatif unik yang sesuai dengan wilayah perjalanan.`,
                });
            }

            if (validItems.length === 0) {
                if (matchedLocation) {
                    return NextResponse.json(
                        {
                            error: `Belum ada destinasi yang disetujui di ${matchedLocation}. Coba wilayah lain.`,
                            code: "LOCATION_NOT_FOUND",
                        },
                        { status: 404 },
                    );
                }
                return NextResponse.json<RouteFinderResponse>(
                    buildFallbackSearch(query),
                    { status: 200 },
                );
            }

            const enriched = await prisma.destination.findMany({
                where: { id: { in: validItems.map((i) => i.destinationId) } },
                include: {
                    destinationHalalFacilities: {
                        include: { facility: true },
                    },
                    umkms: {
                        where: { validationStatus: "APPROVED" },
                        include: {
                            category: true,
                            images: { orderBy: { isPrimary: "desc" }, take: 1 },
                            certifications: {
                                where: { status: "VALID" },
                                select: { id: true },
                            },
                        },
                    },
                },
            });

            const facilitiesMap: Record<string, ItineraryFacility[]> = {};
            const umkmsMap: Record<string, ItineraryUmkm[]> = {};
            for (const dest of enriched) {
                facilitiesMap[dest.id] = buildItineraryFacilities(dest);
                umkmsMap[dest.id] = buildItineraryUmkms(dest);
            }

            const validIdsArr = validItems.map((i) => i.destinationId);
            const destMap: Record<string, DestinationInfo> = {};
            for (const c of candidates) {
                if (!validIdsArr.includes(c.id)) continue;
                destMap[c.id] = {
                    id: c.id,
                    name: c.name,
                    slug: c.slug,
                    city: c.city,
                    imageUrl: c.images?.[0]?.imageUrl ?? null,
                    categoryName: c.category?.name ?? null,
                    latitude: c.latitude != null ? Number(c.latitude) : null,
                    longitude: c.longitude != null ? Number(c.longitude) : null,
                };
            }

            return NextResponse.json<RouteFinderResponse>({
                intent: "ITINERARY_RECOMMENDATION",
                redirectTo: "/itinerary-recommendation",
                payload: {
                    title: matchedLocation
                        ? `Rencana Perjalanan ${requestedDays} Hari di ${matchedLocation}`
                        : (aiResult.payload?.title ?? "Rencana Perjalanan"),
                    days: requestedDays,
                    items: validItems,
                    destinations: destMap,
                    facilities: facilitiesMap,
                    umkms: umkmsMap,
                },
            });
        }

        return NextResponse.json<RouteFinderResponse>({
            intent: "DESTINATION_SEARCH",
            redirectTo: `/explore?q=${encodeURIComponent(query.slice(0, 200))}`,
            payload: null,
        });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
