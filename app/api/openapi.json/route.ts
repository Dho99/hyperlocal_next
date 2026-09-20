import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { generateOpenApiDocument } = await import("@/lib/openapi/spec");
        const doc = generateOpenApiDocument();
        return NextResponse.json(doc, {
            status: 200,
            headers: {
                "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: "Failed to generate OpenAPI specification", details: error.message },
            { status: 500 },
        );
    }
}
