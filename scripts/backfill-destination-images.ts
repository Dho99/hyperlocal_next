import "dotenv/config";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import sharp from "sharp";
import { prisma } from "../lib/prisma";
import {
    destroyCloudinaryImage,
    uploadImageToCloudinary,
    type ImageEntityKind,
} from "../lib/cloudinary/persist-image";
import {
    evaluateCandidate,
    isNoiseText,
    normalize,
    type MatchDecision,
    type MatchEvidence,
} from "../lib/images/photo-match";

/**
 * Photo backfill pipeline: collect -> review -> apply -> fallback.
 *
 * The collector only writes a JSON report. Nothing is uploaded or written to
 * the database until `--apply --plan=<report>` (or `--fallback --apply`).
 *
 * Usage:
 *   npx tsx scripts/backfill-destination-images.ts --kind=destinations
 *   npx tsx scripts/backfill-destination-images.ts --kind=destinations --apply --plan=scripts/output/image-backfill/destinations.json
 *   npx tsx scripts/backfill-destination-images.ts --kind=destinations --fallback --apply
 */

type Kind = ImageEntityKind;
type Entity = {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    province: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    kind: Kind;
};
type CommonsMetadata = { value?: string };
type CommonsFile = {
    title: string;
    imageinfo?: Array<{
        thumburl?: string;
        url?: string;
        mime?: string;
        width?: number;
        height?: number;
        extmetadata?: Record<string, CommonsMetadata>;
    }>;
};
type CommonsResponse = {
    query?: { pages?: CommonsFile[] };
    error?: { info?: string };
};
type NominatimResult = {
    osm_type: "node" | "way" | "relation";
    osm_id: number;
    lat: string;
    lon: string;
    name?: string;
    display_name: string;
    extratags?: Record<string, string>;
    namedetails?: Record<string, string>;
};
type OpenverseImage = {
    title: string;
    creator: string | null;
    license: string;
    license_version: string | null;
    license_url: string;
    url: string;
    foreign_landing_url: string;
};
type OpenverseResponse = { results?: OpenverseImage[] };
type MapillaryImage = {
    id: string;
    thumb_2048_url?: string;
    creator?: { username?: string; name?: string };
};
type MapillaryResponse = { data?: MapillaryImage[]; error?: { message?: string } };
type Candidate = {
    source: MatchEvidence["source"];
    title: string;
    description: string;
    imageUrl: string;
    caption: string;
    license: string;
    licenseUrl: string;
    distanceMeters: number | null;
};
type ReportItem = {
    entity: Entity;
    candidate: Candidate | null;
    decision: MatchDecision;
};
type Report = {
    generatedAt: string;
    kind: Kind | "all";
    items: ReportItem[];
};
type UploadedFallback = {
    imageUrl: string;
    publicId: string;
    caption: string;
};

const USER_AGENT =
    "hyperlocal-next/0.1 (photo backfill; https://github.com/Dho99/hyperlocal_next)";
const MAX_SOURCE_BYTES = 120 * 1024 * 1024;
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const FALLBACK_FILES: Record<string, string[]> = {
    curug: [
        "File:Curug Cimahi, Jawa Barat - panoramio.jpg",
        "File:Curug Cimarinjung, Geopark Ciletuh, Ciemas, Sukabumi, Jawa Barat 0607201601.jpg",
    ],
    pantai: [
        "File:Pantai Karang Hawu, Pelabuhan Ratu, Sukabumi, Jawa Barat.jpg",
        "File:Pantai Pelabuhan Ratu, Sukabumi, Jawa Barat.jpg",
    ],
    danau: [
        "File:Danau Situ Patenggang, Ciwidey, Jawa Barat.jpg",
        "File:Situ patenggang.jpg",
    ],
    gunung: [
        "File:Berselimut kabut, Gunung Papandayan, Garut, Jawa Barat, 13122014.jpg",
        "File:Taman Wisata Alam Gunung Papandayan Kabupaten Garut Jawa Barat.jpg",
    ],
    pemandian: [
        "File:Pemandian Air Panas Ciater.jpg",
        "File:Komplek Kolam Renang Karang Setra 1.jpg",
    ],
    taman: [
        "File:Taman Wisata Alam Gunung Pancar.jpg",
        "File:Taman Wisata Alam Gunung Papandayan Kabupaten Garut Jawa Barat.jpg",
    ],
    budaya: [
        "File:Imah panggung Kampung Adat Cireundeu.jpg",
        "File:Suasana di Kampung Adat Cireundeu.jpg",
    ],
    masjid: [
        "File:Masjid Jami Syuhada, Cikaret, Harapan Jaya, Cibinong, Bogor, Jawa Barat - panoramio.jpg",
        "File:Tower Utara Masjid Raya Jawa Barat - panoramio.jpg",
    ],
    alam: [
        "File:Panorama Alam Di Pantai Menganti, Kebumen, Jawa Tengah.jpg",
        "File:Pemandangan di sabana 1 jalur selo dengan pemandangan diatas awan.jpg",
    ],
};
const THEME_LABELS: Record<string, string> = {
    curug: "curug / air terjun",
    pantai: "pantai",
    danau: "situ / telaga / danau",
    gunung: "bukit / gunung / puncak",
    pemandian: "pemandian / waterpark",
    taman: "taman rekreasi",
    budaya: "kampung budaya / ziarah",
    masjid: "masjid",
    alam: "wisata alam",
    kuliner: "kuliner / warung makan",
    toko: "toko / oleh-oleh",
    usaha: "usaha lokal",
    penginapan: "penginapan / kamar",
};
const UMKM_FALLBACK_FILES: Record<string, string[]> = {
    kuliner: [
        "File:Nasi goreng indonesia.jpg",
        "File:Sate Ayam Panggang.jpg",
        "File:Pedagang Warung Makan Di Pasar Klitikan Kebumen.jpg",
    ],
    toko: [
        "File:Toko Oleh-Oleh Sowan Cabang Mahaka.jpg",
        "File:Aneka jajan pasar tradisional jawa.jpg",
    ],
    usaha: [
        "File:Aneka jajan pasar tradisional jawa.jpg",
        "File:Pedagang Warung Makan Di Pasar Klitikan Kebumen.jpg",
    ],
};
const ACCOMMODATION_FALLBACK_FILES: Record<string, string[]> = {
    penginapan: [
        "File:Kamar Hotel Novotel Suites Yogyakarta Malioboro.jpg",
        "File:Homestay mart paren homestay.jpg",
        "File:Hotel Fatma - Kamar-2.jpg",
    ],
};

