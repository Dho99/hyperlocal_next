import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { aceshEvidenceSchema } from "@/lib/validations/acesh.schema";
import { calculateAndSaveAssessment } from "@/lib/services/acesh/assessment-recalculation-service";
import { getErrorMessage } from "@/lib/api-error";

const SELF_ASSESSMENT_MARKER = "ACESH_SELF:";

export async function PUT(
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
        const components = body?.components;
        if (!components || typeof components !== "object") {
            return NextResponse.json(
                { error: "Data komponen keyakinan bukti tidak valid" },
                { status: 400 },
            );
        }

        const clamp = (v: unknown) =>
            Math.max(0, Math.min(100, Number(v) || 0));

        const mapped = {
            sourceReliabilityScore: clamp(components.sourceReliability),
            managementConfirmed: clamp(components.managementConfirmation) >= 50,
            fieldValidated: clamp(components.fieldValidation) >= 50,
        };

        const existing = await prisma.aceshEvidenceRecord.findFirst({
            where: { destinationId: id, notes: { startsWith: SELF_ASSESSMENT_MARKER } },
            orderBy: { createdAt: "desc" },
        });

        const data = {
            evidenceType: "OTHER" as const,
            source: "Penilaian mandiri ACES-H",
            sourceReliabilityScore: mapped.sourceReliabilityScore,
            managementConfirmed: mapped.managementConfirmed,
            fieldValidated: mapped.fieldValidated,
            validatedAt: mapped.fieldValidated ? new Date() : null,
            dataDate: new Date(),
            notes: SELF_ASSESSMENT_MARKER + JSON.stringify(components),
            validatorId: session.user.id,
        };

        const evidence = existing
            ? await prisma.aceshEvidenceRecord.update({
                  where: { id: existing.id },
                  data,
              })
            : await prisma.aceshEvidenceRecord.create({
                  data: { ...data, destinationId: id },
              });

        const snapshot = await calculateAndSaveAssessment(
            id,
            session.user.id,
            "Pembaruan penilaian keyakinan bukti",
        );

        return NextResponse.json({ data: { evidence, assessment: snapshot } });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}

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
