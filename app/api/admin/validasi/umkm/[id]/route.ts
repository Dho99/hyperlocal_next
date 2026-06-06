import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/api-error";

const VALID_STATUSES = ["APPROVED", "REJECTED", "REVISION"];

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        const existing = await prisma.umkm.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json(
                { success: false, message: "UMKM tidak ditemukan" },
                { status: 404 },
            );
        }

        const body = await request.json();
        const { validationStatus, surveyorNote } = body;

        if (!validationStatus || !VALID_STATUSES.includes(validationStatus)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Status harus salah satu dari: APPROVED, REJECTED, REVISION",
                },
                { status: 400 },
            );
        }

        await prisma.umkm.update({
            where: { id },
            data: {
                validationStatus,
                surveyorNote: typeof surveyorNote === "string" ? surveyorNote : null,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Status validasi berhasil diperbarui",
        });
    } catch (error: unknown) {
        return NextResponse.json(
            { success: false, message: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
