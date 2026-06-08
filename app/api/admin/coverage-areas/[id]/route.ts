import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/api-error";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const area = await prisma.coverageArea.findUnique({ where: { id } });
        if (!area) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json({ data: area }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}

export async function PUT(request: Request, context: RouteContext) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await context.params;
        const body = await request.json();
        const { name, level, geoJsonData, colorHex, isActive } = body;

        const area = await prisma.coverageArea.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(level !== undefined && { level }),
                ...(geoJsonData !== undefined && { geoJsonData }),
                ...(colorHex !== undefined && { colorHex }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return NextResponse.json({ data: area }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}

export async function DELETE(_request: Request, context: RouteContext) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await context.params;
        await prisma.coverageArea.delete({ where: { id } });
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
