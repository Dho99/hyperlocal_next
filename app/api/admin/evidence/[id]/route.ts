import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { aceshEvidenceUpdateSchema } from "@/lib/validations/acesh.schema";
import { calculateAndSaveAssessment } from "@/lib/services/acesh/assessment-recalculation-service";
import { getErrorMessage } from "@/lib/api-error";

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") return null;
    return session;
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const validated = aceshEvidenceUpdateSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: "Data evidence tidak valid", issues: validated.error.flatten() },
                { status: 400 },
            );
        }

        const evidence = await prisma.aceshEvidenceRecord.update({
            where: { id },
            data: {
                ...validated.data,
                validatedAt: validated.data.fieldValidated
                    ? (validated.data.validatedAt ?? new Date())
                    : validated.data.validatedAt,
            },
        });

        const snapshot = await calculateAndSaveAssessment(
            evidence.destinationId,
            session.user.id,
            "Pembaruan evidence",
        );

        return NextResponse.json({ data: { evidence, assessment: snapshot } }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const existing = await prisma.aceshEvidenceRecord.findUnique({
            where: { id },
            select: { destinationId: true },
        });
        if (!existing) {
            return NextResponse.json(
                { error: "Evidence tidak ditemukan" },
                { status: 404 },
            );
        }

        await prisma.aceshEvidenceRecord.delete({ where: { id } });

        const snapshot = await calculateAndSaveAssessment(
            existing.destinationId,
            session.user.id,
            "Penghapusan evidence",
        );

        return NextResponse.json({ data: { assessment: snapshot } }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
