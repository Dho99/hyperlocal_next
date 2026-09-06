/**
 * sync-images-to-cloudinary.ts (hybrid Opsi 1)
 * -------------------------------------------
 * Gabungan `migrate` + `crawl`:
 * 1. Coba migrate fresh: uploadCrawledImageToCloudinary(existing lh3 URL) via Cloudinary remote fetch
 *    – murah, 1 call, work jika token masih fresh (< jam)
 * 2. Jika 403/expired → fallback crawl fresh: TextSearch → Details → Photo API → uploadBuffer
 *
 * Untuk halaman /itinerary-recommendation & /destinasi/[slug] agar imageUrl = res.cloudinary.com.
 *
 * Usage:
 *   npx tsx scripts/sync-images-to-cloudinary.ts --slug=taman-rekreasi-air-fun-park-grand-nusa-indah --dry-run
 *   npx tsx scripts/sync-images-to-cloudinary.ts --limit=3
 *   npx tsx scripts/sync-images-to-cloudinary.ts --limit=5 --fresh-only
 *   npx tsx scripts/sync-images-to-cloudinary.ts --limit=5 --backfill-only
 *   npx tsx scripts/sync-images-to-cloudinary.ts --all
 *   npx tsx scripts/sync-images-to-cloudinary.ts --all --concurrency=1 --kind=destinations
 */

import "dotenv/config";
import { prisma } from "../lib/prisma";
import {
    uploadCrawledImageToCloudinary,
    isAlreadyCloudinary,
    searchPlaceId,
    getPhotoReferences,
    fetchPhotoBuffer,
    uploadBufferToCloudinary,
} from "../lib/cloudinary/crawl-upload";

type Kind = "destinations" | "umkm" | "accommodations" | "all";
type Args = {
    limit: number | null;
    slug: string | null;
    dryRun: boolean;
    all: boolean;
    freshOnly: boolean;
    backfillOnly: boolean;
    concurrency: number;
    kind: Kind;
};
function parseArgs(): Args {
    const raw = process.argv.slice(2);
    return {
        limit: raw.find(a => a.startsWith("--limit=")) ? Number(raw.find(a => a.startsWith("--limit="))!.split("=")[1]) : null,
        slug: raw.find(a => a.startsWith("--slug=")) ? raw.find(a => a.startsWith("--slug="))!.split("=")[1] : null,
        dryRun: raw.includes("--dry-run"),
        all: raw.includes("--all"),
        freshOnly: raw.includes("--fresh-only"),
        backfillOnly: raw.includes("--backfill-only"),
        concurrency: raw.find(a => a.startsWith("--concurrency=")) ? Number(raw.find(a => a.startsWith("--concurrency="))!.split("=")[1]) : 2,
        kind: (raw.find(a => a.startsWith("--kind="))?.split("=")[1] as Kind) ?? "destinations",
    };
}

async function tryMigrateFresh(dest: { id: string; slug: string }, images: Array<{ id: string; imageUrl: string }>, dryRun: boolean): Promise<{ ok: number; fail: number; urls?: string[] }> {
    let ok = 0, fail = 0;
    const urls: string[] = [];
    for (const img of images) {
        if (isAlreadyCloudinary(img.imageUrl)) { ok++; urls.push(img.imageUrl); continue; }
        if (dryRun) { ok++; urls.push(`[dry]${img.imageUrl.slice(0,40)}`); continue; }
        try {
            const url = await uploadCrawledImageToCloudinary(img.imageUrl, { slug: dest.slug, kind: "destinations" });
            // update row inplace if url changed
            if (url !== img.imageUrl) {
                await prisma.destinationImage.update({ where: { id: img.id }, data: { imageUrl: url } });
                console.log(`    migrate ✓ ${img.id} -> ${url.slice(0,70)}...`);
            } else {
                console.log(`    migrate = skip (already cloudinary) ${img.id}`);
            }
            urls.push(url);
            ok++;
        } catch (e: any) {
            const msg = e.message ?? String(e);
            // 403 expired → signal fallback
            if (msg.includes("403") || msg.includes("Forbidden") || msg.includes("expired")) {
                console.log(`    migrate ✗ 403/expired ${img.id}: ${msg.slice(0,120)} → need backfill`);
                fail++;
                // do not throw, let caller fallback to crawl
            } else {
                console.log(`    migrate ✗ ${img.id}: ${msg.slice(0,120)}`);
                fail++;
            }
        }
    }
    return { ok, fail, urls };
}

