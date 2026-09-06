"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Hammer,
  Wrench,
} from "lucide-react";
import {
  buildAnnotatedTree,
  type AnnotatedDomain,
  type RecommendationInsight,
} from "@/lib/services/acesh/annotated-tree";

export interface AceshModelDatum {
  acesScore: number | null;
  hyperlocalScore: number | null;
  baseScore: number | null;
  evidenceConfidenceScore: number | null;
  evidenceFactor: number | null;
  verifiedScore: number | null;
  classification: string | null;
  verificationStatus: "PENDING" | "VERIFIED" | null;
  calculatedAt?: string | null;
}

const CLASS_LABEL: Record<string, string> = {
  BELUM_SIAP: "Belum siap",
  PERLU_PENGEMBANGAN: "Perlu pengembangan",
  BERKEMBANG: "Berkembang",
  SIAP: "Siap",
  SANGAT_SIAP: "Sangat siap",
};

function Pct(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${Math.round(v * 100)}%`;
}
function Fixed1(v: number | null | undefined): string {
  if (v == null) return "—";
  return v.toFixed(1);
}
function Fixed2(v: number | null | undefined): string {
  if (v == null) return "—";
  return v.toFixed(2);
}
function Chip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        className,
      )}
    >
      {children}
    </span>
  );
}

function SeverityBadge({ s }: { s: string }) {
  const cls =
    s === "HIGH"
      ? "bg-red-100 text-red-700 border-red-200"
      : s === "MEDIUM"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-emerald-100 text-emerald-700 border-emerald-200";
  return (
    <span
      className={cn(
        "inline-flex h-5 rounded-full px-2 text-[10px] font-bold border",
        cls,
      )}
    >
      {s}
    </span>
  );
}

function CollapsibleSection({
  title,
  subtitle,
  chip,
  defaultOpen = false,
  children,
  score,
  className,
}: {
  title: string;
  subtitle?: string;
  chip?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  score?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className={cn(
        "rounded-xl border shadow-sm overflow-hidden h-fit self-start flex flex-col",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left cursor-pointer hover:bg-white/60 transition-colors sm:px-4"
      >
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider opacity-70">
            {subtitle}
          </p>
          <p className="text-sm font-extrabold leading-tight">{title}</p>
          {score && <p className="mt-1 text-xs font-medium">{score}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {chip}
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow border">
            {open ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        </div>
      </button>
      <div
        className={cn(
          "grid transition-all",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="p-3 pt-0 sm:p-4 sm:pt-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

function DomainCard({
  domain,
  onToggle,
  expanded,
  showSim,
}: {
  domain: AnnotatedDomain;
  onToggle?: () => void;
  expanded?: boolean;
  showSim?: boolean;
}) {
  if (!domain) return null;
  const insight = domain.insights?.[0] ?? null;
  const gap = domain.gap;
  const score = domain.score;
  return (
    <div className="rounded-lg border bg-white p-2.5 shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-2 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold">{domain.key}</span>
            <span className="text-xs text-muted-foreground">
              {Pct(domain.weight)}
            </span>
            {gap != null && (
              <SeverityBadge
                s={gap >= 40 ? "HIGH" : gap >= 20 ? "MEDIUM" : "LOW"}
              />
            )}
          </div>
          <p className="text-xs font-bold leading-tight">{domain.label}</p>
          {score != null && (
            <p className="text-[11px]">
              Score: <span className="font-bold">{score.toFixed(0)}</span>/100 •
              Gap {gap?.toFixed(0)}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground leading-tight">
            {domain.diagnosis}
          </p>
        </div>
        <span className="text-xs font-bold shrink-0">
          {score != null ? `${score.toFixed(0)}` : "—"}
        </span>
      </button>
      {insight && (
        <div className="mt-2 rounded-lg border bg-muted/20 p-2">
          <p className="text-[11px] font-bold flex items-center gap-1">
            {insight.actionType === "ADD" ? (
              <Hammer className="h-3 w-3" />
            ) : (
              <Wrench className="h-3 w-3" />
            )}{" "}
            {insight.recommendation}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {insight.diagnosis}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            <span className="text-[10px] bg-white border rounded-full px-2 py-0.5">
              Impact +
              {(
                insight.estimatedGain?.verified ??
                (insight as any).estimatedVerifiedIncrease ??
                insight.impactScore
              ).toFixed(1)}{" "}
              Verified
            </span>
            <span className="text-[10px] bg-white border rounded-full px-2 py-0.5">
              {insight.timeline}
            </span>
          </div>
          {expanded && showSim && insight.estimatedGain && (
            <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[11px]">
              <div className="rounded bg-white p-1 border">
                <p className="text-muted-foreground">Saat ini</p>
                <p className="font-bold">
                  {insight.currentScore?.toFixed(0) ?? "—"}
                </p>
              </div>
              <div className="rounded bg-white p-1 border">
                <p className="text-muted-foreground">Target</p>
                <p className="font-bold">{insight.targetScore}</p>
              </div>
              <div className="rounded bg-emerald-50 border border-emerald-200 p-1">
                <p className="text-emerald-700">Est. Verified</p>
                <p className="font-bold text-emerald-700">
                  {insight.estimatedGain.newVerified?.toFixed(1) ?? "—"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AceshModelDiagram({
  data,
  groupBreakdown,
  indicators,
  evidenceRecords,
  profile,
}: {
  data: AceshModelDatum | null;
  groupBreakdown?: Array<{
    group: string;
    groupScore: number | null;
    dimensionWeight: number;
  }>;
  indicators?: Array<{
    id: string;
    code: string;
    name: string;
    group: string;
    weight: number;
    value: number;
  }>;
  evidenceRecords?: any[];
  profile?: { slug?: string; categoryName?: string; city?: string };
}) {
  const d = data;
  const pending =
    !d || d.verificationStatus !== "VERIFIED" || d.verifiedScore == null;
  const displayScore = d ? (pending ? d.baseScore : d.verifiedScore) : null;
  const [showDetail, setShowDetail] = useState(false);
  const [allOpen, setAllOpen] = useState(false);

  const tree = useMemo(() => {
    if (!groupBreakdown && !indicators) return null;
    try {
      return buildAnnotatedTree({
        data: d,
        groupBreakdown: groupBreakdown as any,
        indicators: indicators as any,
        evidenceRecords: evidenceRecords as any,
        profile,
      });
    } catch {
      return null;
    }
  }, [d, groupBreakdown, indicators, evidenceRecords, profile]);

  const acesDomains: AnnotatedDomain[] = tree ? Object.values(tree.aces) : [];
  const hyperDomains: AnnotatedDomain[] = tree
    ? Object.values(tree.hyperlocal)
    : [];
  const evidenceDomains: AnnotatedDomain[] = tree
    ? Object.values(tree.evidence)
    : [];
  const topGaps = tree?.outputs.topGaps ?? [];
  const priorityList = tree?.outputs.priorityList ?? [];
  const kategori = tree?.outputs.kategori;

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-heading text-base sm:text-lg font-extrabold tracking-tight text-emerald-900 flex items-center gap-2">
            <Layers className="h-5 w-5" /> MODEL SAFAR ACES-H
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Tiga lapis penilaian: kesiapan dasar, ekosistem hyperlocal, dan
            validasi bukti
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] sm:gap-3 shrink-0">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border bg-white" /> Diadopsi dari
            GMTI
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-teal-700 bg-teal-50" />{" "}
            Hyperlocal
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-amber-700 bg-amber-50" />{" "}
            Lapis bukti
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setAllOpen((v) => !v)}
          className="rounded-full border bg-white px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-muted"
        >
          {allOpen ? "Ciutkan semua" : "Perluas semua"}
        </button>
        <button
          type="button"
          onClick={() => setShowDetail((v) => !v)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-bold shadow-sm border",
            showDetail ? "bg-emerald-900 text-white" : "bg-white",
          )}
        >
          {showDetail ? "Sembunyikan detail skor" : "Lihat detail skor"}
        </button>
        {d?.calculatedAt && (
          <span className="inline-flex items-center text-[11px] text-muted-foreground">
            Update: {new Date(d.calculatedAt).toLocaleDateString("id-ID")}
          </span>
        )}
      </div>

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 items-start">
        <CollapsibleSection
          title="ACES Readiness Score"
          subtitle="Lapis 1"
          chip={<Chip className="bg-slate-800 text-white">Kerangka GMTI</Chip>}
          defaultOpen={allOpen}
          score={
            d?.acesScore != null
              ? `Skor ACES: ${Fixed1(d.acesScore)} /100`
              : undefined
          }
          className="bg-slate-50/60 border-dashed"
        >
          <div className="space-y-2">
            {(acesDomains.length
              ? acesDomains
              : ([
                  {
                    key: "ACCESS",
                    label: "Access",
                    weight: 0.2,
                    score: null,
                    gap: null,
                    diagnosis: "5 indikator",
                    insights: [],
                  },
                  {
                    key: "COMMUNICATION",
                    label: "Communication",
                    weight: 0.15,
                    score: null,
                    gap: null,
                    diagnosis: "4 indikator",
                    insights: [],
                  },
                  {
                    key: "ENVIRONMENT",
                    label: "Environment",
                    weight: 0.2,
                    score: null,
                    gap: null,
                    diagnosis: "5 indikator",
                    insights: [],
                  },
                  {
                    key: "SERVICES",
                    label: "Services",
                    weight: 0.45,
                    score: null,
                    gap: null,
                    diagnosis: "7 indikator — bobot terbesar",
                    insights: [],
                  },
                ] as any)
            ).map((dom: any) => (
              <DomainCard key={dom.key} domain={dom} showSim={showDetail} />
            ))}
          </div>
          <p className="mt-3 text-[10px] italic text-muted-foreground">
            Nama empat kriteria mengikuti GMTI; bobot disesuaikan SAFAR
          </p>
        </CollapsibleSection>

        <CollapsibleSection
          title="Hyperlocal Score"
          subtitle="Lapis 2"
          chip={<Chip className="bg-teal-800 text-white">Baru</Chip>}
          defaultOpen={allOpen}
          score={
            d?.hyperlocalScore != null
              ? `Skor Hyperlocal: ${Fixed1(d.hyperlocalScore)} /100`
              : undefined
          }
          className="bg-teal-50/40 border-teal-700/40"
        >
          <div className="space-y-2">
            {(hyperDomains.length
              ? hyperDomains
              : ([
                  {
                    key: "SPATIAL_ACCESSIBILITY",
                    label: "Spatial Accessibility",
                    weight: 0.3,
                    score: null,
                    gap: null,
                    diagnosis: "jarak jaringan jalan",
                    insights: [],
                  },
                  {
                    key: "FUNCTIONAL_AVAILABILITY",
                    label: "Functional Availability",
                    weight: 0.25,
                    score: null,
                    gap: null,
                    diagnosis: "irisan jam buka",
                    insights: [],
                  },
                  {
                    key: "HALAL_ASSURANCE",
                    label: "Halal Assurance",
                    weight: 0.2,
                    score: null,
                    gap: null,
                    diagnosis: "cakupan sertifikat",
                    insights: [],
                  },
                  {
                    key: "ECOSYSTEM_CONNECTIVITY",
                    label: "Ecosystem Connectivity",
                    weight: 0.15,
                    score: null,
                    gap: null,
                    diagnosis: "kerapatan UMKM",
                    insights: [],
                  },
                  {
                    key: "EMBEDDEDNESS_CONTINUITY",
                    label: "Embeddedness & Continuity",
                    weight: 0.1,
                    score: null,
                    gap: null,
                    diagnosis: "SOP, kontinuitas",
                    insights: [],
                  },
                ] as any)
            ).map((dom: any) => (
              <DomainCard key={dom.key} domain={dom} showSim={showDetail} />
            ))}
          </div>
          <p className="mt-3 text-[10px] italic text-muted-foreground">
            Satuan analisis: area layanan di sekitar titik destinasi
          </p>
        </CollapsibleSection>

        <CollapsibleSection
          title="Evidence Confidence Score"
          subtitle="Lapis 3"
          chip={<Chip className="bg-amber-900 text-white">Baru</Chip>}
          defaultOpen={allOpen}
          score={
            d?.evidenceConfidenceScore != null
              ? `EVC: ${Fixed1(d.evidenceConfidenceScore)} /100`
              : undefined
          }
          className="bg-amber-50/50 border-amber-700/40 md:col-span-2 xl:col-span-1"
        >
          <div className="grid grid-cols-1 gap-2">
            {(evidenceDomains.length
              ? evidenceDomains
              : ([
                  {
                    key: "sourceReliability",
                    label: "Source Reliability",
                    weight: 0.15,
                  },
                  {
                    key: "documentEvidence",
                    label: "Document Evidence",
                    weight: 0.2,
                  },
                  {
                    key: "photoGeolocation",
                    label: "Photo & Geolocation",
                    weight: 0.15,
                  },
                  {
                    key: "managementConfirmation",
                    label: "Management Confirmation",
                    weight: 0.1,
                  },
                  {
                    key: "fieldValidation",
                    label: "Field Validation",
                    weight: 0.25,
                  },
                  {
                    key: "dataFreshness",
                    label: "Data Freshness",
                    weight: 0.15,
                  },
                ] as any)
            ).map((dom: any) => (
              <DomainCard key={dom.key} domain={dom} showSim={showDetail} />
            ))}
          </div>
          <div className="mt-2 rounded-lg border border-amber-800 bg-amber-100 p-2.5">
            <p className="text-xs font-bold text-amber-900">Evidence Factor</p>
            <p className="text-xs font-mono">
              {" "}
              = 0,70 + 0,30 × (EVC / 100) → 0,70 – 1,00
            </p>
            {d?.evidenceFactor != null && (
              <p className="mt-1 text-xs">
                Faktor:{" "}
                <span className="font-bold">{Fixed2(d.evidenceFactor)}</span>{" "}
                (EVC {Fixed1(d.evidenceConfidenceScore)})
              </p>
            )}
          </div>
        </CollapsibleSection>
      </div>

      <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-[1fr_300px]">
        <div className="relative rounded-xl border border-teal-800 bg-teal-50 px-3 py-3 text-center shadow-sm sm:px-4">
          <p className="text-sm font-extrabold text-teal-900 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" /> Base ACES-H Score = (ACES × 65%) +
            (Hyperlocal × 35%)
          </p>
          {d?.baseScore != null && (
            <p className="mt-1 text-xs">
              Nilai: <span className="font-bold">{Fixed1(d.baseScore)}</span>{" "}
              <span className="text-muted-foreground">
                (ACES {Fixed1(d.acesScore)} • Hyperlocal{" "}
                {Fixed1(d.hyperlocalScore)})
              </span>
            </p>
          )}
          {/* <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-900 px-2 py-0.5 text-[10px] font-bold text-white hidden lg:inline">
            ×
          </span> */}
        </div>
        <div className="rounded-xl border border-amber-800 bg-amber-100 px-4 py-3 text-center shadow-sm">
          <p className="text-sm font-bold text-amber-900">
            Evidence Factor (0,70 – 1,00)
          </p>
          {d?.evidenceFactor != null ? (
            <p className="mt-1 font-mono text-sm font-bold">
              {Fixed2(d.evidenceFactor)}
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">—</p>
          )}
        </div>
      </div>

      <div className="w-full rounded-xl bg-emerald-900 px-4 py-5 text-center text-white shadow sm:px-6">
        <p className="flex items-center justify-center gap-2 text-sm font-extrabold tracking-widest">
          <ShieldCheck className="h-5 w-5" /> VERIFIED ACES-H SCORE
        </p>
        <p className="text-xs opacity-80">= Base ACES-H × Evidence Factor</p>
        <p className="mt-2 text-3xl font-extrabold sm:text-4xl">
          {d ? Fixed1(pending ? d.baseScore : d.verifiedScore) : "—"}{" "}
          <span className="text-sm font-normal">/100</span>
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {d?.classification && (
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-900">
              {CLASS_LABEL[d.classification] ?? d.classification}
            </span>
          )}
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold",
              pending
                ? "bg-amber-200 text-amber-900"
                : "bg-emerald-200 text-emerald-900",
            )}
          >
            {pending ? "Perlu verifikasi" : "Terverifikasi"}
          </span>
          {d?.evidenceConfidenceScore != null && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
              EVC {Fixed1(d.evidenceConfidenceScore)}
            </span>
          )}
        </div>
      </div>

      {/* 4 output reconstructed */}
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-teal-800/40 bg-teal-50/40 p-3">
          <p className="text-xs font-bold text-teal-900">Kategori kesiapan</p>
          <p className="mt-1 text-xs font-semibold">
            {kategori?.label ??
              (d?.classification
                ? (CLASS_LABEL[d.classification] ?? d.classification)
                : "Belum dinilai")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {kategori?.alasan ??
              "Alasan klasifikasi berdasarkan ambang Verified/Base"}
          </p>
        </div>
        <div className="rounded-lg border border-teal-800/40 bg-teal-50/40 p-3">
          <p className="text-xs font-bold text-teal-900">
            Diagnosis kesenjangan
          </p>
          <div className="mt-2 space-y-1">
            {topGaps.length ? (
              topGaps.map((g, i) => (
                <p key={g.label} className="text-xs">
                  <span className="font-bold">
                    {i + 1}. {g.label}
                  </span>{" "}
                  Gap {g.gap.toFixed(0)}
                </p>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">gap per indikator</p>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-teal-800/40 bg-teal-50/40 p-3">
          <p className="text-xs font-bold text-teal-900">
            Rekomendasi prioritas
          </p>
          <div className="mt-2 space-y-1">
            {priorityList.length ? (
              priorityList.slice(0, 2).map((p, i) => (
                <div
                  key={(p as any).id ?? p.code ?? p.indicatorId ?? i}
                  className="rounded bg-white p-2 border"
                >
                  <p className="text-xs font-bold">
                    {i + 1}. {p.recommendation}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Impact +
                    {(
                      (p as any).estimatedGain?.verified ??
                      p.estimatedVerifiedIncrease ??
                      p.impactScore
                    ).toFixed(1)}{" "}
                    Verified
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">
                PI = Gap × Bobot × Dampak × Kelayakan
              </p>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-teal-800/40 bg-teal-50/40 p-3">
          <p className="text-xs font-bold text-teal-900">
            Peta layanan hyperlocal
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            area layanan dan tiga status bukti
          </p>
          <div className="mt-2 space-y-1 text-xs">
            <p>Facility Status: VERIFIED / PARTIAL / NEED VALIDATION</p>
          </div>
        </div>
      </div>

      {!d && (
        <p className="text-center text-xs text-muted-foreground">
          Belum ada penilaian ACES-H untuk destinasi ini. Nilai indikator di
          Validasi untuk menghitung skor.
        </p>
      )}
    </div>
  );
}
