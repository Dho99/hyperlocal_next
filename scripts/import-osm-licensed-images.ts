import "dotenv/config";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { prisma } from "../lib/prisma";
import { cloudinary } from "../lib/cloudinary/config";

type Kind = "destinations" | "umkm" | "accommodations";
type Entity = {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    province: string | null;
    address: string | null;
    latitude: number;
    longitude: number;
    kind: Kind;
};
type OsmElement = {
    type: "node" | "way" | "relation";
    id: number;
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: Record<string, string>;
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
type NominatimResponse = NominatimResult[];
type CommonsMetadata = { value?: string };
type CommonsFile = {
    title: string;
    imageinfo?: Array<{
        thumburl?: string;
        mime?: string;
        extmetadata?: Record<string, CommonsMetadata>;
    }>;
};
type CommonsResponse = {
    query?: { pages?: CommonsFile[] };
    error?: { info?: string };
};

const USER_AGENT =
    "hyperlocal-next/0.1 (OpenStreetMap photo importer; https://github.com/Dho99/hyperlocal_next)";
const MAX_SOURCE_BYTES = 120 * 1024 * 1024;
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const GENERIC_WORDS = new Set([
    "wisata", "objek", "tempat", "kabupaten", "kota", "provinsi", "indonesia",
    "hotel", "penginapan", "restoran", "rumah", "makan", "warung", "toko",
    "usaha", "masjid", "pantai", "dan", "di", "ke", "the",
]);

function parseArgs(): {
    kind: Kind | "all";
    limit: number;
    offset: number;
    apply: boolean;
    radius: number;
} {
    const raw = process.argv.slice(2);
    const kind = raw.find((arg) => arg.startsWith("--kind="))?.slice(7) ?? "all";
    if (!["all", "destinations", "umkm", "accommodations"].includes(kind)) {
        throw new Error("--kind must be all, destinations, umkm, or accommodations");
    }
    const limitValue = raw.find((arg) => arg.startsWith("--limit="))?.slice(8);
    const limit = limitValue === undefined ? 10 : Number(limitValue);
    if (!Number.isInteger(limit) || limit < 1 || limit > 25) {
        throw new Error("--limit must be an integer from 1 to 25 per entity type");
    }
    const offsetValue = raw.find((arg) => arg.startsWith("--offset="))?.slice(9);
    const offset = offsetValue === undefined ? 0 : Number(offsetValue);
    if (!Number.isInteger(offset) || offset < 0) {
        throw new Error("--offset must be a non-negative integer");
    }
    const radiusValue = raw.find((arg) => arg.startsWith("--radius="))?.slice(9);
    const radius = radiusValue === undefined ? 500 : Number(radiusValue);
    if (!Number.isInteger(radius) || radius < 50 || radius > 2000) {
        throw new Error("--radius must be between 50 and 2000 meters");
    }
    return {
        kind: kind as Kind | "all",
        limit,
        offset,
        apply: raw.includes("--apply"),
        radius,
    };
}

function normalize(value: string): string {
    return value.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function meaningfulTokens(value: string): string[] {
    return [...new Set(normalize(value).split(/\s+/).filter(
        (word) => word.length > 2 && !GENERIC_WORDS.has(word),
    ))];
}

function matchesName(entityName: string, osmName: string): boolean {
    const entity = normalize(entityName);
    const osm = normalize(osmName);
    if (entity.length >= 4 && (entity === osm || entity.includes(osm) || osm.includes(entity))) {
        return true;
    }
    const entityTokens = meaningfulTokens(entityName);
    const osmTokens = new Set(meaningfulTokens(osmName));
    if (entityTokens.length < 2) return false;
    const shared = entityTokens.filter((token) => osmTokens.has(token)).length;
    return shared >= Math.max(2, Math.ceil(entityTokens.length * 0.8));
}

function metadataValue(
    metadata: Record<string, CommonsMetadata> | undefined,
    key: string,
): string {
    return metadata?.[key]?.value?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ?? "";
}

function isReusable(metadata: Record<string, CommonsMetadata> | undefined): boolean {
    const license = metadataValue(metadata, "LicenseShortName");
    const licenseUrl = metadataValue(metadata, "LicenseUrl");
    if (/^(public domain|cc0)(?:\b|$)/i.test(license)) {
        return /publicdomain|creativecommons\.org\/publicdomain\/zero/i.test(licenseUrl)
            || /^public domain$/i.test(license);
    }
    return /^CC BY (?:1\.0|2\.0|2\.5|3\.0|4\.0)$/i.test(license)
        && /^https:\/\/creativecommons\.org\/licenses\/by\//i.test(licenseUrl);
}

function fileTitle(value: string): string | null {
    const trimmed = value.trim();
    if (/^https?:\/\//i.test(trimmed)) {
        try {
            const url = new URL(trimmed);
            const match = url.pathname.match(/\/wiki\/File:(.+)$/i);
            if (match) return `File:${decodeURIComponent(match[1].replace(/_/g, " "))}`;
            if (url.hostname === "upload.wikimedia.org") {
                const filename = url.pathname.split("/").pop();
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
    result: NominatimResult,
): number {
    const radians = (value: number) => value * Math.PI / 180;
    const dLat = radians(Number(result.lat) - latitude);
    const dLon = radians(Number(result.lon) - longitude);
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(radians(latitude))
        * Math.cos(radians(Number(result.lat)))
        * Math.sin(dLon / 2) ** 2;
    return 6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
    const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(30_000),
    });
    if (response.status === 429) {
        throw new Error("Nominatim returned HTTP 429; stopping to respect its usage policy");
    }
    if (!response.ok) throw new Error(`Nominatim returned HTTP ${response.status}`);
    return await response.json() as NominatimResponse;
}

async function findCommonsFile(title: string): Promise<CommonsFile | null> {
    const url = new URL("https://commons.wikimedia.org/w/api.php");
    url.search = new URLSearchParams({
        action: "query",
        titles: title,
        prop: "imageinfo",
        iiprop: "url|mime|extmetadata",
        iiurlwidth: "1600",
        format: "json",
        formatversion: "2",
    }).toString();
    const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`Wikimedia Commons returned HTTP ${response.status}`);
    const data = await response.json() as CommonsResponse;
    if (data.error) throw new Error(`Wikimedia Commons error: ${data.error.info ?? "unknown error"}`);
    return data.query?.pages?.find((page) => page.imageinfo?.length) ?? null;
}

async function findImage(entity: Entity, radius: number): Promise<{
    element: OsmElement;
    file: CommonsFile;
} | null> {
    const results = await searchNominatim(entity);
    const candidates = results
        .filter((result) => {
            const name = result.name
                ?? result.namedetails?.name
                ?? result.extratags?.name
                ?? result.display_name.split(",")[0];
            return distanceMeters(entity.latitude, entity.longitude, result) <= radius
                && matchesName(entity.name, name);
        })
        .sort((left, right) => {
            const nameOf = (result: NominatimResult) => result.name
                ?? result.namedetails?.name
                ?? result.extratags?.name
                ?? result.display_name.split(",")[0];
            const exactNameScore = (result: NominatimResult) =>
                Number(normalize(nameOf(result)) === normalize(entity.name));
            return exactNameScore(right) - exactNameScore(left)
                || distanceMeters(entity.latitude, entity.longitude, left)
                    - distanceMeters(entity.latitude, entity.longitude, right);
        });

    for (const result of candidates) {
        const title = fileTitle(
            result.extratags?.wikimedia_commons
            ?? result.extratags?.image
            ?? "",
        );
        if (!title) continue;
        const file = await findCommonsFile(title);
        if (file?.imageinfo?.[0]?.mime?.startsWith("image/")
            && isReusable(file.imageinfo[0].extmetadata)) {
            return {
                element: {
                    type: result.osm_type,
                    id: result.osm_id,
                },
                file,
            };
        }
    }
    return null;
}

function captionFor(
    image: CommonsFile,
    element: OsmElement,
): string {
    const info = image.imageinfo?.[0];
    const metadata = info?.extmetadata;
    const creator = metadataValue(metadata, "Artist")
        || metadataValue(metadata, "Credit")
        || "Tidak dicantumkan";
    const license = metadataValue(metadata, "LicenseShortName");
    const licenseUrl = metadataValue(metadata, "LicenseUrl");
    const commonsUrl = `https://commons.wikimedia.org/wiki/${encodeURIComponent(image.title.replace(/ /g, "_"))}`;
    const osmUrl = `https://www.openstreetmap.org/${element.type}/${element.id}`;
    return `Foto: ${image.title.replace(/^File:/i, "")} — ${creator}. Lisensi: ${license} (${licenseUrl}). Sumber: ${commonsUrl}. Data OSM: ${osmUrl}`;
}

async function downloadImage(image: CommonsFile): Promise<Buffer> {
    const url = image.imageinfo?.[0]?.thumburl;
    if (!url) throw new Error("Commons did not return a thumbnail URL");
    const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(90_000),
    });
    if (!response.ok) throw new Error(`Commons image returned HTTP ${response.status}`);
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) throw new Error("Commons returned a non-image response");
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

