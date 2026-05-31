import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { updateReportStatus, getReportById } from "@/lib/services/report-service";
import { getErrorMessage } from "@/lib/api-error";
import { updateReportStatusSchema } from "@/lib/validations/report.schema";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateReportStatusSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Data tidak valid", issues: validated.error.flatten() },
        { status: 400 },
      );
    }

    const report = await updateReportStatus(id, validated.data);
    return NextResponse.json({ data: report });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const report = await getReportById(id);

    if (!report) {
      return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: report });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
