import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCursorPagination } from "@/lib/pagination/cursorPagination";
import { createCertificationSchema } from "@/lib/validations/halal-certification.schema";
import { Prisma } from "@/lib/generated/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "10");
        const cursor = searchParams.get("cursor");
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") as any;

        const response = await withCursorPagination(
            async (take, cursor, skip) => {
                return prisma.halalCertification.findMany({
                    take,
                    skip,
                    cursor: cursor ? { id: cursor } : undefined,
                    where: {
                        OR: [
                            { certificateNo: { contains: search, mode: "insensitive" } },
                            { issuer: { contains: search, mode: "insensitive" } },
                            { umkm: { name: { contains: search, mode: "insensitive" } } },
                        ],
                        status: status || undefined,
                    },
                    orderBy: { createdAt: "desc" },
                    include: {
                        umkm: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });
            },
            { limit, cursor },
            "Sertifikasi berhasil dimuat"
        );

        return NextResponse.json(response);
    } catch (error) {
        console.error("GET certifications error:", error);
        return NextResponse.json(
            { success: false, message: "Gagal memuat data sertifikasi" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = createCertificationSchema.parse(body);

        const certification = await prisma.halalCertification.create({
            data: {
                umkmId: validatedData.umkmId,
                certificateNo: validatedData.certificateNo || null,
                issuer: validatedData.issuer || null,
                issuedAt: validatedData.issuedAt,
                expiredAt: validatedData.expiredAt,
                status: validatedData.status,
                documentUrl: validatedData.documentUrl || null,
            },
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
            message: "Sertifikasi berhasil ditambahkan",
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
                    { success: false, message: "Nomor sertifikat sudah terdaftar" },
                    { status: 409 }
                );
            }
        }

        console.error("POST certification error:", error);
        return NextResponse.json(
            { success: false, message: "Gagal menambahkan sertifikasi" },
            { status: 500 }
        );
    }
}
