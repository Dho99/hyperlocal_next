import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/api-error";
import { matchesFacilityQuery } from "@/lib/utils/facility-match";

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

        const destination = await prisma.destination.findUnique({
            where: { slug },
            select: {
                id: true,
                name: true,
                slug: true,
                city: true,
                destinationHalalFacilities: {
                    include: {
                        facility: true,
                        evidences: {
                            select: { id: true, imageUrl: true },
                        },
                    },
                },
            },
        });

        if (!destination) {
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

        const matches = destination.destinationHalalFacilities
            .filter((row) =>
                matchesFacilityQuery(
                    {
                        name: `${row.name ?? ""} ${row.facility.name}`,
                        facilityType: row.facility.facilityType,
                    },
                    facility,
                ),
            )
            .sort((a, b) => {
                const distanceA = a.distanceMeters ?? Number.POSITIVE_INFINITY;
                const distanceB = b.distanceMeters ?? Number.POSITIVE_INFINITY;
                return distanceA - distanceB;
            });

        const result = matches[0];

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
                destination: {
                    id: destination.id,
                    name: destination.name,
                    slug: destination.slug,
                    city: destination.city,
                },
                facility: {
                    id: result.facility.id,
                    name: result.facility.name,
                    facilityType: result.facility.facilityType,
                },
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
