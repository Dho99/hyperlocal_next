import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
    getPaginatedDestinations,
    createDestination,
    type DestinationSort,
} from "@/lib/services/destination-service";
import { destinationSchema } from "@/lib/validations/destination.schema";
import { getErrorMessage } from "@/lib/api-error";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get("limit")
            ? Number(searchParams.get("limit"))
            : undefined;
        const cursor = searchParams.get("cursor") || undefined;
        const categoryId = searchParams.get("categoryId") || undefined;
        const areaId = searchParams.get("areaId") || undefined;
        const search = searchParams.get("search") || undefined;
        const validationStatus = searchParams.get("validationStatus") || undefined;
        const minScore = parseMinScore(searchParams.get("minScore"));
        const sort = parseSort(searchParams.get("sort"));

        const result = await getPaginatedDestinations({
            limit,
            cursor,
            categoryId,
            areaId,
            search,
            status: validationStatus,
            minScore,
            sort,
            scope: searchParams.get("scope") === "admin" ? "admin" : "public",
        });
        return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}

const allowedSorts = new Set<DestinationSort>([
    "newest",
    "rating",
    "score",
    "reviews",
    "name",
]);

function parseSort(value: string | null): DestinationSort | undefined {
    if (!value) return undefined;
    return allowedSorts.has(value as DestinationSort)
        ? (value as DestinationSort)
        : undefined;
}

function parseMinScore(value: string | null): number | undefined {
    if (!value) return undefined;

    const score = Number(value);
    if (!Number.isFinite(score)) return undefined;

    return Math.min(100, Math.max(0, score));
}

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
        const validated = destinationSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                {
                    error: "Data tidak valid",
                    issues: validated.error.flatten(),
                },
                { status: 400 },
            );
        }

        if (validated.data.coverageAreaId) {
            const area = await prisma.coverageArea.findUnique({
                where: { id: validated.data.coverageAreaId },
            });
            if (!area || !area.isActive) {
                return NextResponse.json(
                    { error: "Coverage area tidak valid atau tidak aktif" },
                    { status: 400 },
                );
            }
        }

        const destination = await createDestination(validated.data);
        return NextResponse.json({ data: destination }, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
