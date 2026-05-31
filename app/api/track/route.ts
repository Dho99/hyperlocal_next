import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { userInteractionSchema } from "@/lib/validations/analytics.schema";
import { getErrorMessage } from "@/lib/api-error";
import { toggleBookmark, trackUserInteraction } from "@/lib/services/analytics-service";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const body = await request.json();
    const validated = userInteractionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { targetId, targetType, actionType } = validated.data;

    if (actionType === "BOOKMARK") {
      if (!session?.user.id) {
        return NextResponse.json(
          { error: "Silakan login terlebih dahulu untuk menyimpan favorit" },
          { status: 401 }
        );
      }

      const result = await toggleBookmark({
        userId: session.user.id,
        targetId,
        targetType,
      });

      if (targetType === "DESTINASI") {
        const existingDestInteract = await prisma.destinationInteraction.findFirst({
          where: {
            destinationId: targetId,
            userId: session.user.id,
            type: "SAVE",
          },
        });

        if (result.bookmarked && !existingDestInteract) {
          await prisma.destinationInteraction.create({
            data: {
              destinationId: targetId,
              userId: session.user.id,
              type: "SAVE",
              source: "bookmark_toggle",
            },
          });
        } else if (!result.bookmarked && existingDestInteract) {
          await prisma.destinationInteraction.delete({
            where: { id: existingDestInteract.id },
          });
        }
      }

      return NextResponse.json({ data: { bookmarked: result.bookmarked } });
    }

    await trackUserInteraction({
      userId: session?.user?.id,
      targetId,
      targetType,
      actionType,
    });

    if (targetType === "DESTINASI") {
      await prisma.destinationInteraction.create({
        data: {
          destinationId: targetId,
          userId: session?.user?.id,
          type: actionType === "CLICK_ROUTE" ? "ROUTE" : "CLICK",
          source: "cta_tracker",
        },
      });
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
