/**
 * crawl-destinations-to-cloudinary.ts
 * ------------------------------------
 * Crawler yang mengambil foto destinasi dari Google Places API
 * dan meng-upload ke Cloudinary sebagai sumber utama.
 *
 * - Untuk setiap destinasi yang masih pakai lh3.googleusercontent (211 rows),
 *   cari place_id via Text Search, ambil photo_reference via Details,
 *   fetch bytes via Place Photo API, upload ke Cloudinary folder hyperlocal/destinations/<slug>
 * - Update DestinationImage.imageUrl ke Cloudinary secure_url
 * - Idempotent via public_id crawl-<hash> + skip jika sudah res.cloudinary.com
 *
 * Usage:
 *   npx tsx scripts/crawl-destinations-to-cloudinary.ts --limit=1 --dry-run
 *   npx tsx scripts/crawl-destinations-to-cloudinary.ts --limit=3 --concurrency=1
 *   npx tsx scripts/crawl-destinations-to-cloudinary.ts --slug=taman-rekreasi-air-fun-park-grand-nusa-indah
 *   npx tsx scripts/crawl-destinations-to-cloudinary.ts --all   (migrasi semua pending)
 */

import "dotenv/config";
import { createHash } from "crypto";
import { prisma } from "../lib/prisma";
import { cloudinary } from "../lib/cloudinary/config";

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

if (!GOOGLE_KEY) {
    console.error("GOOGLE_MAPS_API_KEY belum set di .env");
    process.exit(1);
}
if (!CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("Cloudinary env belum lengkap");
    process.exit(1);
}

type Args = { limit: number | null; slug: string | null; dryRun: boolean; all: boolean; concurrency: number };
function parseArgs(): Args {
    const raw = process.argv.slice(2);
    return {
        limit: raw.find(a => a.startsWith("--limit=")) ? Number(raw.find(a => a.startsWith("--limit="))!.split("=")[1]) : null,
        slug: raw.find(a => a.startsWith("--slug=")) ? raw.find(a => a.startsWith("--slug="))!.split("=")[1] : null,
        dryRun: raw.includes("--dry-run"),
        all: raw.includes("--all"),
        concurrency: raw.find(a => a.startsWith("--concurrency=")) ? Number(raw.find(a => a.startsWith("--concurrency="))!.split("=")[1]) : 2,
    };
}

function hashUrl(ref: string): string {
    return createHash("sha256").update(ref).digest("hex").slice(0, 16);
}

async function searchPlaceId(query: string): Promise<string | null> {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_KEY}&language=id`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TextSearch ${res.status} ${await res.text().then(t=>t.slice(0,300))}`);
    const json: any = await res.json();
    if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
        throw new Error(`TextSearch status ${json.status}: ${json.error_message ?? JSON.stringify(json).slice(0,500)}`);
    }
    if (!json.results?.length) return null;
    return json.results[0].place_id as string;
}

async function getPhotoReferences(placeId: string): Promise<string[]> {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_KEY}&language=id`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Details ${res.status}`);
    const json: any = await res.json();
    if (json.status !== "OK") {
        if (json.status === "ZERO_RESULTS") return [];
        throw new Error(`Details status ${json.status}: ${json.error_message ?? ""}`);
    }
    const photos = json.result?.photos as Array<{ photo_reference: string }> | undefined;
    if (!photos?.length) return [];
    return photos.map(p => p.photo_reference);
}

async function fetchPhotoBuffer(photoRef: string): Promise<Buffer> {
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${photoRef}&key=${GOOGLE_KEY}`;
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Photo fetch ${res.status} ${txt.slice(0,300)}`);
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.startsWith("image/")) {
        // Google sometimes returns redirect to lh3 which is image; if follow succeeded we get image
        // If still not image, throw
        // But allow
    }
    return Buffer.from(await res.arrayBuffer());
}

async function uploadBufferToCloudinary(buffer: Buffer, slug: string, photoRef: string): Promise<string> {
    const safeSlug = slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase().slice(0,80);
    const folder = `hyperlocal/destinations/${safeSlug}`;
    const publicId = `crawl-${hashUrl(photoRef)}`;
    // check exists
    try {
        const existing = await cloudinary.api.resource(`${folder}/${publicId}`, { resource_type: "image" });
        if (existing?.secure_url) return existing.secure_url as string;
    } catch {}
    const result: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder,
            public_id: publicId,
            resource_type: "image",
            overwrite: false,
            unique_filename: false,
            use_filename: false,
            quality: "auto",
            fetch_format: "auto",
        }, (err, res) => err ? reject(err) : resolve(res));
        stream.end(buffer);
    });
    if (!result.secure_url) throw new Error("No secure_url");
    return result.secure_url;
}

