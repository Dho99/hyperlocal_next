import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { parseAndImport, type ImportType } from "@/lib/services/import-service";

const VALID_TYPES: ImportType[] = ["destination", "umkm", "accommodation", "facility"];

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as ImportType | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }
    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Tipe tidak valid. Pilih: destination, umkm, atau accommodation" },
        { status: 400 }
      );
    }

    const allowedMime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (file.type !== allowedMime && !file.name.endsWith(".xlsx")) {
      return NextResponse.json({ error: "Hanya file .xlsx yang diterima" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Ukuran file maksimal 10 MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await parseAndImport(buffer, type);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[BULK_IMPORT]", error);
    return NextResponse.json({ error: "Gagal memproses file import" }, { status: 500 });
  }
}
