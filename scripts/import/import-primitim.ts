/* Import gabungan dataset_pritim (6 kabupaten/kota) via admin import-service.
 * Urutan: destinasi (semua file) -> umkm -> penginapan -> fasilitas,
 * agar relasi "Destinasi Terkait" UMKM ter-resolve.
 * Baris yang namanya (case-insensitive) sudah ada di DB dilewati agar idempoten.
 * Jalankan: npx tsx scripts/import/import-primitim.ts
 */
import fs from "node:fs";
import path from "node:path";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ExcelJS = require("exceljs");
import { prisma } from "../../lib/prisma";
import { parseAndImport, type ImportType } from "../../lib/services/import-service";

const FILES = [
    "import_data_Kab_Ciamis.xlsx",
    "import_data_Kab_Garut.xlsx",
    "import_data_Kab_Pangandaran.xlsx",
    "import_data_Kab_Tasikmalaya.xlsx",
    "import_data_Kota_Banjar.xlsx",
    "import_data_Kota_Tasikmalaya.xlsx",
];

const SHEET_OF: Record<ImportType, string> = {
    destination: "Destinasi",
    umkm: "UMKM",
    accommodation: "Penginapan",
    facility: "Fasilitas",
};

const TYPE_ORDER: ImportType[] = ["destination", "umkm", "accommodation", "facility"];

function cellText(v: unknown): string {
    if (v === null || v === undefined) return "";
    if (typeof v === "object") {
        const c = v as { text?: string; richText?: { text: string }[]; value?: unknown };
        if (Array.isArray(c.richText)) return c.richText.map((r) => r.text).join("");
        if (typeof c.text === "string") return c.text;
        if ("value" in c) return String(c.value ?? "").trim();
    }
    return String(v).trim();
}

async function loadExisting(): Promise<Record<ImportType, Set<string>>> {
    const [d, u, a, f] = await Promise.all([
        prisma.destination.findMany({ select: { name: true } }),
        prisma.umkm.findMany({ select: { name: true } }),
        prisma.accommodation.findMany({ select: { name: true } }),
        prisma.halalFacility.findMany({ select: { name: true } }),
    ]);
    const norm = (rows: { name: string }[]) => new Set(rows.map((r) => r.name.toLowerCase().trim()));
    return { destination: norm(d), umkm: norm(u), accommodation: norm(a), facility: norm(f) };
}

async function main() {
    const dir = path.join(process.cwd(), "dataset_pritim");
    for (const f of FILES) {
        if (!fs.existsSync(path.join(dir, f))) throw new Error(`File tidak ditemukan: ${f}`);
    }
    const existing = await loadExisting();
    const summary: Record<string, { inserted: number; skipped: number; errors: number }> = {};

    for (const type of TYPE_ORDER) {
        for (const file of FILES) {
            const key = `${file} :: ${type}`;
            const wb = new ExcelJS.Workbook();
            await wb.xlsx.readFile(path.join(dir, file));
            const ws = wb.getWorksheet(SHEET_OF[type]);
            if (!ws) {
                console.log(`${key}: sheet tidak ditemukan, dilewati`);
                continue;
            }
            const headerLen = ws.getRow(1).cellCount;
            const headers: string[] = [];
            for (let c = 1; c <= headerLen; c++) headers.push(cellText(ws.getRow(1).getCell(c).value));

            const kept: unknown[][] = [];
            let skipped = 0;
            const seen = new Set<string>();
            for (let r = 2; r <= ws.rowCount; r++) {
                const row = ws.getRow(r);
                const name = cellText(row.getCell(1).value).trim();
                if (!name) continue;
                const norm = name.toLowerCase();
                if (existing[type].has(norm) || seen.has(norm)) { skipped++; continue; }
                seen.add(norm);
                const vals: unknown[] = [];
                for (let c = 1; c <= headerLen; c++) vals.push(row.getCell(c).value);
                kept.push(vals);
            }

            if (kept.length === 0) {
                console.log(`${key}: 0 baris baru (${skipped} dilewati/sudah ada)`);
                summary[key] = { inserted: 0, skipped, errors: 0 };
                continue;
            }

            const tmp = new ExcelJS.Workbook();
            const dataSheet = tmp.addWorksheet("Data");
            dataSheet.addRow(headers);
            for (const vals of kept) dataSheet.addRow(vals);
            const buffer = Buffer.from(await tmp.xlsx.writeBuffer());
            const result = await parseAndImport(buffer, type);

            for (const vals of kept) existing[type].add(cellText(vals[0]).toLowerCase());
            summary[key] = { inserted: result.inserted, skipped, errors: result.errors.length };
            console.log(`${key}: inserted=${result.inserted}/${result.total} skipped=${skipped} errors=${result.errors.length}`);
            for (const e of result.errors.slice(0, 10)) {
                console.log(`    baris ${e.row} [${e.field}]: ${e.message}`);
            }
            if (result.errors.length > 10) console.log(`    ... +${result.errors.length - 10} error lain`);
        }
    }

    const umkmNullDest = await prisma.umkm.count({ where: { destinationId: null } });
    const umkmTotal = await prisma.umkm.count();
    console.log(`\nUMKM tanpa destinasi terkait: ${umkmNullDest}/${umkmTotal} (link tak dikenal -> null, by design)`);

    const tot = Object.values(summary).reduce(
        (a, s) => ({ inserted: a.inserted + s.inserted, skipped: a.skipped + s.skipped, errors: a.errors + s.errors }),
        { inserted: 0, skipped: 0, errors: 0 },
    );
    console.log(`TOTAL: inserted=${tot.inserted} skipped(sudah ada)=${tot.skipped} errors=${tot.errors}`);
}

main()
    .catch((e) => { console.error("IMPORT GAGAL:", e); process.exit(1); })
    .finally(() => prisma.$disconnect());
