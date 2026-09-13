import ExcelJS from "exceljs";
import path from "path";
import slugify from "slugify";

export function createSlug(name: string): string {
  if (!name) return "";
  return slugify(name, { lower: true, strict: true, trim: true });
}

export function cleanString(val: any): string | null {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (!str || str.toLowerCase() === "tidak ditemukan online" || str === "-" || str.toLowerCase() === "n/a" || str.toLowerCase() === "null") {
    return null;
  }
  return str;
}

export function parseCoordinate(val: any): number | null {
  if (val === null || val === undefined) return null;
  const cleaned = cleanString(val);
  if (!cleaned) return null;
  const num = parseFloat(cleaned.replace(",", "."));
  if (isNaN(num)) return null;
  return num;
}

export function parseOpeningHours(rawText?: any, jamBuka?: any, jamTutup?: any): any {
  const raw = cleanString(rawText);
  const buka = cleanString(jamBuka);
  const tutup = cleanString(jamTutup);

  if (!raw && !buka && !tutup) return null;

  return {
    raw: raw || (buka && tutup ? `${buka} - ${tutup}` : null),
    jamBukaUtama: buka || null,
    jamTutupUtama: tutup || null,
    status: "TERVERIFIKASI"
  };
}

export async function readExcelSheet(fileName: string, sheetName: string | number): Promise<any[]> {
  const filePath = path.join(process.cwd(), "archives", fileName);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = typeof sheetName === "string" ? workbook.getWorksheet(sheetName) : workbook.worksheets[sheetName - 1];
  if (!worksheet) return [];

  const rows: any[] = [];
  let headerRowIndex = 1;

  for (let r = 1; r <= 5; r++) {
    const row = worksheet.getRow(r);
    let count = 0;
    row.eachCell({ includeEmpty: false }, () => count++);
    if (count >= 2) {
      headerRowIndex = r;
      break;
    }
  }

  const headers: string[] = [];
  const headerRow = worksheet.getRow(headerRowIndex);
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber] = cleanString(cell.value) || `col_${colNumber}`;
  });

  for (let r = headerRowIndex + 1; r <= worksheet.rowCount; r++) {
    const row = worksheet.getRow(r);
    const rowData: Record<string, any> = {};
    let hasValue = false;

    const colCount = Math.max(headers.length, 16);
    for (let col = 1; col < colCount; col++) {
      const header = headers[col];
      if (!header) continue;
      const cell = row.getCell(col);
      let val = cell.value as any;
      if (val && typeof val === "object" && "result" in val) {
        val = val.result;
      } else if (val && typeof val === "object" && "hyperlink" in val) {
        val = val.hyperlink;
      } else if (val && typeof val === "object" && "text" in val) {
        val = val.text;
      }
      rowData[header] = val;
      if (cleanString(val)) hasValue = true;
    }

    if (hasValue) {
      const firstHas = Object.values(rowData).some(v => cleanString(v)!== null && !String(v).startsWith("SAFAR"));
      if (firstHas) rows.push(rowData);
    }
  }

  return rows;
}
