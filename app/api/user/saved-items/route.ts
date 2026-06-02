import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { savedItemSchema } from "@/lib/validations/saved-item.schema";
import { getErrorMessage } from "@/lib/api-error";

async function resolveSlugToId(
    slug: string,
    targetType: "DESTINASI" | "UMKM",
): Promise<string | null> {
    if (targetType === "DESTINASI") {
        const dest = await prisma.destination.findUnique({
            where: { slug },
            select: { id: true },
        });
        return dest?.id ?? null;
    }
    const umkm = await prisma.umkm.findUnique({
        where: { slug },
        select: { id: true },
    });
    return umkm?.id ?? null;
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user.id) {
            return NextResponse.json({ data: {} });
        }

        const targetSlug = request.nextUrl.searchParams.get("targetSlug");
        if (!targetSlug) {
            return NextResponse.json({ data: {} });
        }

        const slugs = targetSlug.split(",").filter(Boolean);

        const lookup = await Promise.all(
            slugs.map(async (slug) => {
                const id = await resolveSlugToId(slug, "DESTINASI");
                if (id) return { slug, id, targetType: "DESTINASI" as const };
                const id2 = await resolveSlugToId(slug, "UMKM");
                if (id2) return { slug, id: id2, targetType: "UMKM" as const };
                return null;
            }),
        );

        const resolved = lookup.filter(
            (r): r is { slug: string; id: string; targetType: "DESTINASI" | "UMKM" } =>
                r !== null,
        );

        const ids = resolved.map((r) => r.id);

        const bookmarks = await prisma.userInteraction.findMany({
            where: {
                userId: session.user.id,
                targetId: { in: ids },
                actionType: "BOOKMARK",
            },
            select: { targetId: true },
        });

        const bookmarkSet = new Set(bookmarks.map((b) => b.targetId));
        const data: Record<string, boolean> = {};
        for (const r of resolved) {
            data[r.slug] = bookmarkSet.has(r.id);
        }

        return NextResponse.json({ data });
    } catch (error: unknown) {
        console.error("SAVED_ITEM_CRITICAL_ERROR:", error);
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user.id) {
            return NextResponse.json(
                {
                    error: "Silakan login terlebih dahulu untuk menyimpan favorit",
                },
                { status: 401 },
            );
        }

        const body = await request.json();
        const validated = savedItemSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: "Invalid data", issues: validated.error.flatten() },
                { status: 400 },
            );
        }

        const { targetSlug, targetType } = validated.data;

        const targetId = await resolveSlugToId(targetSlug, targetType);
        if (!targetId) {
            return NextResponse.json(
                {
                    error:
                        targetType === "DESTINASI"
                            ? "Destinasi tidak ditemukan"
                            : "UMKM tidak ditemukan",
                },
                { status: 404 },
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            const existing = await tx.userInteraction.findFirst({
                where: {
                    userId: session.user.id,
                    targetId,
                    targetType,
                    actionType: "BOOKMARK",
                },
            });

            if (existing) {
                await tx.userInteraction.delete({ where: { id: existing.id } });

                if (targetType === "DESTINASI") {
                    const destInteract =
                        await tx.destinationInteraction.findFirst({
                            where: {
                                destinationId: targetId,
                                userId: session.user.id,
                                type: "SAVE",
                            },
                        });
                    if (destInteract) {
                        await tx.destinationInteraction.delete({
                            where: { id: destInteract.id },
                        });
                    }
                }

                return { bookmarked: false };
            }

            await tx.userInteraction.create({
                data: {
                    userId: session.user.id,
                    targetId,
                    targetType,
                    actionType: "BOOKMARK",
                },
            });

            if (targetType === "DESTINASI") {
                await tx.destinationInteraction.create({
                    data: {
                        destinationId: targetId,
                        userId: session.user.id,
                        type: "SAVE",
                        source: "bookmark_toggle",
                    },
                });
            }

            return { bookmarked: true };
        });

        return NextResponse.json({ data: result });
    } catch (error: unknown) {
        console.error("SAVED_ITEM_CRITICAL_ERROR:", error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2003") {
                return NextResponse.json(
                    { error: "Item yang direferensikan tidak ditemukan" },
                    { status: 400 },
                );
            }
        }

        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
