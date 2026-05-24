import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { trackInteraction } from "@/lib/services/analytics-service";
import { interactionSchema } from "@/lib/validations/analytics.schema";
import { getErrorMessage } from "@/lib/api-error";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const body = await request.json();
    const validated = interactionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.flatten() },
        { status: 400 }
      );
    }

    const interaction = await trackInteraction({
      destinationId: id,
      userId: session?.user.id,
      ...validated.data,
    });

    return NextResponse.json({ data: interaction }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
