"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Lightbulb, Target, Clock, ShieldCheck, TrendingUp, Hammer, Wrench, SearchCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Rec = {
    id: string;
    indicatorId?: string;
    indicatorCode?: string;
    group: string;
    actionType: string;
    timeline: string;
    title: string;
    description: string;
    gap: number;
    priorityScore: number;
    ris: number;
    reason: string[];
    explain: string;
    prerequisite?: string[];
    currentScore: number | null;
    targetScore: number;
    estimatedBaseIncrease?: number;
    estimatedVerifiedIncrease?: number;
    estimatedNewVerified?: number;
};

const TYPE_ICON: Record<string, any> = {
    BUILD: Hammer,
    IMPROVE: Wrench,
    VERIFY: SearchCheck,
    MAINTAIN: ShieldCheck,
};
const TYPE_COLOR: Record<string, string> = {
    BUILD: "bg-orange-100 text-orange-800 border-orange-200",
    IMPROVE: "bg-amber-100 text-amber-800 border-amber-200",
    VERIFY: "bg-emerald-100 text-emerald-800 border-emerald-200",
    MAINTAIN: "bg-slate-100 text-slate-600 border-slate-200",
};
const TIMELINE_LABEL: Record<string, string> = {
    QUICK: "Quick Wins <30 hari",
    MEDIUM: "Medium 1–6 bulan",
    STRATEGIC: "Strategic >6 bulan",
};

