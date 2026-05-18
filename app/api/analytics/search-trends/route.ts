import { NextResponse } from "next/server";
import { getSearchTrends } from "@/lib/services/analytics-service";
import { searchTrendQuerySchema } from "@/lib/validations/analytics.schema";
import { getErrorMessage } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = {
      period: searchParams.get("period") || "weekly",
      limit: searchParams.get("limit") || 20,
    };

    const validated = searchTrendQuerySchema.safeParse(query);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", issues: validated.error.flatten() },
        { status: 400 }
      );
    }

    const trends = await getSearchTrends(validated.data);
    return NextResponse.json({ data: trends }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
