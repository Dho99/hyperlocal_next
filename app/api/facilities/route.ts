import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPaginatedFacilities, createFacility } from "@/lib/services/facility-service";
import { headers } from "next/headers";
import { facilitySchema } from "@/lib/validations/fasilitas.schema";
import type { CreateFacilityInput } from "@/types/fasilitas";
import { ZodError } from "zod";
import { getErrorMessage } from "@/lib/api-error";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;
        const cursor = searchParams.get("cursor") || undefined;
        const search = searchParams.get("search") || undefined;

        const result = await getPaginatedFacilities({ limit, cursor, search });
        return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = await req.json();
        const validatedData = facilitySchema.parse(body);
        const facility = await createFacility(
            validatedData as CreateFacilityInput,
        );
        return NextResponse.json({ data: facility }, { status: 201 });
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: "Data tidak valid", issues: error.issues },
                { status: 400 },
            );
        }
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
