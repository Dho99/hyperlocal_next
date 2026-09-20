"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Layers, Sparkles, ShieldCheck, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    ACES_GROUPS,
    HYPERLOCAL_GROUPS,
} from "@/lib/services/acesh/constants";
import {
    GROUP_LABELS_ID,
    LAYER_LABELS,
    VALUE_LABELS,
    EVIDENCE_COMPONENT_KEYS,
    EVIDENCE_COMPONENT_LABELS,
    EVIDENCE_COMPONENT_WEIGHTS,
    diagnosisForScore,
} from "@/lib/config/acesh-labels";

export interface LayerIndicator {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    weight: number;
    group: string;
    value: number;
}

export interface EvidenceComponentValues {
    sourceReliability: number;
    documentEvidence: number;
    photoGeolocation: number;
    managementConfirmation: number;
    fieldValidation: number;
    dataFreshness: number;
}

export interface AceshLayerFormSubmit {
    scores: Array<{ indicatorId: string; value: number }>;
    evidence: EvidenceComponentValues;
}

interface AceshLayerFormProps {
    indicators: LayerIndicator[];
    evidence: EvidenceComponentValues;
    showDetail: boolean;
    readOnly?: boolean;
    saving?: boolean;
    submitLabel?: string;
    /** Optional content rendered between the layers and the submit button. */
    beforeSubmit?: React.ReactNode;
    onSubmit: (payload: AceshLayerFormSubmit) => Promise<void> | void;
}

function sanitizeNumeric(raw: string, max: number): string {
    const digits = raw.replace(/[^\d]/g, "");
    if (digits === "") return "";
    const withoutLeadingZeros = digits.replace(/^0+(?=\d)/, "");
    const clamped = Math.min(Number(withoutLeadingZeros), max);
    return String(clamped);
}

function LayerCard({
    title,
    subtitle,
    icon,
    score,
    className,
    children,
}: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    score?: string;
    className?: string;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(true);
    return (
        <div
            className={cn(
                "rounded-xl border shadow-sm overflow-hidden flex flex-col",
                className,
            )}
        >
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-2 border-b border-inherit px-4 py-3 text-left transition-colors hover:bg-black/5"
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <div>
                        <p className="text-sm font-bold leading-tight">{title}</p>
                        <p className="text-[11px] text-muted-foreground">
                            {subtitle}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {score && (
                        <span className="text-xs font-semibold text-muted-foreground">
                            {score}
                        </span>
                    )}
                    <ChevronDown
                        className={cn(
                            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                            open && "rotate-180",
                        )}
                    />
                </div>
            </button>
            {open && <div className="p-3 space-y-3">{children}</div>}
        </div>
    );
}

