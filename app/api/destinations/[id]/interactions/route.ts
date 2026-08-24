import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { trackInteraction } from "@/lib/services/analytics-service";
import { interactionSchema } from "@/lib/validations/analytics.schema";
import { getErrorMessage } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const destination = await prisma.destination.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true },
    });
    if (!destination) {
      return NextResponse.json(
        { error: "Destinasi tidak ditemukan" },
        { status: 404 }
      );
    }
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
      destinationId: destination.id,
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
