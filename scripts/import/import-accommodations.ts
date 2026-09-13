import { prisma } from "../../lib/prisma";
import { cleanString, createSlug, readExcelSheet } from "./_utils";

export async function importAccommodations() {
  console.log("--> Importing Accommodations (from jam operasional...xlsx sheet Hotel)...");

  const hotelRows = await readExcelSheet("jam operasional destinasi, resto dan uMKM.xlsx", "Hotel");

  let count = 0;
  for (const row of hotelRows) {
    const name = cleanString(row["Nama Entitas"]);
    if (!name) continue;

    const slug = createSlug(name);
    const jadwal = cleanString(row["Jadwal Operasional"]);
    const sumber = cleanString(row["Sumber"]);
    const url = cleanString(row["URL"]);
    const catatan = cleanString(row["Catatan"]);

    const descriptionJson = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: `${name} adalah akomodasi penginapan di Pangandaran yang telah terdata resmi. Jadwal operasional: ${jadwal || "24 Jam"}.`
            }
          ]
        }
      ]
    };

    await prisma.accommodation.upsert({
      where: { slug },
      update: {
        name,
        city: "Kabupaten Pangandaran",
        province: "Jawa Barat",
        address: `${name}, Pangandaran, Jawa Barat`,
        validationStatus: "APPROVED",
        surveyorNote: `Data resmi dinas/sumber terverifikasi. ${catatan || ""}`.trim(),
        description: descriptionJson,
        externalSource: sumber || "Dinas Pariwisata / Traveloka",
        externalId: url || slug,
      },
      create: {
        name,
        slug,
        city: "Kabupaten Pangandaran",
        province: "Jawa Barat",
        address: `${name}, Pangandaran, Jawa Barat`,
        validationStatus: "APPROVED",
        surveyorNote: `Data resmi dinas/sumber terverifikasi. ${catatan || ""}`.trim(),
        description: descriptionJson,
        externalSource: sumber || "Dinas Pariwisata / Traveloka",
        externalId: url || slug,
      }
    });

    count++;
  }

  console.log(`  ✓ Accommodations upserted (validationStatus: APPROVED): ${count}`);
}
