import type { AceshIndicatorGroup } from "@/lib/generated/prisma";

/** Indonesian display labels for ACES-H indicator groups. */
export const GROUP_LABELS_ID: Record<AceshIndicatorGroup, string> = {
    ACCESS: "Akses",
    COMMUNICATION: "Komunikasi",
    ENVIRONMENT: "Lingkungan",
    SERVICES: "Layanan",
    SPATIAL_ACCESSIBILITY: "Keterjangkauan Spasial",
    FUNCTIONAL_AVAILABILITY: "Ketersediaan Fungsional",
    HALAL_ASSURANCE: "Jaminan Halal",
    ECOSYSTEM_CONNECTIVITY: "Konektivitas Ekosistem",
    EMBEDDEDNESS_CONTINUITY: "Keterpaduan & Keberlanjutan",
};

/** Indonesian labels for evidence record types (enum AceshEvidenceType). */
export const EVIDENCE_TYPE_LABELS: Record<string, string> = {
    SOURCE: "Sumber",
    DOCUMENT: "Dokumen",
    PHOTO: "Foto",
    GEOLOCATION: "Geolokasi",
    MANAGEMENT_CONFIRMATION: "Konfirmasi Pengelola",
    FIELD_VALIDATION: "Validasi Lapangan",
    OTHER: "Lainnya",
};

export const EVIDENCE_TYPE_OPTIONS = [
    "SOURCE",
    "DOCUMENT",
    "PHOTO",
    "GEOLOCATION",
    "MANAGEMENT_CONFIRMATION",
    "FIELD_VALIDATION",
    "OTHER",
] as const;

/** Indonesian labels for the three ACES-H layers. */
export const LAYER_LABELS = {
    aces: "Lapis 1 — Kesiapan ACES",
    hyperlocal: "Lapis 2 — Hyperlocal",
    evidence: "Lapis 3 — Keyakinan Bukti",
} as const;

/** Indonesian labels for the six Evidence Confidence components. */
export const EVIDENCE_COMPONENT_LABELS: Record<string, string> = {
    sourceReliability: "Keandalan Sumber",
    documentEvidence: "Bukti Dokumen",
    photoGeolocation: "Foto & Geolokasi",
    managementConfirmation: "Konfirmasi Pengelola",
    fieldValidation: "Validasi Lapangan",
    dataFreshness: "Kesegaran Data",
};

export const EVIDENCE_COMPONENT_KEYS = [
    "sourceReliability",
    "documentEvidence",
    "photoGeolocation",
    "managementConfirmation",
    "fieldValidation",
    "dataFreshness",
] as const;

export const EVIDENCE_COMPONENT_WEIGHTS: Record<string, number> = {
    sourceReliability: 0.15,
    documentEvidence: 0.2,
    photoGeolocation: 0.15,
    managementConfirmation: 0.1,
    fieldValidation: 0.25,
    dataFreshness: 0.15,
};

/** Indonesian labels for readiness classifications. */
export const CLASSIFICATION_LABELS: Record<string, string> = {
    BELUM_SIAP: "Belum siap",
    PERLU_PENGEMBANGAN: "Perlu pengembangan",
    BERKEMBANG: "Berkembang",
    SIAP: "Siap",
    SANGAT_SIAP: "Sangat siap",
};

export const CLASSIFICATION_STYLES: Record<string, string> = {
    BELUM_SIAP: "bg-red-100 text-red-800",
    PERLU_PENGEMBANGAN: "bg-orange-100 text-orange-800",
    BERKEMBANG: "bg-yellow-100 text-yellow-800",
    SIAP: "bg-green-100 text-green-800",
    SANGAT_SIAP: "bg-emerald-100 text-emerald-800",
};

/** Indicator value (0–4) to human readable Indonesian label. */
export const VALUE_LABELS: Record<number, string> = {
    0: "Tidak tersedia",
    1: "Sangat rendah",
    2: "Cukup",
    3: "Baik",
    4: "Sangat baik",
};

/** Severity (gap) labels. */
export const SEVERITY_LABELS: Record<string, string> = {
    HIGH: "Tinggi",
    MEDIUM: "Sedang",
    LOW: "Rendah",
};

/** Recommendation timeline labels. */
export const TIMELINE_LABELS: Record<string, string> = {
    QUICK: "Cepat (<30 hari)",
    MEDIUM: "Sedang (1–6 bulan)",
    STRATEGIC: "Strategis (>6 bulan)",
};

/** Hyperlocal facility status labels. */
export const FACILITY_STATUS_LABELS: Record<string, string> = {
    VERIFIED: "Terverifikasi",
    PARTIAL: "Sebagian",
    NEED_VALIDATION: "Perlu Validasi",
};

/**
 * Readiness diagnosis from a 0–100 score. Mirrors the wording used by the
 * annotated tree so admin and public views stay consistent.
 */
export function diagnosisForScore(score: number | null): string {
    if (score == null) return "Belum dinilai";
    if (score >= 75) return "Baik — tidak butuh tindakan prioritas";
    if (score >= 50) return "Perlu peningkatan — optimalkan operasional";
    if (score >= 25)
        return "Ruang peningkatan signifikan — butuh pembangunan/perbaikan";
    return "Kritis — tindakan prioritas tinggi";
}
