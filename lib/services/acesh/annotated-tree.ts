import type { AceshIndicatorGroup } from "@/lib/generated/prisma";
import { ACES_DIMENSION_WEIGHTS, HYPERLOCAL_DIMENSION_WEIGHTS } from "./constants";
import type { AceshModelDatum } from "@/components/admin/acesh/acesh-model-diagram";
import { calculateRIS, classifyActionType, timelineFromFeasibility } from "./recommendation-engine";
import { findRule } from "./recommendation-rules";
import { simulateImprovement, simulateEvidenceImprovement } from "./recommendation-simulator";

export interface RecommendationInsight {
    id?: string;
    indicatorId?: string;
    code?: string;
    group: AceshIndicatorGroup | "EVIDENCE";
    currentScore: number | null; // 0-100
    targetScore: number; // 100
    gap: number; // 100 - current
    severity: "HIGH" | "MEDIUM" | "LOW";
    diagnosis: string;
    recommendation: string;
    actionType: "VERIFY" | "IMPROVE" | "ADD" | "MAINTAIN";
    impactScore: number; // RIS
    estimatedGain: { base: number; verified: number; newVerified?: number };
    estimatedBaseIncrease?: number;
    estimatedVerifiedIncrease?: number;
    estimatedNewVerified?: number;
    priority: number;
    timeline: "QUICK" | "MEDIUM" | "STRATEGIC";
    reason: string[];
    prerequisite?: string[];
}

export interface AnnotatedDomain {
    key: string;
    label: string;
    weight: number;
    score: number | null;
    gap: number | null;
    insights: RecommendationInsight[];
    diagnosis: string;
}

export interface AnnotatedScoringTree {
    aces: Record<string, AnnotatedDomain>;
    hyperlocal: Record<string, AnnotatedDomain>;
    evidence: Record<string, AnnotatedDomain>;
    outputs: {
        kategori: { label: string; alasan: string };
        topGaps: Array<{ label: string; gap: number; group: string }>;
        priorityList: RecommendationInsight[];
        hyperlocalMap: Array<{ name: string; distance?: number; status: "VERIFIED" | "PARTIAL" | "NEED_VALIDATION" }>;
    };
}

function severityFromGap(gap: number): RecommendationInsight["severity"] {
    if (gap >= 50) return "HIGH";
    if (gap >= 25) return "MEDIUM";
    return "LOW";
}

function diagnosisFor(group: string, score: number | null, gap: number | null): string {
    if (score == null) return "Belum dinilai";
    if (score >= 75) return "Baik — tidak butuh tindakan prioritas";
    if (score >= 50) return "Perlu peningkatan — optimalkan operasional";
    if (score >= 25) return "Ruang peningkatan signifikan — butuh pembangunan/perbaikan";
    return "Kritis — tindakan prioritas tinggi";
}

