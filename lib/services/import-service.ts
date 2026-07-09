import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma";

export type ImportType = "destination" | "umkm" | "accommodation" | "facility";

export interface ImportError {
  row: number;
  field: string;
  message: string;
}

export interface ImportResult {
  inserted: number;
  total: number;
  errors: ImportError[];
}

const DESTINATION_COLUMNS = [
  { key: "name", label: "Nama Destinasi*" },
  { key: "address", label: "Alamat" },
  { key: "city", label: "Kota" },
  { key: "province", label: "Provinsi" },
  { key: "latitude", label: "Latitude" },
  { key: "longitude", label: "Longitude" },
  { key: "description", label: "Deskripsi" },
  { key: "categoryName", label: "Kategori*" },
  { key: "coverageAreaName", label: "Wilayah Cakupan" },
] as const;

const UMKM_COLUMNS = [
  { key: "name", label: "Nama UMKM*" },
  { key: "owner", label: "Pemilik*" },
  { key: "address", label: "Alamat" },
  { key: "phone", label: "Telepon" },
  { key: "estimatedCost", label: "Estimasi Biaya" },
  { key: "latitude", label: "Latitude" },
  { key: "longitude", label: "Longitude" },
  { key: "description", label: "Deskripsi" },
  { key: "categoryName", label: "Kategori" },
  { key: "coverageAreaName", label: "Wilayah Cakupan" },
  { key: "destinationName", label: "Destinasi Terkait" },
] as const;

const ACCOMMODATION_COLUMNS = [
  { key: "name", label: "Nama Penginapan*" },
  { key: "address", label: "Alamat" },
  { key: "city", label: "Kota" },
  { key: "province", label: "Provinsi" },
  { key: "phone", label: "Telepon" },
  { key: "website", label: "Website" },
  { key: "estimatedCost", label: "Estimasi Biaya" },
  { key: "latitude", label: "Latitude" },
  { key: "longitude", label: "Longitude" },
  { key: "description", label: "Deskripsi" },
] as const;

const FACILITY_COLUMNS = [
  { key: "name", label: "Nama Fasilitas*" },
  { key: "description", label: "Deskripsi" },
  { key: "facilityType", label: "Tipe Fasilitas" },
  { key: "weight", label: "Bobot" },
  { key: "maxDistance", label: "Jarak Maksimal (km)" },
] as const;

const SAMPLE_ROW: Record<ImportType, string> = {
  destination: "Pantai Indah Permai",
  umkm: "Warung Makan Barokah",
  accommodation: "Hotel Syariah Lombok",
  facility: "Mushola",
};

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toTiptapJson(text: string) {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }],
      },
    ],
  };
}

