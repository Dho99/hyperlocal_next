import { prisma } from "../../lib/prisma";
import { logger } from "./utils/logger";
import { toIndicatorScore } from "../../lib/services/acesh/indicator";
import { calculateAndSaveAssessment } from "../../lib/services/acesh/assessment-recalculation-service";

interface IndicatorSeed {
    code: string;
    name: string;
    group: string;
    description: string;
    weight: number;
}

/**
 * The 27 ACES-H indicators (9 groups × 3 indicators) with the canonical
 * weights (0.40 / 0.35 / 0.25) used in the official simulation.
 */
export const ACESH_INDICATOR_SEEDS: IndicatorSeed[] = [
    { code: "ACCESS.01", name: "Akses jalan utama ke destinasi", group: "ACCESS", description: "Kualitas dan kemudahan akses jalan utama menuju destinasi.", weight: 0.4 },
    { code: "ACCESS.02", name: "Akses transportasi umum", group: "ACCESS", description: "Ketersediaan angkutan umum menuju dan dari destinasi.", weight: 0.35 },
    { code: "ACCESS.03", name: "Akses jalur ramah pejalan kaki", group: "ACCESS", description: "Ketersediaan trotoar dan jalur pejalan kaki yang aman.", weight: 0.25 },
    { code: "COMM.01", name: "Media informasi halal", group: "COMMUNICATION", description: "Ketersediaan media informasi tentang fasilitas halal destinasi.", weight: 0.4 },
    { code: "COMM.02", name: "Penandaan fasilitas halal", group: "COMMUNICATION", description: "Kejelasan penanda fasilitas halal di lapangan.", weight: 0.35 },
    { code: "COMM.03", name: "Responsivitas layanan informasi", group: "COMMUNICATION", description: "Kecepatan dan kelengkapan layanan informasi kepada pengunjung.", weight: 0.25 },
    { code: "ENV.01", name: "Kebersihan lingkungan", group: "ENVIRONMENT", description: "Kebersihan kawasan dan fasilitas umum destinasi.", weight: 0.4 },
    { code: "ENV.02", name: "Kenyamanan ruang publik", group: "ENVIRONMENT", description: "Kenyamanan ruang publik seperti area istirahat dan taman.", weight: 0.35 },
    { code: "ENV.03", name: "Pengelolaan sampah", group: "ENVIRONMENT", description: "Tersedianya sistem pengelolaan sampah yang baik.", weight: 0.25 },
    { code: "SERV.01", name: "Fasilitas ibadah", group: "SERVICES", description: "Ketersediaan musala/masjid yang bersih dan mudah diakses.", weight: 0.4 },
    { code: "SERV.02", name: "Akses makanan halal", group: "SERVICES", description: "Ketersediaan tempat makan dan produk halal di sekitar.", weight: 0.35 },
    { code: "SERV.03", name: "Akses penginapan halal", group: "SERVICES", description: "Ketersediaan penginapan yang mendukung kebutuhan wisatawan halal.", weight: 0.25 },
    { code: "SPAT.01", name: "Jarak ke pusat kota", group: "SPATIAL_ACCESSIBILITY", description: "Jarak dan kemudahan akses destinasi dari pusat kota.", weight: 0.4 },
    { code: "SPAT.02", name: "Konektivitas antar destinasi", group: "SPATIAL_ACCESSIBILITY", description: "Keterhubungan destinasi dengan destinasi lain di sekitarnya.", weight: 0.35 },
    { code: "SPAT.03", name: "Ketersediaan parkir", group: "SPATIAL_ACCESSIBILITY", description: "Ketersediaan area parkir yang memadai dan aman.", weight: 0.25 },
    { code: "FUNC.01", name: "Ketersediaan layanan utama", group: "FUNCTIONAL_AVAILABILITY", description: "Ketersediaan layanan utama yang ditawarkan destinasi.", weight: 0.4 },
    { code: "FUNC.02", name: "Jam operasional", group: "FUNCTIONAL_AVAILABILITY", description: "Kejelasan dan kelayakan jam operasional destinasi.", weight: 0.35 },
    { code: "FUNC.03", name: "Kapasitas layanan", group: "FUNCTIONAL_AVAILABILITY", description: "Kapasitas destinasi menampung pengunjung secara nyaman.", weight: 0.25 },
    { code: "HALAL.01", name: "Sertifikasi halal tersedia", group: "HALAL_ASSURANCE", description: "Ketersediaan sertifikat halal resmi pada produk/layanan.", weight: 0.4 },
    { code: "HALAL.02", name: "Ketersediaan produk halal", group: "HALAL_ASSURANCE", description: "Ketersediaan produk dan menu bersertifikat halal.", weight: 0.35 },
    { code: "HALAL.03", name: "Transparansi kehalalan", group: "HALAL_ASSURANCE", description: "Kejelasan informasi dan jaminan kehalalan kepada pengunjung.", weight: 0.25 },
    { code: "ECOS.01", name: "Keterhubungan dengan UMKM", group: "ECOSYSTEM_CONNECTIVITY", description: "Keterlibatan destinasi dengan ekosistem UMKM lokal.", weight: 0.4 },
    { code: "ECOS.02", name: "Kemitraan lokal", group: "ECOSYSTEM_CONNECTIVITY", description: "Kemitraan dengan pelaku usaha dan komunitas lokal.", weight: 0.35 },
    { code: "ECOS.03", name: "Integrasi rantai pasok halal", group: "ECOSYSTEM_CONNECTIVITY", description: "Integrasi destinasi dalam rantai pasok halal.", weight: 0.25 },
    { code: "EMBED.01", name: "Keterlibatan komunitas", group: "EMBEDDEDNESS_CONTINUITY", description: "Keterlibatan komunitas dalam pengelolaan destinasi.", weight: 0.4 },
    { code: "EMBED.02", name: "Keberlanjutan program", group: "EMBEDDEDNESS_CONTINUITY", description: "Keberlanjutan program pengembangan halal destinasi.", weight: 0.35 },
    { code: "EMBED.03", name: "Kelembagaan pengelola", group: "EMBEDDEDNESS_CONTINUITY", description: "Kekuatan kelembagaan pengelola destinasi.", weight: 0.25 },
];

