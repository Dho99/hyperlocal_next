import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createReport, getPaginatedReports } from "@/lib/services/report-service";
import { getErrorMessage } from "@/lib/api-error";
import { createReportSchema } from "@/lib/validations/report.schema";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const result = await getPaginatedReports({
      limit: searchParams.get("limit")
        ? Number(searchParams.get("limit"))
        : undefined,
      cursor: searchParams.get("cursor") || undefined,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // We allow anonymous reports but link them if user is logged in
    const userId = session?.user?.id;

    const body = await request.json();
    const validated = createReportSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Data tidak valid", issues: validated.error.flatten() },
        { status: 400 },
      );
    }

    const report = await createReport(userId, validated.data);
    return NextResponse.json({ data: report }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
