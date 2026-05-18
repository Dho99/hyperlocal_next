import { NextResponse } from "next/server";
import { getHottestDestinations } from "@/lib/services/analytics-service";
import { hottestQuerySchema } from "@/lib/validations/analytics.schema";
import { getErrorMessage } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = {
      period: searchParams.get("period") || "weekly",
      limit: searchParams.get("limit") || 10,
    };

    const validated = hottestQuerySchema.safeParse(query);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", issues: validated.error.flatten() },
        { status: 400 }
      );
    }

    const destinations = await getHottestDestinations(validated.data);
    return NextResponse.json({ data: destinations }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
