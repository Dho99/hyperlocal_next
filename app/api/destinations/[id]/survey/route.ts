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

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Resolve a destination id or slug to its canonical id. */
async function resolveDestinationId(
    idOrSlug: string,
): Promise<string | null> {
    const destination = await prisma.destination.findFirst({
        where: UUID_RE.test(idOrSlug)
            ? { id: idOrSlug }
            : { slug: idOrSlug },
        select: { id: true },
    });
    return destination?.id ?? null;
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        const destinationId = await resolveDestinationId(id);
        if (!destinationId) {
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
            getSurveySummary(destinationId),
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
        const destinationId = await resolveDestinationId(id);
        if (!destinationId) {
            return NextResponse.json(
                { error: "Destinasi tidak ditemukan" },
                { status: 404 },
            );
        }

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
            destinationId,
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
