"use client";

import { useCallback, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { IndicatorGroupEditor, type IndicatorEditorItem } from "./acesh-indicator-group";
import { EvidencePanel, type EvidenceRecordItem } from "./acesh-evidence-panel";
import {
    ReachabilityPanel,
    type ReachabilityConfigItem,
    type FacilityMetricItem,
} from "./acesh-reachability-panel";
import {
    ACES_GROUPS,
    HYPERLOCAL_GROUPS,
    GROUP_LABELS,
} from "@/lib/services/acesh/constants";

interface AssessmentPayload {
    assessment: {
        acesScore: number;
        hyperlocalScore: number;
        baseScore: number;
        evidenceConfidenceScore: number;
        evidenceFactor: number;
        verifiedScore: number | null;
        classification: string | null;
        verificationStatus: "PENDING" | "VERIFIED";
        calculatedAt: string;
        calculationVersion: string;
    };
    groupBreakdown: Array<{
        group: string;
        label: string;
        groupScore: number;
        dimensionWeight: number | null;
        contribution: number | null;
    }>;
    indicators: Array<{
        id: string;
        code: string;
        name: string;
        description: string | null;
        weight: number;
        group: string;
        score: {
            id: string;
            value: number;
            notes: string | null;
        } | null;
    }>;
    evidenceRecords: EvidenceRecordItem[];
    history: Array<{
        id: string;
        acesScore: number;
        hyperlocalScore: number;
        baseScore: number;
        evidenceConfidenceScore: number;
        evidenceFactor: number;
        verifiedScore: number | null;
        classification: string | null;
        verificationStatus: string;
        calculationVersion: string;
        notes: string | null;
        calculatedAt: string;
    }>;
}

const CLASSIFICATION_STYLES: Record<string, string> = {
    BELUM_SIAP: "bg-red-100 text-red-800",
    PERLU_PENGEMBANGAN: "bg-orange-100 text-orange-800",
    BERKEMBANG: "bg-yellow-100 text-yellow-800",
    SIAP: "bg-green-100 text-green-800",
    SANGAT_SIAP: "bg-emerald-100 text-emerald-800",
};

export function AceshAssessmentTabs({
    destinationId,
    facilities,
}: {
    destinationId: string;
    facilities: FacilityMetricItem[];
}) {
    const [data, setData] = useState<AssessmentPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [recalculating, setRecalculating] = useState(false);
    const [reachabilityConfigs, setReachabilityConfigs] = useState<
        ReachabilityConfigItem[]
    >([]);
    const [reachabilityLoading, setReachabilityLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const res = await fetch(
                `/api/admin/destinations/${destinationId}/acesh-assessment`,
            );
            if (!res.ok) {
                toast.error("Gagal memuat data penilaian ACES-H");
                return;
            }
            const json = await res.json();
            setData(json.data as AssessmentPayload);
        } catch {
            toast.error("Terjadi kesalahan saat memuat penilaian");
        } finally {
            setLoading(false);
        }
    }, [destinationId]);

    const loadReachability = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/reachability");
            if (res.ok) {
                const json = await res.json();
                setReachabilityConfigs((json.data ?? []) as ReachabilityConfigItem[]);
            }
        } catch {
            // keep defaults
        } finally {
            setReachabilityLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            await load();
            if (cancelled) return;
            await loadReachability();
        })();
        return () => {
            cancelled = true;
        };
    }, [load, loadReachability]);

    const handleRecalculate = async () => {
        setRecalculating(true);
        try {
            const res = await fetch(
                `/api/admin/destinations/${destinationId}/acesh/recalculate`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ notes: "Perhitungan ulang manual" }),
                },
            );
            if (!res.ok) {
                toast.error("Gagal menghitung ulang");
                return;
            }
            toast.success("Skor ACES-H dihitung ulang");
            await load();
        } catch {
            toast.error("Terjadi kesalahan saat menghitung ulang");
        } finally {
            setRecalculating(false);
        }
    };

    if (loading || !data) {
        return (
            <Card>
                <CardContent className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Memuat data
                    penilaian ACES-H...
                </CardContent>
            </Card>
        );
    }

    const assessment = data.assessment;
    const verified = assessment.verificationStatus === "VERIFIED";
    const classificationKey = assessment.classification ?? "";

    const indicatorsByGroup = (groups: string[]) =>
        groups.map((group) => ({
            group,
            indicators: data.indicators
                .filter((i) => i.group === group)
                .map((i) => i as IndicatorEditorItem),
            breakdown:
                data.groupBreakdown.find((b) => b.group === group) ?? null,
        }));

    return (
        <Tabs defaultValue="aces" className="space-y-4">
            <TabsList className="flex flex-wrap h-auto">
                <TabsTrigger value="aces">ACES Readiness</TabsTrigger>
                <TabsTrigger value="hyperlocal">Hyperlocal</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                <TabsTrigger value="reachability">Reachability</TabsTrigger>
                <TabsTrigger value="result">Hasil & Verifikasi</TabsTrigger>
                <TabsTrigger value="history">Riwayat</TabsTrigger>
            </TabsList>

            <TabsContent value="aces" className="space-y-4">
                <Card>
                    <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                                Skor ACES Readiness (0–100)
                            </span>
                            <span className="text-2xl font-bold">
                                {assessment.acesScore.toFixed(1)}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Access 20% · Communication 15% · Environment 20% ·
                            Services 45%
                        </p>
                    </CardContent>
                </Card>
                {indicatorsByGroup(ACES_GROUPS).map(({ group, indicators, breakdown }) => (
                    <IndicatorGroupEditor
                        key={group}
                        title={GROUP_LABELS[group as keyof typeof GROUP_LABELS]}
                        description={`Kelompok indikator ${GROUP_LABELS[
                            group as keyof typeof GROUP_LABELS
                        ]} (ACES Readiness)`}
                        indicators={indicators}
                        groupBreakdown={breakdown}
                        destinationId={destinationId}
                        onSaved={load}
                    />
                ))}
            </TabsContent>

            <TabsContent value="hyperlocal" className="space-y-4">
                <Card>
                    <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                                Skor Hyperlocal (0–100)
                            </span>
                            <span className="text-2xl font-bold">
                                {assessment.hyperlocalScore.toFixed(1)}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Spatial 30% · Functional 25% · Halal assurance 20% ·
                            Ecosystem 15% · Embeddedness 10%
                        </p>
                    </CardContent>
                </Card>
                {indicatorsByGroup(HYPERLOCAL_GROUPS).map(
                    ({ group, indicators, breakdown }) => (
                        <IndicatorGroupEditor
                            key={group}
                            title={
                                GROUP_LABELS[
                                    group as keyof typeof GROUP_LABELS
                                ]
                            }
                            description={`Kelompok indikator ${GROUP_LABELS[
                                group as keyof typeof GROUP_LABELS
                            ]} (Hyperlocal)`}
                            indicators={indicators}
                            groupBreakdown={breakdown}
                            destinationId={destinationId}
                            onSaved={load}
                        />
                    ),
                )}
            </TabsContent>

            <TabsContent value="evidence" className="space-y-4">
                <EvidencePanel
                    destinationId={destinationId}
                    records={data.evidenceRecords}
                    onChanged={load}
                />
            </TabsContent>

            <TabsContent value="reachability" className="space-y-4">
                <ReachabilityPanel
                    configs={reachabilityConfigs}
                    facilities={facilities}
                    loading={reachabilityLoading}
                />
            </TabsContent>

            <TabsContent value="result" className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle className="text-lg">
                                Skor Akhir ACES-H
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Versi perhitungan {assessment.calculationVersion} ·
                                dihitung{" "}
                                {new Date(
                                    assessment.calculatedAt,
                                ).toLocaleString("id-ID")}
                            </p>
                        </div>
                        <Button
                            size="sm"
                            onClick={handleRecalculate}
                            disabled={recalculating}
                        >
                            {recalculating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCcw className="mr-2 h-4 w-4" />
                            )}
                            Hitung Ulang
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap items-center gap-4 rounded-lg border p-4">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Skor Terverifikasi
                                </p>
                                <p className="text-4xl font-bold">
                                    {verified && assessment.verifiedScore != null
                                        ? assessment.verifiedScore.toFixed(1)
                                        : "—"}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        className={
                                            CLASSIFICATION_STYLES[
                                                classificationKey
                                            ] ?? ""
                                        }
                                    >
                                        {assessment.classification ??
                                            "Belum diklasifikasi"}
                                    </Badge>
                                    <Badge
                                        variant={
                                            verified ? "default" : "secondary"
                                        }
                                    >
                                        {verified
                                            ? "Terverifikasi"
                                            : "Perlu verifikasi"}
                                    </Badge>
                                </div>
                                {!verified && (
                                    <p className="text-xs text-muted-foreground max-w-md">
                                        Skor belum ditampilkan ke traveller —
                                        verifikasi evidence lapangan & konfirmasi
                                        pengelola terlebih dahulu.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                                {
                                    label: "ACES Readiness",
                                    value: assessment.acesScore,
                                },
                                {
                                    label: "Hyperlocal",
                                    value: assessment.hyperlocalScore,
                                },
                                {
                                    label: "Skor Dasar",
                                    value: assessment.baseScore,
                                },
                                {
                                    label: "Confidence",
                                    value: assessment.evidenceConfidenceScore,
                                },
                                {
                                    label: "Faktor Bukti",
                                    value: assessment.evidenceFactor,
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-lg border p-3"
                                >
                                    <p className="text-xs text-muted-foreground">
                                        {item.label}
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {item.value.toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Skor dasar = 65% × ACES + 35% × Hyperlocal. Faktor bukti
                            (evidence) = 0,70 + 0,30 × Confidence/100, diterapkan
                            pada skor dasar untuk memperoleh skor terverifikasi.
                            Skor akhir dibulatkan 1 desimal dan diklasifikasikan
                            ke 5 level kesiapan.
                        </p>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Riwayat Perhitungan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.history.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Belum ada riwayat perhitungan.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {data.history.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="rounded-lg border p-4 flex flex-wrap items-center justify-between gap-3"
                                    >
                                        <div>
                                            <p className="text-sm font-medium">
                                                {new Date(
                                                    entry.calculatedAt,
                                                ).toLocaleString("id-ID")}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {entry.notes ?? "Pembaruan data"} ·{" "}
                                                {entry.calculationVersion}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span>
                                                Dasar{" "}
                                                {entry.baseScore.toFixed(1)}
                                            </span>
                                            <span>
                                                Terverifikasi{" "}
                                                {entry.verifiedScore != null
                                                    ? entry.verifiedScore.toFixed(1)
                                                    : "—"}
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                className={
                                                    CLASSIFICATION_STYLES[
                                                        entry.classification ?? ""
                                                    ] ?? ""
                                                }
                                            >
                                                {entry.classification ??
                                                    "—"}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
