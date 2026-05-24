import { NextResponse } from "next/server";
import { getPaginatedReviews } from "@/lib/services/review-service";
import { getErrorMessage } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;
    const cursor = searchParams.get("cursor") || undefined;
    const destinationId = searchParams.get("destinationId") || undefined;
    const umkmId = searchParams.get("umkmId") || undefined;
    const userId = searchParams.get("userId") || undefined;

    const result = await getPaginatedReviews({ limit, cursor, destinationId, umkmId, userId });
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