async function processOneDestination(dest: { id: string; name: string; slug: string; city: string | null; province: string | null; address: string | null }, dryRun: boolean) {
    console.log(`\n--- ${dest.name} (${dest.slug}) ---`);
    const query = [dest.name, dest.city, dest.province].filter(Boolean).join(", ");
    console.log(`Search query: ${query}`);
    const placeId = await searchPlaceId(query);
    if (!placeId) {
        console.log(`  ✗ No place_id found for query`);
        return { success: false, reason: "no_place_id" };
    }
    console.log(`  place_id: ${placeId}`);
    const refs = await getPhotoReferences(placeId);
    console.log(`  photo refs: ${refs.length}`);
    if (refs.length === 0) {
        console.log(`  ✗ No photos in details`);
        return { success: false, reason: "no_photos" };
    }
    const take = Math.min(refs.length, 5);
    console.log(`  will fetch ${take} photos...`);
    if (dryRun) {
        console.log(`  [DRY] would upload ${take} photos to Cloudinary`);
        return { success: true, dryRun: true, count: take };
    }
    const uploadedUrls: string[] = [];
    for (let i = 0; i < take; i++) {
        const ref = refs[i];
        try {
            const buf = await fetchPhotoBuffer(ref);
            console.log(`    photo ${i+1}/${take} bytes ${buf.length}`);
            const url = await uploadBufferToCloudinary(buf, dest.slug, ref);
            console.log(`    -> ${url.slice(0,80)}...`);
            uploadedUrls.push(url);
            // small delay to avoid rate limit
            await new Promise(r => setTimeout(r, 300));
        } catch (e: any) {
            console.error(`    ✗ photo ${i+1} failed: ${e.message}`);
        }
    }
    if (uploadedUrls.length === 0) {
        console.log(`  ✗ No upload succeeded`);
        return { success: false, reason: "upload_failed" };
    }
    // Update DB: delete old lh3 images and create new cloudinary ones
    // Keep order: first uploaded = isPrimary true
    const oldCount = await prisma.destinationImage.count({ where: { destinationId: dest.id } });
    console.log(`  DB: deleting ${oldCount} old images, creating ${uploadedUrls.length} new cloudinary images...`);
    await prisma.$transaction(async (tx) => {
        await tx.destinationImage.deleteMany({ where: { destinationId: dest.id } });
        for (let i = 0; i < uploadedUrls.length; i++) {
            await tx.destinationImage.create({
                data: {
                    destinationId: dest.id,
                    imageUrl: uploadedUrls[i],
                    caption: i === 0 ? "Foto utama" : `Foto ${i+1}`,
                    isPrimary: i === 0,
                }
            });
        }
    });
    console.log(`  ✓ DB updated`);
    return { success: true, count: uploadedUrls.length };
}

async function main(){
    const args = parseArgs();
    console.log("Args", args);
    console.log("GOOGLE_KEY", GOOGLE_KEY?.slice(0,10)+"...", "CLOUD", CLOUD_NAME);

    // Determine destinations to process: those with at least one non-cloudinary image
    let dests: Array<{ id: string; name: string; slug: string; city: string | null; province: string | null; address: string | null }> = [];
    if (args.slug) {
        const d = await prisma.destination.findUnique({ where: { slug: args.slug }, select: { id:true, name:true, slug:true, city:true, province:true, address:true } });
        if (!d) { console.error(`Slug not found: ${args.slug}`); process.exit(1); }
        dests = [d];
    } else {
        // Fetch all destinations, then filter those where images contain googleusercontent
        const all = await prisma.destination.findMany({
            select: { id:true, name:true, slug:true, city:true, province:true, address:true, images:{select:{imageUrl:true}} },
            orderBy:{ createdAt:"asc" }
        });
        let pending = all.filter(d => d.images.some(img => !img.imageUrl.includes("res.cloudinary.com")));
        console.log(`Total destinations ${all.length}, pending (has non-cloudinary image) ${pending.length}`);
        if (!args.all && args.limit != null) pending = pending.slice(0, args.limit);
        else if (!args.all && args.limit == null) pending = pending.slice(0, 3); // default safe 3
        dests = pending.map(({images, ...rest})=>rest);
        console.log(`Will process ${dests.length} destinations`);
    }

    if (dests.length === 0) {
        console.log("No pending destinations");
        await prisma.$disconnect();
        return;
    }

    let ok=0, fail=0;
    for (const dest of dests) {
        try {
            const res: any = await processOneDestination(dest, args.dryRun);
            if (res.success) ok++; else fail++;
        } catch (e:any) {
            console.error(`✗ ${dest.slug} fatal: ${e.message}`);
            fail++;
        }
        // delay between destinations
        await new Promise(r=>setTimeout(r, 800));
    }
    console.log(`\n=== SUMMARY === success ${ok} fail ${fail} / total ${dests.length} ${args.dryRun ? "(DRY)" : ""}`);
    await prisma.$disconnect();
}
main().catch(e=>{ console.error(e); process.exit(1); });
