import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmarks = await prisma.userInteraction.findMany({
      where: {
        userId: session.user.id,
        actionType: "BOOKMARK",
        targetType: "DESTINASI",
      },
      select: {
        targetId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (bookmarks.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const targetIds = bookmarks.map((b) => b.targetId);
    const savedAtMap = Object.fromEntries(
      bookmarks.map((b) => [b.targetId, b.createdAt])
    );

    const destinations = await prisma.destination.findMany({
      where: { id: { in: targetIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { imageUrl: true },
        },
      },
    });

    const result = destinations
      .map((d) => ({
        id: d.id,
        name: d.name,
        slug: d.slug,
        city: d.city || "-",
        imageUrl: d.images[0]?.imageUrl ?? null,
        savedAt: savedAtMap[d.id],
      }))
      .sort(
        (a, b) =>
          new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      );

    return NextResponse.json({ data: result });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