function columnLetter(col: number): string {
  let letter = "";
  let n = col;
  while (n > 0) {
    const mod = (n - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

function getCellValue(cell: unknown): string {
  if (cell === null || cell === undefined) return "";
  const c = cell as { text?: string; richText?: { text: string }[]; value?: unknown };
  if (typeof c === "object" && c !== null) {
    if ("richText" in c && Array.isArray(c.richText)) {
      return c.richText.map((r) => r.text).join("");
    }
    if ("text" in c && typeof c.text === "string") return c.text;
    if ("value" in c) return String(c.value ?? "").trim();
  }
  return String(cell).trim();
}

// ─── Template Generation ─────────────────────────────────────────────────────

export async function generateTemplate(
  type: ImportType,
  categories: { name: string }[],
  coverageAreas: { name: string }[]
): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ExcelJS = require("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Admin HalalTourism";
  workbook.created = new Date();

  const columns =
    type === "destination"
      ? DESTINATION_COLUMNS
      : type === "umkm"
        ? UMKM_COLUMNS
        : ACCOMMODATION_COLUMNS;

  const dataSheet = workbook.addWorksheet("Data");

  // Header row
  const headerRow = dataSheet.addRow(columns.map((c) => c.label));
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF065F46" },
  };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.height = 24;

  // Sample row
  if (type === "destination") {
    dataSheet.addRow([
      SAMPLE_ROW.destination,
      "Jl. Pantai No. 1",
      "Lombok",
      "Nusa Tenggara Barat",
      "-8.650979",
      "116.324134",
      "Destinasi wisata pantai yang indah",
      categories[0]?.name ?? "",
      coverageAreas[0]?.name ?? "",
    ]);
  } else if (type === "umkm") {
    dataSheet.addRow([
      SAMPLE_ROW.umkm,
      "Ahmad Fauzi",
      "Jl. Pasar No. 5",
      "081234567890",
      "25000",
      "-8.650979",
      "116.324134",
      "Warung makan halal dengan menu khas daerah",
      categories[0]?.name ?? "",
      coverageAreas[0]?.name ?? "",
      "",
    ]);
  } else if (type === "facility") {
    dataSheet.addRow([
      SAMPLE_ROW.facility,
      "Tempat sholat bagi wisatawan",
      "mushola",
      "10",
      "5.0",
    ]);
  } else {
    dataSheet.addRow([
      SAMPLE_ROW.accommodation,
      "Jl. Senggigi No. 10",
      "Lombok",
      "Nusa Tenggara Barat",
      "0370-12345",
      "https://hotelsyariah.com",
      "350000",
      "-8.650979",
      "116.324134",
      "Hotel berbasis syariah dengan fasilitas lengkap",
    ]);
  }

  // Style sample row as hint (italic gray)
  const sampleRow = dataSheet.getRow(2);
  sampleRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
  sampleRow.font = { italic: true, color: { argb: "FF9CA3AF" } };

  // Column widths
  columns.forEach((col, i) => {
    dataSheet.getColumn(i + 1).width = Math.max(col.label.length + 4, 22);
  });

  // Freeze header
  dataSheet.views = [{ state: "frozen", ySplit: 1 }];

  // Dropdown validation for category (destination/umkm only)
  const hasCategoryCol = type !== "accommodation" && type !== "facility";

  if (hasCategoryCol && categories.length > 0) {
    const catSheet = workbook.addWorksheet("_Kategori");
    catSheet.state = "hidden";
    categories.forEach((c, i) => {
      catSheet.getCell(`A${i + 1}`).value = c.name;
    });

    const catColIndex = columns.findIndex((c) => c.key === "categoryName") + 1;
    if (catColIndex > 0) {
      const letter = columnLetter(catColIndex);
      for (let row = 2; row <= 500; row++) {
        dataSheet.getCell(`${letter}${row}`).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`_Kategori!$A$1:$A$${categories.length}`],
          showErrorMessage: true,
          errorTitle: "Kategori tidak valid",
          error: "Pilih kategori dari daftar yang tersedia",
        };
      }
    }
  }

  if (hasCategoryCol && coverageAreas.length > 0) {
    const areaSheet = workbook.addWorksheet("_Wilayah");
    areaSheet.state = "hidden";
    coverageAreas.forEach((a, i) => {
      areaSheet.getCell(`A${i + 1}`).value = a.name;
    });

    const areaColIndex = columns.findIndex((c) => c.key === "coverageAreaName") + 1;
    if (areaColIndex > 0) {
      const letter = columnLetter(areaColIndex);
      for (let row = 2; row <= 500; row++) {
        dataSheet.getCell(`${letter}${row}`).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`_Wilayah!$A$1:$A$${coverageAreas.length}`],
          showErrorMessage: true,
          errorTitle: "Wilayah tidak valid",
          error: "Pilih wilayah dari daftar yang tersedia",
        };
      }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

// ─── Import Parsing ───────────────────────────────────────────────────────────

export async function parseAndImport(
  buffer: Buffer,
  type: ImportType
): Promise<ImportResult> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ExcelJS = require("exceljs");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.getWorksheet("Data") ?? workbook.worksheets[0];
  if (!sheet) {
    return {
      inserted: 0,
      total: 0,
      errors: [{ row: 0, field: "-", message: "Sheet 'Data' tidak ditemukan dalam file" }],
    };
  }

  const columns =
    type === "destination"
      ? DESTINATION_COLUMNS
      : type === "umkm"
        ? UMKM_COLUMNS
        : type === "facility"
          ? FACILITY_COLUMNS
          : ACCOMMODATION_COLUMNS;

  // Determine start row — skip sample row if present
  let startRow = 2;
  const row2First = getCellValue(sheet.getRow(2).getCell(1).value);
  if (row2First === SAMPLE_ROW[type]) {
    startRow = 3;
  }

  // Parse rows by column index
  const parsed: { rowNum: number; data: Record<string, string> }[] = [];

  for (let r = startRow; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const record: Record<string, string> = {};

    columns.forEach((col, i) => {
      const val = getCellValue(row.getCell(i + 1).value).trim();
      if (val) record[col.key] = val;
    });

    // Only include rows that have a name value
    if (record.name) {
      parsed.push({ rowNum: r, data: record });
    }
  }

  if (type === "destination") return importDestinations(parsed);
  if (type === "umkm") return importUmkms(parsed);
  if (type === "facility") return importFacilities(parsed);
  return importAccommodations(parsed);
}

// ─── Per-entity import ────────────────────────────────────────────────────────