function parseArgs(): {
    kind: Kind | "all";
    limit: number | null;
    offset: number;
    apply: boolean;
    fallback: boolean;
    openverse: boolean;
    radius: number;
    report: string | null;
    plan: string | null;
    acceptReview: string | null;
    noOsm: boolean;
} {
    const raw = process.argv.slice(2);
    const kind = raw.find((arg) => arg.startsWith("--kind="))?.slice(7) ?? "destinations";
    if (!["all", "destinations", "umkm", "accommodations"].includes(kind)) {
        throw new Error("--kind must be all, destinations, umkm, or accommodations");
    }
    const limitValue = raw.find((arg) => arg.startsWith("--limit="))?.slice(8);
    const limit = limitValue === undefined ? null : Number(limitValue);
    if (limit !== null && (!Number.isInteger(limit) || limit < 1)) {
        throw new Error("--limit must be a positive integer");
    }
    const offsetValue = raw.find((arg) => arg.startsWith("--offset="))?.slice(9);
    const offset = offsetValue === undefined ? 0 : Number(offsetValue);
    if (!Number.isInteger(offset) || offset < 0) {
        throw new Error("--offset must be a non-negative integer");
    }
    const radiusValue = raw.find((arg) => arg.startsWith("--radius="))?.slice(9);
    const radius = radiusValue === undefined ? 1000 : Number(radiusValue);
    if (!Number.isInteger(radius) || radius < 100 || radius > 10000) {
        throw new Error("--radius must be between 100 and 10000 meters");
    }
    return {
        kind: kind as Kind | "all",
        limit,
        offset,
        apply: raw.includes("--apply"),
        fallback: raw.includes("--fallback"),
        openverse: raw.includes("--openverse"),
        radius,
        report: raw.find((arg) => arg.startsWith("--report="))?.slice(9)
            ?? "scripts/output/image-backfill/destinations.json",
        plan: raw.find((arg) => arg.startsWith("--plan="))?.slice(7) ?? null,
        acceptReview: raw.find((arg) => arg.startsWith("--accept-review="))?.slice(16) ?? null,
        noOsm: raw.includes("--no-osm"),
    };
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function metadataValue(
    metadata: Record<string, CommonsMetadata> | undefined,
    key: string,
): string {
    return metadata?.[key]?.value?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ?? "";
}

function reusableLicense(
    metadata: Record<string, CommonsMetadata> | undefined,
): { name: string; url: string; artist: string } | null {
    const name = metadataValue(metadata, "LicenseShortName");
    const url = metadataValue(metadata, "LicenseUrl");
    const artist =
        metadataValue(metadata, "Artist")
        || metadataValue(metadata, "Credit")
        || "Tidak dicantumkan";
    if (!name) return null;
    const isPublicDomain = /^(public domain|cc0)/i.test(name);
    const isCcBy = /^CC BY(?:-SA)? \d(?:\.\d)?$/i.test(name);
    if (!isPublicDomain && !isCcBy) return null;
    if (!isPublicDomain && !/^https:\/\/creativecommons\.org\//i.test(url)) return null;
    return { name, url, artist };
}

function displayFileTitle(title: string): string {
    return title.replace(/^File:/i, "").replace(/\.[a-z0-9]{2,5}$/i, "");
}

function fileTitle(value: string): string | null {
    const trimmed = value.trim();
    if (/^https?:\/\//i.test(trimmed)) {
        try {
            const parsed = new URL(trimmed);
            const match = parsed.pathname.match(/\/wiki\/File:(.+)$/i);
            if (match) return `File:${decodeURIComponent(match[1].replace(/_/g, " "))}`;
            if (parsed.hostname === "upload.wikimedia.org") {
                const filename = parsed.pathname.split("/").pop();
                return filename ? `File:${decodeURIComponent(filename)}` : null;
            }
            return null;
        } catch {
            return null;
        }
    }
    if (/^(category|kategori):/i.test(trimmed)) return null;
    return `File:${trimmed.replace(/^file:/i, "").replace(/_/g, " ")}`;
}

function distanceMeters(
    latitude: number,
    longitude: number,
    lat: number,
    lon: number,
): number {
    const radians = (value: number) => (value * Math.PI) / 180;
    const dLat = radians(lat - latitude);
    const dLon = radians(lon - longitude);
    const a =
        Math.sin(dLat / 2) ** 2
        + Math.cos(radians(latitude))
        * Math.cos(radians(lat))
        * Math.sin(dLon / 2) ** 2;
    return 6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getJson<T>(
    url: URL,
    options: { timeoutMs?: number; retries?: number } = {},
): Promise<T> {
    const retries = options.retries ?? 1;
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, {
                headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
                signal: AbortSignal.timeout(options.timeoutMs ?? 20_000),
            });
            if (response.status === 429 || response.status >= 500) {
                throw new Error(`HTTP ${response.status} for ${url.hostname}`);
            }
            if (!response.ok) throw new Error(`HTTP ${response.status} for ${url.hostname}`);
            return (await response.json()) as T;
        } catch (error) {
            lastError = error;
            if (attempt < retries) await sleep(1_500 * (attempt + 1));
        }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function searchNominatim(entity: Entity): Promise<NominatimResult[]> {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.search = new URLSearchParams({
        q: [entity.name, entity.city, entity.province].filter(Boolean).join(", "),
        format: "jsonv2",
        limit: "10",
        extratags: "1",
        namedetails: "1",
    }).toString();
    return await getJson<NominatimResult[]>(url, { timeoutMs: 6_000, retries: 0 });
}

async function commonsFile(title: string): Promise<CommonsFile | null> {
    const url = new URL("https://commons.wikimedia.org/w/api.php");
    url.search = new URLSearchParams({
        action: "query",
        titles: title,
        prop: "imageinfo",
        iiprop: "url|mime|size|extmetadata",
        iiurlwidth: "1600",
        format: "json",
        formatversion: "2",
    }).toString();
    const data = await getJson<CommonsResponse>(url);
    if (data.error) throw new Error(`Commons: ${data.error.info ?? "unknown error"}`);
    return data.query?.pages?.find((page) => page.imageinfo?.length) ?? null;
}

async function commonsFiles(titles: string[]): Promise<CommonsFile[]> {
    if (titles.length === 0) return [];
    const url = new URL("https://commons.wikimedia.org/w/api.php");
    url.search = new URLSearchParams({
        action: "query",
        titles: titles.join("|"),
        prop: "imageinfo",
        iiprop: "url|mime|size|extmetadata",
        iiurlwidth: "1600",
        format: "json",
        formatversion: "2",
    }).toString();
    const data = await getJson<CommonsResponse>(url);
    if (data.error) throw new Error(`Commons: ${data.error.info ?? "unknown error"}`);
    return (data.query?.pages ?? []).filter((page) => page.imageinfo?.length);
}

async function commonsSearch(query: string): Promise<CommonsFile[]> {
    const url = new URL("https://commons.wikimedia.org/w/api.php");
    url.search = new URLSearchParams({
        action: "query",
        generator: "search",
        gsrsearch: query,
        gsrnamespace: "6",
        gsrlimit: "8",
        prop: "imageinfo",
        iiprop: "url|mime|size|extmetadata",
        iiurlwidth: "1600",
        format: "json",
        formatversion: "2",
    }).toString();
    const data = await getJson<CommonsResponse>(url);
    return data.query?.pages ?? [];
}

async function commonsGeosearch(
    latitude: number,
    longitude: number,
    radius: number,
): Promise<Array<{ title: string; dist: number }>> {
    const url = new URL("https://commons.wikimedia.org/w/api.php");
    url.search = new URLSearchParams({
        action: "query",
        list: "geosearch",
        gscoord: `${latitude}|${longitude}`,
        gsradius: String(radius),
        gslimit: "8",
        gsnamespace: "6",
        format: "json",
        formatversion: "2",
    }).toString();
    const data = await getJson<{ query?: { geosearch?: Array<{ title: string; dist: number }> } }>(url);
    return data.query?.geosearch ?? [];
}

function fileGps(file: CommonsFile): { lat: number; lon: number } | null {
    const meta = file.imageinfo?.[0]?.extmetadata;
    const latRaw = metadataValue(meta, "GPSLatitude");
    const lonRaw = metadataValue(meta, "GPSLongitude");
    if (!latRaw || !lonRaw) return null;
    const lat = Number(latRaw);
    const lon = Number(lonRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    if (lat === 0 && lon === 0) return null;
    return { lat, lon };
}

function candidateFromCommons(
    file: CommonsFile,
    source: Candidate["source"],
    entity: Entity,
    extraSource?: string,
): Candidate | null {
    const info = file.imageinfo?.[0];
    if (!info?.thumburl || !info.mime?.startsWith("image/")) return null;
    if (info.mime !== "image/jpeg" && info.mime !== "image/png") return null;
    if ((info.width ?? 0) < 800) return null;
    const license = reusableLicense(info.extmetadata);
    if (!license) return null;
    const commonsUrl = `https://commons.wikimedia.org/wiki/${encodeURIComponent(file.title.replace(/ /g, "_"))}`;
    const gps = fileGps(file);
    const distance = gps && entity.latitude !== null && entity.longitude !== null
        ? distanceMeters(entity.latitude, entity.longitude, gps.lat, gps.lon)
        : null;
    const sourceText = extraSource ? `. ${extraSource}` : "";
    return {
        source,
        title: file.title,
        description: metadataValue(info.extmetadata, "ImageDescription"),
        imageUrl: info.thumburl,
        license: license.name,
        licenseUrl: license.url,
        distanceMeters: distance,
        caption:
            `Foto: ${displayFileTitle(file.title)} — ${license.artist}. `
            + `Lisensi: ${license.name} (${license.url}). Sumber: ${commonsUrl}${sourceText}`,
    };
}

async function findOsmCandidates(entity: Entity, radius: number): Promise<Candidate[]> {
    if (entity.latitude === null || entity.longitude === null) return [];
    const results = await searchNominatim(entity);
    const candidates = results
        .filter((result) => {
            const name =
                result.name
                ?? result.namedetails?.name
                ?? result.extratags?.name
                ?? result.display_name.split(",")[0];
            return distanceMeters(
                entity.latitude as number,
                entity.longitude as number,
                Number(result.lat),
                Number(result.lon),
            ) <= radius
                && normalize(name).length > 0;
        })
        .sort((left, right) =>
            distanceMeters(
                entity.latitude as number,
                entity.longitude as number,
                Number(left.lat),
                Number(left.lon),
            )
            - distanceMeters(
                entity.latitude as number,
                entity.longitude as number,
                Number(right.lat),
                Number(right.lon),
            ));

    const out: Candidate[] = [];
    for (const result of candidates) {
        const title = fileTitle(
            result.extratags?.wikimedia_commons
            ?? result.extratags?.image
            ?? "",
        );
        if (!title) continue;
        const file = await commonsFile(title);
        if (!file) continue;
        const dist = distanceMeters(
            entity.latitude,
            entity.longitude,
            Number(result.lat),
            Number(result.lon),
        );
        const candidate = candidateFromCommons(
            file,
            "osm",
            entity,
            `Data OSM: https://www.openstreetmap.org/${result.osm_type}/${result.osm_id}`,
        );
        if (candidate) {
            candidate.distanceMeters = dist;
            out.push(candidate);
        }
        if (out.length >= 3) break;
    }
    return out;
}

async function findCommonsSearchCandidates(entity: Entity): Promise<Candidate[]> {
    const queries = [
        entity.name,
        [entity.name, entity.city].filter(Boolean).join(" "),
    ];
    const seen = new Set<string>();
    const out: Candidate[] = [];
    for (const query of queries) {
        if (!query.trim()) continue;
        const files = await commonsSearch(query);
        for (const file of files) {
            if (seen.has(file.title) || isNoiseText(file.title)) continue;
            seen.add(file.title);
            const candidate = candidateFromCommons(file, "commons", entity);
            if (candidate) out.push(candidate);
            if (out.length >= 5) return out;
        }
        await sleep(250);
    }
    return out;
}

async function findCommonsGeoCandidates(entity: Entity, radius: number): Promise<Candidate[]> {
    if (entity.latitude === null || entity.longitude === null) return [];
    const items = await commonsGeosearch(entity.latitude, entity.longitude, radius);
    const distances = new Map(items.map((item) => [item.title, item.dist]));
    const titles = items
        .map((item) => item.title)
        .filter((title) => !isNoiseText(title))
        .slice(0, 8);
    if (titles.length === 0) return [];
    const files = await commonsFiles(titles);
    const out: Candidate[] = [];
    for (const file of files) {
        const candidate = candidateFromCommons(file, "commons-geo", entity);
        if (!candidate) continue;
        candidate.distanceMeters = distances.get(file.title) ?? candidate.distanceMeters;
        out.push(candidate);
    }
    return out;
}

async function findOpenverseCandidates(entity: Entity): Promise<Candidate[]> {
    const url = new URL("https://api.openverse.org/v1/images/");
    url.search = new URLSearchParams({
        q: [entity.name, entity.city].filter(Boolean).join(" "),
        license: "cc0,by,by-sa",
        page_size: "5",
        mature: "false",
    }).toString();
    const data = await getJson<OpenverseResponse>(url, { timeoutMs: 20_000, retries: 0 });
    const out: Candidate[] = [];
    for (const image of data.results ?? []) {
        if (!image.url || isNoiseText(image.title)) continue;
        out.push({
            source: "openverse",
            title: image.title,
            description: "",
            imageUrl: image.url,
            license: image.license.toUpperCase(),
            licenseUrl: image.license_url,
            distanceMeters: null,
            caption:
                `Foto: ${image.title} — ${image.creator ?? "Tidak dicantumkan"}. `
                + `Lisensi: ${image.license.toUpperCase()} ${image.license_version ?? ""} (${image.license_url}). `
                + `Sumber: ${image.foreign_landing_url}`,
        });
    }
    return out;
}

async function findMapillaryCandidates(entity: Entity): Promise<Candidate[]> {
    const token = process.env.MAPILLARY_ACCESS_TOKEN;
    if (!token || entity.latitude === null || entity.longitude === null) return [];
    const delta = 0.002;
    const url = new URL("https://graph.mapillary.com/images");
    url.search = new URLSearchParams({
        access_token: token,
        fields: "id,thumb_2048_url,creator",
        bbox: [
            entity.longitude - delta,
            entity.latitude - delta,
            entity.longitude + delta,
            entity.latitude + delta,
        ].join(","),
        limit: "5",
    }).toString();
    const data = await getJson<MapillaryResponse>(url, { timeoutMs: 20_000, retries: 0 });
    const image = (data.data ?? []).find((item) => item.thumb_2048_url);
    if (!image?.thumb_2048_url) return [];
    const creator = image.creator?.name ?? image.creator?.username ?? "kontributor Mapillary";
    return [{
        source: "mapillary",
        title: `Mapillary ${image.id}`,
        description: "",
        imageUrl: image.thumb_2048_url,
        license: "CC BY-SA 4.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
        distanceMeters: null,
        caption:
            `Foto: ${creator}. Lisensi: CC BY-SA 4.0. `
            + `Sumber: https://www.mapillary.com/app/?focus=photo&pKey=${image.id}`,
    }];
}

async function collectCandidates(
    entity: Entity,
    radius: number,
    openverse: boolean,
    noOsm: boolean,
): Promise<Candidate[]> {
    const groups: Array<[string, () => Promise<Candidate[]>]> = [];
    if (!noOsm) groups.push(["osm", () => findOsmCandidates(entity, radius)]);
    groups.push(["commons", () => findCommonsSearchCandidates(entity)]);
    groups.push(["commons-geo", () => findCommonsGeoCandidates(entity, radius)]);
    if (openverse) groups.push(["openverse", () => findOpenverseCandidates(entity)]);
    groups.push(["mapillary", () => findMapillaryCandidates(entity)]);

    const out: Candidate[] = [];
    for (const [label, load] of groups) {
        try {
            const found = await load();
            out.push(...found);
            if (found.some((candidate) => evaluateCandidate(entity, {
                title: candidate.title,
                description: candidate.description,
                distanceMeters: candidate.distanceMeters,
                source: candidate.source,
            }).status === "auto-accept")) break;
        } catch (error) {
            console.warn(`  ${label} failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        await sleep(label === "osm" ? 1_000 : 200);
    }
    return out;
}

function bestCandidate(entity: Entity, candidates: Candidate[]): ReportItem {
    let best: { candidate: Candidate; decision: MatchDecision } | null = null;
    const rank: Record<MatchDecision["status"], number> = {
        "auto-accept": 3,
        review: 2,
        reject: 1,
    };
    for (const candidate of candidates) {
        const decision = evaluateCandidate(entity, {
            title: candidate.title,
            description: candidate.description,
            distanceMeters: candidate.distanceMeters,
            source: candidate.source,
        });
        if (
            !best
            || rank[decision.status] > rank[best.decision.status]
            || (
                rank[decision.status] === rank[best.decision.status]
                && decision.score > best.decision.score
            )
        ) {
            best = { candidate, decision };
        }
    }
    return {
        entity,
        candidate: best?.candidate ?? null,
        decision: best?.decision ?? {
            status: "reject",
            score: 0,
            reasons: ["tidak ada kandidat"],
        },
    };
}

async function runCollect(args: ReturnType<typeof parseArgs>): Promise<void> {
    const kinds: Kind[] = args.kind === "all"
        ? ["destinations", "umkm", "accommodations"]
        : [args.kind];
    const items: ReportItem[] = [];
    const usedTitles = new Set<string>();

    for (const kind of kinds) {
        const entities = await loadEntities(kind, args.limit, args.offset);
        console.log(`\n== ${kind}: ${entities.length} record tanpa gambar ==`);
        for (const entity of entities) {
            console.log(`\n[${kind}] ${entity.name}`);
            if (entity.latitude === null || entity.longitude === null) {
                items.push({
                    entity,
                    candidate: null,
                    decision: { status: "reject", score: 0, reasons: ["tanpa koordinat"] },
                });
                console.log("  REJECT tanpa koordinat");
                continue;
            }
            const candidates = await collectCandidates(entity, args.radius, args.openverse, args.noOsm);
            const item = bestCandidate(entity, candidates);
            if (item.decision.status === "auto-accept" && item.candidate) {
                if (usedTitles.has(item.candidate.title)) {
                    item.decision = {
                        ...item.decision,
                        status: "review",
                        reasons: [...item.decision.reasons, "duplikat file untuk entitas lain"],
                    };
                } else {
                    usedTitles.add(item.candidate.title);
                }
            }
            items.push(item);
            console.log(
                `  ${item.decision.status.toUpperCase()} score=${item.decision.score}`
                + `${item.candidate ? ` -> ${item.candidate.title}` : ""}`,
            );
        }
    }

    const report: Report = {
        generatedAt: new Date().toISOString(),
        kind: args.kind,
        items,
    };
    await mkdir(dirname(args.report ?? "scripts/output/image-backfill/destinations.json"), { recursive: true });
    await writeFile(args.report ?? "scripts/output/image-backfill/destinations.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
    const counts = items.reduce<Record<string, number>>((acc, item) => {
        acc[item.decision.status] = (acc[item.decision.status] ?? 0) + 1;
        return acc;
    }, {});
    console.log(`\nReport: ${args.report}`);
    console.log(`Summary: ${JSON.stringify(counts)}`);
}

async function loadReviewIds(path: string): Promise<Set<string>> {
    const data = JSON.parse(await readFile(path, "utf8")) as unknown;
    if (Array.isArray(data)) return new Set(data.map(String));
    if (data && typeof data === "object") {
        const record = data as Record<string, unknown>;
        const ids = record.accepted ?? record.ids ?? record.acceptReview;
        if (Array.isArray(ids)) return new Set(ids.map(String));
    }
    throw new Error("File accept-review harus berisi array ID atau { accepted: [...] }");
}

function reportPath(args: ReturnType<typeof parseArgs>): string {
    if (!args.plan) throw new Error("--apply membutuhkan --plan=<report.json>");
    return args.plan;
}

async function runApply(args: ReturnType<typeof parseArgs>): Promise<void> {
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        || !process.env.CLOUDINARY_API_KEY
        || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error("Cloudinary credentials wajib untuk --apply");
    }
    const report = JSON.parse(await readFile(reportPath(args), "utf8")) as Report;
    const acceptedReview = args.acceptReview ? await loadReviewIds(args.acceptReview) : new Set<string>();
    const selected = report.items.filter((item) =>
        item.candidate
        && (
            item.decision.status === "auto-accept"
            || acceptedReview.has(item.entity.id)
        ));

    console.log(`Plan: ${selected.length} kandidat akan diterapkan (${report.items.length} total).`);
    const usedTitles = new Set<string>();
    let applied = 0;
    let failed = 0;
    let skipped = 0;

    for (const item of selected) {
        const entity = item.entity;
        const candidate = item.candidate as Candidate;
        console.log(`\n[${entity.kind}] ${entity.name} <- ${candidate.title}`);
        if (usedTitles.has(candidate.title)) {
            console.log("  SKIP duplikat file");
            skipped++;
            continue;
        }
        const existing = await countImages(entity);
        if (existing > 0) {
            console.log("  SKIP sudah punya gambar");
            skipped++;
            continue;
        }

        let uploadedPublicId: string | null = null;
        try {
            const buffer = await downloadImage(candidate.imageUrl);
            const uploaded = await uploadImageToCloudinary(buffer, {
                kind: entity.kind,
                slug: entity.slug,
                sourceKey: candidate.title,
                prefix: "crawl",
            });
            uploadedPublicId = uploaded.publicId;
            try {
                await saveImage(entity, {
                    imageUrl: uploaded.imageUrl,
                    publicId: uploaded.publicId,
                    caption: candidate.caption,
                    source: candidate.source,
                });
            } catch (dbError) {
                await destroyCloudinaryImage(uploaded.publicId);
                throw dbError;
            }
            usedTitles.add(candidate.title);
            applied++;
            console.log(`  OK ${uploaded.imageUrl}`);
        } catch (error) {
            failed++;
            console.error(`  FAILED ${error instanceof Error ? error.message : String(error)}`);
            if (uploadedPublicId) {
                console.error(`  orphan publicId=${uploadedPublicId}`);
            }
        }
    }

    console.log(`\nApply selesai: ${applied} applied, ${skipped} skipped, ${failed} failed.`);
}

async function runFallback(args: ReturnType<typeof parseArgs>): Promise<void> {
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        || !process.env.CLOUDINARY_API_KEY
        || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error("Cloudinary credentials wajib untuk --fallback --apply");
    }
    const kinds: Kind[] = args.kind === "all"
        ? ["destinations", "umkm", "accommodations"]
        : [args.kind];
    const cache = new Map<string, UploadedFallback>();
    let applied = 0;
    let failed = 0;

    for (const kind of kinds) {
    const entities = await loadEntities(kind, args.limit, args.offset);
    console.log(`Fallback untuk ${entities.length} ${kind} tanpa gambar.`);

    for (const entity of entities) {
        const theme = themeFor(entity);
        const files = fallbackFilesFor(entity)[theme]
            ?? fallbackFilesFor(entity).alam
            ?? fallbackFilesFor(entity).usaha
            ?? fallbackFilesFor(entity).penginapan;
        const start = fallbackIndex(entity, files.length);
        let done = false;
        for (let offset = 0; offset < files.length && !done; offset++) {
            const title = files[(start + offset) % files.length];
            try {
                let uploaded = cache.get(title);
                if (!uploaded) {
                    const file = await commonsFile(title);
                    const info = file?.imageinfo?.[0];
                    if (!file || !info?.thumburl) continue;
                    const license = reusableLicense(info.extmetadata);
                    if (!license) continue;
                    const buffer = await downloadImage(info.thumburl);
                    const cloud = await uploadImageToCloudinary(buffer, {
                        kind: entity.kind,
                        slug: theme,
                        sourceKey: title,
                        prefix: "illustration",
                        folder: `hyperlocal/fallback/${entity.kind}/${theme}`,
                    });
                    const commonsUrl = `https://commons.wikimedia.org/wiki/${encodeURIComponent(file.title.replace(/ /g, "_"))}`;
                    uploaded = {
                        imageUrl: cloud.imageUrl,
                        publicId: cloud.publicId,
                        caption:
                            `Foto: ${displayFileTitle(file.title)} — ${license.artist}. `
                            + `Lisensi: ${license.name} (${license.url}). Sumber: ${commonsUrl}`,
                    };
                    cache.set(title, uploaded);
                }
                const caption =
                    `Ilustrasi suasana ${THEME_LABELS[theme] ?? theme} — bukan foto lokasi asli. `
                    + uploaded.caption;
                try {
                    await saveImage(entity, {
                        imageUrl: uploaded.imageUrl,
                        publicId: uploaded.publicId,
                        caption,
                        source: "illustration",
                    });
                } catch (dbError) {
                    // Fallback assets are shared between entities; never delete
                    // the shared Cloudinary asset when one DB write fails.
                    console.error(`  shared fallback asset kept: ${uploaded.publicId}`);
                    throw dbError;
                }
                applied++;
                console.log(`[${kind}] ${entity.name} -> ${uploaded.imageUrl}`);
                done = true;
            } catch (error) {
                console.error(
                    `[${kind}] ${entity.name} fallback ${title} failed: `
                    + `${error instanceof Error ? error.message : String(error)}`,
                );
            }
        }
        if (!done) failed++;
    }
    }

    console.log(`\nFallback selesai: ${applied} applied, ${failed} failed.`);
}

function fallbackFilesFor(entity: Entity): Record<string, string[]> {
    if (entity.kind === "umkm") return UMKM_FALLBACK_FILES;
    if (entity.kind === "accommodations") return ACCOMMODATION_FALLBACK_FILES;
    return FALLBACK_FILES;
}

function themeFor(entity: Entity): string {
    const name = normalize(entity.name);
    if (entity.kind === "accommodations") return "penginapan";
    if (entity.kind === "umkm") {
        if (/(makan|warung|sate|bakso|nasi|kuliner|kopi|kue|resto|rumah makan|sosis|bakaran|jajanan|minum|oleh|snack|katering)/.test(name)) {
            return "kuliner";
        }
        if (/(toko|pasar|kerajinan|payung|souvenir|olahan|boutique|laundry|salon|jasa|kelontong)/.test(name)) {
            return "toko";
        }
        return "usaha";
    }
    if (/(masjid|mosque|mushola|musala)/.test(name)) return "masjid";
    if (/(curug|coban|waterfall|air terjun)/.test(name)) return "curug";
    if (/(pantai|beach)/.test(name)) return "pantai";
    if (/(situ|telaga|danau|lake|ranu|waduk|embung)/.test(name)) return "danau";
    if (/(pemandian|waterpark|waterboom|water park|kolam|hot ?spring|cipanas|ciater)/.test(name)) {
        return "pemandian";
    }
    if (/(gunung|bukit|puncak|kawah|mountain|hill|pasir|galunggung)/.test(name)) return "gunung";
    if (/(kampung|desa|ziarah|makam|museum|budaya|cagar|situs)/.test(name)) return "budaya";
    if (/(taman|park|rekreasi|kebun|hutan|camping|bumi perkemahan)/.test(name)) return "taman";
    return "alam";
}

function fallbackIndex(entity: Entity, length: number): number {
    const hash = createHash("sha256").update(entity.id).digest();
    return hash[0] % length;
}

async function downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "image/*" },
        signal: AbortSignal.timeout(90_000),
    });
    if (!response.ok) throw new Error(`Image returned HTTP ${response.status}`);
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) throw new Error("Source returned a non-image response");
    const length = Number(response.headers.get("content-length"));
    if (Number.isFinite(length) && length > MAX_SOURCE_BYTES) {
        throw new Error(`Source image exceeds ${MAX_SOURCE_BYTES} bytes`);
    }
    const source = Buffer.from(await response.arrayBuffer());
    if (source.length === 0 || source.length > MAX_SOURCE_BYTES) {
        throw new Error(`Invalid source image size (${source.length} bytes)`);
    }
    const optimized = await sharp(source)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    if (optimized.length > MAX_IMAGE_BYTES) {
        throw new Error(`Optimized image exceeds ${MAX_IMAGE_BYTES} bytes`);
    }
    return optimized;
}