/**
 * Indicator values per group matching the official ACES-H simulation:
 * ACES = 66.8, Hyperlocal = 59.5, base = 64.2, confidence = 69.0,
 * factor = 0.907, verified = 58.2 → BERKEMBANG.
 */
const TARGET_SCORES: Record<string, number[]> = {
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

const REACHABILITY_SEEDS: Array<{
    facilityType: string;
    label: string;
    maxDistanceMeters: number | null;
    maxTravelMinutes: number | null;
    travelMode: "WALKING" | "DRIVING" | "CYCLING";
}> = [
    { facilityType: "MOSQUE", label: "Masjid", maxDistanceMeters: 500, maxTravelMinutes: 10, travelMode: "WALKING" },
    { facilityType: "MUSALA", label: "Musala", maxDistanceMeters: 500, maxTravelMinutes: 10, travelMode: "WALKING" },
    { facilityType: "RESTAURANT", label: "Restoran halal", maxDistanceMeters: 1000, maxTravelMinutes: 15, travelMode: "DRIVING" },
    { facilityType: "HALAL_FOOD", label: "Kuliner halal", maxDistanceMeters: 1000, maxTravelMinutes: 15, travelMode: "DRIVING" },
    { facilityType: "KULINER", label: "Kuliner", maxDistanceMeters: 1000, maxTravelMinutes: 15, travelMode: "DRIVING" },
    { facilityType: "LODGING", label: "Penginapan", maxDistanceMeters: 5000, maxTravelMinutes: 30, travelMode: "DRIVING" },
    { facilityType: "PENGINAPAN", label: "Penginapan", maxDistanceMeters: 5000, maxTravelMinutes: 30, travelMode: "DRIVING" },
    { facilityType: "DESTINATION_NEARBY", label: "Radius pencarian terdekat", maxDistanceMeters: 10000, maxTravelMinutes: null, travelMode: "DRIVING" },
];

const EVIDENCE_TYPES = [
    "SOURCE",
    "DOCUMENT",
    "PHOTO",
    "GEOLOCATION",
    "MANAGEMENT_CONFIRMATION",
    "FIELD_VALIDATION",
] as const;

/**
 * Builds 20 evidence records engineered to produce the exact confidence
 * components of the official simulation: source reliability avg 70,
 * document 75%, photo+geolocation 70%, management 65%, field 70%,
 * freshness avg 60 → confidence 69.0.
 */
function buildEvidenceRecords(destinationId: string) {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const freshnessAges = [
        30, 30, 30, 30,
        120, 120, 120, 120, 120, 120,
        250, 250, 250, 250,
        500, 500, 500, 500, 500, 500,
    ];
    const notes = [
        "Data profil destinasi dari dinas pariwisata",
        "Dokumen izin operasional destinasi",
        "Dokumentasi fasilitas ibadah",
        "Dokumen sertifikasi halal makanan",
        "Koordinat pintu masuk utama",
        "Koordinat area parkir",
        "Konfirmasi pengelola: fasilitas ibadah aktif",
        "Konfirmasi pengelola: kuliner halal tersedia",
        "Konfirmasi pengelola: jam operasional",
        "Validasi lapangan: kondisi fasilitas",
        "Validasi lapangan: penandaan halal",
        "Dokumen kemitraan UMKM lokal",
        "Koordinat musala terdekat",
        "Foto suasana area pengunjung",
        "Data capaian kunjungan",
        "Dokumen program keberlanjutan",
        "Validasi lapangan: kebersihan lingkungan",
        "Konfirmasi pengelola: kapasitas layanan",
        "Foto jalur akses utama",
        "Dokumen kelembagaan pengelola",
    ];

    return freshnessAges.map((ageDays, i) => ({
        destinationId,
        evidenceType: EVIDENCE_TYPES[i % EVIDENCE_TYPES.length],
        source: "Sumber resmi / survei lapangan",
        sourceReliabilityScore: 70,
        documentUrl: i < 15 ? `https://example.com/evidence/dest-doc-${i}.pdf` : null,
        photoUrl: i < 14 ? `https://example.com/evidence/dest-photo-${i}.jpg` : null,
        latitude: -7.32 + i * 0.001,
        longitude: 108.21 + i * 0.001,
        managementConfirmed: i < 13,
        fieldValidated: i < 14,
        dataDate: new Date(now - ageDays * day),
        validatedAt: i < 14 ? new Date(now - Math.max(7, ageDays - 30) * day) : null,
        notes: notes[i] ?? null,
    }));
}

/**
 * Seeds the ACES-H catalogue (27 indicators), reachability parameters, and a
 * full demo assessment for the first destination whose scores reproduce the
 * official simulation (58.2 → BERKEMBANG).
 */
export async function seedAcesh() {
    logger.info("Seeding ACES-H indicators, reachability, and demo assessment...");

    for (const indicator of ACESH_INDICATOR_SEEDS) {
        await prisma.aceshIndicator.upsert({
            where: { code: indicator.code },
            update: {
                name: indicator.name,
                group: indicator.group as never,
                description: indicator.description,
                weight: indicator.weight,
                isActive: true,
            },
            create: {
                code: indicator.code,
                name: indicator.name,
                group: indicator.group as never,
                description: indicator.description,
                weight: indicator.weight,
                isActive: true,
            },
        });
    }
    logger.success(`27 indikator ACES-H siap (${ACESH_INDICATOR_SEEDS.length}).`);

    for (const config of REACHABILITY_SEEDS) {
        await prisma.reachabilityConfig.upsert({
            where: { facilityType: config.facilityType },
            update: config,
            create: config,
        });
    }
    logger.success("Konfigurasi jangkauan (reachability) diperbarui.");

    const indicators = await prisma.aceshIndicator.findMany({
        where: { isActive: true },
        orderBy: [{ group: "asc" }, { code: "asc" }],
    });

    const target = await prisma.destination.findFirst({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true },
    });

    if (!target) {
        logger.warn("Tidak ada destinasi APPROVED — demo assessment dilewati.");
        return;
    }

    await prisma.aceshIndicatorScore.deleteMany({
        where: { destinationId: target.id },
    });
    await prisma.aceshEvidenceRecord.deleteMany({
        where: { destinationId: target.id },
    });
    await prisma.aceshAssessmentHistory.deleteMany({
        where: { destinationId: target.id },
    });
    await prisma.aceshAssessment.deleteMany({
        where: { destinationId: target.id },
    });

    const scores = [];
    for (const indicator of indicators) {
        const groupValues = TARGET_SCORES[indicator.group];
        if (!groupValues) continue;
        const orderInGroup = indicators
            .filter((i) => i.group === indicator.group)
            .findIndex((i) => i.code === indicator.code);
        const value = groupValues[orderInGroup] ?? 0;
        scores.push({
            destinationId: target.id,
            indicatorId: indicator.id,
            value,
            convertedScore: toIndicatorScore(value),
            notes: "Skor dari simulasi resmi ACES-H (seed).",
        });
    }
    await prisma.aceshIndicatorScore.createMany({ data: scores });

    const evidence = buildEvidenceRecords(target.id);
    await prisma.aceshEvidenceRecord.createMany({ data: evidence });
    logger.success(
        `Demo evidence dibuat untuk "${target.name}" (${evidence.length} rekaman).`,
    );

    const snapshot = await calculateAndSaveAssessment(
        target.id,
        null,
        "Seed simulasi ACES-H (contoh skor 58.2)",
    );

    logger.info(
        `[ACES-H SIMULASI] "${target.name}" → ` +
            `ACES ${snapshot.acesScore} | Hyperlocal ${snapshot.hyperlocalScore} | ` +
            `Dasar ${snapshot.baseScore} | Confidence ${snapshot.evidenceConfidenceScore} | ` +
            `Faktor ${snapshot.evidenceFactor} | Terverifikasi ${snapshot.verifiedScore} | ` +
            `${snapshot.classification} (${snapshot.verificationStatus})`,
    );

    return snapshot;
}
