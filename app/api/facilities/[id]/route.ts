import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
    updateFacility,
    deleteFacility,
    getFacilityById,
} from "@/lib/services/facility-service";
import { facilitySchema } from "@/lib/validations/facility.schema";
import { ZodError } from "zod";
import { getErrorMessage } from "@/lib/api-error";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const facility = await getFacilityById(id);
        if (!facility) {
            return NextResponse.json(
                { error: "Fasilitas tidak ditemukan" },
                { status: 404 },
            );
        }
        return NextResponse.json({ data: facility }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}

export async function PATCH(
    req: Request,
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

        const existingFacility = await getFacilityById(id);
        if (!existingFacility) {
            return NextResponse.json(
                { error: "Fasilitas tidak ditemukan" },
                { status: 404 },
            );
        }

        const body = await req.json();
        const validatedData = facilitySchema.parse(body);
        const facility = await updateFacility(id, validatedData);
        return NextResponse.json({ data: facility }, { status: 200 });
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

export async function DELETE(
    _req: Request,
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

        const existingFacility = await getFacilityById(id);
        if (!existingFacility) {
            return NextResponse.json(
                { error: "Fasilitas tidak ditemukan" },
                { status: 404 },
            );
        }

        await deleteFacility(id);
        return NextResponse.json({
            data: { message: "Fasilitas berhasil dihapus" },
        }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