async function uploadImage(entity: Entity, image: CommonsFile, bytes: Buffer): Promise<string> {
    const folder = `hyperlocal/${entity.kind}/${entity.slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase().slice(0, 80)}`;
    const publicId = `osm-${createHash("sha256").update(image.title).digest("hex").slice(0, 16)}`;
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder,
            public_id: publicId,
            resource_type: "image",
            overwrite: true,
            unique_filename: false,
            use_filename: false,
            quality: "auto",
            fetch_format: "auto",
        }, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            if (!result?.secure_url) {
                reject(new Error("Cloudinary upload did not return a secure URL"));
                return;
            }
            resolve(result.secure_url);
        });
        stream.end(bytes);
    });
}

async function saveImage(entity: Entity, imageUrl: string, caption: string): Promise<void> {
    const data = { imageUrl, caption, isPrimary: true };
    if (entity.kind === "destinations") {
        await prisma.destinationImage.create({ data: { ...data, destinationId: entity.id } });
    } else if (entity.kind === "umkm") {
        await prisma.umkmImage.create({ data: { ...data, umkmId: entity.id } });
    } else {
        await prisma.accommodationImage.create({ data: { ...data, accommodationId: entity.id } });
    }
}

async function loadEntities(kind: Kind, limit: number, offset: number): Promise<Entity[]> {
    const where = {
        images: { none: {} },
        latitude: { not: null },
        longitude: { not: null },
    };
    const select = {
        id: true,
        name: true,
        slug: true,
        address: true,
        latitude: true,
        longitude: true,
    } as const;
    if (kind === "destinations") {
        const rows = await prisma.destination.findMany({
            where,
            select: { ...select, city: true, province: true },
            orderBy: { createdAt: "asc" },
            skip: offset,
            take: limit,
        });
        return rows.map((row) => ({
            ...row,
            latitude: Number(row.latitude),
            longitude: Number(row.longitude),
            kind,
        }));
    }
    if (kind === "umkm") {
        const rows = await prisma.umkm.findMany({
            where,
            select: {
                ...select,
                destination: { select: { city: true, province: true } },
            },
            orderBy: { createdAt: "asc" },
            skip: offset,
            take: limit,
        });
        return rows.map((row) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            address: row.address,
            city: row.destination?.city ?? null,
            province: row.destination?.province ?? null,
            latitude: Number(row.latitude),
            longitude: Number(row.longitude),
            kind,
        }));
    }
    const rows = await prisma.accommodation.findMany({
        where,
        select: { ...select, city: true, province: true },
        orderBy: { createdAt: "asc" },
        skip: offset,
        take: limit,
    });
    return rows.map((row) => ({
        ...row,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        kind,
    }));
}

