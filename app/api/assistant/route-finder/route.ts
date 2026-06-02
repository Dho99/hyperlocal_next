import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { getErrorMessage } from "@/lib/api-error";
import { z } from "zod";
import OpenAI from "openai";
import { mapToCandidateData } from "@/lib/utils/ai-candidates";
import { extractCityFromQuery, getLocationNames } from "@/lib/utils/ai-location";

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

function buildSystemPrompt(candidates: string): string {
    return `Anda adalah asisten rekomendasi wisata halal yang cerdas. Analisis query pengguna dan klasifikasikan ke dalam salah satu intent berikut:

1. DESTINATION_SEARCH — pengguna mencari atau ingin melihat destinasi wisata, kuliner, atau penginapan.
2. ITINERARY_RECOMMENDATION — pengguna ingin rencana perjalanan / itinerary / rute wisata yang terstruktur (misalnya "1 hari", "2 hari", "3 hari", atau menyebutkan durasi).
3. FACILITY_CHECK — pengguna ingin mengecek ketersediaan fasilitas halal tertentu di suatu destinasi (misalnya musala, tempat wudu, sertifikat halal, dll).

Petunjuk penting:
- Jika query mengandung kata seperti "rute", "itinerary", "rencana perjalanan", "trips", "jalan-jalan ke", "tour", atau menyebutkan durasi (1 hari, 2 hari, 3 hari, sehari, full day), gunakan ITINERARY_RECOMMENDATION.
- Jika query menanyakan ketersediaan atau keberadaan fasilitas tertentu (musala, masjid, tempat wudu, toilet, parkir, sertifikat halal) di suatu tempat, gunakan FACILITY_CHECK.
- Untuk FACILITY_CHECK, ekstrak slug destinasi dan nama fasilitas dari query.
- Untuk ITINERARY_RECOMMENDATION, pilah destinasi dari kandidat yang diberikan, atur secara kronologis berdasarkan lokasi dan jam operasional, dan berikan notes yang informatif dalam Bahasa Indonesia.
- Untuk DESTINATION_SEARCH, ekstrak kata kunci pencarian dari query dan gunakan di redirectTo.

⚠️ HANYA gunakan destinationId yang tercantum dalam daftar kandidat di bawah. JANGAN membuat ID palsu.

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

        const whereLocation = matchedLocation
            ? {
                  OR: [
                      { city: { contains: matchedLocation, mode: "insensitive" as const } },
                      { province: { contains: matchedLocation, mode: "insensitive" as const } },
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

        try {
            const candidateData = candidates.map(mapToCandidateData);

            console.log("[AI_INTENT_TRACE] AI invoked");

            const response = await aiClient.chat.completions.create({
                model: "llama-3.1-8b-instant",
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: buildSystemPrompt(JSON.stringify(candidateData)),
                    },
                    {
                        role: "user",
                        content: query,
                    },
                ],
            });

            const jsonString = response.choices[0]?.message?.content;
            if (!jsonString) {
                throw new Error("AI returned an empty response");
            }
            const text = jsonString;

            let aiResult: RouteFinderResponse;
            try {
                aiResult = JSON.parse(text) as RouteFinderResponse;
            } catch {
                console.log("[AI_INTENT_TRACE] AI returned invalid JSON");

                prisma.aiIntentLog.create({
                    data: {
                        userQuery: query,
                        intent: "PARSE_ERROR",
                        redirectTo: "",
                        isValid: false,
                        errorMessage: "AI returned non-JSON response",
                    },
                }).catch(() => {});

                return NextResponse.json<RouteFinderResponse>(
                    buildFallbackSearch(query),
                    { status: 200 },
                );
            }

            const requiredKeys: (keyof RouteFinderResponse)[] = ["intent", "redirectTo", "payload"];
            const isValidStructure = requiredKeys.every((key) => key in aiResult);
            if (!isValidStructure) {
                console.log("[AI_INTENT_TRACE] AI returned invalid structure");

                prisma.aiIntentLog.create({
                    data: {
                        userQuery: query,
                        intent: "STRUCTURE_ERROR",
                        redirectTo: "",
                        isValid: false,
                        errorMessage: `Missing keys: ${requiredKeys.filter((k) => !(k in aiResult)).join(", ")}`,
                    },
                }).catch(() => {});

                return NextResponse.json<RouteFinderResponse>(
                    buildFallbackSearch(query),
                    { status: 200 },
                );
            }

            const validIntents = ["DESTINATION_SEARCH", "ITINERARY_RECOMMENDATION", "FACILITY_CHECK"] as const;
            if (!validIntents.includes(aiResult.intent as typeof validIntents[number])) {
                console.log("[AI_INTENT_TRACE] AI returned unknown intent:", aiResult.intent);

                prisma.aiIntentLog.create({
                    data: {
                        userQuery: query,
                        intent: `UNKNOWN:${aiResult.intent}`,
                        redirectTo: aiResult.redirectTo ?? "",
                        isValid: false,
                        errorMessage: `Unknown intent: ${aiResult.intent}`,
                    },
                }).catch(() => {});

                return NextResponse.json<RouteFinderResponse>(
                    buildFallbackSearch(query),
                    { status: 200 },
                );
            }

            console.log("[AI_INTENT_TRACE] AI success:", aiResult.intent);
            console.log("[AI_INTENT_AUDIT]", {
                timestamp: new Date(),
                query,
                parsedIntent: aiResult.intent,
                redirectTo: aiResult.redirectTo,
            });

            prisma.aiIntentLog.create({
                data: {
                    userQuery: query,
                    intent: aiResult.intent,
                    redirectTo: aiResult.redirectTo ?? "",
                    payload: aiResult.payload as unknown as Prisma.InputJsonValue,
                },
            }).catch((err) => console.error("[AI_INTENT_AUDIT] DB log failed:", err));

            if (aiResult.intent === "FACILITY_CHECK") {
                return NextResponse.json<RouteFinderResponse>(aiResult);
            }

            if (aiResult.intent === "ITINERARY_RECOMMENDATION") {
                const validIds = new Set(candidates.map((d) => d.id));
                const validItems = (aiResult.payload?.items ?? []).filter(
                    (item) => validIds.has(item.destinationId),
                );

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
                redirectTo: aiResult.redirectTo || `/explore?q=${encodeURIComponent(query.slice(0, 80))}`,
                payload: null,
            });
        } catch (error) {
            console.error("[AI_INTENT_TRACE] AI error:", getErrorMessage(error));

            prisma.aiIntentLog.create({
                data: {
                    userQuery: query,
                    intent: "RUNTIME_ERROR",
                    redirectTo: "",
                    isValid: false,
                    errorMessage: getErrorMessage(error),
                },
            }).catch(() => {});

            return NextResponse.json<RouteFinderResponse>(
                buildFallbackSearch(query),
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
