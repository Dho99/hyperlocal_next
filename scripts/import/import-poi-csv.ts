import "dotenv/config";

import { createReadStream } from "node:fs";
import { resolve } from "node:path";
import csv from "csv-parser";

import { prisma } from "../../lib/prisma";

type PoiKind = "destination" | "accommodation" | "umkm" | "facility" | "skipped";

interface PoiRow {
  poi_id: string;
  name: string;
  category_level_1: string;
  category_level_2: string;
  category_level_3: string;
  category_level_4: string;
  business_status: string;
  latitude: string;
  longitude: string;
  address_full: string;
  locality: string;
  region: string;
  postal_code: string;
  last_verified_date: string;
  traffic_score: string;
  rating_count: string;
  average_rating: string;
  hotel_star_rating: string;
  website_domain: string;
  phone: string;
}

const SOURCE = "POI Export";

const DESTINATION_CATEGORY_SEEDS = [
  { slug: "wisata-alam", name: "Wisata Alam" },
  { slug: "pantai", name: "Pantai" },
  { slug: "taman-rekreasi", name: "Taman & Rekreasi" },
  { slug: "wisata-religi", name: "Wisata Religi" },
  { slug: "wisata-budaya", name: "Wisata Budaya" },
] as const;

const UMKM_CATEGORY_SEEDS = [
  { slug: "kuliner-halal", name: "Kuliner Halal" },
  { slug: "oleh-oleh-souvenir", name: "Oleh-Oleh & Souvenir" },
] as const;

function text(row: PoiRow): string {
  return [
    row.category_level_1,
    row.category_level_2,
    row.category_level_3,
    row.category_level_4,
  ]
    .join(" ")
    .toLowerCase();
}

export function classifyPoi(row: PoiRow): PoiKind {
  const categories = text(row);

  if (/places? of worship|mosque|masjid|mushola|musala/.test(categories)) return "facility";
  if (/travel & lodging|hotel|hostel|resort|guesthouse|homestay|lodging/.test(categories)) {
    return "accommodation";
  }
  if (
    /food & dining|restaurant|cafe|coffee shop|bakery|dessert|food market|gift shop|souvenir/.test(
      categories,
    )
  ) {
    return "umkm";
  }
  if (
    /outdoor & nature|amusement & recreation|arts, culture & entertainment|museum|monument|heritage|beach|park|zoo|aquarium|theme park|tourist attraction/.test(
      categories,
    )
  ) {
    return "destination";
  }
  return "skipped";
}

function destinationCategory(row: PoiRow): string {
  const categories = text(row);
  if (/beach|shoreline/.test(categories)) return "pantai";
  if (/places? of worship|religious/.test(categories)) return "wisata-religi";
  if (/museum|monument|heritage|arts|culture|theater/.test(categories)) return "wisata-budaya";
  if (/park|zoo|aquarium|amusement|recreation|theme park/.test(categories)) return "taman-rekreasi";
  return "wisata-alam";
}

function umkmCategory(row: PoiRow): string {
  return /gift shop|souvenir/.test(text(row)) ? "oleh-oleh-souvenir" : "kuliner-halal";
}

function facilityType(row: PoiRow): string {
  const value = `${row.name} ${text(row)}`.toLowerCase();
  if (/mushola|musala|prayer room/.test(value)) return "MUSALA";
  if (/mosque|masjid/.test(value)) return "MOSQUE";
  return "WORSHIP";
}

function displayText(value: string): string | null {
  const normalized = value
    ?.trim()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .replace(/\s+/g, " ");
  return normalized || null;
}

function numberOrNull(value: string): number | null {
  if (!value?.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function integerOrZero(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "poi";
}

function poiSlug(row: PoiRow): string {
  return `${slug(displayText(row.name) ?? row.name)}-${row.poi_id.slice(0, 8).toLowerCase()}`;
}

function description(row: PoiRow) {
  const category = [row.category_level_2, row.category_level_3, row.category_level_4]
    .filter(Boolean)
    .join(" / ");
  const verified = row.last_verified_date ? ` Terakhir diverifikasi ${row.last_verified_date}.` : "";
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: `${displayText(row.name) ?? row.name}${category ? ` (${category})` : ""}.${verified}`,
          },
        ],
      },
    ],
  };
}

