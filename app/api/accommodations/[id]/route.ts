import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAccommodation, updateAccommodation, deleteAccommodation } from "@/lib/services/accommodation-service";
import { accommodationSchema } from "@/lib/validations/accommodation.schema";
import { getErrorMessage } from "@/lib/api-error";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const accommodation = await getAccommodation(id);
        if (!accommodation) {
            return NextResponse.json({ error: "Penginapan tidak ditemukan" }, { status: 404 });
        }
        return NextResponse.json({ data: accommodation }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const parsed = accommodationSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Data tidak valid", issues: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const accommodation = await updateAccommodation(id, parsed.data);
        return NextResponse.json({ data: accommodation }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await deleteAccommodation(id);
        return NextResponse.json({ message: "Penginapan berhasil dihapus" }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}
