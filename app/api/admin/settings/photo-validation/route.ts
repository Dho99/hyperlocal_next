import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/api-error";
import { requireAdmin } from "@/lib/auth-guard";
import { getExifValidationEnabled, setExifValidationEnabled } from "@/lib/services/photo-validation-settings-service";

export async function GET() {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
        data: { isExifValidationEnabled: await getExifValidationEnabled() },
    });
}

export async function PUT(request: Request) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body: unknown = await request.json();
        if (
            typeof body !== "object" ||
            body === null ||
            !("isExifValidationEnabled" in body) ||
            typeof body.isExifValidationEnabled !== "boolean"
        ) {
            return NextResponse.json(
                { error: "isExifValidationEnabled harus berupa boolean" },
                { status: 400 },
            );
        }

        const config = await setExifValidationEnabled(
            body.isExifValidationEnabled,
            session.user.id,
        );

        return NextResponse.json({
            data: { isExifValidationEnabled: config.isExifValidationEnabled },
        });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
