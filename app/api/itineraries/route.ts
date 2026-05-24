import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createItinerary, getUserItineraries } from "@/lib/services/itinerary-service";
import { createItinerarySchema } from "@/lib/validations/itinerary.schema";
import { getErrorMessage } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const itineraries = await getUserItineraries(session.user.id);
    return NextResponse.json({ data: itineraries }, { status: 200 });
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

    const body = await request.json();
    const validated = createItinerarySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.flatten() },
        { status: 400 }
      );
    }

    const itinerary = await createItinerary({
      userId: session?.user.id,
      ...validated.data,
      startDate: validated.data.startDate ? new Date(validated.data.startDate) : undefined,
      endDate: validated.data.endDate ? new Date(validated.data.endDate) : undefined,
    });

    return NextResponse.json({ data: itinerary }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
