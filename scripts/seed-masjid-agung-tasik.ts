import "dotenv/config";
import { prisma } from "../lib/prisma";
import { seedAceshCatalog } from "../prisma/seed/aceshSeeder";
import { calculateAndSaveAssessment } from "../lib/services/acesh/assessment-recalculation-service";
import { calculateHalalScoreFromWeights } from "../lib/utils/calculate-halal-score";
import { toIndicatorScore } from "../lib/services/acesh/indicator";

const DEST_NAME = "Masjid Agung Kota Tasikmalaya";
const DEST_SLUG = "masjid-agung-kota-tasik";
const DEST_ADDRESS = "Jl. Mesjid Agung No.01, Yudanagara, Kec. Tawang, Kab. Tasikmalaya, Jawa Barat 46121";
const DEST_CITY = "Kota Tasikmalaya";
const DEST_PROVINCE = "Jawa Barat";
const DEST_LAT = -7.3509;
const DEST_LNG = 108.2172;

const PERFECT_FACILITIES: Array<{ id: string; name: string; facilityType: string; weight: number }> = [
    { id: "perfect-fac-mosque", name: "Masjid Agung - Tempat Ibadah Utama", facilityType: "MOSQUE", weight: 100 },
    { id: "perfect-fac-restaurant", name: "Kuliner Halal Sekitar Masjid Agung", facilityType: "RESTAURANT", weight: 100 },
    { id: "perfect-fac-family", name: "Area Ramah Keluarga & Heritage", facilityType: "FAMILY", weight: 100 },
    { id: "perfect-fac-access", name: "Akses Transportasi & Pedestrian", facilityType: "ACCESSIBILITY", weight: 100 },
    { id: "perfect-fac-clean", name: "Toilet & Wudhu Bersih - Kebersihan Lingkungan", facilityType: "CLEANLINESS", weight: 100 },
    { id: "perfect-fac-additional", name: "Keamanan Umum & Papan Informasi", facilityType: "ADDITIONAL", weight: 100 },
];

