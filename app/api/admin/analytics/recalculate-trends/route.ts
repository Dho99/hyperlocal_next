import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { recalculateTrends } from "@/lib/services/analytics-service";
import { trendRecalculateSchema } from "@/lib/validations/analytics.schema";
import { getErrorMessage } from "@/lib/api-error";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const validated = trendRecalculateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.flatten() },
        { status: 400 }
      );
    }

    const processed = await recalculateTrends(validated.data);
    return NextResponse.json({ data: { processed } }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
