import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/api-error";
import { umkmCertificationSchema } from "@/lib/validations/umkm.schema";
import { syncUmkmCertification } from "@/lib/services/umkm-service";

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
        const { validationStatus, surveyorNote, certification } = body;

        if (!validationStatus || !VALID_STATUSES.includes(validationStatus)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Status harus salah satu dari: APPROVED, REJECTED, REVISION",
                },
                { status: 400 },
            );
        }

        const parsedCertification =
            certification == null
                ? null
                : umkmCertificationSchema.safeParse(certification);

        if (parsedCertification && !parsedCertification.success) {
            return NextResponse.json(
                { success: false, message: "Data sertifikasi halal tidak valid" },
                { status: 400 },
            );
        }

        if (
            parsedCertification?.success &&
            parsedCertification.data.hasCertification &&
            !parsedCertification.data.certificateNo?.trim() &&
            !parsedCertification.data.documentUrl?.trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Isi nomor sertifikat atau unggah bukti sertifikat halal",
                },
                { status: 400 },
            );
        }

        await prisma.$transaction(async (tx) => {
            await tx.umkm.update({
                where: { id },
                data: {
                    validationStatus,
                    surveyorNote:
                        typeof surveyorNote === "string" ? surveyorNote : null,
                },
            });

            if (parsedCertification?.success) {
                await syncUmkmCertification(
                    tx,
                    id,
                    parsedCertification.data,
                );
            }
        });

        return NextResponse.json({
            success: true,
            message: "Status validasi berhasil diperbarui",
        });
    } catch (error: unknown) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code?: string }).code === "P2002"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Nomor sertifikat halal sudah digunakan UMKM lain",
                },
                { status: 400 },
            );
        }
        return NextResponse.json(
            { success: false, message: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
