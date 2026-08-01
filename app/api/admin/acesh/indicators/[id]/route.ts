import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { aceshIndicatorUpdateSchema } from "@/lib/validations/acesh.schema";
import { getErrorMessage } from "@/lib/api-error";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const validated = aceshIndicatorUpdateSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: "Data indikator tidak valid", issues: validated.error.flatten() },
                { status: 400 },
            );
        }

        const indicator = await prisma.aceshIndicator.update({
            where: { id },
            data: validated.data,
        });

        return NextResponse.json({ data: indicator }, { status: 200 });
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
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await prisma.aceshIndicator.delete({ where: { id } });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
