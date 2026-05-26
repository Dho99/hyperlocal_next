import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createValidationSchema } from "@/lib/validations/halal-validation.schema";
import { withCursorPagination } from "@/lib/pagination/cursorPagination";
import { ZodError } from "zod";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get("limit")
            ? Number(searchParams.get("limit"))
            : undefined;
        const cursor = searchParams.get("cursor") || undefined;
        const status = searchParams.get("status") || undefined;

        const result = await withCursorPagination(
            async (take, cursor, skip) => {
                return prisma.halalValidation.findMany({
                    take,
                    skip,
                    ...(cursor && { cursor: { id: cursor } }),
                    where: status ? { status: status as string } : undefined,
                    orderBy: { createdAt: "desc" },
                    include: {
                        certification: true,
                        validator: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                });
            },
            { limit, cursor, status },
            "Halal validations fetched successfully",
        );

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch validations",
                error: error.message,
            },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = createValidationSchema.parse(body);

        const validation = await prisma.halalValidation.create({
            data: {
                certificationId: validatedData.certificationId,
                notes: validatedData.notes,
                status: "PENDING",
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Validation created successfully",
                data: validation,
            },
            { status: 201 },
        );
    } catch (error: any) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    error: error.issues,
                },
                { status: 400 },
            );
        }
        return NextResponse.json(
            {
                success: false,
                message: "Internal Server Error",
                error: error.message,
            },
            { status: 500 },
        );
    }
}
