/**
 * sync-images-to-cloudinary.ts (hybrid)
 * -------------------------------------------
 * Gabungan `migrate` + `crawl` untuk semua kind (destinations, umkm, accommodations):
 * 1. Coba migrate fresh: uploadCrawledImageToCloudinary(existing lh3 URL) via Cloudinary remote fetch
 *    – murah, 1 call, work jika token masih fresh (< jam)
 * 2. Jika 403/expired → fallback crawl fresh: TextSearch → Details → Photo API → uploadBuffer
 *
 * Usage:
 *   npx tsx scripts/sync-images-to-cloudinary.ts --slug=taman-rekreasi-air-fun-park-grand-nusa-indah --dry-run
 *   npx tsx scripts/sync-images-to-cloudinary.ts --limit=3
 *   npx tsx scripts/sync-images-to-cloudinary.ts --limit=5 --kind=umkm
 *   npx tsx scripts/sync-images-to-cloudinary.ts --limit=5 --kind=umkm --dry-run
 *   npx tsx scripts/sync-images-to-cloudinary.ts --all --kind=umkm
 *   npx tsx scripts/sync-images-to-cloudinary.ts --all --kind=all
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

type Entity = {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    province: string | null;
    address: string | null;
    images: Array<{ id: string; imageUrl: string }>;
    kind: Exclude<Kind, "all">;
};

async function tryMigrateFresh(entity: Entity, dryRun: boolean): Promise<{ ok: number; fail: number }> {
    let ok = 0, fail = 0;
    for (const img of entity.images) {
        if (isAlreadyCloudinary(img.imageUrl)) { ok++; continue; }
        if (dryRun) { ok++; continue; }
        try {
            const url = await uploadCrawledImageToCloudinary(img.imageUrl, { slug: entity.slug, kind: entity.kind });
            if (url !== img.imageUrl) {
                if (entity.kind === "destinations") await prisma.destinationImage.update({ where: { id: img.id }, data: { imageUrl: url } });
                else if (entity.kind === "umkm") await prisma.umkmImage.update({ where: { id: img.id }, data: { imageUrl: url } });
                else await prisma.accommodationImage.update({ where: { id: img.id }, data: { imageUrl: url } });
                console.log(`    migrate ✓ ${img.id} -> ${url.slice(0,70)}...`);
            }
            ok++;
        } catch (e: any) {
            const msg = e.message ?? String(e);
            if (msg.includes("403") || msg.includes("Forbidden") || msg.includes("expired")) {
                console.log(`    migrate ✗ 403/expired ${img.id}: ${msg.slice(0,120)} → need backfill`);
            } else {
                console.log(`    migrate ✗ ${img.id}: ${msg.slice(0,120)}`);
            }
            fail++;
        }
    }
    return { ok, fail };
}

function buildQuery(e: Entity): string {
    return [e.name, e.address, e.city, e.province].filter(Boolean).join(", ");
}

async function backfillViaCrawl(entity: Entity, dryRun: boolean): Promise<{ uploaded: number }> {
    const query = buildQuery(entity);
    console.log(`  crawl query: ${query}`);
    const placeId = await searchPlaceId(query);
    if (!placeId) throw new Error("no_place_id");
    console.log(`  place_id: ${placeId}`);
    const refs = await getPhotoReferences(placeId);
    console.log(`  refs: ${refs.length}`);
    if (!refs.length) throw new Error("no_photos");
    const take = Math.min(refs.length, 5);
    if (dryRun) {
        console.log(`  [DRY] would crawl ${take} photos -> hyperlocal/${entity.kind}/${entity.slug}`);
        return { uploaded: take };
    }
    const uploadedUrls: string[] = [];
    for (let i = 0; i < take; i++) {
        const ref = refs[i];
        const buf = await fetchPhotoBuffer(ref);
        console.log(`    photo ${i+1}/${take} ${buf.length}b`);
        const url = await uploadBufferToCloudinary(buf, entity.slug, ref, entity.kind);
        console.log(`    -> ${url.slice(0,70)}...`);
        uploadedUrls.push(url);
        await new Promise(r => setTimeout(r, 300));
    }
    const oldCount = entity.images.length;
    console.log(`  DB replace ${oldCount} -> ${uploadedUrls.length} (${entity.kind})`);
    if (entity.kind === "destinations") {
        await prisma.$transaction(async (tx) => {
            await tx.destinationImage.deleteMany({ where: { destinationId: entity.id } });
            for (let i = 0; i < uploadedUrls.length; i++) {
                await tx.destinationImage.create({ data: { destinationId: entity.id, imageUrl: uploadedUrls[i], caption: i === 0 ? "Foto utama" : `Foto ${i+1}`, isPrimary: i === 0 } });
            }
        });
    } else if (entity.kind === "umkm") {
        await prisma.$transaction(async (tx) => {
            await tx.umkmImage.deleteMany({ where: { umkmId: entity.id } });
            for (let i = 0; i < uploadedUrls.length; i++) {
                await tx.umkmImage.create({ data: { umkmId: entity.id, imageUrl: uploadedUrls[i], caption: i === 0 ? "Foto utama" : `Foto ${i+1}`, isPrimary: i === 0 } });
            }
        });
    } else {
        await prisma.$transaction(async (tx) => {
            await tx.accommodationImage.deleteMany({ where: { accommodationId: entity.id } });
            for (let i = 0; i < uploadedUrls.length; i++) {
                await tx.accommodationImage.create({ data: { accommodationId: entity.id, imageUrl: uploadedUrls[i], caption: i === 0 ? "Foto utama" : `Foto ${i+1}`, isPrimary: i === 0 } });
            }
        });
    }
    console.log(`  ✓ DB updated`);
    return { uploaded: uploadedUrls.length };
}

async function loadEntities(kind: Exclude<Kind, "all">, args: Args): Promise<Entity[]> {
    if (args.slug) {
        if (kind === "destinations") {
            const d = await prisma.destination.findUnique({ where: { slug: args.slug }, select: { id: true, name: true, slug: true, city: true, province: true, address: true, images: { select: { id: true, imageUrl: true } } } });
            if (!d) { console.error(`Slug not found: ${args.slug}`); process.exit(1); }
            return [{ ...d, kind }];
        }
        if (kind === "umkm") {
            const u = await prisma.umkm.findUnique({ where: { slug: args.slug }, select: { id: true, name: true, slug: true, address: true, destination: { select: { city: true, province: true } }, images: { select: { id: true, imageUrl: true } } } });
            if (!u) { console.error(`Slug not found: ${args.slug}`); process.exit(1); }
            return [{ id: u.id, name: u.name, slug: u.slug, city: u.destination?.city ?? null, province: u.destination?.province ?? null, address: u.address, images: u.images, kind }];
        }
        const a = await prisma.accommodation.findUnique({ where: { slug: args.slug }, select: { id: true, name: true, slug: true, city: true, province: true, address: true, images: { select: { id: true, imageUrl: true } } } });
        if (!a) { console.error(`Slug not found: ${args.slug}`); process.exit(1); }
        return [{ ...a, kind }];
    }

    if (kind === "destinations") {
        const all = await prisma.destination.findMany({ select: { id: true, name: true, slug: true, city: true, province: true, address: true, images: { select: { id: true, imageUrl: true } } }, orderBy: { createdAt: "asc" } });
        let pending = all.filter(d => d.images.length === 0 || d.images.some(img => !isAlreadyCloudinary(img.imageUrl)));
        console.log(`Total dest ${all.length}, pending (0 or lh3) ${pending.length}`);
        if (!args.all && args.limit != null) pending = pending.slice(0, args.limit);
        else if (!args.all && args.limit == null) pending = pending.slice(0, 3);
        return pending.map(p => ({ ...p, kind } as Entity));
    }
    if (kind === "umkm") {
        const all = await prisma.umkm.findMany({ select: { id: true, name: true, slug: true, address: true, destination: { select: { city: true, province: true } }, images: { select: { id: true, imageUrl: true } } }, orderBy: { createdAt: "asc" } });
        let pending = all.filter(u => u.images.length === 0 || u.images.some(img => !isAlreadyCloudinary(img.imageUrl)));
        console.log(`Total umkm ${all.length}, pending (0 or lh3) ${pending.length}`);
        if (!args.all && args.limit != null) pending = pending.slice(0, args.limit);
        else if (!args.all && args.limit == null) pending = pending.slice(0, 3);
        return pending.map(u => ({ id: u.id, name: u.name, slug: u.slug, city: u.destination?.city ?? null, province: u.destination?.province ?? null, address: u.address, images: u.images, kind } as Entity));
    }
    const all = await prisma.accommodation.findMany({ select: { id: true, name: true, slug: true, city: true, province: true, address: true, images: { select: { id: true, imageUrl: true } } }, orderBy: { createdAt: "asc" } });
    let pending = all.filter(a => a.images.length === 0 || a.images.some(img => !isAlreadyCloudinary(img.imageUrl)));
    console.log(`Total accommodations ${all.length}, pending (0 or lh3) ${pending.length}`);
    if (!args.all && args.limit != null) pending = pending.slice(0, args.limit);
    else if (!args.all && args.limit == null) pending = pending.slice(0, 3);
    return pending.map(p => ({ ...p, kind } as Entity));
}

async function main(){
    const args = parseArgs();
    console.log("Args", args);
    if (args.freshOnly && args.backfillOnly) { console.error("Cannot use both --fresh-only and --backfill-only"); process.exit(1); }

    const kinds: Exclude<Kind, "all">[] = args.kind === "all" ? ["destinations", "umkm", "accommodations"] : [args.kind];
    let allEntities: Entity[] = [];
    for (const k of kinds) {
        const ents = await loadEntities(k, args);
        allEntities.push(...ents);
    }
    // dedup by id when kind=all (no overlap across tables, but safe)
    console.log(`Will sync ${allEntities.length} entities (${kinds.join(",")}) (${args.freshOnly ? "freshOnly" : args.backfillOnly ? "backfillOnly" : "hybrid"})`);

    if (allEntities.length === 0) { console.log("No pending"); await prisma.$disconnect(); return; }

    let ok=0, fail=0, crawled=0, migrated=0;
    for (const ent of allEntities) {
        console.log(`\n--- [${ent.kind}] ${ent.name} (${ent.slug}) ${ent.images.length} images ---`);
        try {
            if (!args.backfillOnly) {
                const res = await tryMigrateFresh(ent, args.dryRun);
                console.log(`  migrate result ok=${res.ok} fail=${res.fail}`);
                if (res.fail === 0) { ok++; migrated++; continue; }
                if (args.freshOnly) { fail++; continue; }
                console.log(`  migrate partial fail → fallback crawl...`);
            }
            if (!args.freshOnly) {
                const r = await backfillViaCrawl(ent, args.dryRun);
                console.log(`  crawl uploaded=${r.uploaded}`);
                ok++; crawled++;
            } else {
                fail++;
            }
        } catch (e:any) {
            console.error(`✗ ${ent.slug} fatal: ${e.message}`);
            fail++;
        }
        await new Promise(r=>setTimeout(r, 800));
    }
    console.log(`\n=== SUMMARY === ok ${ok} fail ${fail} migrated ${migrated} crawled ${crawled} / total ${allEntities.length} ${args.dryRun ? "(DRY)" : ""}`);
    await prisma.$disconnect();
}
main().catch(e=>{ console.error(e); process.exit(1); });