export function AceshLayerForm({
    indicators,
    evidence,
    showDetail,
    readOnly = false,
    saving = false,
    submitLabel = "Simpan Penilaian",
    beforeSubmit,
    onSubmit,
}: AceshLayerFormProps) {
    const [values, setValues] = useState<Record<string, string>>(() =>
        Object.fromEntries(
            indicators.map((i) => [
                i.id,
                i.value ? String(i.value) : i.value === 0 ? "0" : "",
            ]),
        ),
    );
    const [evidenceValues, setEvidenceValues] = useState<Record<string, string>>(
        () =>
            Object.fromEntries(
                EVIDENCE_COMPONENT_KEYS.map((k) => [
                    k,
                    evidence[k] ? String(evidence[k]) : "0",
                ]),
            ),
    );

    const indicatorsByGroup = useMemo(() => {
        const map = new Map<string, LayerIndicator[]>();
        for (const ind of indicators) {
            const list = map.get(ind.group) ?? [];
            list.push(ind);
            map.set(ind.group, list);
        }
        return map;
    }, [indicators]);

    const groupScore = useCallback(
        (group: string): number | null => {
            const list = indicatorsByGroup.get(group) ?? [];
            const scored = list.filter(
                (i) => values[i.id] !== "" && values[i.id] != null,
            );
            if (scored.length === 0) return null;
            const avg =
                scored.reduce((sum, i) => sum + Number(values[i.id] ?? 0), 0) /
                scored.length;
            return Math.round(avg * 25 * 10) / 10;
        },
        [indicatorsByGroup, values],
    );

    const acesScore = useMemo(() => {
        let weighted = 0;
        let weightSum = 0;
        for (const g of ACES_GROUPS) {
            const s = groupScore(g);
            if (s == null) continue;
            const w = g === "ACCESS" ? 0.2 : g === "COMMUNICATION" ? 0.15 : g === "ENVIRONMENT" ? 0.2 : 0.45;
            weighted += s * w;
            weightSum += w;
        }
        return weightSum > 0 ? Math.round((weighted / weightSum) * 10) / 10 : null;
    }, [groupScore]);

    const evidenceScore = useMemo(() => {
        let total = 0;
        let weightSum = 0;
        for (const k of EVIDENCE_COMPONENT_KEYS) {
            const raw = evidenceValues[k];
            if (raw === "" || raw == null) continue;
            const w = EVIDENCE_COMPONENT_WEIGHTS[k] ?? 0;
            total += Number(raw) * w;
            weightSum += w;
        }
        return weightSum > 0 ? Math.round((total / weightSum) * 10) / 10 : null;
    }, [evidenceValues]);

    const handleSubmit = async () => {
        await onSubmit({
            scores: indicators.map((i) => ({
                indicatorId: i.id,
                value: values[i.id] === "" ? 0 : Number(values[i.id]),
            })),
            evidence: Object.fromEntries(
                EVIDENCE_COMPONENT_KEYS.map((k) => [
                    k,
                    evidenceValues[k] === "" ? 0 : Number(evidenceValues[k]),
                ]),
            ) as unknown as EvidenceComponentValues,
        });
    };

    const renderDomain = (group: string) => {
        const list = indicatorsByGroup.get(group) ?? [];
        if (list.length === 0) return null;
        const s = groupScore(group);
        return (
            <div key={group} className="rounded-lg border bg-white/70 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">
                        {GROUP_LABELS_ID[group as keyof typeof GROUP_LABELS_ID] ?? group}
                    </p>
                    <span className="text-[11px] font-medium text-muted-foreground">
                        {s != null ? `Nilai ${s}/100` : "Belum dinilai"}
                    </span>
                </div>
                {showDetail && (
                    <p className="text-[11px] text-muted-foreground italic">
                        {diagnosisForScore(s)}
                    </p>
                )}
                <div className="space-y-2 pt-1">
                    {list.map((ind) => (
                        <div
                            key={ind.id}
                            className="flex items-start justify-between gap-3 border-t border-dashed pt-2 first:border-t-0 first:pt-0"
                        >
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] text-muted-foreground">
                                        {ind.code}
                                    </span>
                                    <p className="text-xs font-medium">{ind.name}</p>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Bobot {ind.weight} ·{" "}
                                    {VALUE_LABELS[Number(values[ind.id] ?? 0)] ??
                                        "Belum diisi"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    min={0}
                                    max={4}
                                    step={1}
                                    disabled={readOnly}
                                    className="w-16 h-8 text-center"
                                    value={values[ind.id] ?? ""}
                                    onChange={(e) =>
                                        setValues((prev) => ({
                                            ...prev,
                                            [ind.id]: sanitizeNumeric(e.target.value, 4),
                                        }))
                                    }
                                />
                                <span className="w-12 text-[10px] text-muted-foreground text-right">
                                    {values[ind.id] === ""
                                        ? "—"
                                        : `${Number(values[ind.id]) * 25}/100`}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 items-start">
                <LayerCard
                    title={LAYER_LABELS.aces}
                    subtitle="Kerangka GMTI"
                    icon={<Layers className="h-4 w-4 text-slate-700" />}
                    score={acesScore != null ? `Skor ACES: ${acesScore}/100` : undefined}
                    className="bg-slate-50/60 border-dashed"
                >
                    {ACES_GROUPS.map((g) => renderDomain(g))}
                </LayerCard>

                <LayerCard
                    title={LAYER_LABELS.hyperlocal}
                    subtitle="Area layanan sekitar destinasi"
                    icon={<Sparkles className="h-4 w-4 text-teal-700" />}
                    className="bg-teal-50/40 border-teal-700/40"
                >
                    {HYPERLOCAL_GROUPS.map((g) => renderDomain(g))}
                </LayerCard>

                <LayerCard
                    title={LAYER_LABELS.evidence}
                    subtitle="Keyakinan atas bukti"
                    icon={<ShieldCheck className="h-4 w-4 text-amber-800" />}
                    score={evidenceScore != null ? `EVC: ${evidenceScore}/100` : undefined}
                    className="bg-amber-50/50 border-amber-700/40 md:col-span-2 xl:col-span-1"
                >
                    <div className="space-y-2">
                        {EVIDENCE_COMPONENT_KEYS.map((key) => (
                            <div
                                key={key}
                                className="flex items-center justify-between gap-3 rounded-lg border bg-white/70 px-3 py-2"
                            >
                                <div className="min-w-0">
                                    <p className="text-xs font-medium">
                                        {EVIDENCE_COMPONENT_LABELS[key] ?? key}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        Bobot {Math.round((EVIDENCE_COMPONENT_WEIGHTS[key] ?? 0) * 100)}%
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Input
                                        type="number"
                                        inputMode="numeric"
                                        min={0}
                                        max={100}
                                        disabled={readOnly}
                                        className="w-16 h-8 text-center"
                                        value={evidenceValues[key] ?? ""}
                                        onChange={(e) =>
                                            setEvidenceValues((prev) => ({
                                                ...prev,
                                                [key]: sanitizeNumeric(e.target.value, 100),
                                            }))
                                        }
                                    />
                                    <span className="w-8 text-[10px] text-muted-foreground text-right">
                                        /100
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </LayerCard>
            </div>

            {beforeSubmit}

            {!readOnly && (
                <div className="flex justify-end">
                    <Button onClick={handleSubmit} disabled={saving}>
                        {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {submitLabel}
                    </Button>
                </div>
            )}
        </div>
    );
}
