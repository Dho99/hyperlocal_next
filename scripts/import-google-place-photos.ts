import "dotenv/config";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { prisma } from "../lib/prisma";
import { cloudinary } from "../lib/cloudinary/config";

/**
 * Google Places (New) photo importer — fills images for entities that the
 * open-license importer (Openverse/Wikimedia/Flickr) could not match.
 *
 * Requires GOOGLE_MAPS_API_KEY with "Places API (New)" enabled.
 * Run AFTER scripts/import-open-licensed-images.ts so only unmatched entities are processed.
 *
 * Usage:
 *   npx tsx scripts/import-google-place-photos.ts                  # preview (no DB writes)
 *   npx tsx scripts/import-google-place-photos.ts --apply          # download + Cloudinary + DB
 *   npx tsx scripts/import-google-place-photos.ts --kind=umkm      # one kind only
 */

type Kind = "destinations" | "umkm" | "accommodations";
type Entity = {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    province: string | null;
    address: string | null;
    kind: Kind;
};

type PlacePhoto = {
    name: string; // places/{placeId}/photos/{photoResource}
    widthPx?: number;
    heightPx?: number;
    authorAttributions?: Array<{ displayName?: string; uri?: string }>;
};
type TextSearchResponse = {
    places?: Array<{ id: string; displayName?: { text?: string }; photos?: PlacePhoto[] }>;
    error?: { message?: string };
};

const USER_AGENT = "hyperlocal-next/0.1 (google place photo importer)";
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const REQUEST_DELAY_MS = 350; // ~3 reqs/sec per worker slot is conservative

function parseArgs(): {
    kind: Kind | "all";
    limit: number | null;
    apply: boolean;
    concurrency: number;
} {
    const raw = process.argv.slice(2);
    const kindValue = raw.find((arg) => arg.startsWith("--kind="))?.slice(7) ?? "all";
    if (!["all", "destinations", "umkm", "accommodations"].includes(kindValue)) {
        throw new Error("--kind must be all, destinations, umkm, or accommodations");
    }
    const limitValue = raw.find((arg) => arg.startsWith("--limit="))?.slice(8);
    const limit = limitValue === undefined ? null : Number(limitValue);
    if (limit !== null && (!Number.isInteger(limit) || limit < 1)) {
        throw new Error("--limit must be a positive integer");
    }
    const concurrencyValue = raw.find((arg) => arg.startsWith("--concurrency="))?.slice(14);
    const concurrency = concurrencyValue === undefined ? 3 : Number(concurrencyValue);
    if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 10) {
        throw new Error("--concurrency must be an integer from 1 to 10");
    }
    return { kind: kindValue as Kind | "all", limit, apply: raw.includes("--apply"), concurrency };
}

async function placesRequest<T>(url: URL, fieldMask: string): Promise<T> {
    const response = await fetch(url, {
        headers: {
            "User-Agent": USER_AGENT,
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY ?? "",
            "X-Goog-FieldMask": fieldMask,
        },
        signal: AbortSignal.timeout(30_000),
    });
    const data = await response.json() as T & { error?: { message?: string } };
    if (!response.ok) {
        const message = (data as { error?: { message?: string } }).error?.message
            ?? `HTTP ${response.status}`;
        throw new Error(message);
    }
    return data;
}

async function resolvePlaceAndPhoto(entity: Entity): Promise<PlacePhoto | null> {
    const url = new URL("https://places.googleapis.com/v1/places:searchText");
    url.search = new URLSearchParams({
        textQuery: [entity.name, entity.city ?? entity.address].filter(Boolean).join(" "),
        pageSize: "2",
    }).toString();

    const search = await placesRequest<TextSearchResponse>(url, "places.id,places.displayName,places.photos");
    const place = search.places?.[0];
    const photo = place?.photos?.[0];
    return photo ?? null;
}

async function resolvePhotoUri(photo: PlacePhoto): Promise<string> {
    // photo.name = places/{placeId}/photos/{photoResource}
    const url = new URL(`https://places.googleapis.com/v1/${photo.name}/media`);
    url.search = new URLSearchParams({
        maxHeightPx: "1600",
        skipHttpRedirect: "true",
    }).toString();
    const media = await placesRequest<{ photoUri?: string }>(url, "photoUri");
    if (!media.photoUri) throw new Error("Photo media resolved without photoUri");
    return media.photoUri;
}

