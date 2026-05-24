import { NextResponse } from "next/server";
import { getDestinationSentimentSummary } from "@/lib/services/analytics-service";
import { getErrorMessage } from "@/lib/api-error";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const summary = await getDestinationSentimentSummary(id);
    return NextResponse.json({ data: summary }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
