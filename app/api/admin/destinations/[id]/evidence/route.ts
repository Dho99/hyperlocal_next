import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { aceshEvidenceSchema } from "@/lib/validations/acesh.schema";
import { calculateAndSaveAssessment } from "@/lib/services/acesh/assessment-recalculation-service";
import { getErrorMessage } from "@/lib/api-error";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const destination = await prisma.destination.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!destination) {
            return NextResponse.json(
                { error: "Destinasi tidak ditemukan" },
                { status: 404 },
            );
        }

        const body = await request.json();
        const validated = aceshEvidenceSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: "Data evidence tidak valid", issues: validated.error.flatten() },
                { status: 400 },
            );
        }

        const evidence = await prisma.aceshEvidenceRecord.create({
            data: {
                ...validated.data,
                destinationId: id,
                validatorId: session.user.id,
                validatedAt: validated.data.fieldValidated
                    ? (validated.data.validatedAt ?? new Date())
                    : null,
            },
        });

        const snapshot = await calculateAndSaveAssessment(
            id,
            session.user.id,
            "Pembaruan evidence",
        );

        return NextResponse.json(
            {
                data: {
                    evidence,
                    assessment: {
                        acesScore: snapshot.acesScore,
                        hyperlocalScore: snapshot.hyperlocalScore,
                        baseScore: snapshot.baseScore,
                        evidenceConfidenceScore: snapshot.evidenceConfidenceScore,
                        evidenceFactor: snapshot.evidenceFactor,
                        verifiedScore: snapshot.verifiedScore,
                        classification: snapshot.classification,
                        verificationStatus: snapshot.verificationStatus,
                        calculatedAt: snapshot.calculatedAt.toISOString(),
                        calculationVersion: snapshot.calculationVersion,
                    },
                },
            },
            { status: 201 },
        );
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
