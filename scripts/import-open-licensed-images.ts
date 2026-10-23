import "dotenv/config";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
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
    kind: Kind;
};
type OpenverseImage = {
    title: string;
    creator: string | null;
    license: string;
    license_version: string | null;
    license_url: string;
    url: string;
    foreign_landing_url: string;
    width: number | null;
    height: number | null;
};
type OpenverseResponse = {
    results?: OpenverseImage[];
    detail?: string;
};

const USER_AGENT =
    "hyperlocal-next/0.1 (open-license photo importer; https://github.com/Dho99/hyperlocal_next)";
const GENERIC_NAME_WORDS = new Set([
    "dan", "di", "ke", "the", "wisata", "objek", "tempat", "kabupaten",
    "kota", "provinsi", "indonesia", "hotel", "penginapan", "restoran",
    "rumah", "makan", "warung", "toko", "usaha",
]);
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_SOURCE_BYTES = 120 * 1024 * 1024;

function parseArgs(): {
    kind: Kind | "all";
    limit: number | null;
    apply: boolean;
    concurrency: number;
    retryFrom: string | null;
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
    const concurrency = concurrencyValue === undefined ? 4 : Number(concurrencyValue);
    if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 5) {
        throw new Error("--concurrency must be an integer from 1 to 5");
    }
    return {
        kind: kindValue as Kind | "all",
        limit,
        apply: raw.includes("--apply"),
        concurrency,
        retryFrom: raw.find((arg) => arg.startsWith("--retry-from="))?.slice(13) ?? null,
    };
}

function normalize(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function nameTokens(name: string): string[] {
    return [...new Set(normalize(name).split(/\s+/).filter(
        (token) => token.length > 2 && !GENERIC_NAME_WORDS.has(token),
    ))];
}

function isReusableLicense(image: OpenverseImage): boolean {
    if (image.license === "cc0") {
        return image.license_url.startsWith("https://creativecommons.org/publicdomain/zero/");
    }
    return image.license === "by"
        && image.license_url.startsWith("https://creativecommons.org/licenses/by/");
}

function attributionCaption(image: OpenverseImage): string {
    const creator = image.creator?.replace(/<[^>]*>/g, "").trim() || "Tidak dicantumkan";
    const version = image.license_version ? ` ${image.license_version}` : "";
    const license = image.license === "cc0" ? "CC0" : "CC BY";
    return `Foto: ${image.title} — ${creator}. Lisensi: ${license}${version} (${image.license_url}). Sumber: ${image.foreign_landing_url}`;
}

async function searchOpenverse(entity: Entity): Promise<OpenverseImage | null> {
    const tokens = nameTokens(entity.name);
    const location = [entity.city, entity.province].filter(Boolean).join(" ") || entity.address || "";
    const locationTokens = nameTokens(location).filter((token) => !tokens.includes(token));
    if (tokens.length === 0) return null;

    const queries = [...new Set([
        [entity.name, entity.city, entity.province].filter(Boolean).join(" "),
        entity.name,
    ])];

    for (const query of queries) {
        const url = new URL("https://api.openverse.org/v1/images/");
        url.search = new URLSearchParams({
            q: query,
            license: "cc0,by",
            license_type: "commercial",
            page_size: "20",
        }).toString();
        let response: Response | undefined;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                response = await fetch(url, {
                    headers: { "User-Agent": USER_AGENT },
                    signal: AbortSignal.timeout(45_000),
                });
            } catch (error) {
                const timedOut = error instanceof Error
                    && (error.name === "TimeoutError" || error.name === "AbortError");
                if (!timedOut || attempt === 2) throw error;
                await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1_500));
                continue;
            }
            if (response.ok) break;
            if (response.status !== 429 && response.status < 500) {
                throw new Error(`Openverse API returned HTTP ${response.status}`);
            }
            if (attempt === 2) {
                throw new Error(`Openverse API returned HTTP ${response.status} after retries`);
            }
            const retryAfter = Number(response.headers.get("retry-after"));
            const delayMs = Number.isFinite(retryAfter) && retryAfter > 0
                ? Math.min(retryAfter * 1_000, 15_000)
                : (attempt + 1) * 1_500;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
        if (!response?.ok) throw new Error("Openverse API request did not complete");
        const data = await response.json() as OpenverseResponse;
        if (data.detail) throw new Error(`Openverse API error: ${data.detail}`);

        const candidates = (data.results ?? [])
            .filter((image) => {
                if (!isReusableLicense(image) || !image.url.startsWith("https://")) return false;
                const titleWords = normalize(image.title).split(" ");
                const titleMatches = tokens.filter((token) => titleWords.includes(token)).length;
                const requiredMatches = tokens.length === 1
                    ? titleMatches === 1 && locationTokens.some((token) => titleWords.includes(token))
                    : titleMatches >= Math.max(2, Math.ceil(tokens.length * 0.67));
                if (!requiredMatches) return false;
                if (locationTokens.length > 0) {
                    return locationTokens.some((token) => titleWords.includes(token));
                }
                return tokens.length >= 3 && titleMatches === tokens.length;
            })
            .sort((left, right) => {
                const score = (image: OpenverseImage) => {
                    const titleWords = normalize(image.title).split(" ");
                    const nameScore = tokens.filter((token) => titleWords.includes(token)).length / tokens.length;
                    const locationScore = locationTokens.some((token) => titleWords.includes(token)) ? 0.2 : 0;
                    return nameScore + locationScore;
                };
                return score(right) - score(left);
            });

        if (candidates[0]) return candidates[0];
    }
    return null;
}

