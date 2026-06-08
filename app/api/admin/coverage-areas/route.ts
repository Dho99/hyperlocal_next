import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/api-error";

export async function GET() {
  try {
    const areas = await prisma.coverageArea.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: areas }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, level, geoJsonData, colorHex, isActive } = body;

    if (!name || !level || !geoJsonData) {
      return NextResponse.json(
        { error: "name, level, and geoJsonData are required" },
        { status: 400 },
      );
    }

    const area = await prisma.coverageArea.create({
      data: { name, level, geoJsonData, colorHex, isActive },
    });

    return NextResponse.json({ data: area }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
