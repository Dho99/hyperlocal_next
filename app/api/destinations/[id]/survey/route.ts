import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getErrorMessage } from "@/lib/api-error";
import { createSurveySchema } from "@/lib/validations/survey.schema";
import {
    createSurveyResponse,
    getSurveySummary,
} from "@/lib/services/survey-service";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
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

        const [indicators, summary] = await Promise.all([
            prisma.aceshIndicator.findMany({
                where: { isActive: true },
                orderBy: [{ group: "asc" }, { code: "asc" }],
                select: {
                    id: true,
                    code: true,
                    name: true,
                    description: true,
                    weight: true,
                    group: true,
                },
            }),
            getSurveySummary(id),
        ]);

        return NextResponse.json({ data: { indicators, summary } });
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
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session) {
            return NextResponse.json(
                { error: "Masuk terlebih dahulu untuk memberi penilaian" },
                { status: 401 },
            );
        }

        const { id } = await params;
        const body = await request.json();
        const validated = createSurveySchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                {
                    error: "Data penilaian tidak valid",
                    issues: validated.error.flatten(),
                },
                { status: 400 },
            );
        }

        const survey = await createSurveyResponse({
            destinationId: id,
            userId: session.user.id,
            scores: validated.data.scores,
            comment: validated.data.comment ?? null,
        });

        return NextResponse.json({ data: survey }, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
