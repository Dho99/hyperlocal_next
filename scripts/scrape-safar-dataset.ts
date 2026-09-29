/**
 * scrape-safar-dataset.ts
 * ------------------------
 * Enrichment scraper untuk dataset SAFAR (Smart Halal Tourism Intelligence Platform).
 * Sumber data: Google Places API (Text Search + Place Details + Nearby Search),
 * legal & sesuai ToS Google (hanya data publik/agregat, review dibatasi 5/tempat
 * seperti yang diizinkan Places API — bukan full scrape halaman review).
 *
 * Wilayah prioritas: Priangan Timur (Tasikmalaya, Garut, Ciamis, Banjar, Pangandaran).
 *
 * Output (staging, belum masuk DB — lihat scripts/import-safar-dataset.ts untuk import):
 *   scripts/output/safar/destination_master.json
 *   scripts/output/safar/facility_enrichment.json
 *   scripts/output/safar/review_sentiment.json
 *   scripts/output/safar/tourism_metrics.json
 *   scripts/output/safar/coverage-report.json
 *
 * Usage:
 *   npx tsx scripts/scrape-safar-dataset.ts --region=pangandaran --limit=5 --dry-run
 *   npx tsx scripts/scrape-safar-dataset.ts --region=all --limit=10
 *   npx tsx scripts/scrape-safar-dataset.ts --region=garut --skip-sentiment
 */

import "dotenv/config";
import { createHash } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import OpenAI from "openai";
import { haversineDistance } from "../lib/utils/haversine-distance";

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GROQ_KEY = process.env.GROQ_API_KEY;

if (!GOOGLE_KEY) {
    console.error("GOOGLE_MAPS_API_KEY belum di-set di .env");
    process.exit(1);
}

const OUT_DIR = join(__dirname, "output", "safar");
const RETRIEVED_AT = new Date().toISOString();
const METHOD_PLACES = "Google Places API (Text Search + Place Details + Nearby Search)";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

type Region = {
    key: string;
    name: string;
    province: string;
    keywords: string[];
};

const REGIONS: Region[] = [
    {
        key: "tasikmalaya",
        name: "Tasikmalaya",
        province: "Jawa Barat",
        keywords: [
            "wisata alam Tasikmalaya",
            "wisata religi Tasikmalaya",
            "wisata sejarah Tasikmalaya",
            "wisata kuliner Tasikmalaya",
        ],
    },
    {
        key: "garut",
        name: "Garut",
        province: "Jawa Barat",
        keywords: [
            "wisata alam Garut",
            "wisata religi Garut",
            "kawah Garut",
            "curug Garut",
        ],
    },
    {
        key: "ciamis",
        name: "Ciamis",
        province: "Jawa Barat",
        keywords: [
            "wisata alam Ciamis",
            "wisata sejarah Ciamis",
            "wisata religi Ciamis",
        ],
    },
    {
        key: "banjar",
        name: "Banjar",
        province: "Jawa Barat",
        keywords: ["wisata Banjar Jawa Barat", "curug Banjar Jawa Barat"],
    },
    {
        key: "pangandaran",
        name: "Pangandaran",
        province: "Jawa Barat",
        keywords: [
            "pantai Pangandaran",
            "wisata alam Pangandaran",
            "green canyon Pangandaran",
        ],
    },
];

type Args = {
    region: string;
    limitPerKeyword: number;
    dryRun: boolean;
    skipFacilities: boolean;
    skipSentiment: boolean;
};