async function countImages(entity: Entity): Promise<number> {
    if (entity.kind === "destinations") {
        return await prisma.destinationImage.count({ where: { destinationId: entity.id } });
    }
    if (entity.kind === "umkm") {
        return await prisma.umkmImage.count({ where: { umkmId: entity.id } });
    }
    return await prisma.accommodationImage.count({ where: { accommodationId: entity.id } });
}

async function saveImage(
    entity: Entity,
    data: { imageUrl: string; publicId: string; caption: string; source: string },
): Promise<void> {
    if (entity.kind === "destinations") {
        await prisma.destinationImage.create({
            data: {
                destinationId: entity.id,
                imageUrl: data.imageUrl,
                publicId: data.publicId,
                caption: data.caption,
                source: data.source,
                isPrimary: true,
            },
        });
        return;
    }
    if (entity.kind === "umkm") {
        await prisma.umkmImage.create({
            data: {
                umkmId: entity.id,
                imageUrl: data.imageUrl,
                publicId: data.publicId,
                caption: data.caption,
                source: data.source,
                isPrimary: true,
            },
        });
        return;
    }
    await prisma.accommodationImage.create({
        data: {
            accommodationId: entity.id,
            imageUrl: data.imageUrl,
            publicId: data.publicId,
            caption: data.caption,
            source: data.source,
            isPrimary: true,
        },
    });
}

