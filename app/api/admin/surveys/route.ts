import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/api-error";
import { requireAdmin } from "@/lib/auth-guard";
import { getPaginatedSurveyResponses } from "@/lib/services/survey-service";

export async function GET(request: Request) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { searchParams } = new URL(request.url);
        const result = await getPaginatedSurveyResponses({
            limit: searchParams.get("limit")
                ? Number(searchParams.get("limit"))
                : undefined,
            cursor: searchParams.get("cursor") || undefined,
            destinationId: searchParams.get("destinationId") || undefined,
            search: searchParams.get("search") || undefined,
        });
        return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
