import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPaginatedAccommodations, createAccommodation } from "@/lib/services/accommodation-service";
import { accommodationSchema } from "@/lib/validations/accommodation.schema";
import { getErrorMessage } from "@/lib/api-error";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const result = await getPaginatedAccommodations({
            limit: searchParams.get("limit")
                ? Number(searchParams.get("limit"))
                : undefined,
            cursor: searchParams.get("cursor") || undefined,
            search: searchParams.get("search") || undefined,
            scope: searchParams.get("scope") === "admin" ? "admin" : "public",
            validationStatus: searchParams.get("validationStatus") || undefined,
        });
        return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const parsed = accommodationSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Data tidak valid", issues: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const accommodation = await createAccommodation(parsed.data);
        return NextResponse.json({ data: accommodation }, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}
