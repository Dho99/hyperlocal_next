import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export type ReportCategory =
  | "destinations"
  | "umkms"
  | "coverage-areas"
  | "accommodations"
  | "reviews"
  | "interactions";

export type ExportFormat = "csv" | "xlsx" | "pdf";

export interface GenerateReportParams {
  startDate: string;
  endDate: string;
  categories: ReportCategory[];
  format: ExportFormat;
}

export interface ReportRow {
  [key: string]: string | number | boolean | null | undefined;
}

export interface ReportData {
  category: ReportCategory;
  label: string;
  columns: { key: string; label: string }[];
  rows: ReportRow[];
}

async function getDestinationsData(startDate: Date, endDate: Date): Promise<ReportData> {
  const data = await prisma.destination.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    include: {
      category: { select: { name: true } },
      coverageArea: { select: { name: true } },
      _count: { select: { reviews: true, images: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    category: "destinations",
    label: "Data Destinasi",
    columns: [
      { key: "name", label: "Nama" },
      { key: "slug", label: "Slug" },
      { key: "address", label: "Alamat" },
      { key: "city", label: "Kota" },
      { key: "province", label: "Provinsi" },
      { key: "latitude", label: "Latitude" },
      { key: "longitude", label: "Longitude" },
      { key: "status", label: "Status" },
      { key: "rating", label: "Rating" },
      { key: "reviewCount", label: "Jumlah Ulasan" },
      { key: "halalScore", label: "Skor Halal" },
      { key: "validatedScore", label: "Skor Validasi" },
      { key: "category", label: "Kategori" },
      { key: "coverageArea", label: "Wilayah Cakupan" },
      { key: "externalSource", label: "Sumber Data" },
      { key: "createdAt", label: "Tanggal Dibuat" },
      { key: "updatedAt", label: "Terakhir Diupdate" },
    ],
    rows: data.map((d) => ({
      name: d.name,
      slug: d.slug,
      address: d.address ?? "",
      city: d.city ?? "",
      province: d.province ?? "",
      latitude: d.latitude ? Number(d.latitude) : "",
      longitude: d.longitude ? Number(d.longitude) : "",
      status: d.status,
      rating: d.rating ?? "",
      reviewCount: d.reviewCount ?? 0,
      halalScore: d.halalScore ?? "",
      validatedScore: d.validatedScore ?? "",
      category: d.category.name,
      coverageArea: d.coverageArea?.name ?? "",
      externalSource: d.externalSource ?? "",
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    })),
  };
}

async function getUmkmData(startDate: Date, endDate: Date): Promise<ReportData> {
  const data = await prisma.umkm.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    include: {
      destination: { select: { name: true } },
      category: { select: { name: true } },
      coverageArea: { select: { name: true } },
      certifications: { select: { status: true } },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    category: "umkms",
    label: "Data UMKM",
    columns: [
      { key: "name", label: "Nama" },
      { key: "slug", label: "Slug" },
      { key: "owner", label: "Pemilik" },
      { key: "address", label: "Alamat" },
      { key: "phone", label: "Telepon" },
      { key: "latitude", label: "Latitude" },
      { key: "longitude", label: "Longitude" },
      { key: "rating", label: "Rating" },
      { key: "reviewCount", label: "Jumlah Ulasan" },
      { key: "validationStatus", label: "Status Validasi" },
      { key: "surveyorNote", label: "Catatan Surveyor" },
      { key: "certificationCount", label: "Jumlah Sertifikasi" },
      { key: "destination", label: "Destinasi Terkait" },
      { key: "category", label: "Kategori" },
      { key: "coverageArea", label: "Wilayah Cakupan" },
      { key: "externalSource", label: "Sumber Data" },
      { key: "createdAt", label: "Tanggal Dibuat" },
      { key: "updatedAt", label: "Terakhir Diupdate" },
    ],
    rows: data.map((u) => ({
      name: u.name,
      slug: u.slug,
      owner: u.owner,
      address: u.address ?? "",
      phone: u.phone ?? "",
      latitude: u.latitude ? Number(u.latitude) : "",
      longitude: u.longitude ? Number(u.longitude) : "",
      rating: u.rating ?? "",
      reviewCount: u.reviewCount ?? 0,
      validationStatus: u.validationStatus,
      surveyorNote: u.surveyorNote ?? "",
      certificationCount: u.certifications.filter((c) => c.status === "VALID").length,
      destination: u.destination?.name ?? "",
      category: u.category?.name ?? "",
      coverageArea: u.coverageArea?.name ?? "",
      externalSource: u.externalSource ?? "",
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    })),
  };
}

async function getCoverageAreasData(startDate: Date, endDate: Date): Promise<ReportData> {
  const data = await prisma.coverageArea.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    include: {
      _count: { select: { destinations: true, umkms: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    category: "coverage-areas",
    label: "Data Cakupan Wilayah",
    columns: [
      { key: "name", label: "Nama Wilayah" },
      { key: "level", label: "Tingkat" },
      { key: "isActive", label: "Aktif" },
      { key: "colorHex", label: "Warna" },
      { key: "destinationCount", label: "Jumlah Destinasi" },
      { key: "umkmCount", label: "Jumlah UMKM" },
      { key: "createdAt", label: "Tanggal Dibuat" },
      { key: "updatedAt", label: "Terakhir Diupdate" },
    ],
    rows: data.map((c) => ({
      name: c.name,
      level: c.level,
      isActive: c.isActive ? "Ya" : "Tidak",
      colorHex: c.colorHex ?? "",
      destinationCount: c._count.destinations,
      umkmCount: c._count.umkms,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
  };
}

async function getAccommodationsData(startDate: Date, endDate: Date): Promise<ReportData> {
  const data = await prisma.accommodation.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    category: "accommodations",
    label: "Data Akomodasi",
    columns: [
      { key: "name", label: "Nama" },
      { key: "slug", label: "Slug" },
      { key: "address", label: "Alamat" },
      { key: "city", label: "Kota" },
      { key: "province", label: "Provinsi" },
      { key: "phone", label: "Telepon" },
      { key: "website", label: "Website" },
      { key: "rating", label: "Rating" },
      { key: "reviewCount", label: "Jumlah Ulasan" },
      { key: "validationStatus", label: "Status Validasi" },
      { key: "validatedScore", label: "Skor Validasi" },
      { key: "surveyorNote", label: "Catatan Surveyor" },
      { key: "latitude", label: "Latitude" },
      { key: "longitude", label: "Longitude" },
      { key: "externalSource", label: "Sumber Data" },
      { key: "createdAt", label: "Tanggal Dibuat" },
      { key: "updatedAt", label: "Terakhir Diupdate" },
    ],
    rows: data.map((a) => ({
      name: a.name,
      slug: a.slug,
      address: a.address ?? "",
      city: a.city ?? "",
      province: a.province ?? "",
      phone: a.phone ?? "",
      website: a.website ?? "",
      rating: a.rating ?? "",
      reviewCount: a.reviewCount ?? 0,
      validationStatus: a.validationStatus,
      validatedScore: a.validatedScore ?? "",
      surveyorNote: a.surveyorNote ?? "",
      latitude: a.latitude ? Number(a.latitude) : "",
      longitude: a.longitude ? Number(a.longitude) : "",
      externalSource: a.externalSource ?? "",
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
  };
}

async function getReviewsData(startDate: Date, endDate: Date): Promise<ReportData> {
  const data = await prisma.review.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    include: {
      user: { select: { name: true, email: true } },
      destination: { select: { name: true } },
      umkm: { select: { name: true } },
      accommodation: { select: { name: true } },
      sentiment: { select: { label: true, score: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    category: "reviews",
    label: "Data Ulasan & Sentimen",
    columns: [
      { key: "targetName", label: "Target" },
      { key: "targetType", label: "Tipe Target" },
      { key: "rating", label: "Rating" },
      { key: "comment", label: "Komentar" },
      { key: "userName", label: "Nama Pengguna" },
      { key: "userEmail", label: "Email Pengguna" },
      { key: "sentimentLabel", label: "Label Sentimen" },
      { key: "sentimentScore", label: "Skor Sentimen" },
      { key: "createdAt", label: "Tanggal Dibuat" },
    ],
    rows: data.map((r) => ({
      targetName: r.destination?.name ?? r.umkm?.name ?? r.accommodation?.name ?? "",
      targetType: r.destination ? "Destinasi" : r.umkm ? "UMKM" : "Akomodasi",
      rating: r.rating,
      comment: r.comment ?? "",
      userName: r.user.name,
      userEmail: r.user.email,
      sentimentLabel: r.sentiment?.label ?? "",
      sentimentScore: r.sentiment?.score ?? "",
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

async function getInteractionsData(startDate: Date, endDate: Date): Promise<ReportData> {
  const destinationInteractions = await prisma.destinationInteraction.groupBy({
    by: ["destinationId", "type"],
    _count: { _all: true },
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
  });

  const destIds = [...new Set(destinationInteractions.map((i) => i.destinationId))];
  const destinations = destIds.length > 0
    ? await prisma.destination.findMany({
        where: { id: { in: destIds } },
        select: { id: true, name: true },
      })
    : [];
  const destMap = new Map(destinations.map((d) => [d.id, d.name]));

  const interactionMap = new Map<string, Record<string, number>>();
  for (const i of destinationInteractions) {
    if (!interactionMap.has(i.destinationId)) {
      interactionMap.set(i.destinationId, { VIEW: 0, SEARCH: 0, CLICK: 0, SAVE: 0, SHARE: 0, ROUTE: 0 });
    }
    const entry = interactionMap.get(i.destinationId)!;
    entry[i.type] = i._count._all;
  }

  const userInteractions = await prisma.userInteraction.groupBy({
    by: ["targetId", "targetType", "actionType"],
    _count: { _all: true },
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
  });

  const bookmarkMap = new Map<string, number>();
  const whatsappMap = new Map<string, number>();
  const routeClickMap = new Map<string, number>();

  for (const ui of userInteractions) {
    if (ui.actionType === "BOOKMARK") {
      bookmarkMap.set(ui.targetId, (bookmarkMap.get(ui.targetId) ?? 0) + ui._count._all);
    } else if (ui.actionType === "CLICK_WHATSAPP") {
      whatsappMap.set(ui.targetId, (whatsappMap.get(ui.targetId) ?? 0) + ui._count._all);
    } else if (ui.actionType === "CLICK_ROUTE") {
      routeClickMap.set(ui.targetId, (routeClickMap.get(ui.targetId) ?? 0) + ui._count._all);
    }
  }

  const rows: ReportRow[] = [];
  for (const [destId, counts] of interactionMap) {
    rows.push({
      targetName: destMap.get(destId) ?? destId,
      targetType: "Destinasi",
      views: counts.VIEW,
      searches: counts.SEARCH,
      clicks: counts.CLICK,
      saves: counts.SAVE,
      shares: counts.SHARE,
      routes: counts.ROUTE,
      bookmarks: bookmarkMap.get(destId) ?? 0,
      whatsappClicks: whatsappMap.get(destId) ?? 0,
      routeClicks: routeClickMap.get(destId) ?? 0,
    });
  }

  return {
    category: "interactions",
    label: "Data Interaksi",
    columns: [
      { key: "targetName", label: "Nama Target" },
      { key: "targetType", label: "Tipe Target" },
      { key: "views", label: "Dilihat" },
      { key: "searches", label: "Pencarian" },
      { key: "clicks", label: "Klik" },
      { key: "saves", label: "Disimpan" },
      { key: "shares", label: "Dibagikan" },
      { key: "routes", label: "Rute" },
      { key: "bookmarks", label: "Bookmark" },
      { key: "whatsappClicks", label: "Klik WhatsApp" },
      { key: "routeClicks", label: "Klik Rute" },
    ],
    rows,
  };
}

const categoryQueryMap: Record<ReportCategory, (start: Date, end: Date) => Promise<ReportData>> = {
  destinations: getDestinationsData,
  umkms: getUmkmData,
  "coverage-areas": getCoverageAreasData,
  accommodations: getAccommodationsData,
  reviews: getReviewsData,
  interactions: getInteractionsData,
};

export async function getReportData(
  startDate: string,
  endDate: string,
  categories: ReportCategory[]
): Promise<ReportData[]> {
  const start = startOfDay(new Date(startDate));
  const end = endOfDay(new Date(endDate));

  const results = await Promise.all(
    categories.map((cat) => {
      const queryFn = categoryQueryMap[cat];
      if (!queryFn) throw new Error(`Unknown category: ${cat}`);
      return queryFn(start, end);
    })
  );

  return results;
}

export async function generateCsv(data: ReportData[]): Promise<string> {
  const allRows: string[] = [];

  for (const section of data) {
    allRows.push(`"${section.label}"`);
    allRows.push(section.columns.map((c) => `"${c.label}"`).join(","));

    for (const row of section.rows) {
      const values = section.columns.map((col) => {
        const val = row[col.key];
        if (val === null || val === undefined) return "";
        const str = String(val);
        return `"${str.replace(/"/g, '""')}"`;
      });
      allRows.push(values.join(","));
    }

    allRows.push("");
  }

  return allRows.join("\n");
}

export async function generateExcel(data: ReportData[]): Promise<Buffer> {
  const ExcelJS = require("exceljs");
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Admin";
  workbook.created = new Date();

  for (const section of data) {
    const sheetName = section.label.substring(0, 31);
    const sheet = workbook.addWorksheet(sheetName);

    const headerRow = sheet.addRow(section.columns.map((c) => c.label));
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF065F46" },
    };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.height = 24;

    for (const row of section.rows) {
      const values = section.columns.map((col) => {
        const val = row[col.key];
        if (val === null || val === undefined) return "";
        return val;
      });
      sheet.addRow(values);
    }

    sheet.columns.forEach((column: { width?: number }, i: number) => {
      let maxLength = section.columns[i]?.label.length ?? 10;
      for (const row of section.rows) {
        const val = row[section.columns[i]?.key ?? ""];
        if (val) {
          maxLength = Math.max(maxLength, String(val).length);
        }
      }
      column.width = Math.min(maxLength + 3, 50);
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function generateReport(
  params: GenerateReportParams
): Promise<{ data: Buffer; contentType: string; filename: string }> {
  const reportData = await getReportData(params.startDate, params.endDate, params.categories);
  const dateStr = new Date().toISOString().split("T")[0];

  switch (params.format) {
    case "csv": {
      const csvContent = await generateCsv(reportData);
      return {
        data: Buffer.from(csvContent, "utf-8"),
        contentType: "text/csv; charset=utf-8",
        filename: `laporan-halal-tourism-${dateStr}.csv`,
      };
    }
    case "xlsx": {
      const buffer = await generateExcel(reportData);
      return {
        data: buffer,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename: `laporan-halal-tourism-${dateStr}.xlsx`,
      };
    }
    default: {
      throw new Error(`Unsupported format: ${params.format}`);
    }
  }
}
