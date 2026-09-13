import { prisma } from "../../lib/prisma";
import { cleanString, createSlug, parseCoordinate, readExcelSheet } from "./_utils";

export async function importDestinations(coverageAreaId: string, categories: Record<string, string>) {
  console.log("--> Importing Destinations (from Amenity.xlsx & Koordinat.xlsx)...");

  const amenityRows = await readExcelSheet("Amenity.xlsx", "Destinasi");
  const koordinatRows = await readExcelSheet("Koordinat.xlsx", "Destinasi");

  // Merge map by normalized name
  const destMap = new Map<string, any>();

  for (const row of koordinatRows) {
    const name = cleanString(row["Destinasi"]);
    if (name) destMap.set(name.toLowerCase(), { ...row });
  }

  for (const row of amenityRows) {
    const name = cleanString(row["Destinasi"]);
    if (name) {
      const existing = destMap.get(name.toLowerCase()) || {};
      destMap.set(name.toLowerCase(), { ...existing, ...row });
    }
  }

  let count = 0;
  for (const [_, row] of destMap.entries()) {
    const name = cleanString(row["Destinasi"]);
    if (!name) continue;

    const slug = createSlug(name);
    const lat = parseCoordinate(row["Lat Anchor"]);
    const lon = parseCoordinate(row["Lon Anchor"]);
    const urlSumber = cleanString(row["URL Sumber"]);
    const catatan = cleanString(row["Catatan"]);
    const statusEvidence = cleanString(row["Status Evidence"]);

    // Determine category
    let categoryId = categories["wisata-alam_DESTINATION"];
    if (name.toLowerCase().includes("pantai")) {
      categoryId = categories["pantai_DESTINATION"] || categoryId;
    } else if (name.toLowerCase().includes("cagar alam") || name.toLowerCase().includes("taman")) {
      categoryId = categories["taman-rekreasi_DESTINATION"] || categoryId;
    }

    const descriptionJson = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: `${name} adalah destinasi wisata unggulan di Kabupaten Pangandaran yang telah terdaftar dan tervalidasi oleh Dinas Pariwisata.`
            }
          ]
        }
      ]
    };

    await prisma.destination.upsert({
      where: { slug },
      update: {
        name,
        latitude: lat,
        longitude: lon,
        city: "Kabupaten Pangandaran",
        province: "Jawa Barat",
        address: `${name}, Kabupaten Pangandaran, Jawa Barat`,
        status: "APPROVED",
        validatedScore: 85,
        halalScore: 80,
        coverageAreaId,
        categoryId,
        description: descriptionJson,
        externalSource: statusEvidence || "Dinas Pariwisata / Sisparnas",
        externalId: urlSumber || slug,
      },
      create: {
        name,
        slug,
        latitude: lat,
        longitude: lon,
        city: "Kabupaten Pangandaran",
        province: "Jawa Barat",
        address: `${name}, Kabupaten Pangandaran, Jawa Barat`,
        status: "APPROVED",
        validatedScore: 85,
        halalScore: 80,
        coverageAreaId,
        categoryId,
        description: descriptionJson,
        externalSource: statusEvidence || "Dinas Pariwisata / Sisparnas",
        externalId: urlSumber || slug,
      }
    });

    count++;
  }

  console.log(`  ✓ Destinations upserted (status: APPROVED): ${count}`);
}