async function loadEntities(kind: Kind, limit: number | null, offset: number): Promise<Entity[]> {
    const take = limit ?? undefined;
    if (kind === "destinations") {
        const rows = await prisma.destination.findMany({
            where: { images: { none: {} } },
            select: {
                id: true, name: true, slug: true, city: true, province: true,
                address: true, latitude: true, longitude: true,
            },
            orderBy: [{ createdAt: "asc" }, { id: "asc" }],
            skip: offset,
            take,
        });
        return rows.map((row) => ({
            ...row,
            latitude: row.latitude === null ? null : Number(row.latitude),
            longitude: row.longitude === null ? null : Number(row.longitude),
            kind,
        }));
    }
    if (kind === "umkm") {
        const rows = await prisma.umkm.findMany({
            where: { images: { none: {} } },
            select: {
                id: true, name: true, slug: true, address: true,
                latitude: true, longitude: true,
                destination: { select: { city: true, province: true } },
            },
            orderBy: [{ createdAt: "asc" }, { id: "asc" }],
            skip: offset,
            take,
        });
        return rows.map((row) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            city: row.destination?.city ?? null,
            province: row.destination?.province ?? null,
            address: row.address,
            latitude: row.latitude === null ? null : Number(row.latitude),
            longitude: row.longitude === null ? null : Number(row.longitude),
            kind,
        }));
    }
    const rows = await prisma.accommodation.findMany({
        where: { images: { none: {} } },
        select: {
            id: true, name: true, slug: true, city: true, province: true,
            address: true, latitude: true, longitude: true,
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        skip: offset,
        take,
    });
    return rows.map((row) => ({
        ...row,
        latitude: row.latitude === null ? null : Number(row.latitude),
        longitude: row.longitude === null ? null : Number(row.longitude),
        kind,
    }));
}

async function main(): Promise<void> {
    const args = parseArgs();
    if (args.fallback) {
        if (!args.apply) throw new Error("--fallback harus dipakai bersama --apply");
        await runFallback(args);
        return;
    }
    if (args.apply) {
        await runApply(args);
        return;
    }
    await runCollect(args);
}

main()
    .catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
