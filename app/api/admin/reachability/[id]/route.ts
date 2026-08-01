import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { reachabilityConfigUpdateSchema } from "@/lib/validations/acesh.schema";
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
        const validated = reachabilityConfigUpdateSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: "Data konfigurasi jangkauan tidak valid", issues: validated.error.flatten() },
                { status: 400 },
            );
        }

        const config = await prisma.reachabilityConfig.update({
            where: { id },
            data: validated.data,
        });

        return NextResponse.json({ data: config }, { status: 200 });
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
        await prisma.reachabilityConfig.delete({ where: { id } });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
