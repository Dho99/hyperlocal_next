import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { getErrorMessage } from "@/lib/api-error";
import { rateLimit, getClientKey } from "@/lib/security/rate-limit";
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
import {
    cleanDestinationQuery,
    detectFacilityKeyword,
    detectFacilityListKeyword,
    facilityCanonicalLabel,
    isStrongDestinationNameMatch,
} from "@/lib/utils/facility-match";
import { logAiRequest } from "@/lib/services/ai-request-log-service";

const querySchema = z.object({
    query: z.string().min(1, "Query wajib diisi").max(500),
});

const ROUTE_FINDER_MODEL = "llama-3.1-8b-instant";

type LlmIntent =
    | "DESTINATION_SEARCH"
    | "FACILITY_CHECK"
    | "FACILITY_LIST"
    | "ITINERARY_RECOMMENDATION"
    | "UNSUPPORTED";

interface IntentDecision {
    intent: LlmIntent;
    destination: string | null;
    facility: string | null;
    location: string | null;
    days: number | null;
    confidence: number;
}

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
        | "FACILITY_CHECK"
        | "FACILITY_LIST";
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

async function findDestinationByName(
    query: string,
): Promise<{ slug: string; name: string } | null> {
    const cleaned = cleanDestinationQuery(query);
    if (cleaned.length < 3) return null;

    const matches = await prisma.destination.findMany({
        where: {
            status: "APPROVED",
            name: { contains: cleaned, mode: "insensitive" },
        },
        select: { name: true, slug: true },
        take: 5,
    });

    const strong = matches.find((match) =>
        isStrongDestinationNameMatch(cleaned, match.name),
    );
    return strong ? { slug: strong.slug, name: strong.name } : null;
}

function normalizeDecisionText(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

/**
 * LLM-first intent classification with entity extraction. It NEVER returns a
 * redirect or a destination id; the server resolves those deterministically
 * against the database.
 */
async function classifyIntentWithLlm(
    query: string,
): Promise<IntentDecision | null> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    const client = new OpenAI({
        apiKey,
        baseURL: "https://api.groq.com/openai/v1",
    });
    const prompt = `Anda adalah router intent untuk aplikasi wisata halal.
Klasifikasikan query pengguna dan ekstrak entitas. JANGAN membuat slug, ID, atau URL.

Intent yang tersedia:
- DESTINATION_SEARCH: mencari destinasi, tempat wisata, kuliner, atau penginapan.
- FACILITY_CHECK: menanyakan keberadaan fasilitas tertentu di destinasi, seperti masjid, musala, mushola, toilet, parkir, tempat wudu, sertifikat halal.
- FACILITY_LIST: meminta daftar semua fasilitas yang tersedia di satu destinasi.
- ITINERARY_RECOMMENDATION: meminta rencana perjalanan, rute, itinerary, atau durasi hari.
- UNSUPPORTED: pertanyaan di luar wisata halal atau tidak dapat dipetakan.

Aturan:
- destination: nama destinasi yang disebut, atau null.
- facility: kata fasilitas yang diminta, atau null.
- location: kota/provinsi/wilayah yang disebut, atau null. Jangan isi destination ke location.
- days: jumlah hari jika disebut, atau null.
- confidence: 0 sampai 1.

Contoh:
"apakah ada mushala di wisata situ gede" -> {"intent":"FACILITY_CHECK","destination":"Situ Gede","facility":"musala","location":null,"days":null,"confidence":0.95}
"ada fasilitas apa saja di situ gede" -> {"intent":"FACILITY_LIST","destination":"Situ Gede","facility":null,"location":null,"days":null,"confidence":0.95}
"fasilitas apa yang tersedia di pantai pangandaran" -> {"intent":"FACILITY_LIST","destination":"Pantai Pangandaran","facility":null,"location":null,"days":null,"confidence":0.95}
"cari wisata halal di tasikmalaya" -> {"intent":"DESTINATION_SEARCH","destination":null,"facility":null,"location":"Tasikmalaya","days":null,"confidence":0.95}
"itinerary 2 hari di bandung" -> {"intent":"ITINERARY_RECOMMENDATION","destination":null,"facility":null,"location":"Bandung","days":2,"confidence":0.95}

Output hanya JSON:
{"intent":"...","destination":null,"facility":null,"location":null,"days":null,"confidence":0}`;

    try {
        const response = await client.chat.completions.create({
            model: ROUTE_FINDER_MODEL,
            response_format: { type: "json_object" },
            max_tokens: 300,
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: query },
            ],
        });
        const raw = response.choices[0]?.message?.content;
        if (!raw) return null;

        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const intents: LlmIntent[] = [
            "DESTINATION_SEARCH",
            "FACILITY_CHECK",
            "FACILITY_LIST",
            "ITINERARY_RECOMMENDATION",
            "UNSUPPORTED",
        ];
        if (!intents.includes(parsed.intent as LlmIntent)) return null;

        const daysValue =
            typeof parsed.days === "number" && Number.isFinite(parsed.days)
                ? Math.min(Math.max(Math.trunc(parsed.days), 1), 30)
                : null;
        const confidence =
            typeof parsed.confidence === "number" &&
            Number.isFinite(parsed.confidence)
                ? Math.min(Math.max(parsed.confidence, 0), 1)
                : 0;

        return {
            intent: parsed.intent as LlmIntent,
            destination: normalizeDecisionText(parsed.destination),
            facility: normalizeDecisionText(parsed.facility),
            location: normalizeDecisionText(parsed.location),
            days: daysValue,
            confidence,
        };
    } catch {
        return null;
    }
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
- "cari musola di Situ Gede" → FACILITY_CHECK
- "apakah ada musala di destinasi ini?" → FACILITY_CHECK
- "rekomendasi destinasi" → DESTINATION_SEARCH
- "solo trip 1 hari di Bandung" → ITINERARY_RECOMMENDATION

