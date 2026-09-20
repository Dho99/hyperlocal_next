import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/api-error";
import { requireAdmin } from "@/lib/auth-guard";
import { deleteSurveyResponse } from "@/lib/services/survey-service";

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { id } = await params;
        const result = await deleteSurveyResponse(id);
        return NextResponse.json({ data: result }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
