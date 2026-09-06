import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/api-error";
import { calculateAssessmentSnapshot } from "@/lib/services/acesh/assessment-recalculation-service";
import { deriveEvidenceConfidence } from "@/lib/services/acesh/evidence-derivation";
import { calculateGroupGaps } from "@/lib/services/acesh/gap-engine";
import { calculateEvidenceGaps } from "@/lib/services/acesh/evidence-engine";
import {
  calculateRIS,
  classifyActionType,
  timelineFromFeasibility,
} from "@/lib/services/acesh/recommendation-engine";
import { findRule } from "@/lib/services/acesh/recommendation-rules";
import {
  simulateImprovement,
  simulateEvidenceImprovement,
} from "@/lib/services/acesh/recommendation-simulator";
import {
  ACES_DIMENSION_WEIGHTS,
  HYPERLOCAL_DIMENSION_WEIGHTS,
  ACES_GROUPS,
  HYPERLOCAL_GROUPS,
} from "@/lib/services/acesh/constants";
import type { AceshIndicatorGroup } from "@/lib/generated/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const dest = await prisma.destination.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: {
        id: true,
        name: true,
        slug: true,
        category: { select: { name: true } },
        city: true,
      },
    });
    if (!dest)
      return NextResponse.json(
        { error: "Destinasi tidak ditemukan" },
        { status: 404 },
      );

    const snapshot = await calculateAssessmentSnapshot(dest.id);
    const evc = snapshot.evidenceConfidenceScore;
    const acesScore = snapshot.acesScore;
    const hyperScore = snapshot.hyperlocalScore;
    const baseScore = snapshot.baseScore;

    // Fetch indicators with scores
    const indicators = await prisma.aceshIndicator.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    });
    const scores = await prisma.aceshIndicatorScore.findMany({
      where: { destinationId: dest.id },
    });
    const scoreMap = new Map(scores.map((s) => [s.indicatorId, s.value]));
    const evidenceRecords = await prisma.aceshEvidenceRecord.findMany({
      where: { destinationId: dest.id },
    });

    // Build gaps per indicator
    const dimensionWeights = {
      ...ACES_DIMENSION_WEIGHTS,
      ...HYPERLOCAL_DIMENSION_WEIGHTS,
    } as Record<string, number>;
    const sumWeightsByGroup: Record<string, number> = {};
    for (const ind of indicators) {
      sumWeightsByGroup[ind.group] =
        (sumWeightsByGroup[ind.group] ?? 0) + ind.weight;
    }

    const isAcesGroup = (g: string) =>
      ACES_GROUPS.includes(g as AceshIndicatorGroup);

    const recs: any[] = [];
    const freshnessLow = (() => {
      const derived = deriveEvidenceConfidence(evidenceRecords);
      // simple: if dataFreshness <75 then low
      return (derived as any).dataFreshness < 75;
    })();

    for (const ind of indicators) {
      const val = scoreMap.get(ind.id) ?? 0;
      const score = val * 25;
      const gap = 100 - score;
      if (gap < 20 && evc >= 60) continue; // skip good
      const dimW = (dimensionWeights as Record<string, number>)[ind.group] ?? 0;
      const baseW = isAcesGroup(ind.group) ? 0.65 : 0.35;
      const {
        ris,
        priority,
        reason,
        visitorImpact,
        feasibility,
        destinationMultiplier,
      } = calculateRIS({
        indicator: {
          id: ind.id,
          code: ind.code,
          name: ind.name,
          group: ind.group,
          weight: ind.weight,
          value: val,
        },
        dimensionWeight: dimW,
        groupScore: score, // approximate
        baseWeight: baseW,
        evidenceConfidence: evc,
        profile: {
          slug: dest.slug,
          categoryName: dest.category?.name ?? undefined,
          city: dest.city ?? undefined,
        },
      });
      const actionType = classifyActionType(val, evc, freshnessLow);
      const timeline = timelineFromFeasibility(feasibility, ris);
      const rule = findRule(ind.group);
      const sim = simulateImprovement({
        currentAces: acesScore,
        currentHyperlocal: hyperScore,
        currentEvc: evc,
        group: ind.group,
        dimensionWeight: dimW,
        indicatorWeight: ind.weight,
        sumWeightsGroup: sumWeightsByGroup[ind.group] ?? 1,
        currentValue: val,
        targetValue: 4,
        baseWeight: baseW,
      });

      recs.push({
        id: `IND-${ind.code}`,
        indicatorId: ind.id,
        indicatorCode: ind.code,
        indicatorName: ind.name,
        group: ind.group,
        actionType,
        timeline,
        title: rule?.title ?? `Tingkatkan ${ind.name}`,
        description:
          rule?.description ?? `Skor ${ind.code} ${score}/100 gap ${gap}`,
        gap,
        gapSeverity: gap / 100,
        weight: ind.weight,
        dimensionWeight: dimW,
        ris,
        priorityScore: priority,
        reason,
        explain: `Gap ${gap} (skor ${score}/100), bobot indikator ${ind.weight}, bobot dimensi ${Math.round(dimW * 100)}%, EVC ${evc}, dampak pengunjung ${visitorImpact}, feasibility ${feasibility}, multiplier ${destinationMultiplier.toFixed(2)}`,
        prerequisite: rule?.prerequisite,
        currentScore: score,
        targetScore: 100,
        estimatedBaseIncrease: sim.baseIncrease,
        estimatedVerifiedIncrease: sim.verifiedIncrease,
        estimatedNewVerified: sim.estimatedNewVerified,
        destinationType: dest.category?.name ?? "General",
      });
    }

    // Evidence gaps as separate recs
    const { gaps: evGaps } = calculateEvidenceGaps(evidenceRecords);
    for (const eg of evGaps.slice(0, 3)) {
      if (eg.gap < 20) continue;
      const simE = simulateEvidenceImprovement(
        evc,
        Math.min(100, evc + eg.gap * 0.5),
        baseScore,
      );
      recs.push({
        id: `EVIDENCE-${eg.component}`,
        group: "EVIDENCE" as any,
        actionType: "VERIFY" as const,
        timeline: eg.weight >= 0.2 ? ("QUICK" as const) : ("MEDIUM" as const),
        title:
          eg.component === "fieldValidation"
            ? "Jadwalkan validasi lapangan"
            : eg.component === "documentEvidence"
              ? "Upload bukti dokumen"
              : eg.component === "photoGeolocation"
                ? "Tambah foto + geotag"
                : `Perbaiki ${eg.label}`,
        description: `Komponen ${eg.label} hanya ${eg.value}/100 (gap ${eg.gap}), bobot ${Math.round(eg.weight * 100)}%`,
        gap: eg.gap,
        gapSeverity: eg.gap / 100,
        weight: eg.weight,
        dimensionWeight: eg.weight,
        ris: (eg.gap / 100) * eg.weight * (0.5 + evc / 200) * 3 * 0.8,
        priorityScore: (eg.gap / 100) * eg.weight,
        reason: ["low_evidence_component", eg.component],
        explain: `${eg.label} ${eg.value}/100, bobot ${Math.round(eg.weight * 100)}%, EVC ${evc}, estimasi naik verified +${simE.verifiedIncrease}`,
        currentScore: eg.value,
        targetScore: 100,
        estimatedBaseIncrease: 0,
        estimatedVerifiedIncrease: simE.verifiedIncrease,
        estimatedNewVerified: simE.verifiedAfter,
      });
    }

    // Sort by RIS priority desc
    recs.sort((a, b) => b.priorityScore - a.priorityScore);

    // Fetch persisted lifecycle
    const persisted = await prisma.recommendationAction
      .findMany({
        where: { destinationId: dest.id },
        orderBy: { priorityScore: "desc" },
      })
      .catch(() => []);

    // Classify quick vs strategic
    const quickWins = recs.filter((r) => r.timeline === "QUICK").slice(0, 5);
    const medium = recs.filter((r) => r.timeline === "MEDIUM").slice(0, 5);
    const strategic = recs
      .filter((r) => r.timeline === "STRATEGIC")
      .slice(0, 5);

    return NextResponse.json({
      data: {
        assessment: snapshot,
        recommendations: recs.slice(0, 12),
        quickWins,
        medium,
        strategic,
        persisted,
        destination: dest,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: getErrorMessage(e) }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { indicatorId, ruleId, status } = body as {
      indicatorId?: string;
      ruleId?: string;
      status?: string;
    };
    const dest = await prisma.destination.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true },
    });
    if (!dest)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    // Minimal create/update lifecycle - validate status
    const validStatus = [
      "OPEN",
      "IN_PROGRESS",
      "SUBMITTED",
      "VALIDATING",
      "VERIFIED",
    ];
    if (status && !validStatus.includes(status))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    // For MVP, just upsert by destination+indicator
    if (indicatorId) {
      const existing = await prisma.recommendationAction.findFirst({
        where: { destinationId: dest.id, indicatorId },
      });
      if (existing) {
        const updated = await prisma.recommendationAction.update({
          where: { id: existing.id },
          data: {
            status: (status as any) ?? existing.status,
            verifiedAt: status === "VERIFIED" ? new Date() : undefined,
          },
        });
        return NextResponse.json({ data: updated });
      }
      const created = await prisma.recommendationAction.create({
        data: {
          destinationId: dest.id,
          indicatorId,
          ruleId: ruleId ?? null,
          actionType: "IMPROVE",
          timeline: "QUICK",
          title: "Action",
          priorityScore: 0,
          status: (status as any) ?? "OPEN",
        },
      });
      return NextResponse.json({ data: created });
    }
    return NextResponse.json(
      { error: "indicatorId required" },
      { status: 400 },
    );
  } catch (e) {
    return NextResponse.json({ error: getErrorMessage(e) }, { status: 500 });
  }
}
