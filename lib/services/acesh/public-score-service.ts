import { prisma } from "@/lib/prisma";

export interface PublicAceshScore {
    verifiedScore: number | null;
    baseScore: number;
    classification: string | null;
    verificationStatus: "PENDING" | "VERIFIED";
}

/**
 * Fetches the public ACES-H assessment for a set of destinations.
 * Travellers must never receive internal evidence; only the score
 * surface (verified/base score + classification) is exposed.
 */
export async function getPublicAceshScores(
    destinationIds: string[],
): Promise<Map<string, PublicAceshScore>> {
    if (destinationIds.length === 0) return new Map();

    const assessments = await prisma.aceshAssessment.findMany({
        where: { destinationId: { in: destinationIds } },
        select: {
            destinationId: true,
            verifiedScore: true,
            baseScore: true,
            classification: true,
            verificationStatus: true,
        },
    });

    return new Map(
        assessments.map((a) => [
            a.destinationId,
            {
                verifiedScore: a.verifiedScore,
                baseScore: a.baseScore,
                classification: a.classification,
                verificationStatus: a.verificationStatus,
            },
        ]),
    );
}

/**
 * Score shown to travellers: the verified score when the assessment is
 * VERIFIED, otherwise the base (unverified) score. Never returns a
 * fabricated verified score for PENDING assessments.
 */
export function publicDisplayScore(
    score: PublicAceshScore | undefined,
    fallback: number | null,
): number {
    if (!score) return fallback ?? 0;
    if (score.verificationStatus === "VERIFIED" && score.verifiedScore != null) {
        return score.verifiedScore;
    }
    return score.baseScore;
}
