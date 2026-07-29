import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { getErrorMessage } from "@/lib/api-error";
import { z } from "zod";
import OpenAI from "openai";
import { mapToCandidateData } from "@/lib/utils/ai-candidates";
import { extractCityFromQuery, getLocationNames, isNameWithinLocation, isAddressWithinLocation } from "@/lib/utils/ai-location";

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

interface ItineraryPayload {
    title: string;
    days: number;
    items: ItineraryItemPayload[];
    destinations: Record<string, DestinationInfo>;
}

interface RouteFinderResponse {
    intent: "DESTINATION_SEARCH" | "ITINERARY_RECOMMENDATION" | "FACILITY_CHECK";
    redirectTo: string;
    payload: ItineraryPayload | null;
}

const ROUTE_FINDER_STOP_WORDS = new Set([
    "cari", "carikan", "temukan", "tampilkan", "lihat", "tunjukkan",
    "rekomendasi", "rekomendasikan", "sarankan", "saran",
    "di", "ke", "dari", "untuk", "yang", "ada", "sekitar",
    "halal", "wisata", "destinasi", "tempat", "lokasi",
    "tolong", "bantu", "dong", "deh", "ya", "yuk",
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
        orderBy: { halalScore: "desc" },
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

function buildSystemPrompt(candidates: string, matchedLocation?: string | null): string {
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

        const whereLocation = matchedLocation
            ? {
                  OR: [
                      { city: { contains: matchedLocation, mode: "insensitive" as const } },
                      { province: { contains: matchedLocation, mode: "insensitive" as const } },
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
            take: 30,
            orderBy: { halalScore: "desc" },
        });

        if (candidates.length === 0) {
            console.log("[AI_INTENT_TRACE] No candidates found, skip AI");
            return NextResponse.json<RouteFinderResponse>(
                buildFallbackSearch(query),
                { status: 200 },
            );
        }

        if (!process.env.GROQ_API_KEY) {
            console.log("[AI_INTENT_TRACE] GROQ_API_KEY not configured, skip AI");
            return NextResponse.json<RouteFinderResponse>(
                buildFallbackSearch(query),
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
            const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
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
            // If both are null, trust AI knowledge
            if (!city && !province) return true;
            const loc = location.toLowerCase().trim();
            const c = city?.toLowerCase().trim() ?? "";
            const p = province?.toLowerCase().trim() ?? "";
            return c.includes(loc) || p.includes(loc);
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
            const isValidStructure = requiredKeys.every((key) => key in aiResult);
            if (!isValidStructure) {
                const missing = requiredKeys
                    .filter((k) => !(k in aiResult))
                    .join(", ");
                const retry = await attemptAiCall(
                    `Your response is missing these required fields: ${missing}. Respond with ONLY valid JSON that includes ALL of: ${requiredKeys.join(", ")}.`,
                );
                if (!retry) return null;
                try {
                    const retryParsed = JSON.parse(retry.json) as RouteFinderResponse;
                    const retryValid = requiredKeys.every((k) => k in retryParsed);
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
                    const retryParsed = JSON.parse(retry.json) as RouteFinderResponse;
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
            console.log("[AI_INTENT_TRACE] All AI attempts failed, falling back");
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
                buildFallbackSearch(query),
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
                    payload: aiResult.payload as unknown as Prisma.InputJsonValue,
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
            let validItems = (aiResult.payload?.items ?? []).filter(
                (item) => validIds.has(item.destinationId),
            );

            // Guardrail: deduplicate destinations across days
            validItems = deduplicateItems(validItems);

            // Guardrail: filter by location if location was matched
            if (matchedLocation) {
                validItems = validItems.filter((item) => {
                    const dest = candidates.find((c) => c.id === item.destinationId);
                    return dest ? isWithinLocation(dest, matchedLocation) : false;
                });
            }

            // Guardrail: name + description + address location conflict detection
            if (matchedLocation && knownLocations.length > 0) {
                validItems = validItems.filter((item) => {
                    const dest = candidates.find((c) => c.id === item.destinationId);
                    if (!dest) return false;
                    const desc =
                        typeof dest.description === "object" && dest.description !== null
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
                        !isAddressWithinLocation(
                            dest.address,
                            matchedLocation,
                        )
                    ) {
                        return false;
                    }
                    return true;
                });
            }

            if (validItems.length === 0) {
                return NextResponse.json<RouteFinderResponse>(
                    buildFallbackSearch(query),
                    { status: 200 },
                );
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
                    title: aiResult.payload?.title ?? "Rencana Perjalanan",
                    days: aiResult.payload?.days ?? 1,
                    items: validItems,
                    destinations: destMap,
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
