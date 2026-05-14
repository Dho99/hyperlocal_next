import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getDestinations, createDestination } from "@/lib/services/destination-service";
import { destinationSchema } from "@/lib/validations/destination.schema";
import { getErrorMessage } from "@/lib/api-error";

export async function GET() {
  try {
    const destinations = await getDestinations();
    return NextResponse.json({ data: destinations }, { status: 200 });
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

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = destinationSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Data tidak valid", issues: validated.error.flatten() },
        { status: 400 }
      );
    }

    const destination = await createDestination(validated.data);
    return NextResponse.json({ data: destination }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
