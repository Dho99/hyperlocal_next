import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { reachabilityConfigSchema } from "@/lib/validations/acesh.schema";
import { getErrorMessage } from "@/lib/api-error";

export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const configs = await prisma.reachabilityConfig.findMany({
            orderBy: { facilityType: "asc" },
        });

        return NextResponse.json({ data: configs }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validated = reachabilityConfigSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: "Data konfigurasi jangkauan tidak valid", issues: validated.error.flatten() },
                { status: 400 },
            );
        }

        const config = await prisma.reachabilityConfig.upsert({
            where: { facilityType: validated.data.facilityType },
            update: validated.data,
            create: validated.data,
        });

        return NextResponse.json({ data: config }, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
