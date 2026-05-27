import { NextResponse } from "next/server";
import { getAllMapDestinations } from "@/lib/services/dashboard-service";
import { getErrorMessage } from "@/lib/api-error";

export async function GET() {
    try {
        const destinations = await getAllMapDestinations();
        return NextResponse.json({ data: destinations }, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
