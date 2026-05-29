import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createReview, getPaginatedReviews } from "@/lib/services/review-service";
import { getErrorMessage } from "@/lib/api-error";
import { createReviewSchema } from "@/lib/validations/review.schema";

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

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Login diperlukan untuk memberi rating" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const validated = createReviewSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Data tidak valid", issues: validated.error.flatten() },
        { status: 400 },
      );
    }

    const review = await createReview(session.user.id, validated.data);
    return NextResponse.json({ data: review }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
