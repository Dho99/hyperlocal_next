import { vi } from "vitest";

/**
 * Shared Prisma mock for ACES-H integration tests.
 * All model accessors are vi.fn() so tests can override behavior per case.
 *
 * The instance is memoized so `vi.mock("@/lib/prisma")` factories and the
 * test body can both reference the SAME object.
 */
export function buildPrismaMock() {
    return {
        aceshIndicator: {
            findMany: vi.fn(),
        },
        aceshIndicatorScore: {
            findMany: vi.fn(),
            upsert: vi.fn(),
            createMany: vi.fn(),
        },
        aceshEvidenceRecord: {
            findMany: vi.fn(),
            createMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        aceshAssessment: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            upsert: vi.fn(),
            deleteMany: vi.fn(),
        },
        aceshAssessmentHistory: {
            create: vi.fn(),
            findMany: vi.fn(),
            deleteMany: vi.fn(),
        },
        reachabilityConfig: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            upsert: vi.fn(),
        },
        destination: {
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            findMany: vi.fn(),
            count: vi.fn(),
        },
        halalFacility: { findMany: vi.fn() },
        destinationHalalFacility: { findMany: vi.fn() },
        $transaction: vi.fn(async (args: unknown[]) => args),
        $disconnect: vi.fn(),
    };
}

export type PrismaMock = ReturnType<typeof buildPrismaMock>;

let instance: PrismaMock | null = null;

export function getPrismaMockInstance(): PrismaMock {
    if (!instance) instance = buildPrismaMock();
    return instance;
}

/** 27 indicators with the canonical weights (0.40 / 0.35 / 0.25 per group). */
export function buildIndicatorFixtures() {
    const groups = [
        "ACCESS",
        "COMMUNICATION",
        "ENVIRONMENT",
        "SERVICES",
        "SPATIAL_ACCESSIBILITY",
        "FUNCTIONAL_AVAILABILITY",
        "HALAL_ASSURANCE",
        "ECOSYSTEM_CONNECTIVITY",
        "EMBEDDEDNESS_CONTINUITY",
    ];
    const weights = [0.4, 0.35, 0.25];
    return groups.flatMap((group) =>
        weights.map((weight, i) => ({
            id: `indicator-${group}-${i}`,
            code: `${group}.0${i + 1}`,
            name: `Indikator ${group} ${i + 1}`,
            group,
            description: null,
            weight,
            isActive: true,
            createdAt: new Date("2026-01-01"),
            updatedAt: new Date("2026-01-01"),
        })),
    );
}

/** Official indicator values per group. */
export const OFFICIAL_VALUES: Record<string, number[]> = {
    ACCESS: [3, 3, 3],
    COMMUNICATION: [2, 2, 2],
    ENVIRONMENT: [2, 2, 2],
    SERVICES: [4, 2, 3],
    SPATIAL_ACCESSIBILITY: [3, 3, 2],
    FUNCTIONAL_AVAILABILITY: [2, 2, 2],
    HALAL_ASSURANCE: [2, 3, 2],
    ECOSYSTEM_CONNECTIVITY: [3, 2, 2],
    EMBEDDEDNESS_CONTINUITY: [3, 3, 0],
};

export function buildOfficialScores(destinationId: string) {
    const indicators = buildIndicatorFixtures();
    return indicators.flatMap((indicator) => {
        const groupValues = OFFICIAL_VALUES[indicator.group as string];
        if (!groupValues) return [];
        const orderInGroup = indicators
            .filter((i) => i.group === indicator.group)
            .findIndex((i) => i.id === indicator.id);
        return [
            {
                id: `score-${indicator.id}`,
                destinationId,
                indicatorId: indicator.id,
                value: groupValues[orderInGroup] ?? 0,
                convertedScore: (groupValues[orderInGroup] ?? 0) * 25,
                notes: null,
                assessedBy: null,
                assessedAt: new Date("2026-01-01"),
            },
        ];
    });
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 20 evidence records engineered to produce the official confidence
 * components (70 / 75 / 70 / 65 / 70 / 60 → 69.0). Freshness uses
 * dataDate only (no validatedAt), so results are deterministic.
 */
export function buildOfficialEvidence(destinationId: string, now: Date) {
    const ages = [
        30, 30, 30, 30,
        120, 120, 120, 120, 120, 120,
        250, 250, 250, 250,
        500, 500, 500, 500, 500, 500,
    ];
    return ages.map((ageDays, i) => ({
        id: `evidence-${i}`,
        destinationId,
        sourceReliabilityScore: 70,
        documentUrl: i < 15 ? `https://example.com/doc-${i}.pdf` : null,
        photoUrl: i < 14 ? `https://example.com/photo-${i}.jpg` : null,
        latitude: -7.3 + i * 0.001,
        longitude: 108.2 + i * 0.001,
        managementConfirmed: i < 13,
        fieldValidated: i < 14,
        dataDate: new Date(now.getTime() - ageDays * DAY_MS),
        validatedAt: null,
        createdAt: now,
    }));
}
