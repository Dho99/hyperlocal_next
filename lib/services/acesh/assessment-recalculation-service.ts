import { prisma } from "@/lib/prisma";
import type {
    AceshIndicator,
    AceshIndicatorScore,
    AceshVerificationStatus,
} from "@/lib/generated/prisma";
import {
    ACESH_CALCULATION_VERSION,
    ACES_GROUPS,
    HYPERLOCAL_GROUPS,
} from "./constants";
import { calculateAcesScore } from "./aces-readiness-service";
import { calculateHyperlocalScore } from "./hyperlocal-scoring-service";
import {
    calculateEvidenceConfidenceScore,
} from "./evidence-confidence-service";
import {
    averageCommunityEvidence,
    deriveCommunityEvidence,
    deriveEvidenceConfidence,
    mergeEvidenceConfidence,
    shouldMarkVerified,
} from "./evidence-derivation";
import { calculateAceshScores, type AceshScoringResult } from "./acesh-scoring-service";
import { classifyScore } from "./acesh-classification-service";
import type { GroupScoreInput } from "./indicator";
import { getActiveScoringConfig } from "./scoring-config-service";
import type { AceshScoringConfigValues } from "./scoring-defaults";
import type { Prisma } from "@/lib/generated/prisma";

export interface AceshAssessmentSnapshot extends Omit<AceshScoringResult, "verifiedScore"> {
    destinationId: string;
    verifiedScore: number | null;
    verificationStatus: AceshVerificationStatus;
    calculationVersion: string;
    weightsSnapshot: AceshScoringConfigValues;
    officialEvidenceCount: number;
    communityEvidenceCount: number;
    communityEvidenceScore: number | null;
    evidenceSource: string;
    calculatedAt: Date;
}

interface IndicatorWithScore {
    indicator: AceshIndicator;
    score: AceshIndicatorScore | null;
}

/**
 * Recalculates the complete ACES-H assessment for a destination and persists
 * it as a snapshot (upsert AceshAssessment + append AceshAssessmentHistory).
 * All formulas come from the central scoring services — nothing is computed here.
 */
export async function calculateAndSaveAssessment(
    destinationId: string,
    calculatedBy?: string,
    notes?: string,
): Promise<AceshAssessmentSnapshot> {
    const snapshot = await calculateAssessmentSnapshot(destinationId);

    const calculatedAt = new Date();

    await prisma.$transaction([
        prisma.aceshAssessment.upsert({
            where: { destinationId },
            update: {
                acesScore: snapshot.acesScore,
                hyperlocalScore: snapshot.hyperlocalScore,
                baseScore: snapshot.baseScore,
                evidenceConfidenceScore: snapshot.evidenceConfidenceScore,
                evidenceFactor: snapshot.evidenceFactor,
                officialEvidenceCount: snapshot.officialEvidenceCount,
                communityEvidenceCount: snapshot.communityEvidenceCount,
                communityEvidenceScore: snapshot.communityEvidenceScore,
                evidenceSource: snapshot.evidenceSource,
                verifiedScore: snapshot.verifiedScore,
                classification: snapshot.classification,
                verificationStatus: snapshot.verificationStatus,
                calculationVersion: snapshot.calculationVersion,
                calculatedAt,
            },
            create: {
                destinationId,
                acesScore: snapshot.acesScore,
                hyperlocalScore: snapshot.hyperlocalScore,
                baseScore: snapshot.baseScore,
                evidenceConfidenceScore: snapshot.evidenceConfidenceScore,
                evidenceFactor: snapshot.evidenceFactor,
                officialEvidenceCount: snapshot.officialEvidenceCount,
                communityEvidenceCount: snapshot.communityEvidenceCount,
                communityEvidenceScore: snapshot.communityEvidenceScore,
                evidenceSource: snapshot.evidenceSource,
                verifiedScore: snapshot.verifiedScore,
                classification: snapshot.classification,
                verificationStatus: snapshot.verificationStatus,
                calculationVersion: snapshot.calculationVersion,
                calculatedAt,
            },
        }),
        prisma.aceshAssessmentHistory.create({
            data: {
                destinationId,
                acesScore: snapshot.acesScore,
                hyperlocalScore: snapshot.hyperlocalScore,
                baseScore: snapshot.baseScore,
                evidenceConfidenceScore: snapshot.evidenceConfidenceScore,
                evidenceFactor: snapshot.evidenceFactor,
                officialEvidenceCount: snapshot.officialEvidenceCount,
                communityEvidenceCount: snapshot.communityEvidenceCount,
                communityEvidenceScore: snapshot.communityEvidenceScore,
                evidenceSource: snapshot.evidenceSource,
                verifiedScore: snapshot.verifiedScore,
                classification: snapshot.classification,
                verificationStatus: snapshot.verificationStatus,
                calculationVersion: snapshot.calculationVersion,
                weightsSnapshot: snapshot.weightsSnapshot as unknown as Prisma.InputJsonValue,
                calculatedBy,
                notes,
                calculatedAt,
            },
        }),
    ]);

    return { ...snapshot, calculatedAt };
}

