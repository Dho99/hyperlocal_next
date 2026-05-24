import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
    updateCategory,
    deleteCategory,
} from "@/lib/services/category-service";
import { categorySchema } from "@/lib/validations/destinasi-kategori.schema";
import { getErrorMessage } from "@/lib/api-error";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
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

        const category = await updateCategory(id, validated.data);
        return NextResponse.json({ data: category }, { status: 200 });
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
        const { id } = await params;
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        await deleteCategory(id);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json(
            {
                error: getErrorMessage(error),
            },
            { status: 500 },
        );
    }
}