Petunjuk penting:
- Jika query mengandung kata seperti "rute", "itinerary", "rencana perjalanan", "trips", "jalan-jalan ke", "tour", atau menyebutkan durasi (1 hari, 2 hari, 3 hari, sehari, full day), gunakan ITINERARY_RECOMMENDATION.
- Kata "rekomendasi" atau "rekomendasikan" SAJA tidak cukup untuk ITINERARY_RECOMMENDATION. Contoh: "rekomendasikan destinasi halal di Bandung" adalah DESTINATION_SEARCH.
- Jika query menanyakan ketersediaan atau keberadaan fasilitas tertentu (musala, musola, mushola, musholla, masjid, tempat wudu, toilet, parkir, sertifikat halal) di suatu tempat, gunakan FACILITY_CHECK.
- Untuk FACILITY_CHECK, ekstrak slug destinasi dan nama fasilitas dari query. Jika pengguna menyebut "musola" atau "mushola", gunakan kata itu pada parameter facility.
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
        value.includes("mesjid") ||
        value.includes("musala") ||
        value.includes("musola") ||
        value.includes("mushola") ||
        value.includes("musholla") ||
        value.includes("musolla") ||
        value.includes("mosque") ||
        value.includes("prayer") ||
        value.includes("religious") ||
        value.includes("worship") ||
        value.includes("ibadah")
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

