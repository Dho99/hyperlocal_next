import { NextResponse } from "next/server";
import { generateItineraryRecommendation } from "@/lib/services/itinerary-service";
import { recommendItinerarySchema } from "@/lib/validations/itinerary.schema";
import { getErrorMessage } from "@/lib/api-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = recommendItinerarySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.flatten() },
        { status: 400 }
      );
    }

    const recommendation = await generateItineraryRecommendation(validated.data);
    return NextResponse.json({ data: recommendation }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
