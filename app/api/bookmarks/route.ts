import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserBookmarks } from "@/lib/services/analytics-service";
import { getErrorMessage } from "@/lib/api-error";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user.id) {
      return NextResponse.json({ data: [] });
    }

    const bookmarks = await getUserBookmarks(session.user.id);

    const bookmarkMap: Record<string, { targetType: string; createdAt: Date }> = {};
    for (const b of bookmarks) {
      bookmarkMap[b.targetId] = { targetType: b.targetType, createdAt: b.createdAt };
    }

    return NextResponse.json({ data: bookmarkMap });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