async function main(): Promise<void> {
    const args = parseArgs();
    const kinds: Kind[] = args.kind === "all"
        ? ["destinations", "umkm", "accommodations"]
        : [args.kind];
    const entities = (await Promise.all(
        kinds.map((kind) => loadEntities(kind, args.limit, args.offset)),
    )).flat();
    console.log(
        `Found ${entities.length} image-free records with coordinates. ` +
        `${args.apply ? "Saving matches." : "Preview only."}`,
    );
    if (args.apply && (
        !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        || !process.env.CLOUDINARY_API_KEY
        || !process.env.CLOUDINARY_API_SECRET
    )) {
        throw new Error("Cloudinary credentials are required when using --apply");
    }

    let matched = 0;
    let added = 0;
    let failed = 0;
    let rateLimited = false;
    let processed = 0;
    for (const entity of entities) {
        processed++;
        try {
            const result = await findImage(entity, args.radius);
            if (!result) {
                console.log(`NO MATCH [${entity.kind}] ${entity.name}`);
                continue;
            }
            matched++;
            const caption = captionFor(result.file, result.element);
            console.log(`MATCH [${entity.kind}] ${entity.name} -> ${result.file.title}`);
            console.log(`  ${caption}`);
            if (!args.apply) continue;

            const bytes = await downloadImage(result.file);
            const imageUrl = await uploadImage(entity, result.file, bytes);
            await saveImage(entity, imageUrl, caption);
            added++;
            console.log(`  ADDED ${imageUrl}`);
        } catch (error) {
            failed++;
            console.error(
                `FAILED [${entity.kind}] ${entity.name}: ` +
                `${error instanceof Error ? error.message : String(error)}`,
            );
            rateLimited = error instanceof Error
                && error.message.includes("Nominatim returned HTTP 429");
        }
        if (rateLimited) {
            console.error("Stopping this batch after the Nominatim rate limit response.");
            break;
        }
        await new Promise((resolve) => setTimeout(resolve, 1_500));
    }
    console.log(
        `Complete: ${matched} matches, ${added} images added, ` +
        `${processed - matched - failed} unmatched, ${failed} failures` +
        `${rateLimited ? " (stopped by Nominatim rate limit)" : ""}.`,
    );
}

main()
    .catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