function parseArgs(): Args {
    const raw = process.argv.slice(2);
    const get = (prefix: string) => raw.find((a) => a.startsWith(prefix))?.split("=")[1];
    return {
        region: get("--region=") ?? "all",
        limitPerKeyword: get("--limit=") ? Number(get("--limit=")) : 5,
        dryRun: raw.includes("--dry-run"),
        skipFacilities: raw.includes("--skip-facilities"),
        skipSentiment: raw.includes("--skip-sentiment"),
    };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(input: string): string {
    return input
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

function placeIdToDestinationId(placeId: string): string {
    return createHash("sha256").update(placeId).digest("hex").slice(0, 16);
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function googleFetch(url: string): Promise<any> {
    for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${url.slice(0, 120)}`);
        const json: any = await res.json();
        if (json.status === "OVER_QUERY_LIMIT") {
            await sleep(1000 * (attempt + 1));
            continue;
        }
        if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
            throw new Error(`Places API status ${json.status}: ${json.error_message ?? ""}`);
        }
        return json;
    }
    throw new Error("OVER_QUERY_LIMIT retries exhausted");
}

// ---------------------------------------------------------------------------
// Google Places calls
// ---------------------------------------------------------------------------

type TextSearchResult = {
    place_id: string;
    name: string;
    formatted_address?: string;
    geometry: { location: { lat: number; lng: number } };
    types: string[];
};

async function textSearch(query: string, limit: number): Promise<TextSearchResult[]> {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query,
    )}&key=${GOOGLE_KEY}&language=id&region=id`;
    const json = await googleFetch(url);
    const results = (json.results ?? []) as TextSearchResult[];
    return results.slice(0, limit);
}

type PlaceDetails = {
    name: string;
    formatted_address?: string;
    geometry: { location: { lat: number; lng: number } };
    types: string[];
    website?: string;
    url?: string;
    rating?: number;
    user_ratings_total?: number;
    address_components?: Array<{ long_name: string; types: string[] }>;
    photos?: Array<{ photo_reference: string }>;
    reviews?: Array<{
        author_name: string;
        rating: number;
        text: string;
        time: number;
        relative_time_description: string;
    }>;
};

async function placeDetails(placeId: string): Promise<PlaceDetails> {
    const fields = [
        "name",
        "formatted_address",
        "geometry",
        "type",
        "website",
        "url",
        "rating",
        "user_ratings_total",
        "address_component",
        "photo",
        "review",
    ].join(",");
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_KEY}&language=id`;
    const json = await googleFetch(url);
    return json.result as PlaceDetails;
}

type NearbyResult = {
    place_id: string;
    name: string;
    geometry: { location: { lat: number; lng: number } };
    rating?: number;
    user_ratings_total?: number;
};

async function nearbySearch(
    lat: number,
    lng: number,
    type: string,
    keyword?: string,
    radiusMeters = 2000,
): Promise<NearbyResult[]> {
    const params = new URLSearchParams({
        location: `${lat},${lng}`,
        radius: String(radiusMeters),
        type,
        key: GOOGLE_KEY!,
        language: "id",
    });
    if (keyword) params.set("keyword", keyword);
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;
    const json = await googleFetch(url);
    return (json.results ?? []) as NearbyResult[];
}

function addressComponent(
    components: Array<{ long_name: string; types: string[] }> | undefined,
    type: string,
): string | null {
    return components?.find((c) => c.types.includes(type))?.long_name ?? null;
}

function mapCategory(types: string[]): string {
    const map: Record<string, string> = {
        natural_feature: "wisata_alam",
        park: "wisata_alam",
        place_of_worship: "wisata_religi",
        museum: "wisata_sejarah",
        historical_landmark: "wisata_sejarah",
        tourist_attraction: "wisata_umum",
        beach: "wisata_alam",
        amusement_park: "wisata_hiburan",
        campground: "wisata_alam",
    };
    for (const t of types) if (map[t]) return map[t];
    return "wisata_umum";
}

// ---------------------------------------------------------------------------
// Sentiment (Groq)
// ---------------------------------------------------------------------------

const ASPECTS = [
    "kebersihan",
    "aksesibilitas",
    "fasilitas_halal",
    "pelayanan",
    "kenyamanan",
] as const;

type AspectScores = Record<(typeof ASPECTS)[number], number | null>;

type SentimentResult = {
    sentiment: "positive" | "negative" | "neutral";
    aspect_score: AspectScores;
};

const groqClient = GROQ_KEY
    ? new OpenAI({ apiKey: GROQ_KEY, baseURL: "https://api.groq.com/openai/v1" })
    : null;

async function classifyReviews(
    reviews: Array<{ text: string; rating: number }>,
): Promise<SentimentResult[]> {
    if (!groqClient || reviews.length === 0) {
        return reviews.map(() => ({
            sentiment: "neutral" as const,
            aspect_score: Object.fromEntries(ASPECTS.map((a) => [a, null])) as AspectScores,
        }));
    }

    const systemPrompt = `Anda menganalisis sentiment review wisata Bahasa Indonesia untuk platform wisata halal SAFAR.
Untuk setiap review, kembalikan:
- sentiment: "positive" | "negative" | "neutral"
- aspect_score: skor 1-5 untuk setiap aspek berikut JIKA disebut/tersirat di review, atau null jika aspek tidak dibahas sama sekali:
  kebersihan, aksesibilitas, fasilitas_halal, pelayanan, kenyamanan
Balas HANYA JSON array, urutan sama dengan input, format:
[{"sentiment":"positive","aspect_score":{"kebersihan":4,"aksesibilitas":null,"fasilitas_halal":null,"pelayanan":5,"kenyamanan":4}}]`;

    const userPrompt = JSON.stringify(
        reviews.map((r, i) => ({ index: i, rating: r.rating, text: r.text.slice(0, 800) })),
    );

    try {
        const completion = await groqClient.chat.completions.create({
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" },
            max_tokens: 1200,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Reviews:\n${userPrompt}\n\nBalas JSON: {"results": [...]}` },
            ],
        });
        const raw = completion.choices[0]?.message?.content ?? "{}";
        const parsed = JSON.parse(raw);
        const results = (parsed.results ?? parsed) as SentimentResult[];
        if (!Array.isArray(results) || results.length !== reviews.length) {
            throw new Error("shape mismatch");
        }
        return results;
    } catch (err) {
        console.warn(`  [sentiment] gagal classify batch: ${(err as Error).message}, fallback neutral`);
        return reviews.map(() => ({
            sentiment: "neutral" as const,
            aspect_score: Object.fromEntries(ASPECTS.map((a) => [a, null])) as AspectScores,
        }));
    }
}

