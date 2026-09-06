/**
 * migrate-images-to-cloudinary.ts
 * -------------------------------
 * Migrasi semua imageUrl yang masih berupa lh3.googleusercontent.com / unsplash / external
 * ke Cloudinary via uploadCrawledImageToCloudinary.
 *
 * - Idempotent: pakai public_id = crawl-<hash(url)> sehingga rerun tidak duplikat
 * - Jika imageUrl sudah res.cloudinary.com maka skip
 * - Update DB inplace
 * - Mendukung --dry-run, --limit, --kind=destinations|umkm|accommodations|all, --concurrency
 *
 * Usage:
 *   npx tsx scripts/migrate-images-to-cloudinary.ts --dry-run --limit=5
 *   npx tsx scripts/migrate-images-to-cloudinary.ts --kind=destinations
 *   npx tsx scripts/migrate-images-to-cloudinary.ts --concurrency=3
 */

import "dotenv/config";
import { prisma } from "../lib/prisma";
import { uploadCrawledImageToCloudinary, isAlreadyCloudinary } from "../lib/cloudinary/crawl-upload";

type Kind = "destinations" | "umkm" | "accommodations" | "all";

interface Args {
    dryRun: boolean;
    limit: number | null;
    kind: Kind;
    concurrency: number;
}

function parseArgs(): Args {
    const raw = process.argv.slice(2);
    const dryRun = raw.includes("--dry-run");
    const limitArg = raw.find((a) => a.startsWith("--limit="));
    const kindArg = raw.find((a) => a.startsWith("--kind="));
    const concArg = raw.find((a) => a.startsWith("--concurrency="));
    return {
        dryRun,
        limit: limitArg ? Number(limitArg.split("=")[1]) : null,
        kind: (kindArg?.split("=")[1] as Kind) ?? "all",
        concurrency: concArg ? Number(concArg.split("=")[1]) : 3,
    };
}

async function pMap<T, R>(items: T[], concurrency: number, fn: (item: T, idx: number) => Promise<R>): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let idx = 0;
    async function worker() {
        while (true) {
            const cur = idx++;
            if (cur >= items.length) break;
            results[cur] = await fn(items[cur], cur);
        }
    }
    const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
    await Promise.all(workers);
    return results;
}

async function migrateDestinationImages(dryRun: boolean, limit: number | null, concurrency: number) {
    console.log("\n=== Migrasi DestinationImage ===");
    // Prisma tidak support LIKE di filter string secara langsung tanpa mode, kita fetch lalu filter di mem
    // Tapi untuk performa, ambil semua lalu filter yang belum cloudinary
    const all = await prisma.destinationImage.findMany({
        include: { destination: { select: { slug: true, name: true } } },
        orderBy: { createdAt: "asc" },
    });
    let pending = all.filter((r) => !isAlreadyCloudinary(r.imageUrl));
    if (limit != null) pending = pending.slice(0, limit);
    console.log(`Total destination images: ${all.length}, pending (non-cloudinary): ${pending.length}, dryRun=${dryRun}`);

    if (pending.length === 0) return { migrated: 0, failed: 0, skipped: all.length };

    let migrated = 0;
    let failed = 0;

    await pMap(pending, concurrency, async (row) => {
        const slug = row.destination.slug ?? row.destination.name.replace(/\s+/g, "-").toLowerCase();
        try {
            if (dryRun) {
                console.log(`[DRY] ${row.id} | ${slug} | ${row.imageUrl.slice(0, 80)}... -> would upload`);
                migrated++;
                return;
            }
            const secureUrl = await uploadCrawledImageToCloudinary(row.imageUrl, {
                slug,
                kind: "destinations",
                caption: row.caption,
                isPrimary: row.isPrimary,
            });
            if (secureUrl !== row.imageUrl) {
                await prisma.destinationImage.update({
                    where: { id: row.id },
                    data: { imageUrl: secureUrl },
                });
                console.log(`✓ ${row.id} | ${slug} | -> ${secureUrl.slice(0, 80)}...`);
            } else {
                console.log(`= ${row.id} | skip (already cloudinary)`);
            }
            migrated++;
        } catch (e) {
            failed++;
            console.error(`✗ ${row.id} | ${slug} | FAILED: ${(e as Error).message}`);
        }
    });

    console.log(`DestinationImage done: migrated=${migrated}, failed=${failed}`);
    return { migrated, failed, skipped: all.length - pending.length };
}

