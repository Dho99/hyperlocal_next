import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { subMonths, startOfMonth, format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/api-error";

const MONTH_LABELS = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

interface TrendPoint {
    period: string;
    label: string;
    year: number;
    month: number;
    bookmarks: number;
    whatsappClicks: number;
    routeClicks: number;
    totalViews: number;
}

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

        const now = new Date();
        const sixMonthsAgo = startOfMonth(subMonths(now, 5));

        const [userInteractions, destinationViews] = await Promise.all([
            prisma.userInteraction.findMany({
                where: { createdAt: { gte: sixMonthsAgo } },
                select: { actionType: true, createdAt: true },
            }),
            prisma.destinationInteraction.findMany({
                where: {
                    createdAt: { gte: sixMonthsAgo },
                    type: "VIEW",
                },
                select: { createdAt: true },
            }),
        ]);

        const monthBuckets = new Map<string, TrendPoint>();

        for (let i = 5; i >= 0; i--) {
            const date = subMonths(now, i);
            const key = format(date, "yyyy-MM");
            monthBuckets.set(key, {
                period: `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`,
                label: MONTH_LABELS[date.getMonth()],
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                bookmarks: 0,
                whatsappClicks: 0,
                routeClicks: 0,
                totalViews: 0,
            });
        }

        for (const interaction of userInteractions) {
            const key = format(interaction.createdAt, "yyyy-MM");
            const bucket = monthBuckets.get(key);
            if (!bucket) continue;

            if (interaction.actionType === "BOOKMARK") bucket.bookmarks += 1;
            else if (interaction.actionType === "CLICK_WHATSAPP") bucket.whatsappClicks += 1;
            else if (interaction.actionType === "CLICK_ROUTE") bucket.routeClicks += 1;
        }

        for (const view of destinationViews) {
            const key = format(view.createdAt, "yyyy-MM");
            const bucket = monthBuckets.get(key);
            if (!bucket) continue;
            bucket.totalViews += 1;
        }

        const trends = Array.from(monthBuckets.values());

        return NextResponse.json({ data: trends });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