function RecCard({ r, onStatus }: { r: Rec; onStatus?: (id: string, status: string) => void }) {
    const [open, setOpen] = useState(false);
    const Icon = TYPE_ICON[r.actionType] ?? Lightbulb;
    const priorityLabel = r.priorityScore > 0.08 ? "Tinggi" : r.priorityScore > 0.04 ? "Sedang" : "Rendah";
    const priorityColor = r.priorityScore > 0.08 ? "bg-red-100 text-red-700 border-red-200" : r.priorityScore > 0.04 ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-slate-100 text-slate-600";
    return (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <button onClick={() => setOpen((v) => !v)} className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-muted/30 transition-colors">
                <div className="flex gap-3 min-w-0 flex-1">
                    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border", TYPE_COLOR[r.actionType] ?? "")}>
                        <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <Badge className={cn("h-5 rounded-full px-2 text-[10px] border", TYPE_COLOR[r.actionType])}>{r.actionType}</Badge>
                            <Badge variant="outline" className="h-5 rounded-full text-[10px]">{r.group.replace(/_/g, " ")}</Badge>
                            <Badge className={cn("h-5 rounded-full px-2 text-[10px] border", priorityColor)}>{priorityLabel}</Badge>
                            <Badge variant="outline" className="h-5 rounded-full text-[10px] flex items-center gap-1"><Clock className="h-3 w-3" />{TIMELINE_LABEL[r.timeline] ?? r.timeline}</Badge>
                        </div>
                        <p className="mt-1.5 text-sm font-bold leading-tight truncate">{r.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Gap {r.gap.toFixed(0)}</span>
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">RIS {r.ris.toFixed(3)}</span>
                            {r.estimatedVerifiedIncrease != null && r.estimatedVerifiedIncrease > 0 && <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1"><TrendingUp className="h-3 w-3" />+{r.estimatedVerifiedIncrease} Verified</span>}
                        </div>
                        {r.prerequisite && r.prerequisite.length > 0 && <p className="mt-1 text-[11px] text-amber-700">Prasyarat: {r.prerequisite.join(", ")}</p>}
                    </div>
                </div>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm">
                    {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
            </button>
            <div className={cn("grid transition-all", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                <div className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-3 border-t bg-muted/20 pt-3">
                        <div>
                            <p className="text-xs font-bold flex items-center gap-1"><Target className="h-3 w-3" /> Alasan</p>
                            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{r.explain}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                                {r.reason.map((rr) => <Badge key={rr} variant="outline" className="text-[10px] h-5 rounded-full">{rr}</Badge>)}
                            </div>
                        </div>
                        {(r.estimatedBaseIncrease != null || r.estimatedNewVerified != null) && (
                            <div className="rounded-lg border bg-white p-3">
                                <p className="text-xs font-bold">Before → After Simulation</p>
                                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                                    <div className="rounded bg-muted p-2"><p className="text-muted-foreground">Saat ini</p><p className="font-bold">{r.currentScore?.toFixed(0) ?? "—"}/100</p></div>
                                    <div className="rounded bg-muted p-2"><p className="text-muted-foreground">Target</p><p className="font-bold">{r.targetScore}/100</p></div>
                                    <div className="rounded bg-emerald-50 p-2 border border-emerald-200"><p className="text-emerald-700">Est. Verified</p><p className="font-bold text-emerald-700">{r.estimatedNewVerified?.toFixed(1) ?? "—"}</p><p className="text-[11px] text-emerald-600">+{r.estimatedVerifiedIncrease?.toFixed(1) ?? "0"}</p></div>
                                </div>
                                <p className="mt-2 text-[11px] text-muted-foreground">Jika {r.indicatorCode ?? r.group} naik {r.currentScore?.toFixed(0) ?? 0} → 100, Base +{r.estimatedBaseIncrease?.toFixed(1) ?? "0"} → Verified +{r.estimatedVerifiedIncrease?.toFixed(1) ?? "0"}</p>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button size="sm" className="h-7 text-xs bg-[#047857] text-white" onClick={() => onStatus?.(r.indicatorId ?? r.id, "IN_PROGRESS")}>Mulai</Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onStatus?.(r.indicatorId ?? r.id, "SUBMITTED")}>Ajukan Verifikasi</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AceshRuleActions({ destinationId }: { destinationId: string }) {
    const [data, setData] = useState<{ recommendations: Rec[]; quickWins: Rec[]; medium: Rec[]; strategic: Rec[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/destinations/${destinationId}/acesh/recommendations`);
                if (!res.ok) throw new Error("Gagal memuat rekomendasi");
                const json = await res.json();
                if (!cancelled) setData(json.data);
            } catch (e: any) {
                if (!cancelled) setError(e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [destinationId]);

    async function updateStatus(indicatorId: string, status: string) {
        await fetch(`/api/admin/destinations/${destinationId}/acesh/recommendations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ indicatorId, status }) });
    }

    if (loading) return <div className="py-10 text-center text-sm text-muted-foreground animate-pulse">Memuat rekomendasi...</div>;
    if (error) return <div className="py-6 text-center text-sm text-red-600">{error}</div>;
    if (!data || data.recommendations.length === 0) return <div className="py-6 text-center text-sm text-muted-foreground">Tidak ada rekomendasi. Semua indikator sudah optimal.</div>;

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-heading text-sm font-bold flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-600" /> Rekomendasi Berbasis Aturan</h3>
                <span className="text-xs text-muted-foreground">{data.recommendations.length} prioritas • RIS ranking</span>
            </div>

            {/* Explainability header */}
            <div className="rounded-lg border bg-amber-50 p-3 text-xs">
                <p className="font-bold">Prioritas = Gap × Bobot × Dimensi × Confidence × Visitor × Feasibility</p>
                <p className="text-muted-foreground">Setiap kartu menjelaskan mengapa muncul (low_score, high_weight, high_need) dan estimasi kenaikan Verified.</p>
            </div>

            {/* Quick wins */}
            {data.quickWins.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-700 flex items-center gap-1"><Clock className="h-3 w-3" /> Quick Wins &lt;30 hari</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                        {data.quickWins.map((r) => <RecCard key={r.id} r={r} onStatus={updateStatus} />)}
                    </div>
                </div>
            )}
            {data.medium.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-amber-700">Medium 1–6 bulan</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                        {data.medium.map((r) => <RecCard key={r.id} r={r} onStatus={updateStatus} />)}
                    </div>
                </div>
            )}
            {data.strategic.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-slate-600">Strategic &gt;6 bulan</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                        {data.strategic.map((r) => <RecCard key={r.id} r={r} onStatus={updateStatus} />)}
                    </div>
                </div>
            )}

            {/* Confidence-aware note */}
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-xs">
                <p className="font-bold text-teal-800">Confidence-Aware</p>
                <p className="text-muted-foreground">Jika confidence &lt;60 dan gap tinggi → “Validate first” didahulukan daripada Build. Field Validation bobot 25% paling besar.</p>
            </div>
        </div>
    );
}
