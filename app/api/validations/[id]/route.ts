import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processValidationSchema } from "@/lib/validations/unified-validation";
import { processDestinationValidationSchema } from "@/lib/validations/halal-validation.schema";
import { ZodError } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { calculateAndSaveAssessment } from "@/lib/services/acesh/assessment-recalculation-service";
import { auditLog } from "@/lib/audit";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!(await requireAdmin())) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    try {
        const { id } = await params;
        const validation = await prisma.halalValidation.findUnique({
            where: { id },
            include: {
                certification: {
                    include: {
                        umkm: true,
                    },
                },
                destination: {
                    include: {
                        category: true,
                        images: true,
                        destinationHalalFacilities: {
                            include: {
                                facility: true,
                                evidences: true,
                            },
                        },
                    },
                },
                validator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                evidences: true,
            },
        });

        if (!validation) {
            // Fallback: treat id as destinationId
            const byDest = await prisma.halalValidation.findFirst({
                where: { destinationId: id },
                include: {
                    certification: { include: { umkm: true } },
                    destination: {
                        include: {
                            category: true,
                            images: true,
                            destinationHalalFacilities: {
                                include: { facility: true, evidences: true },
                            },
                        },
                    },
                    validator: { select: { id: true, name: true, email: true } },
                    evidences: true,
                },
                orderBy: { createdAt: "desc" },
            });
            if (!byDest) {
                return NextResponse.json(
                    { success: false, message: "Data validasi tidak ditemukan" },
                    { status: 404 }
                );
            }
            return NextResponse.json({ success: true, data: byDest });
        }

        return NextResponse.json({ success: true, data: validation });
    } catch (error: unknown) {
        console.error("GET validation [id] error:", error);
        return NextResponse.json(
            { success: false, message: "Gagal mengambil data validasi" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const validatorId = session.user.id;
    try {
        const { id } = await params;
        const body = await request.json();

        const currentValidation = await prisma.halalValidation.findUnique({
            where: { id },
            select: { certificationId: true, destinationId: true },
        });

        if (!currentValidation) {
            return NextResponse.json(
                { success: false, message: "Data validasi tidak ditemukan" },
                { status: 404 }
            );
        }

        // Destination validation path
        if (currentValidation.destinationId) {
            const validatedData = processDestinationValidationSchema.parse(body);

            const isApproved = validatedData.status === "APPROVED";

            const result = await prisma.$transaction(async (tx) => {
                const validation = await tx.halalValidation.update({
                    where: { id },
                    data: {
                        status: validatedData.status,
                        notes: validatedData.notes,
                        validatedAt: new Date(),
                        validatorId: validatorId,
                        adminScore: validatedData.adminScore,
                        categoryScores: validatedData.categoryScores ?? undefined,
                    },
                });

                const destination = await tx.destination.update({
                    where: { id: currentValidation.destinationId! },
                    data: {
                        status: isApproved ? "APPROVED" : "REJECTED",
                        validatedScore: validatedData.adminScore,
                        categoryScores: (validatedData.categoryScores ?? null) as any,
                    },
                });

                return { validation, destination };
            });

            try {
                await calculateAndSaveAssessment(currentValidation.destinationId, validatorId, "Validasi destinasi diperbarui");
            } catch (recalcError) { console.error("ACES-H recalculation after validation failed:", recalcError); }
            void auditLog({ userId: validatorId, action: isApproved ? "validation.approve" : "validation.reject", target: "halalValidation", targetId: id, ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null, userAgent: request.headers.get("user-agent") });
            return NextResponse.json({ success: true, message: isApproved ? "Destinasi berhasil divalidasi" : "Destinasi ditolak", data: result }, { status: 200 });
        }

        // Certification validation path (legacy)
        const validatedData = processValidationSchema.parse(body);

        if (!currentValidation.certificationId) {
            return NextResponse.json(
                { success: false, message: "Validasi ini tidak terkait dengan sertifikasi atau destinasi" },
                { status: 400 }
            );
        }

        const isApproved = validatedData.status === "APPROVED";

        const result = await prisma.$transaction(async (tx) => {
            const validation = await tx.halalValidation.update({
                where: { id },
                data: {
                    status: validatedData.status,
                    notes: validatedData.notes,
                    validatedAt: new Date(),
                    validatorId: validatorId,
                },
            });

            const certification = await tx.halalCertification.update({
                where: { id: currentValidation.certificationId! },
                data: {
                    status: isApproved ? "VALID" : "PENDING",
                    certificateNo: isApproved ? (validatedData.certificateNo ?? undefined) : undefined,
                    issuer: isApproved ? validatedData.issuer : undefined,
                    issuedAt: isApproved ? validatedData.issuedAt : undefined,
                    expiredAt: isApproved ? validatedData.expiredAt : undefined,
                    documentUrl: isApproved ? (validatedData.documentUrl || undefined) : undefined,
                },
            });

            return { validation, certification };
        });

        return NextResponse.json(
            {
                success: true,
                message: isApproved ? "Sertifikasi berhasil disetujui dan diterbitkan" : "Validasi ditolak",
                data: result,
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { success: false, message: "Input tidak valid", error: error.issues },
                { status: 400 }
            );
        }
        if (typeof error === "object" && error !== null && "code" in error && (error as Record<string, unknown>).code === "P2002") {
            return NextResponse.json(
                { success: false, message: "Nomor sertifikat sudah terdaftar di sistem" },
                { status: 400 }
            );
        }
        console.error("PATCH validation [id] error:", error);
        return NextResponse.json(
            { success: false, message: "Gagal memproses validasi" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!(await requireAdmin())) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    try {
        const { id } = await params;
        await prisma.halalValidation.delete({
            where: { id },
        });

        return NextResponse.json(
            { success: true, message: "Data validasi berhasil dihapus" },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("DELETE validation [id] error:", error);
        return NextResponse.json(
            { success: false, message: "Gagal menghapus data validasi" },
            { status: 500 }
        );
    }
}
