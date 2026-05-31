import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
    getTopBookmarkedDestinations,
    getTopWhatsappClickedUmkms,
    getCtaSummary,
} from "@/lib/services/analytics-service";
import { getErrorMessage } from "@/lib/api-error";

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const [topBookmarked, topWhatsapp, ctaSummary] = await Promise.all([
            getTopBookmarkedDestinations(10),
            getTopWhatsappClickedUmkms(10),
            getCtaSummary(),
        ]);

        return NextResponse.json({
            data: {
                topBookmarkedDestinations: topBookmarked,
                topWhatsappClickedUmkms: topWhatsapp,
                ctaSummary,
            },
        });
    } catch (error: unknown) {
        console.log(error);
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
