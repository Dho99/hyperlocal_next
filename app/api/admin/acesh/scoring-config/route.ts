import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/api-error";
import { aceshScoringConfigSchema } from "@/lib/validations/acesh.schema";

async function requireAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user.role === "admin" ? session : null;
}

export async function GET() {
    try {
        if (!(await requireAdmin())) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const config = await prisma.aceshScoringConfig.upsert({
            where: { id: "default" },
            update: {},
            create: { id: "default" },
        });
        return NextResponse.json({ data: config });
    } catch (error: unknown) {
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await requireAdmin();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const validated = aceshScoringConfigSchema.safeParse(await request.json());
        if (!validated.success) {
            return NextResponse.json(
                {
                    error: validated.error.issues[0]?.message ?? "Konfigurasi bobot tidak valid",
                    issues: validated.error.flatten(),
                },
                { status: 400 },
            );
        }

        const config = await prisma.aceshScoringConfig.upsert({
            where: { id: "default" },
            update: { ...validated.data, updatedBy: session.user.id },
            create: { id: "default", ...validated.data, updatedBy: session.user.id },
        });
        return NextResponse.json({ data: config });
    } catch (error: unknown) {
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}