// ---------------------------------------------------------------------------
// Output row types
// ---------------------------------------------------------------------------

type DestinationMasterRow = {
    destination_id: string;
    name: string;
    category: string;
    description: string | null;
    address: string | null;
    latitude: number;
    longitude: number;
    city: string | null;
    province: string;
    region: string;
    website: string | null;
    photo_urls: string[];
    source_url: string;
    retrieved_at: string;
    method: string;
    confidence_score: number;
};

type FacilityEnrichmentRow = {
    destination_id: string;
    facility_name: string;
    facility_type: string;
    latitude: number;
    longitude: number;
    distance_meter: number;
    rating: number | null;
    review_count: number | null;
    source_url: string;
    retrieved_at: string;
    method: string;
};

type ReviewSentimentRow = {
    destination_id: string;
    source: string;
    rating: number;
    review_text: string;
    review_date: string;
    sentiment: string;
    aspect_score: AspectScores;
    retrieved_at: string;
    method: string;
};

type TourismMetricsRow = {
    destination_id: string;
    rating_average: number | null;
    review_count: number;
    popularity_score: number;
    trend: null;
    retrieved_at: string;
    method: string;
};

const FACILITY_TYPES: Array<{ type: string; keyword?: string; facilityType: string }> = [
    { type: "place_of_worship", keyword: "masjid", facilityType: "masjid" },
    { type: "restaurant", facilityType: "restoran" },
    { type: "lodging", facilityType: "penginapan" },
    { type: "bus_station", facilityType: "transportasi" },
    { type: "atm", facilityType: "fasilitas_umum" },
];

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

