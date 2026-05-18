import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUmkm, updateUmkm, deleteUmkm } from "@/lib/services/umkm-service";
import { umkmSchema } from "@/lib/validations/umkm.schema";
import { getErrorMessage } from "@/lib/api-error";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const umkm = await getUmkm(id);
    if (!umkm) {
      return NextResponse.json({ error: "UMKM tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ data: umkm }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingUmkm = await getUmkm(id);
    if (!existingUmkm) {
      return NextResponse.json({ error: "UMKM tidak ditemukan" }, { status: 404 });
    }

    // Authorization: Admin or Owner
    if (session.user.role !== "admin" && existingUmkm.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = umkmSchema.partial().safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Data tidak valid", issues: validated.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateUmkm(id, validated.data as any);
    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingUmkm = await getUmkm(id);
    if (!existingUmkm) {
      return NextResponse.json({ error: "UMKM tidak ditemukan" }, { status: 404 });
    }

    // Authorization: Admin or Owner
    if (session.user.role !== "admin" && existingUmkm.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteUmkm(id);
    return NextResponse.json({ message: "UMKM berhasil dihapus" }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
