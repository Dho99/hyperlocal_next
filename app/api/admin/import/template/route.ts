import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generateTemplate, type ImportType } from "@/lib/services/import-service";

const VALID_TYPES: ImportType[] = ["destination", "umkm", "accommodation"];

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as ImportType | null;

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Parameter 'type' harus salah satu dari: destination, umkm, accommodation" },
        { status: 400 }
      );
    }

    const [categories, coverageAreas] = await Promise.all([
      type !== "accommodation"
        ? prisma.category.findMany({
            where: {
              type:
                type === "destination"
                  ? "DESTINATION"
                  : "UMKM",
            },
            select: { name: true },
            orderBy: { name: "asc" },
          })
        : [],
      prisma.coverageArea.findMany({
        where: { isActive: true },
        select: { name: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const buffer = await generateTemplate(type, categories, coverageAreas);

    const typeLabel: Record<ImportType, string> = {
      destination: "destinasi",
      umkm: "umkm",
      accommodation: "penginapan",
    };

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="template-import-${typeLabel[type]}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[IMPORT_TEMPLATE]", error);
    return NextResponse.json({ error: "Gagal membuat template" }, { status: 500 });
  }
}