function normalizeSearchText(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

async function findFacilityCheckTarget(query: string): Promise<{
    slug: string;
    facility: string;
} | null> {
    if (!/(ada|tersedia|cek|check|fasilitas|masjid|musala|mushola|toilet|wudu|wudhu|parkir)/i.test(query)) {
        return null;
    }

    const normalizedQuery = normalizeSearchText(query);
    const destinations = await prisma.destination.findMany({
        where: { status: "APPROVED" },
        select: { name: true, slug: true },
    });
    const destination = destinations
        .filter((item) => normalizedQuery.includes(normalizeSearchText(item.name)))
        .sort((a, b) => b.name.length - a.name.length)[0];
    if (!destination) return null;

    const facilities = await prisma.halalFacility.findMany({
        select: { name: true },
        distinct: ["name"],
    });
    const facility = facilities
        .map((item) => item.name)
        .filter((name): name is string => Boolean(name))
        .map((name) => {
            const normalizedName = normalizeSearchText(name);
            const tokens = normalizedName.split(" ").filter((token) => token.length >= 4);
            const exact = normalizedQuery.includes(normalizedName) ? 100 : 0;
            const overlap = tokens.filter((token) => normalizedQuery.includes(token)).length;
            return { name, score: exact + overlap };
        })
        .sort((a, b) => b.score - a.score)[0];

    return facility && facility.score > 0
        ? { slug: destination.slug, facility: facility.name }
        : null;
}

export async function POST(request: Request) {
    const requestStartedAt = Date.now();
    const rl = rateLimit(getClientKey(request, "route-finder"), 30, 60_000);
    if (!rl.allowed) return NextResponse.json({ success: false, error: "Too Many Requests" }, { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } });
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
        const facilityKeyword = detectFacilityKeyword(query);

        // Existing facility pre-match: handles queries that already contain the
        // full destination name plus a facility keyword.
        const facilityTarget = await findFacilityCheckTarget(query);
        if (facilityTarget) {
            const redirectTo = `/facility-check?slug=${encodeURIComponent(facilityTarget.slug)}&facility=${encodeURIComponent(facilityTarget.facility)}`;
            await logAiRequest({
                feature: "ROUTE_FINDER",
                userQuery: query,
                intent: "FACILITY_CHECK",
                redirectTo,
                provider: "none",
                model: null,
                status: "RULE_BASED",
                latencyMs: Date.now() - requestStartedAt,
                attemptCount: 0,
            });
            return NextResponse.json<RouteFinderResponse>({
                intent: "FACILITY_CHECK",
                redirectTo,
                payload: null,
            });
        }

        // Rule-based fast path for "fasilitas apa saja di X".
        if (detectFacilityListKeyword(query)) {
            const destination = await findDestinationByName(query);
            if (destination) {
                const redirectTo = `/destinasi/${destination.slug}#fasilitas`;
                await logAiRequest({
                    feature: "ROUTE_FINDER",
                    userQuery: query,
                    intent: "FACILITY_LIST",
                    redirectTo,
                    provider: "none",
                    model: null,
                    status: "RULE_BASED",
                    latencyMs: Date.now() - requestStartedAt,
                    attemptCount: 0,
                });
                return NextResponse.json<RouteFinderResponse>({
                    intent: "FACILITY_LIST",
                    redirectTo,
                    payload: null,
                });
            }
        }

        // Pre-AI: resolve a destination name first. A destination name such as
        // "Situ Gede" must not be treated as a city by the location extractor.
        const directMatch = await findDestinationByName(query);
        if (directMatch) {
            const redirectTo = facilityKeyword
                ? `/facility-check?slug=${encodeURIComponent(directMatch.slug)}&facility=${encodeURIComponent(facilityKeyword.matched)}`
                : `/destinasi/${directMatch.slug}`;
            const intent = facilityKeyword
                ? "FACILITY_CHECK"
                : "DESTINATION_SEARCH";

            console.log(
                "[AI_INTENT_TRACE] Pre-AI destination match →",
                directMatch.slug,
                facilityKeyword ? `(${facilityCanonicalLabel(facilityKeyword.canonical)})` : "",
            );

            await logAiRequest({
                feature: "ROUTE_FINDER",
                userQuery: query,
                intent,
                redirectTo,
                provider: "none",
                model: null,
                status: "RULE_BASED",
                latencyMs: Date.now() - requestStartedAt,
                attemptCount: 0,
            });

            return NextResponse.json<RouteFinderResponse>({
                intent,
                redirectTo,
                payload: null,
            });
        }

        // LLM-first: classify intent and extract entities before querying data.
        const classificationStartedAt = Date.now();
        const intentDecision = await classifyIntentWithLlm(query);

        if (intentDecision && intentDecision.confidence >= 0.55) {
            if (intentDecision.intent === "FACILITY_LIST") {
                const destination =
                    (intentDecision.destination
                        ? await findDestinationByName(intentDecision.destination)
                        : null) ?? (await findDestinationByName(query));

                if (destination) {
                    const redirectTo = `/destinasi/${destination.slug}#fasilitas`;
                    await logAiRequest({
                        feature: "ROUTE_FINDER",
                        userQuery: query,
                        intent: "FACILITY_LIST",
                        redirectTo,
                        provider: "groq",
                        model: ROUTE_FINDER_MODEL,
                        status: "SUCCESS",
                        latencyMs: Date.now() - classificationStartedAt,
                        attemptCount: 1,
                    });
                    return NextResponse.json<RouteFinderResponse>({
                        intent: "FACILITY_LIST",
                        redirectTo,
                        payload: null,
                    });
                }

                await logAiRequest({
                    feature: "ROUTE_FINDER",
                    userQuery: query,
                    intent: "FACILITY_LIST",
                    redirectTo: "",
                    provider: "groq",
                    model: ROUTE_FINDER_MODEL,
                    status: "SKIPPED",
                    latencyMs: Date.now() - classificationStartedAt,
                    attemptCount: 1,
                    isValid: false,
                    errorMessage: "Destinasi untuk daftar fasilitas tidak ditemukan",
                });
                return NextResponse.json(
                    {
                        error: "Destinasi untuk daftar fasilitas tidak ditemukan. Sebutkan nama destinasi yang lebih spesifik.",
                        code: "FACILITY_LIST_DESTINATION_NOT_FOUND",
                    },
                    { status: 404 },
                );
            }

            if (intentDecision.intent === "UNSUPPORTED") {
                await logAiRequest({
                    feature: "ROUTE_FINDER",
                    userQuery: query,
                    intent: "UNSUPPORTED_QUERY",
                    redirectTo: "",
                    provider: "groq",
                    model: ROUTE_FINDER_MODEL,
                    status: "SKIPPED",
                    latencyMs: Date.now() - classificationStartedAt,
                    attemptCount: 1,
                    isValid: false,
                    errorMessage: "Query tidak dapat dipetakan ke intent wisata halal",
                });
                return NextResponse.json(
                    {
                        error: "Maaf, permintaan ini belum dapat diproses. Coba cari destinasi, fasilitas, atau itinerary wisata halal.",
                        code: "UNSUPPORTED_QUERY",
                    },
                    { status: 422 },
                );
            }

            if (intentDecision.intent === "FACILITY_CHECK") {
                const destination =
                    (intentDecision.destination
                        ? await findDestinationByName(intentDecision.destination)
                        : null) ?? (await findDestinationByName(query));
                const facilityTerm =
                    intentDecision.facility ??
                    facilityKeyword?.matched ??
                    detectFacilityKeyword(query)?.matched;

                if (destination && facilityTerm) {
                    const redirectTo = `/facility-check?slug=${encodeURIComponent(destination.slug)}&facility=${encodeURIComponent(facilityTerm)}`;
                    await logAiRequest({
                        feature: "ROUTE_FINDER",
                        userQuery: query,
                        intent: "FACILITY_CHECK",
                        redirectTo,
                        provider: "groq",
                        model: ROUTE_FINDER_MODEL,
                        status: "SUCCESS",
                        latencyMs: Date.now() - classificationStartedAt,
                        attemptCount: 1,
                    });
                    return NextResponse.json<RouteFinderResponse>({
                        intent: "FACILITY_CHECK",
                        redirectTo,
                        payload: null,
                    });
                }

                await logAiRequest({
                    feature: "ROUTE_FINDER",
                    userQuery: query,
                    intent: "FACILITY_NOT_FOUND",
                    redirectTo: "",
                    provider: "groq",
                    model: ROUTE_FINDER_MODEL,
                    status: "SKIPPED",
                    latencyMs: Date.now() - classificationStartedAt,
                    attemptCount: 1,
                    isValid: false,
                    errorMessage: "Destinasi untuk pengecekan fasilitas tidak ditemukan",
                });
                return NextResponse.json(
                    {
                        error: "Destinasi untuk pengecekan fasilitas tidak ditemukan. Sebutkan nama destinasi yang lebih spesifik.",
                        code: "FACILITY_NOT_FOUND",
                    },
                    { status: 404 },
                );
            }

            if (intentDecision.intent === "DESTINATION_SEARCH") {
                const destination = intentDecision.destination
                    ? await findDestinationByName(intentDecision.destination)
                    : null;
                const redirectTo = destination
                    ? `/destinasi/${destination.slug}`
                    : `/explore?q=${encodeURIComponent(query.slice(0, 200))}`;

                await logAiRequest({
                    feature: "ROUTE_FINDER",
                    userQuery: query,
                    intent: "DESTINATION_SEARCH",
                    redirectTo,
                    provider: "groq",
                    model: ROUTE_FINDER_MODEL,
                    status: "SUCCESS",
                    latencyMs: Date.now() - classificationStartedAt,
                    attemptCount: 1,
                });
                return NextResponse.json<RouteFinderResponse>({
                    intent: "DESTINATION_SEARCH",
                    redirectTo,
                    payload: null,
                });
            }
        }

        const knownLocations = await getLocationNames();
        const llmLocation =
            intentDecision?.intent === "ITINERARY_RECOMMENDATION"
                ? intentDecision.location
                : null;
        const knownLlmLocation = llmLocation
            ? knownLocations.find(
                  (location) =>
                      normalizeSearchText(location) === normalizeSearchText(llmLocation),
              )
            : null;
        const matchedLocation =
            knownLlmLocation ?? extractCityFromQuery(query, knownLocations);

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
                          province: {
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
                          address: {
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
            const errorMessage = matchedLocation
                ? `Belum ada destinasi yang disetujui di ${matchedLocation}. Coba wilayah lain.`
                : "Tidak ada kandidat destinasi.";
            await logAiRequest({
                feature: "ROUTE_FINDER",
                userQuery: query,
                intent: "LOCATION_NOT_FOUND",
                redirectTo: "",
                provider: "none",
                model: null,
                status: "SKIPPED",
                latencyMs: Date.now() - requestStartedAt,
                attemptCount: 0,
                isValid: false,
                errorMessage,
            });
            if (matchedLocation) {
                return NextResponse.json(
                    {
                        error: errorMessage,
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
            await logAiRequest({
                feature: "ROUTE_FINDER",
                userQuery: query,
                intent: isExplicitItineraryQuery(query)
                    ? "ITINERARY_RECOMMENDATION"
                    : "DESTINATION_SEARCH",
                redirectTo: "",
                provider: "none",
                model: null,
                status: "FALLBACK",
                latencyMs: Date.now() - requestStartedAt,
                attemptCount: 0,
                errorMessage: "GROQ_API_KEY not configured",
            });
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
        const aiStartedAt = Date.now();
        let aiAttemptCount = 0;

        async function attemptAiCall(
            correctiveMessage?: string,
        ): Promise<{ json: string; raw: string } | null> {
            aiAttemptCount += 1;
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
                    max_tokens: 1500,
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
            await logAiRequest({
                feature: "ROUTE_FINDER",
                userQuery: query,
                intent: "RUNTIME_ERROR",
                redirectTo: "",
                provider: "groq",
                model: "llama-3.1-8b-instant",
                status: "ERROR",
                latencyMs: Date.now() - aiStartedAt,
                attemptCount: aiAttemptCount,
                isValid: false,
                errorMessage: "AI failed after retry",
            });
            return NextResponse.json<RouteFinderResponse>(
                isExplicitItineraryQuery(query)
                    ? buildFallbackItinerary()
                    : buildFallbackSearch(query),
                { status: 200 },
            );
        }

        const { aiResult } = parsedResult;
        const aiLatencyMs = Date.now() - aiStartedAt;

        console.log("[AI_INTENT_TRACE] AI success:", aiResult.intent);
        console.log("[AI_INTENT_AUDIT]", {
            timestamp: new Date(),
            query,
            parsedIntent: aiResult.intent,
            redirectTo: aiResult.redirectTo,
        });

        await logAiRequest({
            feature: "ROUTE_FINDER",
            userQuery: query,
            intent: aiResult.intent,
            redirectTo: aiResult.redirectTo ?? "",
            payload: aiResult.payload as unknown as Prisma.InputJsonValue,
            provider: "groq",
            model: "llama-3.1-8b-instant",
            status: "SUCCESS",
            latencyMs: aiLatencyMs,
            attemptCount: aiAttemptCount,
        });

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
