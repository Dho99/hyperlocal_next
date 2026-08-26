import { config } from "dotenv";
config();

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma";
import { v2 as cloudinary } from "cloudinary";

interface ImageEntity {
    id: string;
    name: string;
    city?: string | null;
    province?: string | null;
    images: Array<{ id: string; imageUrl: string }>;
}

interface MigrationConfig {
    entityType: "destinations" | "umkms" | "accommodations";
    findMany: () => Promise<ImageEntity[]>;
    updateImage: (id: string, url: string) => Promise<void>;
}

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY!;
const GOOGLE_PLACES_BASE = "https://maps.googleapis.com/maps/api/place";

async function searchPlace(name: string, city?: string, province?: string) {
    const query = [name, city, province].filter(Boolean).join(" ");
    const url = `${GOOGLE_PLACES_BASE}/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,photos&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.status === "OK" && data.candidates?.[0] ? data.candidates[0] : null;
}

async function getPlaceDetails(placeId: string) {
    const url = `${GOOGLE_PLACES_BASE}/details/json?place_id=${placeId}&fields=photos,name&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.status === "OK" ? data.result : null;
}

async function downloadGooglePhoto(photoReference: string, maxWidth = 1600): Promise<Buffer> {
    const url = `${GOOGLE_PLACES_BASE}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; HyperlocalBot/1.0)" } });
    if (!response.ok) throw new Error(`Failed to download: ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
}

async function uploadToCloudinary(buffer: Buffer, folder: string, prefix: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Upload timeout")), 60000);
        const stream = cloudinary.uploader.upload_stream(
            { folder: `hyperlocal/${folder}`, public_id: `${prefix}_${Date.now()}`, resource_type: "auto", quality: "auto", fetch_format: "auto" },
            (err, result) => { clearTimeout(timeout); err ? reject(err) : result?.secure_url ? resolve(result.secure_url) : reject(new Error("No URL")); }
        );
        stream.end(buffer);
    });
}

function isGoogleUrl(url: string): boolean {
    return url.includes("lh3.googleusercontent.com");
}

async function migrate(config: MigrationConfig) {
    const entities = await config.findMany();
    let migrated = 0, failed = 0;

    for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        const googleImages = entity.images.filter(img => isGoogleUrl(img.imageUrl));
        if (!googleImages.length) continue;

        if (i > 0) await new Promise(r => setTimeout(r, 1000));

        console.log(`\n${config.entityType}: ${entity.name} (${googleImages.length}/${entity.images.length} images)`);

        const place = await searchPlace(entity.name, entity.city ?? undefined, entity.province ?? undefined);
        if (!place) { console.log("  ✗ No place found"); failed += googleImages.length; continue; }

        const details = await getPlaceDetails(place.place_id);
        if (!details?.photos?.length) { console.log("  ✗ No photos"); failed += googleImages.length; continue; }

        console.log(`  Found ${details.photos.length} Google photos`);

        for (let j = 0; j < googleImages.length; j++) {
            if (j > 0) await new Promise(r => setTimeout(r, 500));
            if (j >= details.photos.length) { failed++; continue; }

            try {
                const buffer = await downloadGooglePhoto(details.photos[j].photo_reference);
                const newUrl = await uploadToCloudinary(buffer, config.entityType, `${config.entityType.slice(0,-1)}_${entity.id}_${googleImages[j].id}`);
                await config.updateImage(googleImages[j].id, newUrl);
                console.log(`  ✓ Image ${j + 1}`);
                migrated++;
            } catch (e) {
                console.error(`  ✗ Image ${j + 1}:`, (e as Error).message);
                failed++;
            }
        }
    }

    return { migrated, failed };
}

async function main() {
    console.log("=== Google Places Images Migration ===\n");

    if (!GOOGLE_API_KEY || !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        console.error("Missing required env vars");
        process.exit(1);
    }

    const configs: MigrationConfig[] = [
        {
            entityType: "destinations",
            findMany: () => prisma.destination.findMany({ include: { images: true } }),
            updateImage: (id, url) => prisma.destinationImage.update({ where: { id }, data: { imageUrl: url } }),
        },
        {
            entityType: "umkms",
            findMany: () => prisma.umkm.findMany({ include: { images: true } }),
            updateImage: (id, url) => prisma.umkmImage.update({ where: { id }, data: { imageUrl: url } }),
        },
        {
            entityType: "accommodations",
            findMany: () => prisma.accommodation.findMany({ include: { images: true } }),
            updateImage: (id, url) => prisma.accommodationImage.update({ where: { id }, data: { imageUrl: url } }),
        },
    ];

    let totalMigrated = 0, totalFailed = 0;

    for (const cfg of configs) {
        const result = await migrate(cfg);
        totalMigrated += result.migrated;
        totalFailed += result.failed;
        await new Promise(r => setTimeout(r, 3000));
    }

    console.log("\n=== COMPLETE ===");
    console.log(`Migrated: ${totalMigrated}`);
    console.log(`Failed: ${totalFailed}`);

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });