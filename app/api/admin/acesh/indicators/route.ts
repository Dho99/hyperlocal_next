import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { aceshIndicatorSchema } from "@/lib/validations/acesh.schema";
import { getErrorMessage } from "@/lib/api-error";

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
        return null;
    }
    return session;
}

export async function GET() {
    try {
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const indicators = await prisma.aceshIndicator.findMany({
            orderBy: [{ group: "asc" }, { code: "asc" }],
            include: { _count: { select: { indicatorScores: true } } },
        });

        return NextResponse.json({ data: indicators }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validated = aceshIndicatorSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: "Data indikator tidak valid", issues: validated.error.flatten() },
                { status: 400 },
            );
        }

        const indicator = await prisma.aceshIndicator.create({
            data: validated.data,
        });

        return NextResponse.json({ data: indicator }, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
