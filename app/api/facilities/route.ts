import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
    getFacilities,
    getPaginatedFacilities,
    createFacility,
} from "@/lib/services/facility-service";
import { headers } from "next/headers";
import { facilitySchema } from "@/lib/validations/facility.schema";
import { ZodError } from "zod";
import { getErrorMessage } from "@/lib/api-error";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Paginated mode for the admin list; bare GET still returns all
        // facilities (used by the destination/accommodation form pickers).
        if (
            searchParams.has("limit") ||
            searchParams.has("cursor") ||
            searchParams.has("search")
        ) {
            const result = await getPaginatedFacilities({
                limit: searchParams.get("limit")
                    ? Number(searchParams.get("limit"))
                    : undefined,
                cursor: searchParams.get("cursor") || undefined,
                search: searchParams.get("search") || undefined,
            });
            return NextResponse.json(result, { status: 200 });
        }

        const facilities = await getFacilities();
        return NextResponse.json({ data: facilities }, { status: 200 });
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
            validatedData as Parameters<typeof createFacility>[0],
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