async function main() {
    console.log("=== Seed Masjid Agung Kota Tasik - Perfect 100 ===\n");

    await seedAceshCatalog();

    const category = await prisma.category.upsert({
        where: { slug_type: { slug: "wisata-religi", type: "DESTINATION" } },
        update: {},
        create: { name: "Wisata Religi", slug: "wisata-religi", type: "DESTINATION", description: "Wisata religi & masjid" },
    });
    console.log(`✓ Kategori: ${category.name} (${category.id})`);

    for (const f of PERFECT_FACILITIES) {
        await prisma.halalFacility.upsert({
            where: { id: f.id },
            update: { name: f.name, facilityType: f.facilityType, weight: f.weight, maxDistance: 5 },
            create: { id: f.id, name: f.name, facilityType: f.facilityType, weight: f.weight, maxDistance: 5 },
        });
    }
    console.log(`✓ 6 HalalFacility perfect (weight 100) siap`);

    let dest = await prisma.destination.findUnique({ where: { slug: DEST_SLUG }, select: { id: true } });
    if (dest) {
        await prisma.destination.update({
            where: { id: dest.id },
            data: {
                name: DEST_NAME,
                address: DEST_ADDRESS,
                city: DEST_CITY,
                province: DEST_PROVINCE,
                latitude: DEST_LAT,
                longitude: DEST_LNG,
                categoryId: category.id,
                status: "PENDING",
                validatedScore: null,
                categoryScores: undefined as any,
            },
        });
        console.log(`= Destinasi existing diupdate: ${DEST_SLUG}`);
    } else {
        const created = await prisma.destination.create({
            data: {
                name: DEST_NAME,
                slug: DEST_SLUG,
                address: DEST_ADDRESS,
                city: DEST_CITY,
                province: DEST_PROVINCE,
                latitude: DEST_LAT,
                longitude: DEST_LNG,
                categoryId: category.id,
                status: "PENDING",
                description: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Masjid Agung Kota Tasikmalaya - destinasi wisata religi dengan kesiapan halal sempurna (seed perfect 100)." }] }] } as any,
            },
            select: { id: true },
        });
        dest = created;
        console.log(`✓ Destinasi dibuat: ${DEST_SLUG} (${dest.id})`);
    }
    const destinationId = dest!.id;

    await prisma.destinationHalalFacility.deleteMany({ where: { destinationId } });
    await prisma.aceshIndicatorScore.deleteMany({ where: { destinationId } });
    await prisma.aceshEvidenceRecord.deleteMany({ where: { destinationId } });
    await prisma.aceshAssessmentHistory.deleteMany({ where: { destinationId } });
    await prisma.aceshAssessment.deleteMany({ where: { destinationId } });
    await prisma.recommendationAction.deleteMany({ where: { destinationId } });
    await prisma.halalValidation.deleteMany({ where: { destinationId } });

    for (const f of PERFECT_FACILITIES) {
        await prisma.destinationHalalFacility.create({
            data: { destinationId, facilityId: f.id, name: f.name, latitude: DEST_LAT, longitude: DEST_LNG },
        });
    }
    const facilityWeights = PERFECT_FACILITIES.map((f) => ({ facilityType: f.facilityType, weight: f.weight }));
    const halalScore = calculateHalalScoreFromWeights(facilityWeights);
    await prisma.destination.update({ where: { id: destinationId }, data: { halalScore } });
    console.log(`✓ 6 fasilitas di-link → halalScore=${halalScore}`);

    const indicators = await prisma.aceshIndicator.findMany({ where: { isActive: true }, orderBy: [{ group: "asc" }, { code: "asc" }] });
    const scores = indicators.map((ind) => ({
        destinationId,
        indicatorId: ind.id,
        value: 4,
        convertedScore: toIndicatorScore(4),
        notes: "Perfect 100 - Masjid Agung Kota Tasik",
    }));
    await prisma.aceshIndicatorScore.createMany({ data: scores });
    console.log(`✓ ${scores.length} indikator =4 (100) dibuat`);

    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const evidenceTypes = ["SOURCE", "DOCUMENT", "PHOTO", "GEOLOCATION", "MANAGEMENT_CONFIRMATION", "FIELD_VALIDATION"] as const;
    const evidenceData = evidenceTypes.map((type, i) => ({
        destinationId,
        evidenceType: type as any,
        source: "Seed perfect 100 - Masjid Agung Kota Tasik",
        sourceReliabilityScore: 100,
        documentUrl: `https://example.com/masjid-agung-tasik/doc-${i}.pdf`,
        photoUrl: `https://example.com/masjid-agung-tasik/photo-${i}.jpg`,
        latitude: DEST_LAT + i * 0.0001,
        longitude: DEST_LNG + i * 0.0001,
        managementConfirmed: true,
        fieldValidated: true,
        dataDate: new Date(now - 10 * day),
        validatedAt: new Date(now - 7 * day),
        notes: `Evidence sempurna ${type} - Masjid Agung`,
    }));
    await prisma.aceshEvidenceRecord.createMany({ data: evidenceData });
    console.log(`✓ ${evidenceData.length} evidence perfect (EVC komponen 100) dibuat`);

    await prisma.halalValidation.create({ data: { destinationId, status: "PENDING" } });

    const snapshot = await calculateAndSaveAssessment(destinationId, undefined, "Seed perfect 100 - Masjid Agung Kota Tasik");

    console.log(`\n[HASIL] ${DEST_NAME}`);
    console.log(`  halalScore=${halalScore} | ACES ${snapshot.acesScore} | Hyperlocal ${snapshot.hyperlocalScore} | Base ${snapshot.baseScore} | EVC ${snapshot.evidenceConfidenceScore} | Factor ${snapshot.evidenceFactor} | Verified ${snapshot.verifiedScore} | ${snapshot.classification} (${snapshot.verificationStatus})`);
    console.log(`  URL: http://localhost:3000/destinations/${destinationId}`);
    console.log(`  Slug: /destinasi/${DEST_SLUG}`);

    if (halalScore !== 100 || snapshot.baseScore !== 100 || snapshot.verifiedScore !== 100) {
        console.warn("⚠ Skor belum 100 sempurna, periksa indikator/evidence");
    } else {
        console.log("✓ SEMPURNA 100 - siap dinilai");
    }
}

main().then(() => process.exit(0)).catch((e) => { console.error("Fatal:", e); process.exit(1); });
