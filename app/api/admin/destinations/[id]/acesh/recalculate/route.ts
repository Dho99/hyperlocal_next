import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { aceshRecalculateSchema } from "@/lib/validations/acesh.schema";
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

        let notes: string | undefined;
        if (request.body) {
            const body = await request.json().catch(() => null);
            if (body) {
                const validated = aceshRecalculateSchema.safeParse(body);
                if (validated.success && validated.data.notes) {
                    notes = validated.data.notes;
                }
            }
        }

        const snapshot = await calculateAndSaveAssessment(id, session.user.id, notes);

        return NextResponse.json(
            {
                data: {
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
            { status: 200 },
        );
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