/** Computes the ACES-H assessment snapshot without persisting anything. */
export async function calculateAssessmentSnapshot(
    destinationId: string,
    now: Date = new Date(),
): Promise<Omit<AceshAssessmentSnapshot, "calculatedAt"> & { calculatedAt: Date }> {
    const [indicators, scores, evidenceRecords, surveys, activeScoring] = await Promise.all([
        prisma.aceshIndicator.findMany({ where: { isActive: true }, orderBy: { code: "asc" } }),
        prisma.aceshIndicatorScore.findMany({ where: { destinationId } }),
        prisma.aceshEvidenceRecord.findMany({ where: { destinationId } }),
        prisma.destinationSurveyResponse.findMany({
            where: { destinationId, scoreHiddenAt: null },
            select: { scores: true },
        }),
        getActiveScoringConfig(),
    ]);
    const scoringWeights = activeScoring.weights;

    const scoreByIndicator = new Map(scores.map((s) => [s.indicatorId, s]));

    const indicatorsWithScores: IndicatorWithScore[] = indicators.map((indicator) => ({
        indicator,
        score: scoreByIndicator.get(indicator.id) ?? null,
    }));

    const acesScore = calculateAcesScore(
        buildGroupInputs(indicatorsWithScores, ACES_GROUPS),
        scoringWeights.aces,
    );
    const hyperlocalScore = calculateHyperlocalScore(
        buildGroupInputs(indicatorsWithScores, HYPERLOCAL_GROUPS),
        scoringWeights.hyperlocal,
    );

    const officialDerived = deriveEvidenceConfidence(evidenceRecords, now);
    const community = deriveCommunityEvidence(surveys ?? []);
    const mergedEvidence = mergeEvidenceConfidence(
        officialDerived,
        evidenceRecords.length,
        community,
    );
    const evidenceConfidenceScore = calculateEvidenceConfidenceScore(
        mergedEvidence.input,
        scoringWeights.evidence,
    );
    const recordCount = evidenceRecords.length;
    const communityEvidenceScore = community ? averageCommunityEvidence(community) : null;

    const result = calculateAceshScores(
        { acesScore, hyperlocalScore, evidenceConfidenceScore },
        scoringWeights,
    );

    const verificationStatus: AceshVerificationStatus = shouldMarkVerified(
        evidenceConfidenceScore,
        recordCount,
    )
        ? "VERIFIED"
        : "PENDING";

    // Business rule: verifiedScore may be null until validation is sufficient.
    const verifiedScore = verificationStatus === "VERIFIED" ? result.verifiedScore : null;
    const classification =
        verifiedScore != null
            ? result.classification
            : classifyScore(result.baseScore).key;

    return {
        destinationId,
        acesScore: result.acesScore,
        hyperlocalScore: result.hyperlocalScore,
        baseScore: result.baseScore,
        evidenceConfidenceScore: result.evidenceConfidenceScore,
        evidenceFactor: result.evidenceFactor,
        verifiedScore,
        classification,
        classificationLabel:
            verifiedScore != null
                ? result.classificationLabel
                : classifyScore(result.baseScore).label,
        verificationStatus,
        calculationVersion: scoringWeights.version || ACESH_CALCULATION_VERSION,
        weightsSnapshot: activeScoring.config,
        officialEvidenceCount: evidenceRecords.length,
        communityEvidenceCount: community?.responseCount ?? 0,
        communityEvidenceScore,
        evidenceSource: mergedEvidence.source,
        calculatedAt: now,
    };
}

function buildGroupInputs(
    items: IndicatorWithScore[],
    groups: string[],
): Record<string, GroupScoreInput[]> {
    const byGroup: Record<string, GroupScoreInput[]> = {};
    for (const group of groups) byGroup[group] = [];

    for (const { indicator, score } of items) {
        if (!score || !groups.includes(indicator.group)) continue;
        byGroup[indicator.group].push({
            value: score.value,
            weight: indicator.weight,
        });
    }

    return byGroup;
}