async function makeUniqueSlug(base: string, taken: Set<string>): Promise<string> {
  let slug = toSlug(base) || "item";
  if (!taken.has(slug)) {
    taken.add(slug);
    return slug;
  }
  let n = 2;
  while (taken.has(`${slug}-${n}`)) n++;
  const final = `${slug}-${n}`;
  taken.add(final);
  return final;
}

async function importDestinations(
  rows: { rowNum: number; data: Record<string, string> }[]
): Promise<ImportResult> {
  const errors: ImportError[] = [];

  const [categories, coverageAreas, existing] = await Promise.all([
    prisma.category.findMany({ where: { type: "DESTINATION" }, select: { id: true, name: true } }),
    prisma.coverageArea.findMany({ select: { id: true, name: true } }),
    prisma.destination.findMany({ select: { slug: true } }),
  ]);

  const catMap = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
  const areaMap = new Map(coverageAreas.map((a) => [a.name.toLowerCase(), a.id]));
  const slugs = new Set(existing.map((d) => d.slug));

  const toInsert: Prisma.DestinationCreateManyInput[] = [];

  for (const { rowNum, data } of rows) {
    if (!data.name) {
      errors.push({ row: rowNum, field: "Nama Destinasi", message: "Wajib diisi" });
      continue;
    }
    if (!data.categoryName) {
      errors.push({ row: rowNum, field: "Kategori", message: "Wajib diisi" });
      continue;
    }

    const categoryId = catMap.get(data.categoryName.toLowerCase());
    if (!categoryId) {
      errors.push({ row: rowNum, field: "Kategori", message: `"${data.categoryName}" tidak ditemukan` });
      continue;
    }

    let coverageAreaId: string | null = null;
    if (data.coverageAreaName) {
      const found = areaMap.get(data.coverageAreaName.toLowerCase());
      if (!found) {
        errors.push({ row: rowNum, field: "Wilayah Cakupan", message: `"${data.coverageAreaName}" tidak ditemukan` });
        continue;
      }
      coverageAreaId = found;
    }

    const latitude = data.latitude ? parseFloat(data.latitude) : null;
    const longitude = data.longitude ? parseFloat(data.longitude) : null;

    if (data.latitude && (isNaN(latitude!) || latitude! < -90 || latitude! > 90)) {
      errors.push({ row: rowNum, field: "Latitude", message: "Nilai tidak valid (contoh: -8.650979)" });
      continue;
    }
    if (data.longitude && (isNaN(longitude!) || longitude! < -180 || longitude! > 180)) {
      errors.push({ row: rowNum, field: "Longitude", message: "Nilai tidak valid (contoh: 116.324134)" });
      continue;
    }

    const slug = await makeUniqueSlug(data.name, slugs);

    toInsert.push({
      name: data.name,
      slug,
      categoryId,
      coverageAreaId,
      address: data.address ?? null,
      city: data.city ?? null,
      province: data.province ?? null,
      latitude: latitude,
      longitude: longitude,
      description: data.description ? toTiptapJson(data.description) : undefined,
    });
  }

  let inserted = 0;
  if (toInsert.length > 0) {
    const result = await prisma.destination.createMany({ data: toInsert, skipDuplicates: true });
    inserted = result.count;
  }

  return { inserted, total: rows.length, errors };
}

