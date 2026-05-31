import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/api-error";

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;

        const itinerary = await prisma.itinerary.findUnique({
            where: { id },
            select: { userId: true },
        });

        if (!itinerary) {
            return NextResponse.json(
                { error: "Rencana tidak ditemukan" },
                { status: 404 },
            );
        }

        if (itinerary.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 },
            );
        }

        await prisma.itinerary.delete({ where: { id } });

        return NextResponse.json(
            { message: "Rencana berhasil dihapus" },
            { status: 200 },
        );
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