async function migrateUmkmImages(dryRun: boolean, limit: number | null, concurrency: number) {
    console.log("\n=== Migrasi UmkmImage ===");
    const all = await prisma.umkmImage.findMany({
        include: { umkm: { select: { slug: true, name: true } } },
        orderBy: { createdAt: "asc" },
    });
    let pending = all.filter((r) => !isAlreadyCloudinary(r.imageUrl));
    if (limit != null) pending = pending.slice(0, limit);
    console.log(`Total umkm images: ${all.length}, pending: ${pending.length}, dryRun=${dryRun}`);
    if (pending.length === 0) return { migrated: 0, failed: 0, skipped: all.length };
    let migrated = 0;
    let failed = 0;
    await pMap(pending, concurrency, async (row) => {
        const slug = row.umkm.slug ?? row.umkm.name.replace(/\s+/g, "-").toLowerCase();
        try {
            if (dryRun) {
                console.log(`[DRY] ${row.id} | ${slug} | ${row.imageUrl.slice(0, 80)}...`);
                migrated++;
                return;
            }
            const secureUrl = await uploadCrawledImageToCloudinary(row.imageUrl, {
                slug,
                kind: "umkm",
                caption: row.caption,
                isPrimary: row.isPrimary,
            });
            if (secureUrl !== row.imageUrl) {
                await prisma.umkmImage.update({ where: { id: row.id }, data: { imageUrl: secureUrl } });
                console.log(`✓ ${row.id} | ${slug} | -> ${secureUrl.slice(0, 80)}...`);
            }
            migrated++;
        } catch (e) {
            failed++;
            console.error(`✗ ${row.id} | ${slug} | FAILED: ${(e as Error).message}`);
        }
    });
    console.log(`UmkmImage done: migrated=${migrated}, failed=${failed}`);
    return { migrated, failed, skipped: all.length - pending.length };
}

async function migrateAccommodationImages(dryRun: boolean, limit: number | null, concurrency: number) {
    console.log("\n=== Migrasi AccommodationImage ===");
    const all = await prisma.accommodationImage.findMany({
        include: { accommodation: { select: { slug: true, name: true } } },
        orderBy: { createdAt: "asc" },
    });
    let pending = all.filter((r) => !isAlreadyCloudinary(r.imageUrl));
    if (limit != null) pending = pending.slice(0, limit);
    console.log(`Total accommodation images: ${all.length}, pending: ${pending.length}, dryRun=${dryRun}`);
    if (pending.length === 0) return { migrated: 0, failed: 0, skipped: all.length };
    let migrated = 0;
    let failed = 0;
    await pMap(pending, concurrency, async (row) => {
        const slug = row.accommodation.slug ?? row.accommodation.name.replace(/\s+/g, "-").toLowerCase();
        try {
            if (dryRun) {
                console.log(`[DRY] ${row.id} | ${slug} | ${row.imageUrl.slice(0, 80)}...`);
                migrated++;
                return;
            }
            const secureUrl = await uploadCrawledImageToCloudinary(row.imageUrl, {
                slug,
                kind: "accommodations",
                caption: row.caption,
                isPrimary: row.isPrimary,
            });
            if (secureUrl !== row.imageUrl) {
                await prisma.accommodationImage.update({ where: { id: row.id }, data: { imageUrl: secureUrl } });
                console.log(`✓ ${row.id} | ${slug} | -> ${secureUrl.slice(0, 80)}...`);
            }
            migrated++;
        } catch (e) {
            failed++;
            console.error(`✗ ${row.id} | ${slug} | FAILED: ${(e as Error).message}`);
        }
    });
    console.log(`AccommodationImage done: migrated=${migrated}, failed=${failed}`);
    return { migrated, failed, skipped: all.length - pending.length };
}

async function main() {
    const args = parseArgs();
    console.log("Args:", args);
    console.log("Cloudinary cloud_name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error("Cloudinary env belum lengkap. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
        process.exit(1);
    }

    let destRes = { migrated: 0, failed: 0, skipped: 0 };
    let umkmRes = { migrated: 0, failed: 0, skipped: 0 };
    let accomRes = { migrated: 0, failed: 0, skipped: 0 };

    if (args.kind === "all" || args.kind === "destinations") {
        destRes = await migrateDestinationImages(args.dryRun, args.limit, args.concurrency);
    }
    if (args.kind === "all" || args.kind === "umkm") {
        umkmRes = await migrateUmkmImages(args.dryRun, args.limit, args.concurrency);
    }
    if (args.kind === "all" || args.kind === "accommodations") {
        accomRes = await migrateAccommodationImages(args.dryRun, args.limit, args.concurrency);
    }

    console.log("\n=== SUMMARY ===");
    console.log(`Destinations: migrated=${destRes.migrated} failed=${destRes.failed} skipped=${destRes.skipped}`);
    console.log(`Umkm:         migrated=${umkmRes.migrated} failed=${umkmRes.failed} skipped=${umkmRes.skipped}`);
    console.log(`Accommodations: migrated=${accomRes.migrated} failed=${accomRes.failed} skipped=${accomRes.skipped}`);
    console.log(args.dryRun ? "DRY RUN - tidak ada perubahan DB." : "Migrasi selesai.");
}

main()
    .catch((e) => {
        console.error("Fatal:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
