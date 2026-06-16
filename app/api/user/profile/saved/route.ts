import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/api-error";
import { withCursorPagination } from "@/lib/pagination/cursorPagination";

interface SavedItem {
  id: string;
  name: string;
  slug: string;
  type: "DESTINASI" | "UMKM";
  subtitle: string;
  imageUrl: string | null;
  savedAt: Date;
}

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);

    const result = await withCursorPagination<SavedItem>(
      async (take, cursor, skip) => {
        const bookmarks = await prisma.userInteraction.findMany({
          where: { userId, actionType: "BOOKMARK" },
          select: {
            id: true,
            targetId: true,
            targetType: true,
            createdAt: true,
          },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take,
          skip,
          cursor: cursor ? { id: cursor } : undefined,
        });

        if (bookmarks.length === 0) return [];

        const destinationIds = bookmarks
          .filter((b) => b.targetType === "DESTINASI")
          .map((b) => b.targetId);
        const umkmIds = bookmarks
          .filter((b) => b.targetType === "UMKM")
          .map((b) => b.targetId);

        const [destinations, umkms] = await Promise.all([
          prisma.destination.findMany({
            where: { id: { in: destinationIds } },
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
          }),
          prisma.umkm.findMany({
            where: { id: { in: umkmIds } },
            select: {
              id: true,
              name: true,
              slug: true,
              address: true,
              images: {
                where: { isPrimary: true },
                take: 1,
                select: { imageUrl: true },
              },
              destination: { select: { city: true } },
            },
          }),
        ]);

        const destMap = new Map(destinations.map((d) => [d.id, d]));
        const umkmMap = new Map(umkms.map((u) => [u.id, u]));

        // Preserve bookmark order; cursor id is the interaction id.
        const items: SavedItem[] = [];
        for (const b of bookmarks) {
          if (b.targetType === "DESTINASI") {
            const d = destMap.get(b.targetId);
            if (!d) continue;
            items.push({
              id: b.id,
              name: d.name,
              slug: d.slug,
              type: "DESTINASI",
              subtitle: d.city || "-",
              imageUrl: d.images[0]?.imageUrl ?? null,
              savedAt: b.createdAt,
            });
          } else if (b.targetType === "UMKM") {
            const u = umkmMap.get(b.targetId);
            if (!u) continue;
            items.push({
              id: b.id,
              name: u.name,
              slug: u.slug,
              type: "UMKM",
              subtitle: u.destination?.city || u.address || "-",
              imageUrl: u.images[0]?.imageUrl ?? null,
              savedAt: b.createdAt,
            });
          }
        }
        return items;
      },
      {
        limit: searchParams.get("limit")
          ? Number(searchParams.get("limit"))
          : undefined,
        cursor: searchParams.get("cursor") || undefined,
      },
      "Saved items fetched successfully",
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
