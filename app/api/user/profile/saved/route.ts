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
      },
      select: {
        targetId: true,
        targetType: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (bookmarks.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const destinationIds = bookmarks
      .filter((b) => b.targetType === "DESTINASI")
      .map((b) => b.targetId);
    
    const umkmIds = bookmarks
      .filter((b) => b.targetType === "UMKM")
      .map((b) => b.targetId);

    const savedAtMap = Object.fromEntries(
      bookmarks.map((b) => [b.targetId, b.createdAt])
    );
    
    const typeMap = Object.fromEntries(
      bookmarks.map((b) => [b.targetId, b.targetType])
    );

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
          destination: {
            select: { city: true }
          }
        },
      })
    ]);

    const formattedDestinations = destinations.map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      type: "DESTINASI",
      subtitle: d.city || "-",
      imageUrl: d.images[0]?.imageUrl ?? null,
      savedAt: savedAtMap[d.id],
    }));

    const formattedUmkms = umkms.map((u) => ({
      id: u.id,
      name: u.name,
      slug: u.slug,
      type: "UMKM",
      subtitle: u.destination?.city || u.address || "-",
      imageUrl: u.images[0]?.imageUrl ?? null,
      savedAt: savedAtMap[u.id],
    }));

    const result = [...formattedDestinations, ...formattedUmkms].sort(
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
