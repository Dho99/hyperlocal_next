import { prisma } from "../../lib/prisma";
import { cleanString, createSlug, readExcelSheet } from "./_utils";

export async function importUmkms(coverageAreaId: string, categories: Record<string, string>) {
  console.log("--> Importing UMKM & Restoran (from data usaha kab pangandaran.xlsx)...");

  // Read supplemental phone/email from UMKM_Kuliner_Source
  const kulinerRows = await readExcelSheet("data usaha kab pangandaran.xlsx", "UMKM_Kuliner_Source");
  const contactMap = new Map<string, { phone?: string; email?: string }>();

  for (const row of kulinerRows) {
    const nama = cleanString(row["Nama/Merek"]);
    const telp = cleanString(row["Telepon"]);
    const email = cleanString(row["Email"]);
    if (nama) {
      contactMap.set(nama.toLowerCase(), { phone: telp || undefined, email: email || undefined });
    }
  }

  // Read master data
  const masterRows = await readExcelSheet("data usaha kab pangandaran.xlsx", "Master_Halal_Assurance");

  let count = 0;
  for (const row of masterRows) {
    const id = cleanString(row["ID"]);
    const nama = cleanString(row["Nama Usaha/Produk"]);
    const pemilik = cleanString(row["Pemilik/Pelaku Usaha"]) || "Pelaku Usaha";
    const pengelola = cleanString(row["Pengelola"]);
    const alamat = cleanString(row["Alamat"]);
    const jenis = cleanString(row["Jenis Entitas"]);
    const datasetSumber = cleanString(row["Dataset Sumber"]);

    if (!nama) continue;

    // Create unique slug
    let baseSlug = createSlug(nama);
    if (!baseSlug) baseSlug = `umkm-${id?.toLowerCase() || Math.random().toString(36).substring(2, 7)}`;
    const slug = id ? `${baseSlug}-${id.toLowerCase()}` : baseSlug;

    // Contact info
    const contact = contactMap.get(nama.toLowerCase()) || {};

    // Category
    const categoryId = jenis?.toLowerCase().includes("restoran")
      ? categories["kuliner-halal_UMKM"]
      : categories["oleh-oleh-souvenir_UMKM"] || categories["kuliner-halal_UMKM"];

    await prisma.umkm.upsert({
      where: { slug },
      update: {
        name: nama,
        owner: pemilik,
        address: alamat || "Kabupaten Pangandaran, Jawa Barat",
        phone: contact.phone || null,
        validationStatus: "APPROVED",
        surveyorNote: `Data usaha resmi dinas. Pengelola: ${pengelola || "-"}. Jenis: ${jenis || "-"}`,
        externalId: id || null,
        externalSource: datasetSumber || "Dinas Pariwisata Pangandaran",
        coverageAreaId,
        categoryId,
        description: `${nama} merupakan usaha ${jenis || "kuliner"} yang beroperasi di ${alamat || "Kabupaten Pangandaran"}.`,
      },
      create: {
        name: nama,
        slug,
        owner: pemilik,
        address: alamat || "Kabupaten Pangandaran, Jawa Barat",
        phone: contact.phone || null,
        validationStatus: "APPROVED",
        surveyorNote: `Data usaha resmi dinas. Pengelola: ${pengelola || "-"}. Jenis: ${jenis || "-"}`,
        externalId: id || null,
        externalSource: datasetSumber || "Dinas Pariwisata Pangandaran",
        coverageAreaId,
        categoryId,
        description: `${nama} merupakan usaha ${jenis || "kuliner"} yang beroperasi di ${alamat || "Kabupaten Pangandaran"}.`,
      },
    });

    count++;
  }

  console.log(`  ✓ UMKM & Resto upserted (validationStatus: APPROVED): ${count}`);
}
