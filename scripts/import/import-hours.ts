import { prisma } from "../../lib/prisma";
import { cleanString, createSlug, parseOpeningHours, readExcelSheet } from "./_utils";

export async function importOperationalHours() {
  console.log("--> Patching Operational Hours (from jam operasional...xlsx)...");

  // 1. Destinasi & Entitas Umum dari Jam_Terverifikasi
  const verifiedRows = await readExcelSheet("jam operasional destinasi, resto dan uMKM.xlsx", "Jam_Terverifikasi");
  let destPatched = 0;
  let umkmPatched = 0;

  for (const row of verifiedRows) {
    const kategori = cleanString(row["Kategori"]);
    const nama = cleanString(row["Nama Entitas"]);
    const jadwal = cleanString(row["Jadwal Operasional"]);
    const buka = cleanString(row["Jam Buka Utama"]);
    const tutup = cleanString(row["Jam Tutup Utama"]);

    if (!nama) continue;
    const hoursJson = parseOpeningHours(jadwal, buka, tutup);
    if (!hoursJson) continue;

    if (kategori?.toLowerCase() === "destinasi") {
      const slug = createSlug(nama);
      const dest = await prisma.destination.findFirst({
        where: {
          OR: [
            { slug },
            { name: { equals: nama, mode: "insensitive" } },
          ],
        },
      });

      if (dest) {
        await prisma.destination.update({
          where: { id: dest.id },
          data: { openingHours: hoursJson },
        });
        destPatched++;
      }
    } else {
      const umkm = await prisma.umkm.findFirst({
        where: {
          OR: [
            { name: { equals: nama, mode: "insensitive" } },
          ],
        },
      });
      if (umkm) {
        await prisma.umkm.update({
          where: { id: umkm.id },
          data: { openingHours: hoursJson },
        });
        umkmPatched++;
      }
    }
  }

  // 2. UMKM / Resto dari Restoran_UMKM_Master
  const masterRows = await readExcelSheet("jam operasional destinasi, resto dan uMKM.xlsx", "Restoran_UMKM_Master");

  for (const row of masterRows) {
    const id = cleanString(row["Master ID"]);
    const nama = cleanString(row["Nama Usaha/Produk"]);
    const jadwal = cleanString(row["Jadwal Operasional"]);
    const buka = cleanString(row["Jam Buka Utama"]);
    const tutup = cleanString(row["Jam Tutup Utama"]);

    const hoursJson = parseOpeningHours(jadwal, buka, tutup);
    if (!hoursJson) continue;

    const umkm = await prisma.umkm.findFirst({
      where: {
        OR: [
          ...(id ? [{ externalId: id }] : []),
          ...(nama ? [{ name: { equals: nama, mode: "insensitive" as const } }] : []),
        ],
      },
    });

    if (umkm) {
      await prisma.umkm.update({
        where: { id: umkm.id },
        data: { openingHours: hoursJson },
      });
      umkmPatched++;
    }
  }

  console.log(`  ✓ Operational hours patched: ${destPatched} Destinations, ${umkmPatched} UMKM`);
}