export function buildAnnotatedTree(params: {
    data: AceshModelDatum | null;
    groupBreakdown?: Array<{ group: string; groupScore: number | null; dimensionWeight: number }>;
    indicators?: Array<{ id: string; code: string; name: string; group: AceshIndicatorGroup; weight: number; value: number }>;
    evidenceRecords?: Array<{ evidenceType: string; documentUrl?: string | null; photoUrl?: string | null; latitude?: any; longitude?: any; managementConfirmed?: boolean; fieldValidated?: boolean; validatedAt?: string | null; dataDate?: string | null }>;
    profile?: { slug?: string; categoryName?: string; city?: string };
}): AnnotatedScoringTree {
    const { data, groupBreakdown = [], indicators = [], evidenceRecords = [], profile } = params;
    const acesScore = data?.acesScore ?? 0;
    const hyperScore = data?.hyperlocalScore ?? 0;
    const evc = data?.evidenceConfidenceScore ?? 0;
    const baseScore = data?.baseScore ?? 0;

    const byGroup = new Map<string, typeof indicators>();
    for (const ind of indicators) {
        if (!byGroup.has(ind.group)) byGroup.set(ind.group, []);
        byGroup.get(ind.group)!.push(ind);
    }

    const acesMap: Record<string, AnnotatedDomain> = {};
    const acesGroups = [
        { key: "ACCESS", label: "Access", weight: ACES_DIMENSION_WEIGHTS.ACCESS },
        { key: "COMMUNICATION", label: "Communication", weight: ACES_DIMENSION_WEIGHTS.COMMUNICATION },
        { key: "ENVIRONMENT", label: "Environment", weight: ACES_DIMENSION_WEIGHTS.ENVIRONMENT },
        { key: "SERVICES", label: "Services", weight: ACES_DIMENSION_WEIGHTS.SERVICES },
    ];
    for (const g of acesGroups) {
        const gb = groupBreakdown.find((x) => x.group === g.key);
        const score = gb?.groupScore ?? null;
        const gap = score != null ? 100 - score : null;
        const insights: RecommendationInsight[] = [];
        const list = byGroup.get(g.key as AceshIndicatorGroup) ?? [];
        for (const ind of list.slice(0, 2)) {
            const sc = ind.value * 25;
            const gp = 100 - sc;
            if (gp < 15 && evc >= 60) continue;
            const baseW = 0.65;
            const dimW = g.weight;
            const sumW = list.reduce((s, x) => s + x.weight, 0) || 1;
            const { ris, priority, reason, feasibility } = calculateRIS({
                indicator: { id: ind.id, code: ind.code, name: ind.name, group: ind.group, weight: ind.weight, value: ind.value },
                dimensionWeight: dimW,
                groupScore: sc,
                baseWeight: baseW,
                evidenceConfidence: evc,
                profile,
            });
            const actionMap: Record<string, RecommendationInsight["actionType"]> = { BUILD: "ADD", IMPROVE: "IMPROVE", VERIFY: "VERIFY", MAINTAIN: "MAINTAIN" };
            const rawType = classifyActionType(ind.value, evc, false);
            const at = actionMap[rawType] ?? "IMPROVE";
            const rule = findRule(ind.group as AceshIndicatorGroup);
            const sim = simulateImprovement({
                currentAces: acesScore,
                currentHyperlocal: hyperScore,
                currentEvc: evc,
                group: g.key,
                dimensionWeight: dimW,
                indicatorWeight: ind.weight,
                sumWeightsGroup: sumW,
                currentValue: ind.value,
                targetValue: 4,
                baseWeight: baseW,
            });
            insights.push({
                indicatorId: ind.id,
                code: ind.code,
                group: ind.group,
                currentScore: sc,
                targetScore: 100,
                gap: gp,
                severity: severityFromGap(gp),
                diagnosis: gp >= 50 ? `Skor ${ind.code} rendah ${sc}/100 — prioritas` : `Celah ${gp} poin`,
                recommendation: rule?.title ?? `Tingkatkan ${ind.name}`,
                actionType: at,
                impactScore: ris,
                estimatedGain: { base: sim.baseIncrease, verified: sim.verifiedIncrease, newVerified: sim.estimatedNewVerified },
                priority,
                timeline: timelineFromFeasibility(feasibility, ris),
                reason,
                prerequisite: rule?.prerequisite,
            });
        }
        // fallback if no indicators but gap high
        if (insights.length === 0 && gap != null && gap >= 30) {
            insights.push({
                group: g.key as AceshIndicatorGroup,
                currentScore: score!,
                targetScore: 100,
                gap: gap!,
                severity: severityFromGap(gap!),
                diagnosis: diagnosisFor(g.key, score, gap),
                recommendation: findRule(g.key as AceshIndicatorGroup)?.title ?? `Tingkatkan ${g.label}`,
                actionType: gap! >= 50 ? "ADD" : "IMPROVE",
                impactScore: gap! * g.weight * 0.01,
                estimatedGain: { base: 0, verified: 0 },
                priority: gap! * g.weight,
                timeline: gap! >= 50 ? "MEDIUM" : "QUICK",
                reason: ["high_gap"],
            });
        }
        acesMap[g.key] = {
            key: g.key,
            label: g.label,
            weight: g.weight,
            score,
            gap,
            diagnosis: diagnosisFor(g.key, score, gap),
            insights,
        };
    }

    const hyperGroups = [
        { key: "SPATIAL_ACCESSIBILITY", label: "Spatial Accessibility", weight: HYPERLOCAL_DIMENSION_WEIGHTS.SPATIAL_ACCESSIBILITY },
        { key: "FUNCTIONAL_AVAILABILITY", label: "Functional Availability", weight: HYPERLOCAL_DIMENSION_WEIGHTS.FUNCTIONAL_AVAILABILITY },
        { key: "HALAL_ASSURANCE", label: "Halal Assurance", weight: HYPERLOCAL_DIMENSION_WEIGHTS.HALAL_ASSURANCE },
        { key: "ECOSYSTEM_CONNECTIVITY", label: "Ecosystem Connectivity", weight: HYPERLOCAL_DIMENSION_WEIGHTS.ECOSYSTEM_CONNECTIVITY },
        { key: "EMBEDDEDNESS_CONTINUITY", label: "Embeddedness & Continuity", weight: HYPERLOCAL_DIMENSION_WEIGHTS.EMBEDDEDNESS_CONTINUITY },
    ];
    const hyperMap: Record<string, AnnotatedDomain> = {};
    for (const g of hyperGroups) {
        const gb = groupBreakdown.find((x) => x.group === g.key);
        const score = gb?.groupScore ?? null;
        const gap = score != null ? 100 - score : null;
        const list = byGroup.get(g.key as AceshIndicatorGroup) ?? [];
        const insights: RecommendationInsight[] = [];
        if (gap != null && gap >= 20) {
            const baseW = 0.35;
            const sumW = list.reduce((s, x) => s + x.weight, 0) || 1;
            for (const ind of list.slice(0, 1)) {
                const sc = ind.value * 25;
                const gp = 100 - sc;
                const { ris, priority, reason, feasibility } = calculateRIS({
                    indicator: { id: ind.id, code: ind.code, name: ind.name, group: ind.group, weight: ind.weight, value: ind.value },
                    dimensionWeight: g.weight,
                    groupScore: sc,
                    baseWeight: baseW,
                    evidenceConfidence: evc,
                    profile,
                });
                const sim = simulateImprovement({
                    currentAces: acesScore,
                    currentHyperlocal: hyperScore,
                    currentEvc: evc,
                    group: g.key,
                    dimensionWeight: g.weight,
                    indicatorWeight: ind.weight,
                    sumWeightsGroup: sumW,
                    currentValue: ind.value,
                    targetValue: 4,
                    baseWeight: baseW,
                });
                insights.push({
                    indicatorId: ind.id,
                    group: ind.group,
                    currentScore: sc,
                targetScore: 100,
                    gap: gp,
                    severity: severityFromGap(gp),
                    diagnosis: gap != null && gap >= 40 ? "Akses layanan belum optimal radius" : "Perlu peningkatan",
                    recommendation: `Tambah fasilitas dalam radius layanan — ${g.label}`,
                    actionType: "IMPROVE",
                    impactScore: ris,
                    estimatedGain: { base: sim.baseIncrease, verified: sim.verifiedIncrease },
                    priority,
                    timeline: timelineFromFeasibility(feasibility, ris),
                    reason,
                });
            }
            if (insights.length === 0) {
                insights.push({
                    group: g.key as AceshIndicatorGroup,
                    currentScore: score!,
                targetScore: 100,
                    gap: gap!,
                    severity: severityFromGap(gap!),
                    diagnosis: g.key === "SPATIAL_ACCESSIBILITY" ? "Akses fasilitas halal belum optimal radius layanan" : diagnosisFor(g.key, score, gap),
                    recommendation: g.key === "SPATIAL_ACCESSIBILITY" ? "Tambah fasilitas dalam radius layanan minimum" : `Tingkatkan ${g.label}`,
                    actionType: "IMPROVE",
                    impactScore: gap! * g.weight * 0.01,
                    estimatedGain: { base: 0, verified: 0 },
                    priority: gap! * g.weight,
                    timeline: "MEDIUM",
                    reason: ["hyperlocal_gap"],
                });
            }
        }
        hyperMap[g.key] = { key: g.key, label: g.label, weight: g.weight, score, gap, diagnosis: diagnosisFor(g.key, score, gap), insights };
    }

    const evidenceLabels: Record<string, string> = {
        sourceReliability: "Source Reliability",
        documentEvidence: "Document Evidence",
        photoGeolocation: "Photo & Geolocation",
        managementConfirmation: "Management Confirmation",
        fieldValidation: "Field Validation",
        dataFreshness: "Data Freshness",
    };
    const evidenceWeights: Record<string, number> = { sourceReliability: 0.15, documentEvidence: 0.2, photoGeolocation: 0.15, managementConfirmation: 0.1, fieldValidation: 0.25, dataFreshness: 0.15 };
    const evidenceMap: Record<string, AnnotatedDomain> = {};
    // derive evidence component scores from EVC breakdown approximation: use single evc value for demo, split via gaps
    const evGaps: Record<string, number> = {};
    // approximate per component score as evc (since we don't have per component breakdown here)
    for (const k of Object.keys(evidenceWeights)) {
        const compGap = 100 - evc; // simplistic
        const status = compGap >= 50 ? "Critical Gap" : compGap >= 25 ? "Perlu peningkatan" : "Baik";
        const rec = k === "fieldValidation" ? "Jadwalkan validasi lapangan" : k === "documentEvidence" ? "Upload sertifikat/dokumen" : k === "photoGeolocation" ? "Tambah foto dengan koordinat GPS" : k === "dataFreshness" ? "Lakukan re-validasi data (>90 hari)" : `Perbaiki ${evidenceLabels[k]}`;
        evidenceMap[k] = {
            key: k,
            label: evidenceLabels[k],
            weight: evidenceWeights[k],
            score: evc,
            gap: compGap,
            diagnosis: status,
            insights: compGap >= 20 ? (() => {
                const sim = simulateEvidenceImprovement(evc, Math.min(100, evc + 20), baseScore);
                return [{
                    group: "EVIDENCE",
                    currentScore: evc,
                    targetScore: 100,
                    gap: compGap,
                    severity: severityFromGap(compGap),
                    diagnosis: status,
                    recommendation: rec,
                    actionType: "VERIFY",
                    impactScore: compGap * evidenceWeights[k] * 0.01,
                    estimatedGain: { base: 0, verified: sim.verifiedIncrease, newVerified: sim.verifiedAfter },
                    estimatedVerifiedIncrease: sim.verifiedIncrease,
                    estimatedNewVerified: sim.verifiedAfter,
                    priority: compGap * evidenceWeights[k],
                    timeline: "QUICK",
                    reason: ["evidence_gap"],
                } as any];
            })() : [],
        };
        evGaps[k] = compGap;
    }

    // Top gaps across all groups
    const allGaps: Array<{ label: string; gap: number; group: string }> = [];
    for (const [k, v] of Object.entries(acesMap)) if (v.gap != null) allGaps.push({ label: k, gap: v.gap!, group: k });
    for (const [k, v] of Object.entries(hyperMap)) if (v.gap != null) allGaps.push({ label: k, gap: v.gap!, group: k });
    for (const [k, v] of Object.entries(evidenceMap)) if (v.gap != null) allGaps.push({ label: v.label, gap: v.gap!, group: k });
    allGaps.sort((a, b) => b.gap - a.gap);
    const topGaps = allGaps.slice(0, 3);

    // priority list across all insights
    const allInsights: RecommendationInsight[] = [];
    Object.values(acesMap).forEach((d) => allInsights.push(...d.insights));
    Object.values(hyperMap).forEach((d) => allInsights.push(...d.insights));
    Object.values(evidenceMap).forEach((d) => allInsights.push(...(d.insights ?? [])));
    allInsights.sort((a, b) => b.priority - a.priority);

    const alasan = !data ? "Belum dinilai" : data.verificationStatus !== "VERIFIED" ? "Verified tertahan oleh Evidence Confidence rendah" : `Klasifikasi ${data.classification} sesuai ambang`;

    return {
        aces: acesMap,
        hyperlocal: hyperMap,
        evidence: evidenceMap,
        outputs: {
            kategori: { label: data?.classification ? data.classification.replace(/_/g, " ") : "Belum dinilai", alasan },
            topGaps,
            priorityList: allInsights.slice(0, 5),
            hyperlocalMap: [], // filled by caller if facility data available
        },
    };
}
