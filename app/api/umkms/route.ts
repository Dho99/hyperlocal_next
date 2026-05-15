import { NextResponse } from "next/server";
import { getPaginatedUmkms } from "@/lib/services/umkm-service";
import { getErrorMessage } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;
    const cursor = searchParams.get("cursor") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const destinationId = searchParams.get("destinationId") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = await getPaginatedUmkms({ limit, cursor, categoryId, destinationId, search });
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
