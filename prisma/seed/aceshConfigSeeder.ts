import { prisma } from "../../lib/prisma";
import { logger } from "./utils/logger";
import {
    DEFAULT_SCORING_CONFIG,
    assertScoringConfigTotals,
} from "../../lib/services/acesh/scoring-defaults";

/**
 * Seeds the complete ACES-H 1.0 parameter set: ACES readiness (layer 1),
 * hyperlocal (layer 2), evidence confidence (layer 3), base composition,
 * and the evidence factor.
 *
 * Create-if-missing: an existing `acesh_scoring_configs` row is never
 * overwritten, so admin customisations survive re-seeding. Run the migration
 * `20261118091000_seed_acesh_scoring_defaults` for environments that only
 * deploy migrations.
 */
export async function seedAceshScoringConfig() {
    assertScoringConfigTotals(DEFAULT_SCORING_CONFIG);

    await prisma.aceshScoringConfig.createMany({
        data: [{ id: "default", ...DEFAULT_SCORING_CONFIG, updatedBy: "seed" }],
        skipDuplicates: true,
    });

    const config = await prisma.aceshScoringConfig.findUniqueOrThrow({
        where: { id: "default" },
    });

    logger.success(
        `Konfigurasi scoring ACES-H siap (versi ${config.version}, 3 lapisan aktif).`,
    );

    return config;
}