async function backfillViaCrawl(dest: { id: string; name: string; slug: string; city: string | null; province: string | null; address: string | null }, dryRun: boolean): Promise<{ uploaded: number }> {
    const query = [dest.name, dest.city, dest.province].filter(Boolean).join(", ");
    console.log(`  crawl query: ${query}`);
    const placeId = await searchPlaceId(query);
    if (!placeId) throw new Error("no_place_id");
    console.log(`  place_id: ${placeId}`);
    const refs = await getPhotoReferences(placeId);
    console.log(`  refs: ${refs.length}`);
    if (!refs.length) throw new Error("no_photos");
    const take = Math.min(refs.length, 5);
    if (dryRun) {
        console.log(`  [DRY] would crawl ${take} photos`);
        return { uploaded: take };
    }
    const uploadedUrls: string[] = [];
    for (let i = 0; i < take; i++) {
        const ref = refs[i];
        const buf = await fetchPhotoBuffer(ref);
        console.log(`    photo ${i+1}/${take} ${buf.length}b`);
        const url = await uploadBufferToCloudinary(buf, dest.slug, ref, "destinations");
        console.log(`    -> ${url.slice(0,70)}...`);
        uploadedUrls.push(url);
        await new Promise(r => setTimeout(r, 300));
    }
    // replace all images for this destination
    const oldCount = await prisma.destinationImage.count({ where: { destinationId: dest.id } });
    console.log(`  DB replace ${oldCount} -> ${uploadedUrls.length}`);
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
    return { uploaded: uploadedUrls.length };
}

async function main(){
    const args = parseArgs();
    console.log("Args", args);
    if (args.freshOnly && args.backfillOnly) { console.error("Cannot use both --fresh-only and --backfill-only"); process.exit(1); }

    let dests: Array<{ id:string; name:string; slug:string; city:string|null; province:string|null; address:string|null; images: Array<{id:string; imageUrl:string}> }> = [];
    if (args.slug) {
        const d = await prisma.destination.findUnique({
            where: { slug: args.slug },
            select: { id:true, name:true, slug:true, city:true, province:true, address:true, images:{select:{id:true, imageUrl:true}} }
        });
        if (!d) { console.error(`Slug not found: ${args.slug}`); process.exit(1); }
        dests = [d as any];
    } else if (args.kind !== "destinations") {
        console.error("Hybrid sync saat ini hanya destinations; untuk umkm/accommodations gunakan migrate lama atau tunggu extend");
        process.exit(1);
    } else {
        const all = await prisma.destination.findMany({
            select: { id:true, name:true, slug:true, city:true, province:true, address:true, images:{select:{id:true, imageUrl:true}} },
            orderBy:{ createdAt:"asc" }
        });
        let pending = all.filter(d => d.images.some(img => !isAlreadyCloudinary(img.imageUrl)));
        console.log(`Total dest ${all.length}, pending (has lh3) ${pending.length}`);
        if (!args.all && args.limit != null) pending = pending.slice(0, args.limit);
        else if (!args.all && args.limit == null) pending = pending.slice(0, 3);
        dests = pending as any;
        console.log(`Will sync ${dests.length} dests (${args.freshOnly ? "freshOnly" : args.backfillOnly ? "backfillOnly" : "hybrid"})`);
    }

    if (dests.length === 0) { console.log("No pending"); await prisma.$disconnect(); return; }

    let ok=0, fail=0, crawled=0, migrated=0;
    for (const dest of dests) {
        console.log(`\n--- ${dest.name} (${dest.slug}) ${dest.images.length} images ---`);
        try {
            if (!args.backfillOnly) {
                const res = await tryMigrateFresh(dest, dest.images as any, args.dryRun);
                console.log(`  migrate result ok=${res.ok} fail=${res.fail}`);
                if (res.fail === 0) { ok++; migrated++; continue; }
                // partial fail → fallback if not freshOnly
                if (args.freshOnly) { fail++; continue; }
                console.log(`  migrate partial fail → fallback crawl...`);
            }
            if (!args.freshOnly) {
                if (args.dryRun) {
                    const r = await backfillViaCrawl(dest as any, true);
                    console.log(`  crawl dry uploaded=${r.uploaded}`);
                    ok++; crawled++;
                } else {
                    const r = await backfillViaCrawl(dest as any, false);
                    ok++; crawled++;
                }
            } else {
                fail++;
            }
        } catch (e:any) {
            console.error(`✗ ${dest.slug} fatal: ${e.message}`);
            fail++;
        }
        await new Promise(r=>setTimeout(r, 800));
    }
    console.log(`\n=== SUMMARY === ok ${ok} fail ${fail} migrated ${migrated} crawled ${crawled} / total ${dests.length} ${args.dryRun ? "(DRY)" : ""}`);
    await prisma.$disconnect();
}
main().catch(e=>{ console.error(e); process.exit(1); });
