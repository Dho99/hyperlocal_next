import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateValidationSchema } from "@/lib/validations/halal-validation.schema";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const validatedData = updateValidationSchema.parse(body);

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        // Use session user if available, fallback to mock for now if not restricted yet
        const validatorId = session?.user?.id || null;

        const isProcessed = ["APPROVED", "REJECTED"].includes(validatedData.status);

        const validation = await prisma.halalValidation.update({
            where: { id },
            data: {
                status: validatedData.status,
                notes: validatedData.notes,
                ...(isProcessed && {
                    validatedAt: new Date(),
                    validatorId: validatorId,
                }),
            },
        });

        return NextResponse.json(
            { success: true, message: "Validation updated successfully", data: validation },
            { status: 200 }
        );
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json(
                { success: false, message: "Validation not found", error: error.message },
                { status: 404 }
            );
        }
        if (error instanceof ZodError) {
            return NextResponse.json(
                { success: false, message: "Invalid input", error: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, message: "Failed to update validation", error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.halalValidation.delete({
            where: { id },
        });

        return NextResponse.json(
            { success: true, message: "Validation deleted successfully" },
            { status: 200 }
        );
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json(
                { success: false, message: "Validation not found", error: error.message },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { success: false, message: "Failed to delete validation", error: error.message },
            { status: 500 }
        );
    }
}
