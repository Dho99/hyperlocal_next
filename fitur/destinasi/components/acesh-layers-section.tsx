import { Layers, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    CLASSIFICATION_LABELS,
    CLASSIFICATION_STYLES,
    LAYER_LABELS,
} from "@/lib/config/acesh-labels";

export interface PublicAceshLayers {
    acesScore: number | null;
    hyperlocalScore: number | null;
    evidenceConfidenceScore: number | null;
    evidenceFactor: number | null;
    officialEvidenceCount: number | null;
    communityEvidenceCount: number | null;
    communityEvidenceScore: number | null;
    evidenceSource: string | null;
    verifiedScore: number | null;
    baseScore: number | null;
    classification: string | null;
    verificationStatus: "PENDING" | "VERIFIED" | null;
    calculatedAt: string | null;
    calculationVersion: string | null;
}

const LAYERS = [
    {
        key: "aces",
        icon: Layers,
        scoreKey: "acesScore",
        title: LAYER_LABELS.aces,
        description: "Kesiapan dasar destinasi: akses, komunikasi, lingkungan, dan layanan.",
        accent: "border-slate-200 bg-slate-50/60",
        iconClass: "text-slate-700",
        barClass: "bg-slate-700",
    },
    {
        key: "hyperlocal",
        icon: Sparkles,
        scoreKey: "hyperlocalScore",
        title: LAYER_LABELS.hyperlocal,
        description: "Ekosistem sekitar: keterjangkauan, layanan, jaminan halal, dan keberlanjutan.",
        accent: "border-teal-200 bg-teal-50/40",
        iconClass: "text-teal-700",
        barClass: "bg-teal-600",
    },
    {
        key: "evidence",
        icon: ShieldCheck,
        scoreKey: "evidenceConfidenceScore",
        title: LAYER_LABELS.evidence,
        description: "Tingkat keyakinan atas bukti yang mendukung penilaian destinasi.",
        accent: "border-amber-200 bg-amber-50/50",
        iconClass: "text-amber-800",
        barClass: "bg-amber-500",
    },
] as const;

function formatScore(value: number | null): string {
    return value != null ? value.toFixed(1) : "—";
}

export function AceshLayersSection({ assessment }: { assessment: PublicAceshLayers }) {
    const displayScore =
        assessment.verificationStatus === "VERIFIED" &&
        assessment.verifiedScore != null
            ? assessment.verifiedScore
            : assessment.baseScore;
    const isVerified = assessment.verificationStatus === "VERIFIED";
    const classificationLabel = assessment.classification
        ? CLASSIFICATION_LABELS[assessment.classification] ?? assessment.classification
        : null;

    return (
        <section className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                        Kesiapan ACES-H
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Tiga lapis penilaian destinasi wisata halal.
                    </p>
                </div>
                <span className="text-xs text-muted-foreground">
                    {isVerified ? "Skor terverifikasi" : "Skor sementara"}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {LAYERS.map((layer) => {
                    const score = assessment[layer.scoreKey];
                    const Icon = layer.icon;
                    return (
                        <article
                            key={layer.key}
                            className={cn(
                                "w-full rounded-xl border p-4 shadow-sm",
                                layer.accent,
                            )}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="flex min-w-0 items-start gap-3">
                                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-sm">
                                        <Icon className={cn("size-5", layer.iconClass)} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold leading-tight text-foreground">
                                            {layer.title}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {layer.description}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-2xl font-bold tabular-nums text-foreground">
                                    {formatScore(score)}
                                    <span className="ml-1 text-xs font-medium text-muted-foreground">
                                        /100
                                    </span>
                                </p>
                            </div>

                            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/80">
                                <div
                                    className={cn("h-full rounded-full transition-all", layer.barClass)}
                                    style={{ width: `${Math.max(0, Math.min(100, score ?? 0))}%` }}
                                />
                            </div>

                            {layer.key === "evidence" && (
                                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                    {assessment.evidenceFactor != null && (
                                        <p>
                                            Faktor bukti: {assessment.evidenceFactor.toFixed(3)} —
                                            skor akhir = skor dasar × faktor bukti.
                                        </p>
                                    )}
                                    {(assessment.communityEvidenceCount ?? 0) > 0 && (
                                        <p>
                                            EVC gabungan:{" "}
                                            {assessment.officialEvidenceCount ?? 0} bukti resmi +{" "}
                                            {assessment.communityEvidenceCount} penilaian pengunjung
                                            {assessment.communityEvidenceScore != null
                                                ? ` (rata-rata komunitas ${assessment.communityEvidenceScore.toFixed(1)}/100)`
                                                : ""}
                                            .
                                        </p>
                                    )}
                                    {assessment.verificationStatus !== "VERIFIED" && (
                                        <p>
                                            Status masih sementara; verifikasi resmi tetap memerlukan
                                            minimal satu bukti resmi.
                                        </p>
                                    )}
                                </div>
                            )}
                        </article>
                    );
                })}

                <article className="w-full rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-bold text-foreground">
                                Hasil Akhir ACES-H
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {isVerified
                                    ? "Sudah terverifikasi dan ditampilkan sebagai skor resmi."
                                    : "Belum terverifikasi; ditampilkan sebagai skor sementara."}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {classificationLabel && (
                                <span
                                    className={cn(
                                        "rounded-full px-3 py-1 text-xs font-semibold",
                                        CLASSIFICATION_STYLES[assessment.classification ?? ""] ??
                                            "bg-slate-100 text-slate-700",
                                    )}
                                >
                                    {classificationLabel}
                                </span>
                            )}
                            <p className="text-3xl font-bold tabular-nums text-foreground">
                                {formatScore(displayScore)}
                                <span className="ml-1 text-xs font-medium text-muted-foreground">
                                    /100
                                </span>
                            </p>
                        </div>
                    </div>
                    <p className="mt-3 text-[11px] text-muted-foreground">
                        Versi {assessment.calculationVersion ?? "ACES-H"}
                        {assessment.calculatedAt
                            ? ` · dihitung ${new Date(assessment.calculatedAt).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                              })}`
                            : ""}
                    </p>
                </article>
            </div>
        </section>
    );
}
