import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateCertificationSchema } from "@/lib/validations/halal-certification.schema";
import { Prisma } from "@/lib/generated/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const certification = await prisma.halalCertification.findUnique({
            where: { id },
            include: {
                umkm: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!certification) {
            return NextResponse.json(
                { success: false, message: "Sertifikasi tidak ditemukan" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: certification,
        });
    } catch (error) {
        console.error("GET certification [id] error:", error);
        return NextResponse.json(
            { success: false, message: "Gagal memuat data sertifikasi" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const validatedData = updateCertificationSchema.parse(body);

        const certification = await prisma.halalCertification.update({
            where: { id },
            data: validatedData,
            include: {
                umkm: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: "Sertifikasi berhasil diperbarui",
            data: certification,
        });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return NextResponse.json(
                { success: false, message: "Validasi gagal", errors: error.errors },
                { status: 400 }
            );
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return NextResponse.json(
                    { success: false, message: "Nomor sertifikat sudah digunakan" },
                    { status: 409 }
                );
            }
        }

        console.error("PATCH certification [id] error:", error);
        return NextResponse.json(
            { success: false, message: "Gagal memperbarui sertifikasi" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.halalCertification.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Sertifikasi berhasil dihapus",
        });
    } catch (error) {
        console.error("DELETE certification [id] error:", error);
        return NextResponse.json(
            { success: false, message: "Gagal menghapus sertifikasi" },
            { status: 500 }
        );
    }
}
