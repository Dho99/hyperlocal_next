import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/api-error";

/**
 * Public ACES-H endpoint. Returns only traveller-safe information:
 * the verified score (or base score when unverified), classification,
 * validation date and version. Internal evidence details are never exposed.
 */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        const destination = await prisma.destination.findFirst({
            where: { OR: [{ id }, { slug: id }] },
            select: { id: true, halalScore: true },
        });
        if (!destination) {
            return NextResponse.json(
                { error: "Destinasi tidak ditemukan" },
                { status: 404 },
            );
        }

        let assessment = null;
        try {
            assessment = await prisma.aceshAssessment.findUnique({
                where: { destinationId: destination.id },
            });
        } catch {
            // Database lama belum memiliki tabel ACES-H. Skor halal lama
            // tetap aman ditampilkan sebagai skor dasar yang belum diverifikasi.
            return NextResponse.json({
                data: {
                    verifiedScore: null,
                    baseScore: destination.halalScore,
                    acesScore: null,
                    hyperlocalScore: null,
                    evidenceConfidenceScore: null,
                    evidenceFactor: null,
                    classification: null,
                    verificationStatus: null,
                    calculatedAt: null,
                    calculationVersion: null,
                },
            });
        }

        if (!assessment) {
            return NextResponse.json(
                { error: "Penilaian ACES-H belum tersedia untuk destinasi ini" },
                { status: 404 },
            );
        }

        return NextResponse.json(
            {
                data: {
                    verifiedScore: assessment.verifiedScore,
                    baseScore: assessment.baseScore,
                    acesScore: assessment.acesScore,
                    hyperlocalScore: assessment.hyperlocalScore,
                    evidenceConfidenceScore: assessment.evidenceConfidenceScore,
                    evidenceFactor: assessment.evidenceFactor,
                    classification: assessment.classification,
                    verificationStatus: assessment.verificationStatus,
                    calculatedAt: assessment.calculatedAt.toISOString(),
                    calculationVersion: assessment.calculationVersion,
                },
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