async function downloadImage(image: OpenverseImage): Promise<Buffer> {
    const response = await fetch(image.url, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(120_000),
    });
    if (!response.ok) throw new Error(`Image download returned HTTP ${response.status}`);
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) throw new Error("Openverse source returned a non-image response");
    const contentLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_SOURCE_BYTES) {
        throw new Error(`Source image exceeds the ${MAX_SOURCE_BYTES}-byte limit`);
    }
    const sourceBytes = Buffer.from(await response.arrayBuffer());
    if (sourceBytes.length === 0 || sourceBytes.length > MAX_SOURCE_BYTES) {
        throw new Error(`Source image size is invalid (${sourceBytes.length} bytes)`);
    }
    const bytes = await sharp(sourceBytes)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    if (bytes.length > MAX_IMAGE_BYTES) {
        throw new Error(`Optimized image exceeds the ${MAX_IMAGE_BYTES}-byte limit`);
    }
    return bytes;
}

async function uploadImage(entity: Entity, image: OpenverseImage, bytes: Buffer): Promise<string> {
    const folder = `hyperlocal/${entity.kind}/${entity.slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase().slice(0, 80)}`;
    const publicId = `openverse-${createHash("sha256").update(image.foreign_landing_url).digest("hex").slice(0, 16)}`;
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
                id: true,
                name: true,
                slug: true,
                address: true,
                destination: { select: { city: true, province: true } },
            },
            orderBy: { createdAt: "asc" },
            take,
        });
        return rows.map((row) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            address: row.address,
            city: row.destination?.city ?? null,
            province: row.destination?.province ?? null,
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
    let entities = (await Promise.all(kinds.map((kind) => loadEntities(kind, args.limit)))).flat();
    if (args.retryFrom) {
        const log = await readFile(args.retryFrom, "utf8");
        const retries = new Set<string>();
        for (const line of log.split(/\r?\n/)) {
            const match = line.match(/^FAILED \[(destinations|umkm|accommodations)\] (.+?): /);
            if (match) retries.add(`${match[1]}\u0000${match[2]}`);
        }
        entities = entities.filter((entity) => retries.has(`${entity.kind}\u0000${entity.name}`));
        if (retries.size === 0) throw new Error("The retry log contains no failed image records");
    }
    console.log(
        `Found ${entities.length} entities without images${args.apply ? "; applying matches" : "; preview only"}. ` +
        `Concurrency: ${args.concurrency}.`,
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
    let nextIndex = 0;
    const worker = async () => {
        while (nextIndex < entities.length) {
            const entity = entities[nextIndex++];
            try {
                const image = await searchOpenverse(entity);
                if (!image) {
                    console.log(`NO MATCH [${entity.kind}] ${entity.name}`);
                    continue;
                }
                matched++;
                console.log(`MATCH [${entity.kind}] ${entity.name} -> ${image.title}`);
                const caption = attributionCaption(image);
                console.log(`  ${caption}`);
                if (!args.apply) continue;

                const bytes = await downloadImage(image);
                const imageUrl = await uploadImage(entity, image, bytes);
                await saveImage(entity, imageUrl, caption);
                added++;
                console.log(`  ADDED ${imageUrl}`);
            } catch (error) {
                console.error(`FAILED [${entity.kind}] ${entity.name}: ${error instanceof Error ? error.message : String(error)}`);
                failed++;
            } finally {
                await new Promise((resolve) => setTimeout(resolve, 1_100));
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
