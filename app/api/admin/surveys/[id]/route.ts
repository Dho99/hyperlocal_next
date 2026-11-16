import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/api-error";
import { requireAdmin } from "@/lib/auth-guard";
import {
    deleteSurveyResponse,
    moderateSurveyResponse,
    type SurveyModerationAction,
} from "@/lib/services/survey-service";

const MODERATION_ACTIONS = new Set<SurveyModerationAction>([
    "HIDE_SCORE",
    "SHOW_SCORE",
    "HIDE_COMMENT",
    "SHOW_COMMENT",
]);

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const { id } = await params;
        const body = (await request.json()) as { action?: string };
        if (!body.action || !MODERATION_ACTIONS.has(body.action as SurveyModerationAction)) {
            return NextResponse.json({ error: "Aksi moderasi tidak valid" }, { status: 400 });
        }
        const result = await moderateSurveyResponse(
            id,
            session.user.id,
            body.action as SurveyModerationAction,
        );
        return NextResponse.json({ data: result }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}

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