function website(domain: string): string | null {
  const value = domain?.trim();
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

async function readRows(filePath: string): Promise<PoiRow[]> {
  return new Promise((resolveRows, reject) => {
    const rows: PoiRow[] = [];
    createReadStream(filePath)
      .pipe(csv())
      .on("data", (row: PoiRow) => rows.push(row))
      .on("end", () => resolveRows(rows))
      .on("error", reject);
  });
}

function validCoordinates(row: PoiRow): boolean {
  const latitude = numberOrNull(row.latitude);
  const longitude = numberOrNull(row.longitude);
  return (
    latitude !== null &&
    longitude !== null &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

async function ensureCategories() {
  const destinationEntries = await Promise.all(
    DESTINATION_CATEGORY_SEEDS.map((category) =>
      prisma.category.upsert({
        where: { slug_type: { slug: category.slug, type: "DESTINATION" } },
        update: { name: category.name },
        create: { ...category, type: "DESTINATION" },
      }),
    ),
  );
  const umkmEntries = await Promise.all(
    UMKM_CATEGORY_SEEDS.map((category) =>
      prisma.category.upsert({
        where: { slug_type: { slug: category.slug, type: "UMKM" } },
        update: { name: category.name },
        create: { ...category, type: "UMKM" },
      }),
    ),
  );
  return {
    destinations: new Map(destinationEntries.map((item) => [item.slug, item.id])),
    umkms: new Map(umkmEntries.map((item) => [item.slug, item.id])),
  };
}

async function commit(rows: PoiRow[]) {
  const categories = await ensureCategories();
  const ids = rows.map((row) => row.poi_id).filter(Boolean);
  const [destinations, accommodations, umkms, facilities] = await Promise.all([
    prisma.destination.findMany({ where: { externalId: { in: ids } }, select: { externalId: true } }),
    prisma.accommodation.findMany({ where: { externalId: { in: ids } }, select: { externalId: true } }),
    prisma.umkm.findMany({ where: { externalId: { in: ids } }, select: { externalId: true } }),
    prisma.halalFacility.findMany({ where: { externalId: { in: ids } }, select: { externalId: true } }),
  ]);
  const existing = new Set(
    [...destinations, ...accommodations, ...umkms, ...facilities]
      .map((item) => item.externalId)
      .filter((id): id is string => Boolean(id)),
  );
  const fresh = rows.filter((row) => row.poi_id && !existing.has(row.poi_id) && validCoordinates(row));

  const destinationRows = fresh.filter((row) => classifyPoi(row) === "destination");
  const accommodationRows = fresh.filter((row) => classifyPoi(row) === "accommodation");
  const umkmRows = fresh.filter((row) => classifyPoi(row) === "umkm");
  const facilityRows = fresh.filter((row) => classifyPoi(row) === "facility");

  const [destinationResult, accommodationResult, umkmResult, facilityResult] = await prisma.$transaction([
    prisma.destination.createMany({
      data: destinationRows.map((row) => ({
        name: displayText(row.name) ?? row.name,
        slug: poiSlug(row),
        categoryId: categories.destinations.get(destinationCategory(row))!,
        description: description(row),
        address: row.address_full || null,
        city: displayText(row.locality),
        province: displayText(row.region),
        latitude: numberOrNull(row.latitude),
        longitude: numberOrNull(row.longitude),
        status: "PENDING",
        rating: numberOrNull(row.average_rating),
        reviewCount: integerOrZero(row.rating_count),
        externalId: row.poi_id,
        externalSource: SOURCE,
      })),
      skipDuplicates: true,
    }),
    prisma.accommodation.createMany({
      data: accommodationRows.map((row) => ({
        name: displayText(row.name) ?? row.name,
        slug: poiSlug(row),
        description: description(row),
        address: row.address_full || null,
        city: displayText(row.locality),
        province: displayText(row.region),
        latitude: numberOrNull(row.latitude),
        longitude: numberOrNull(row.longitude),
        phone: row.phone || null,
        website: website(row.website_domain),
        rating: numberOrNull(row.average_rating),
        reviewCount: integerOrZero(row.rating_count),
        validationStatus: "PENDING",
        externalId: row.poi_id,
        externalSource: SOURCE,
      })),
      skipDuplicates: true,
    }),
    prisma.umkm.createMany({
      data: umkmRows.map((row) => ({
        name: displayText(row.name) ?? row.name,
        slug: poiSlug(row),
        owner: "Belum terverifikasi",
        categoryId: categories.umkms.get(umkmCategory(row))!,
        description: `Kategori sumber: ${[row.category_level_2, row.category_level_3, row.category_level_4].filter(Boolean).join(" / ")}`,
        address: row.address_full || null,
        phone: row.phone || null,
        latitude: numberOrNull(row.latitude),
        longitude: numberOrNull(row.longitude),
        rating: numberOrNull(row.average_rating),
        reviewCount: integerOrZero(row.rating_count),
        validationStatus: "PENDING",
        externalId: row.poi_id,
        externalSource: SOURCE,
      })),
      skipDuplicates: true,
    }),
    prisma.halalFacility.createMany({
      data: facilityRows.map((row) => ({
        name: displayText(row.name) ?? row.name,
        description: `Tempat ibadah dari ${SOURCE}; status halal dan kondisi fasilitas belum divalidasi.`,
        facilityType: facilityType(row),
        latitude: numberOrNull(row.latitude),
        longitude: numberOrNull(row.longitude),
        externalId: row.poi_id,
        externalSource: SOURCE,
        weight: 0,
        maxDistance: 0.5,
      })),
    }),
  ]);

  return {
    destination: destinationResult.count,
    accommodation: accommodationResult.count,
    umkm: umkmResult.count,
    facility: facilityResult.count,
    duplicateOrInvalid: rows.length - fresh.length,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const shouldCommit = args.includes("--commit");
  const input = args.find((arg) => !arg.startsWith("--"));
  if (!input) {
    throw new Error("Pemakaian: npm run import:poi -- <file.csv> [--commit]");
  }

  const filePath = resolve(input);
  const rows = await readRows(filePath);
  const counts: Record<PoiKind, number> = {
    destination: 0,
    accommodation: 0,
    umkm: 0,
    facility: 0,
    skipped: 0,
  };
  let invalidCoordinates = 0;
  for (const row of rows) {
    counts[classifyPoi(row)]++;
    if (!validCoordinates(row)) invalidCoordinates++;
  }

  console.log(`File: ${filePath}`);
  console.log(`Total baris: ${rows.length}`);
  console.table(counts);
  console.log(`Koordinat tidak valid: ${invalidCoordinates}`);

  if (!shouldCommit) {
    console.log("Dry-run selesai. Tambahkan --commit untuk memasukkan data ke database.");
    return;
  }

  const result = await commit(rows);
  console.log("Hasil import:");
  console.table(result);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