async function importUmkms(
  rows: { rowNum: number; data: Record<string, string> }[]
): Promise<ImportResult> {
  const errors: ImportError[] = [];

  const [categories, coverageAreas, destinations, existing] = await Promise.all([
    prisma.category.findMany({ where: { type: "UMKM" }, select: { id: true, name: true } }),
    prisma.coverageArea.findMany({ select: { id: true, name: true } }),
    prisma.destination.findMany({ select: { id: true, name: true } }),
    prisma.umkm.findMany({ select: { slug: true } }),
  ]);

  const catMap = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
  const areaMap = new Map(coverageAreas.map((a) => [a.name.toLowerCase(), a.id]));
  const destMap = new Map(destinations.map((d) => [d.name.toLowerCase(), d.id]));
  const slugs = new Set(existing.map((u) => u.slug));

  const toInsert: Prisma.UmkmCreateManyInput[] = [];

  for (const { rowNum, data } of rows) {
    if (!data.name) {
      errors.push({ row: rowNum, field: "Nama UMKM", message: "Wajib diisi" });
      continue;
    }
    if (!data.owner) {
      errors.push({ row: rowNum, field: "Pemilik", message: "Wajib diisi" });
      continue;
    }

    let categoryId: string | null = null;
    if (data.categoryName) {
      const found = catMap.get(data.categoryName.toLowerCase());
      if (!found) {
        errors.push({ row: rowNum, field: "Kategori", message: `"${data.categoryName}" tidak ditemukan` });
        continue;
      }
      categoryId = found;
    }

    let coverageAreaId: string | null = null;
    if (data.coverageAreaName) {
      const found = areaMap.get(data.coverageAreaName.toLowerCase());
      if (!found) {
        errors.push({ row: rowNum, field: "Wilayah Cakupan", message: `"${data.coverageAreaName}" tidak ditemukan` });
        continue;
      }
      coverageAreaId = found;
    }

    const destinationId = data.destinationName
      ? (destMap.get(data.destinationName.toLowerCase()) ?? null)
      : null;

    const latitude = data.latitude ? parseFloat(data.latitude) : null;
    const longitude = data.longitude ? parseFloat(data.longitude) : null;
    const estimatedCost = data.estimatedCost ? parseFloat(data.estimatedCost) : null;

    if (data.latitude && isNaN(latitude!)) {
      errors.push({ row: rowNum, field: "Latitude", message: "Nilai tidak valid" });
      continue;
    }

    const slug = await makeUniqueSlug(data.name, slugs);

    toInsert.push({
      name: data.name,
      slug,
      owner: data.owner,
      categoryId,
      coverageAreaId,
      destinationId,
      address: data.address ?? null,
      phone: data.phone ?? null,
      estimatedCost: estimatedCost,
      latitude: latitude,
      longitude: longitude,
      description: data.description ?? null,
    });
  }

  let inserted = 0;
  if (toInsert.length > 0) {
    const result = await prisma.umkm.createMany({ data: toInsert, skipDuplicates: true });
    inserted = result.count;
  }

  return { inserted, total: rows.length, errors };
}

async function importAccommodations(
  rows: { rowNum: number; data: Record<string, string> }[]
): Promise<ImportResult> {
  const errors: ImportError[] = [];

  const existing = await prisma.accommodation.findMany({ select: { slug: true } });
  const slugs = new Set(existing.map((a) => a.slug));

  const toInsert: Prisma.AccommodationCreateManyInput[] = [];

  for (const { rowNum, data } of rows) {
    if (!data.name) {
      errors.push({ row: rowNum, field: "Nama Penginapan", message: "Wajib diisi" });
      continue;
    }

    const latitude = data.latitude ? parseFloat(data.latitude) : null;
    const longitude = data.longitude ? parseFloat(data.longitude) : null;
    const estimatedCost = data.estimatedCost ? parseFloat(data.estimatedCost) : null;

    if (data.latitude && isNaN(latitude!)) {
      errors.push({ row: rowNum, field: "Latitude", message: "Nilai tidak valid" });
      continue;
    }

    const slug = await makeUniqueSlug(data.name, slugs);

    toInsert.push({
      name: data.name,
      slug,
      address: data.address ?? null,
      city: data.city ?? null,
      province: data.province ?? null,
      phone: data.phone ?? null,
      website: data.website ?? null,
      estimatedCost: estimatedCost,
      latitude: latitude,
      longitude: longitude,
      description: data.description ? toTiptapJson(data.description) : undefined,
    });
  }

  let inserted = 0;
  if (toInsert.length > 0) {
    const result = await prisma.accommodation.createMany({ data: toInsert, skipDuplicates: true });
    inserted = result.count;
  }

  return { inserted, total: rows.length, errors };
}

async function importFacilities(
  rows: { rowNum: number; data: Record<string, string> }[]
): Promise<ImportResult> {
  const errors: ImportError[] = [];
  const toInsert: Prisma.HalalFacilityCreateManyInput[] = [];

  for (const { rowNum, data } of rows) {
    if (!data.name) {
      errors.push({ row: rowNum, field: "Nama Fasilitas", message: "Wajib diisi" });
      continue;
    }

    const weight = data.weight ? parseInt(data.weight, 10) : 0;
    const maxDistance = data.maxDistance ? parseFloat(data.maxDistance) : 5.0;

    if (data.weight && isNaN(weight)) {
      errors.push({ row: rowNum, field: "Bobot", message: "Harus berupa angka bulat" });
      continue;
    }
    if (data.maxDistance && isNaN(maxDistance)) {
      errors.push({ row: rowNum, field: "Jarak Maksimal", message: "Harus berupa angka desimal (contoh: 5.0)" });
      continue;
    }

    toInsert.push({
      name: data.name,
      description: data.description ?? null,
      facilityType: data.facilityType ?? null,
      weight,
      maxDistance,
    });
  }

  let inserted = 0;
  if (toInsert.length > 0) {
    const result = await prisma.halalFacility.createMany({ data: toInsert });
    inserted = result.count;
  }

  return { inserted, total: rows.length, errors };
}
