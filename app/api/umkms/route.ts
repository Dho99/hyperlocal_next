import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
    getUmkms,
    createUmkm,
    getPaginatedUmkms,
} from "@/lib/services/umkm-service";
import { umkmSchema } from "@/lib/validations/umkm.schema";
import { getErrorMessage } from "@/lib/api-error";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // If pagination or filtering parameters are present, use paginated service
        if (
            searchParams.has("limit") ||
            searchParams.has("cursor") ||
            searchParams.has("category") ||
            searchParams.has("search")
        ) {
            const limit = searchParams.get("limit")
                ? Number(searchParams.get("limit"))
                : undefined;
            const cursor = searchParams.get("cursor") || undefined;
            const categoryId = searchParams.get("categoryId") || undefined;
            const categorySlug = searchParams.get("category") || undefined;
            const destinationId =
                searchParams.get("destinationId") || undefined;
            const search = searchParams.get("search") || undefined;

            const result = await getPaginatedUmkms({
                limit,
                cursor,
                categoryId,
                categorySlug,
                destinationId,
                search,
            });
            return NextResponse.json(result, { status: 200 });
        }

        // Default to all UMKMs (for admin list etc)
        const umkms = await getUmkms();
        return NextResponse.json({ data: umkms }, { status: 200 });
    } catch (error: unknown) {
        console.log(error);
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
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

        const body = await request.json();
        const validated = umkmSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                {
                    error: "Data tidak valid",
                    issues: validated.error.flatten(),
                },
                { status: 400 },
            );
        }

        const umkm = await createUmkm(validated.data);
        return NextResponse.json({ data: umkm }, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
