import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getHalalReadinessDashboard } from "@/lib/services/analytics-service";
import { halalReadinessQuerySchema } from "@/lib/validations/analytics.schema";
import { getErrorMessage } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = {
      regionType: searchParams.get("regionType") || "city",
    };

    const validated = halalReadinessQuerySchema.safeParse(query);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", issues: validated.error.flatten() },
        { status: 400 }
      );
    }

    const dashboard = await getHalalReadinessDashboard(validated.data.regionType);
    return NextResponse.json({ data: dashboard }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