async function run() {
    const args = parseArgs();
    mkdirSync(OUT_DIR, { recursive: true });

    const regions = args.region === "all" ? REGIONS : REGIONS.filter((r) => r.key === args.region);
    if (regions.length === 0) {
        console.error(`Region "${args.region}" tidak dikenal. Pilihan: all, ${REGIONS.map((r) => r.key).join(", ")}`);
        process.exit(1);
    }
    if (args.skipSentiment) {
        console.log("Sentiment classification dilewati (--skip-sentiment).");
    } else if (!GROQ_KEY) {
        console.warn("GROQ_API_KEY belum di-set — sentiment akan fallback ke neutral/null untuk semua review.");
    }

    const destinationMaster: DestinationMasterRow[] = [];
    const facilityEnrichment: FacilityEnrichmentRow[] = [];
    const reviewSentiment: ReviewSentimentRow[] = [];
    const tourismMetrics: TourismMetricsRow[] = [];

    const seenPlaceIds = new Set<string>();
    const seenCoordKeys = new Set<string>(); // dedup dgn nama+koordinat dibulatkan
    const errors: Array<{ stage: string; ref: string; message: string }> = [];

    for (const region of regions) {
        console.log(`\n=== Region: ${region.name} ===`);
        const discovered = new Map<string, TextSearchResult>();

        for (const keyword of region.keywords) {
            try {
                const results = await textSearch(keyword, args.limitPerKeyword);
                for (const r of results) discovered.set(r.place_id, r);
                console.log(`  [textsearch] "${keyword}" -> ${results.length} hasil`);
            } catch (err) {
                errors.push({ stage: "textsearch", ref: keyword, message: (err as Error).message });
                console.warn(`  [textsearch] gagal "${keyword}": ${(err as Error).message}`);
            }
            await sleep(200);
        }

        for (const [placeId, basic] of discovered) {
            if (seenPlaceIds.has(placeId)) continue;

            const coordKey = `${basic.name.toLowerCase().trim()}|${basic.geometry.location.lat.toFixed(4)},${basic.geometry.location.lng.toFixed(4)}`;
            if (seenCoordKeys.has(coordKey)) continue;

            let details: PlaceDetails;
            try {
                details = await placeDetails(placeId);
            } catch (err) {
                errors.push({ stage: "details", ref: basic.name, message: (err as Error).message });
                console.warn(`  [details] gagal "${basic.name}": ${(err as Error).message}`);
                continue;
            }
            await sleep(200);

            seenPlaceIds.add(placeId);
            seenCoordKeys.add(coordKey);

            const destinationId = placeIdToDestinationId(placeId);
            const lat = details.geometry.location.lat;
            const lng = details.geometry.location.lng;
            const city =
                addressComponent(details.address_components, "administrative_area_level_2") ??
                addressComponent(details.address_components, "locality");
            const sourceUrl = details.url ?? `https://www.google.com/maps/place/?q=place_id:${placeId}`;
            const photoUrls = (details.photos ?? [])
                .slice(0, 5)
                .map((p) => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${p.photo_reference}&key=${GOOGLE_KEY}`);

            let confidence = 0.5;
            if (details.formatted_address) confidence += 0.15;
            if (details.website) confidence += 0.1;
            if (details.rating) confidence += 0.15;
            if (photoUrls.length > 0) confidence += 0.1;

            destinationMaster.push({
                destination_id: destinationId,
                name: details.name,
                category: mapCategory(details.types ?? []),
                description: null,
                address: details.formatted_address ?? null,
                latitude: lat,
                longitude: lng,
                city,
                province: region.province,
                region: region.name,
                website: details.website ?? null,
                photo_urls: photoUrls,
                source_url: sourceUrl,
                retrieved_at: RETRIEVED_AT,
                method: METHOD_PLACES,
                confidence_score: Math.min(1, Math.round(confidence * 100) / 100),
            });

            tourismMetrics.push({
                destination_id: destinationId,
                rating_average: details.rating ?? null,
                review_count: details.user_ratings_total ?? 0,
                popularity_score:
                    Math.round(((details.rating ?? 0) * Math.log((details.user_ratings_total ?? 0) + 1)) * 100) / 100,
                trend: null,
                retrieved_at: RETRIEVED_AT,
                method: METHOD_PLACES,
            });

            // --- Facility enrichment ---
            if (!args.skipFacilities) {
                for (const facilityDef of FACILITY_TYPES) {
                    try {
                        const nearby = await nearbySearch(lat, lng, facilityDef.type, facilityDef.keyword);
                        for (const f of nearby.slice(0, 5)) {
                            const distanceMeter = Math.round(
                                haversineDistance(
                                    lat,
                                    lng,
                                    f.geometry.location.lat,
                                    f.geometry.location.lng,
                                ) * 1000,
                            );
                            facilityEnrichment.push({
                                destination_id: destinationId,
                                facility_name: f.name,
                                facility_type: facilityDef.facilityType,
                                latitude: f.geometry.location.lat,
                                longitude: f.geometry.location.lng,
                                distance_meter: distanceMeter,
                                rating: f.rating ?? null,
                                review_count: f.user_ratings_total ?? null,
                                source_url: `https://www.google.com/maps/place/?q=place_id:${f.place_id}`,
                                retrieved_at: RETRIEVED_AT,
                                method: METHOD_PLACES,
                            });
                        }
                    } catch (err) {
                        errors.push({
                            stage: "nearby",
                            ref: `${details.name}/${facilityDef.facilityType}`,
                            message: (err as Error).message,
                        });
                    }
                    await sleep(150);
                }
            }

            // --- Review + sentiment ---
            if (details.reviews?.length) {
                const sentiments = args.skipSentiment
                    ? details.reviews.map(() => ({
                          sentiment: "neutral" as const,
                          aspect_score: Object.fromEntries(ASPECTS.map((a) => [a, null])) as AspectScores,
                      }))
                    : await classifyReviews(details.reviews.map((r) => ({ text: r.text, rating: r.rating })));

                details.reviews.forEach((review, idx) => {
                    reviewSentiment.push({
                        destination_id: destinationId,
                        source: "google_places",
                        rating: review.rating,
                        review_text: review.text,
                        review_date: new Date(review.time * 1000).toISOString(),
                        sentiment: sentiments[idx].sentiment,
                        aspect_score: sentiments[idx].aspect_score,
                        retrieved_at: RETRIEVED_AT,
                        method: args.skipSentiment || !GROQ_KEY ? "fallback_neutral" : "groq_llama-3.1-8b-instant",
                    });
                });
            }

            console.log(`  + ${details.name} (${destinationId}) [conf=${confidence.toFixed(2)}]`);
        }
    }

    // -----------------------------------------------------------------------
    // Coverage report
    // -----------------------------------------------------------------------

    const coverage = {
        generated_at: RETRIEVED_AT,
        regions: regions.map((r) => r.key),
        total_destinations: destinationMaster.length,
        with_website: destinationMaster.filter((d) => d.website).length,
        with_photos: destinationMaster.filter((d) => d.photo_urls.length > 0).length,
        with_facility_data: new Set(facilityEnrichment.map((f) => f.destination_id)).size,
        with_reviews: new Set(reviewSentiment.map((r) => r.destination_id)).size,
        total_facilities: facilityEnrichment.length,
        total_reviews: reviewSentiment.length,
        avg_confidence_score:
            destinationMaster.length > 0
                ? Math.round(
                      (destinationMaster.reduce((s, d) => s + d.confidence_score, 0) / destinationMaster.length) * 100,
                  ) / 100
                : 0,
        sentiment_engine: args.skipSentiment ? "skipped" : GROQ_KEY ? "groq_llama-3.1-8b-instant" : "fallback_neutral (GROQ_API_KEY not set)",
        errors,
    };

    console.log("\n=== Coverage Report ===");
    console.log(JSON.stringify(coverage, null, 2));

    if (args.dryRun) {
        console.log("\n[dry-run] tidak menulis file output.");
        return;
    }

    writeFileSync(join(OUT_DIR, "destination_master.json"), JSON.stringify(destinationMaster, null, 2));
    writeFileSync(join(OUT_DIR, "facility_enrichment.json"), JSON.stringify(facilityEnrichment, null, 2));
    writeFileSync(join(OUT_DIR, "review_sentiment.json"), JSON.stringify(reviewSentiment, null, 2));
    writeFileSync(join(OUT_DIR, "tourism_metrics.json"), JSON.stringify(tourismMetrics, null, 2));
    writeFileSync(join(OUT_DIR, "coverage-report.json"), JSON.stringify(coverage, null, 2));

    console.log(`\nOutput ditulis ke ${OUT_DIR}`);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
