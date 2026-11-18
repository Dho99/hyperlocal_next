/**
 * recalc-acesh-all.ts
 * -------------------
 * Recalculates ACES-H for every destination that has at least one active
 * public survey response, so the Layer 3 community evidence is applied to
 * destinations rated before this feature existed.
 *
 * Usage:
 *   npm run recalc:acesh
 */

import "dotenv/config";
import { prisma } from "../lib/prisma";
import { calculateAndSaveAssessment } from "../lib/services/acesh/assessment-recalculation-service";

async function main() {
    const destinations = await prisma.destination.findMany({
        where: {
            surveyResponses: {
                some: { scoreHiddenAt: null },
            },
        },
        select: { id: true, name: true },
        orderBy: { createdAt: "asc" },
    });

    console.log(`Recalculating ACES-H for ${destinations.length} destinations...`);

    for (const destination of destinations) {
        const snapshot = await calculateAndSaveAssessment(
            destination.id,
            undefined,
            "Perhitungan ulang bukti komunitas",
        );
        console.log(
            `✓ ${destination.name}: EVC ${snapshot.evidenceConfidenceScore} ` +
                `(${snapshot.evidenceSource}, ${snapshot.communityEvidenceCount} penilaian pengunjung) ` +
                `→ ${snapshot.verificationStatus}`,
        );
    }

    console.log("Selesai.");
}

main()
    .catch((error) => {
        console.error("Gagal menghitung ulang ACES-H:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
