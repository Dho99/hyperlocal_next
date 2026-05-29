import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPaginatedCategories, createCategory } from "@/lib/services/category-service";
import { categorySchema } from "@/lib/validations/destinasi-kategori.schema";
import { getErrorMessage } from "@/lib/api-error";
import { CategoryType } from "@/lib/generated/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;
        const cursor = searchParams.get("cursor") || undefined;
        const search = searchParams.get("search") || undefined;
        const type = searchParams.get("type") as CategoryType || undefined;

        const result = await getPaginatedCategories({ limit, cursor, search, type });
        return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
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
        const validated = categorySchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                {
                    error: "Data tidak valid",
                    issues: validated.error.flatten(),
                },
                { status: 400 },
            );
        }

        const category = await createCategory(validated.data);
        return NextResponse.json({ data: category }, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
