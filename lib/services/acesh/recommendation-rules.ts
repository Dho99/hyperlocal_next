import type { AceshIndicatorGroup } from "@/lib/generated/prisma";
import type { RecommendationRule } from "./recommendation-types";

export const RECOMMENDATION_RULES: RecommendationRule[] = [
    // Infrastructure – ACES
    { id: "BUILD_TOILET", indicatorGroup: "SERVICES", actionType: "BUILD", title: "Tambah / renovasi toilet & wudhu", description: "Skor Services rendah – fasilitas sanitasi prioritas", timeline: "MEDIUM", defaultFeasibility: 0.6, defaultVisitorImpact: 4 },
    { id: "BUILD_MOSQUE", indicatorGroup: "SERVICES", actionType: "BUILD", prerequisite: ["FACILITY_EXISTS"], title: "Tambah masjid/mushola radius <500m", description: "Akses ibadah di bawah 40 – bangun/kerjasama mushola terdekat", timeline: "STRATEGIC", defaultFeasibility: 0.5, defaultVisitorImpact: 5 },
    { id: "UPGRADE_ACCESS", indicatorGroup: "ACCESS", actionType: "IMPROVE", title: "Perbaiki akses jalan & signage", description: "Gap Access tinggi – perbaiki jalan, petunjuk, parkir", timeline: "MEDIUM", defaultFeasibility: 0.7, defaultVisitorImpact: 3 },
    { id: "IMPROVE_INFO", indicatorGroup: "COMMUNICATION", actionType: "IMPROVE", title: "Tambah signage halal & informasi", description: "Communication rendah – tambah papan, QR, multibahasa", timeline: "QUICK", defaultFeasibility: 0.9, defaultVisitorImpact: 3 },
    { id: "ENVIRON_CLEAN", indicatorGroup: "ENVIRONMENT", actionType: "IMPROVE", title: "Perbaiki kebersihan & keberlanjutan", description: "Environment gap – program kebersihan & pengelolaan sampah", timeline: "MEDIUM", defaultFeasibility: 0.7, defaultVisitorImpact: 3 },
    // Hyperlocal
    { id: "SPATIAL_FIX", indicatorGroup: "SPATIAL_ACCESSIBILITY", actionType: "IMPROVE", title: "Perbaiki jarak jaringan jalan", description: "Spatial accessibility rendah – rute alternatif bukan garis lurus", timeline: "STRATEGIC", defaultFeasibility: 0.4, defaultVisitorImpact: 3 },
    { id: "HOURS_ALIGN", indicatorGroup: "FUNCTIONAL_AVAILABILITY", actionType: "IMPROVE", title: "Sesuaikan jam buka dengan jam kunjungan", description: "Functional availability gap – sinkronkan jam operasional", timeline: "QUICK", defaultFeasibility: 0.9, defaultVisitorImpact: 4 },
    { id: "HALAL_CERT", indicatorGroup: "HALAL_ASSURANCE", actionType: "VERIFY", prerequisite: ["FACILITY_EXISTS"], title: "Upload sertifikat halal MUI", description: "Halal assurance rendah – lengkapi sertifikat", timeline: "QUICK", defaultFeasibility: 0.8, defaultVisitorImpact: 5 },
    { id: "ECOSYSTEM_UMKM", indicatorGroup: "ECOSYSTEM_CONNECTIVITY", actionType: "BUILD", title: "Integrasi UMKM halal sekitar", description: "Ecosystem rendah – hubungkan UMKM halal", timeline: "STRATEGIC", defaultFeasibility: 0.5, defaultVisitorImpact: 4 },
    { id: "SOP_CONTINUITY", indicatorGroup: "EMBEDDEDNESS_CONTINUITY", actionType: "IMPROVE", title: "SOP pengelola & kontinuitas layanan", description: "Embeddedness rendah – buat SOP, training", timeline: "MEDIUM", defaultFeasibility: 0.7, defaultVisitorImpact: 2 },
    // Evidence
    { id: "VERIFY_EVIDENCE", indicatorGroup: "EVIDENCE", actionType: "VERIFY", title: "Jadwalkan validasi lapangan", description: "Field Validation bobot 25% paling besar – validasi lapangan", timeline: "QUICK", defaultFeasibility: 0.8, defaultVisitorImpact: 4 },
    { id: "UPLOAD_DOC", indicatorGroup: "EVIDENCE", actionType: "VERIFY", title: "Upload bukti dokumen", description: "Document evidence 20% – upload sertifikat/dokumen", timeline: "QUICK", defaultFeasibility: 0.9, defaultVisitorImpact: 3 },
    { id: "PHOTO_GEO", indicatorGroup: "EVIDENCE", actionType: "VERIFY", title: "Tambah foto + geotag", description: "Photo & Geolocation 15% – foto tergeotag", timeline: "QUICK", defaultFeasibility: 0.95, defaultVisitorImpact: 2 },
];

export function findRule(group: AceshIndicatorGroup | "EVIDENCE"): RecommendationRule | undefined {
    return RECOMMENDATION_RULES.find((r) => r.indicatorGroup === group);
}
