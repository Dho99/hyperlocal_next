import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/api-error";

interface DestinationInfo {
    id: string;
    name: string;
    slug: string;
    city: string | null;
}

interface FacilityInfo {
    id: string;
    name: string;
    facilityType: string | null;
}

interface EvidenceInfo {
    id: string;
    imageUrl: string;
}

interface FacilityVerifyResponse {
    found: boolean;
    destination: DestinationInfo | null;
    facility: FacilityInfo | null;
    evidences: EvidenceInfo[];
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get("slug");
        const facility = searchParams.get("facility");

        if (!slug || !facility) {
            return NextResponse.json<FacilityVerifyResponse>(
                {
                    found: false,
                    destination: null,
                    facility: null,
                    evidences: [],
                },
                { status: 400 },
            );
        }

        const result = await prisma.destinationHalalFacility.findFirst({
            where: {
                destination: { slug },
                facility: {
                    name: { contains: facility, mode: "insensitive" },
                },
            },
            include: {
                destination: {
                    select: { id: true, name: true, slug: true, city: true },
                },
                facility: {
                    select: { id: true, name: true, facilityType: true },
                },
                evidences: {
                    select: { id: true, imageUrl: true },
                },
            },
        });

        if (!result) {
            return NextResponse.json<FacilityVerifyResponse>(
                {
                    found: false,
                    destination: null,
                    facility: null,
                    evidences: [],
                },
                { status: 200 },
            );
        }

        return NextResponse.json<FacilityVerifyResponse>(
            {
                found: true,
                destination: result.destination,
                facility: result.facility,
                evidences: result.evidences,
            },
            { status: 200 },
        );
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 },
        );
    }
}