async function downloadImage(photoUri: string): Promise<Buffer> {
    const response = await fetch(photoUri, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(120_000),
    });
    if (!response.ok) throw new Error(`Photo download returned HTTP ${response.status}`);
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) throw new Error("Photo URI returned a non-image response");
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) {
        throw new Error(`Photo size is invalid (${bytes.length} bytes)`);
    }
    return sharp(bytes)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
}

async function uploadImage(entity: Entity, photo: PlacePhoto, bytes: Buffer): Promise<string> {
    const folder = `hyperlocal/${entity.kind}/${entity.slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase().slice(0, 80)}`;
    const publicId = `googleplaces-${createHash("sha256").update(photo.name).digest("hex").slice(0, 16)}`;
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
            if (error) { reject(error); return; }
            if (!result?.secure_url) { reject(new Error("Cloudinary upload did not return a secure URL")); return; }
            resolve(result.secure_url);
        });
        stream.end(bytes);
    });
}

function attributionCaption(entity: Entity, photo: PlacePhoto): string {
    const author = photo.authorAttributions?.[0]?.displayName ?? "Google Maps";
    return `Foto: ${entity.name} — ${author}. Sumber: Google Maps (Places API)`;
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

async function loadEntities(kind: Kind, limit: number | null): Promise<Entity[]> {
    const take = limit ?? undefined;
    if (kind === "destinations") {
        const rows = await prisma.destination.findMany({
            where: { images: { none: {} } },
            select: { id: true, name: true, slug: true, city: true, province: true, address: true },
            orderBy: { createdAt: "asc" },
            take,
        });
        return rows.map((row) => ({ ...row, kind }));
    }
    if (kind === "umkm") {
        const rows = await prisma.umkm.findMany({
            where: { images: { none: {} } },
            select: {
                id: true, name: true, slug: true, address: true,
                destination: { select: { city: true, province: true } },
            },
            orderBy: { createdAt: "asc" },
            take,
        });
        return rows.map((row) => ({
            id: row.id, name: row.name, slug: row.slug, address: row.address,
            city: row.destination?.city ?? null, province: row.destination?.province ?? null,
            kind,
        }));
    }
    const rows = await prisma.accommodation.findMany({
        where: { images: { none: {} } },
        select: { id: true, name: true, slug: true, city: true, province: true, address: true },
        orderBy: { createdAt: "asc" },
        take,
    });
    return rows.map((row) => ({ ...row, kind }));
}

async function main(): Promise<void> {
    const args = parseArgs();
    const kinds: Kind[] = args.kind === "all"
        ? ["destinations", "umkm", "accommodations"]
        : [args.kind];
    const entities = (await Promise.all(kinds.map((kind) => loadEntities(kind, args.limit)))).flat();

    console.log(
        `Found ${entities.length} entities without images${args.apply ? "; applying matches" : "; preview only"}. ` +
        `Concurrency: ${args.concurrency}.`,
    );
    if (!process.env.GOOGLE_MAPS_API_KEY) {
        throw new Error("GOOGLE_MAPS_API_KEY is not configured");
    }

    let matched = 0;
    let added = 0;
    let failed = 0;
    let nextIndex = 0;
    const worker = async () => {
        while (nextIndex < entities.length) {
            const entity = entities[nextIndex++];
            try {
                const photo = await resolvePlaceAndPhoto(entity);
                if (!photo) {
                    console.log(`NO PHOTO [${entity.kind}] ${entity.name}`);
                    continue;
                }
                const photoUri = await resolvePhotoUri(photo);
                console.log(`MATCH [${entity.kind}] ${entity.name} -> ${photoUri.slice(0, 60)}`);
                if (!args.apply) { matched++; continue; }

                const bytes = await downloadImage(photoUri);
                const imageUrl = await uploadImage(entity, photo, bytes);
                await saveImage(entity, imageUrl, attributionCaption(entity, photo));
                matched++;
                added++;
                console.log(`  ADDED ${imageUrl}`);
            } catch (error) {
                console.error(`FAILED [${entity.kind}] ${entity.name}: ${error instanceof Error ? error.message : String(error)}`);
                failed++;
            } finally {
                await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
            }
        }
    };
    await Promise.all(
        Array.from({ length: Math.min(args.concurrency, entities.length) }, () => worker()),
    );
    console.log(`Complete: ${matched} matches, ${added} images added, ${entities.length - matched - failed} unmatched, ${failed} failures.`);
}

main()
    .catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
