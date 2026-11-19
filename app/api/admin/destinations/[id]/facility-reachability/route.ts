import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/api-error";
import { requireAdmin } from "@/lib/auth-guard";
import { getDestinationFacilityReachability } from "@/lib/services/acesh/facility-reachability-service";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const rows = await getDestinationFacilityReachability(id);

        if (!rows) {
            return NextResponse.json(
                { error: "Destinasi tidak ditemukan" },
                { status: 404 },
            );
        }

        return NextResponse.json(
            { data: rows },
            { headers: { "Cache-Control": "no-store" } },
        );
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
