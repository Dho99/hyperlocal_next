import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getErrorMessage } from "@/lib/api-error";
import {
    generateReportSchema,
    type GenerateReportInput,
} from "@/lib/validations/report.schema";
import {
    generateReport,
    getReportData,
    type GenerateReportParams,
} from "@/lib/services/export-service";

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const validated = generateReportSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                {
                    error: "Data tidak valid",
                    issues: validated.error.flatten(),
                },
                { status: 400 },
            );
        }

        if (validated.data.format) {
            const { data, contentType, filename } = await generateReport(
                validated.data as GenerateReportParams,
            );
            return new NextResponse(new Uint8Array(data), {
                status: 200,
                headers: {
                    "Content-Type": contentType,
                    "Content-Disposition": `attachment; filename="${filename}"`,
                    "Content-Length": String(data.length),
                },
            });
        }

        const reportData = await getReportData(
            validated.data.startDate,
            validated.data.endDate,
            validated.data.categories,
        );

        return NextResponse.json({ data: reportData });
    } catch (error: unknown) {
        console.log(error);
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
