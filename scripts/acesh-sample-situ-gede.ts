/**
 * acesh-sample-situ-gede.ts
 * --------------------------
 * Menyiapkan data sampel simulasi ACES-H untuk destinasi Situ Gede
 * (id 876716ea-b568-482a-bc92-e885c811ebce):
 *   1. Setujui destinasi (status APPROVED)
 *   2. Pastikan katalog ACES-H (27 indikator + reachability) tersedia
 *   3. Isi skor 27 indikator (skenario resmi ACES-H)
 *   4. Buat 20 rekaman evidence → EVC 69 → VERIFIED
 *   5. Hitung & simpan assessment (base 64.2, factor 0.907, verified 58.2 → BERKEMBANG)
 *
 * Usage:
 *   npx tsx scripts/acesh-sample-situ-gede.ts
 */

import "dotenv/config";
import { prisma } from "../lib/prisma";
import {
    seedAceshCatalog,
    TARGET_SCORES,
    buildEvidenceRecords,
} from "../prisma/seed/aceshSeeder";
import { calculateAndSaveAssessment } from "../lib/services/acesh/assessment-recalculation-service";
import { toIndicatorScore } from "../lib/services/acesh/indicator";

const DESTINATION_ID = "876716ea-b568-482a-bc92-e885c811ebce";
const DESTINATION_SLUG = "situ-gede";

async function main() {
    const dest = await prisma.destination.findUnique({
        where: { id: DESTINATION_ID },
        select: { id: true, name: true, slug: true, status: true },
    });

    if (!dest || dest.slug !== DESTINATION_SLUG) {
        throw new Error(
            `Destinasi tidak ditemukan untuk id ${DESTINATION_ID} (slug ${DESTINATION_SLUG}).`,
        );
    }

    // 1) Approve destination
    if (dest.status !== "APPROVED") {
        await prisma.destination.update({
            where: { id: DESTINATION_ID },
            data: { status: "APPROVED" },
        });
        console.log(`✓ Destinasi disetujui: ${dest.name}`);
    } else {
        console.log(`= Destinasi sudah APPROVED: ${dest.name}`);
    }

    // 2) Ensure catalogue (idempotent)
    await seedAceshCatalog();

    // 3) Purge existing ACES-H data for this destination
    await prisma.aceshIndicatorScore.deleteMany({ where: { destinationId: DESTINATION_ID } });
    await prisma.aceshEvidenceRecord.deleteMany({ where: { destinationId: DESTINATION_ID } });
    await prisma.aceshAssessmentHistory.deleteMany({ where: { destinationId: DESTINATION_ID } });
    await prisma.aceshAssessment.deleteMany({ where: { destinationId: DESTINATION_ID } });

    // 4) Indicator scores (official ACES-H scenario)
    const indicators = await prisma.aceshIndicator.findMany({
        where: { isActive: true },
        orderBy: [{ group: "asc" }, { code: "asc" }],
    });

    const scores: Array<{
        destinationId: string;
        indicatorId: string;
        value: number;
        convertedScore: number;
        notes: string;
    }> = [];
    for (const indicator of indicators) {
        const groupValues = (TARGET_SCORES as Record<string, number[]>)[indicator.group];
        if (!groupValues) continue;
        const orderInGroup = indicators
            .filter((i) => i.group === indicator.group)
            .findIndex((i) => i.code === indicator.code);
        const value = groupValues[orderInGroup] ?? 0;
        scores.push({
            destinationId: DESTINATION_ID,
            indicatorId: indicator.id,
            value,
            convertedScore: toIndicatorScore(value),
            notes: "Sample simulasi ACES-H Situ Gede (skenario resmi).",
        });
    }
    await prisma.aceshIndicatorScore.createMany({ data: scores });
    console.log(`✓ ${scores.length} skor indikator dibuat.`);

    // 5) Evidence records → EVC 69 → VERIFIED
    const evidence = buildEvidenceRecords(DESTINATION_ID);
    await prisma.aceshEvidenceRecord.createMany({ data: evidence });
    console.log(`✓ ${evidence.length} rekaman evidence dibuat.`);

    // 6) Recalculate & persist assessment + history
    const snapshot = await calculateAndSaveAssessment(
        DESTINATION_ID,
        undefined,
        "Sample simulasi ACES-H Situ Gede.",
    );

    console.log("\n[ACES-H SITU GEDE] " + dest.name);
    console.log(
        `  ACES ${snapshot.acesScore} | Hyperlocal ${snapshot.hyperlocalScore} | ` +
            `Dasar ${snapshot.baseScore} | Confidence ${snapshot.evidenceConfidenceScore} | ` +
            `Faktor ${snapshot.evidenceFactor} | Terverifikasi ${snapshot.verifiedScore} | ` +
            `${snapshot.classification} (${snapshot.verificationStatus})`,
    );
    console.log("✓ ACES-H selesai — cek UI /destinations/" + DESTINATION_ID);
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Fatal:", err);
        process.exit(1);
    });
