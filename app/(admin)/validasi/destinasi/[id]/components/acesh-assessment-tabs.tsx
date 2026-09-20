"use client";

import { useCallback, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import {
    AceshLayerForm,
    type EvidenceComponentValues,
} from "@/components/acesh/acesh-layer-form";
import {
    ReachabilityPanel,
    type ReachabilityConfigItem,
    type FacilityMetricItem,
} from "./acesh-reachability-panel";
import type { EvidenceRecordItem } from "./acesh-evidence-panel";
import { AceshModelDiagram } from "@/components/admin/acesh/acesh-model-diagram";
import {
    CLASSIFICATION_LABELS,
    CLASSIFICATION_STYLES,
} from "@/lib/config/acesh-labels";

const SELF_MARKER = "ACESH_SELF:";

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

const DEFAULT_EVIDENCE: EvidenceComponentValues = {
    sourceReliability: 0,
    documentEvidence: 0,
    photoGeolocation: 0,
    managementConfirmation: 0,
    fieldValidation: 0,
    dataFreshness: 0,
};

function deriveEvidence(records: EvidenceRecordItem[]): EvidenceComponentValues {
    const canonical = records.find((r) => r.notes?.startsWith(SELF_MARKER));
    if (canonical?.notes) {
        try {
            const parsed = JSON.parse(
                canonical.notes.slice(SELF_MARKER.length),
            ) as Partial<EvidenceComponentValues>;
            return { ...DEFAULT_EVIDENCE, ...parsed };
        } catch {
            // fall through to derivation
        }
    }
    if (records.length === 0) return DEFAULT_EVIDENCE;
    const any = (fn: (r: EvidenceRecordItem) => boolean) => records.some(fn);
    return {
        sourceReliability: Math.max(
            0,
            ...records.map((r) => r.sourceReliabilityScore ?? 0),
        ),
        documentEvidence: any((r) => !!r.documentUrl) ? 100 : 0,
        photoGeolocation: any((r) => !!r.photoUrl) ? 100 : 0,
        managementConfirmation: any((r) => r.managementConfirmed) ? 100 : 0,
        fieldValidation: any((r) => r.fieldValidated) ? 100 : 0,
        dataFreshness: 100,
    };
}

export function AceshAssessmentTabs({
    destinationId,
    facilities,
    profile,
}: {
    destinationId: string;
    facilities: FacilityMetricItem[];
    profile?: { slug?: string; categoryName?: string; city?: string };
}) {
    const [data, setData] = useState<AssessmentPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDetail, setShowDetail] = useState(true);
    const [showModel, setShowModel] = useState(false);
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

    const handleSaveLayer = async (payload: {
        scores: Array<{ indicatorId: string; value: number }>;
        evidence: EvidenceComponentValues;
    }) => {
        setSaving(true);
        try {
            const [scoreRes, evidenceRes] = await Promise.all([
                fetch(
                    `/api/admin/destinations/${destinationId}/acesh-assessment`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ scores: payload.scores }),
                    },
                ),
                fetch(`/api/admin/destinations/${destinationId}/evidence`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ components: payload.evidence }),
                }),
            ]);

            if (!scoreRes.ok || !evidenceRes.ok) {
                toast.error("Gagal menyimpan penilaian");
                return;
            }
            toast.success("Penilaian disimpan & skor diperbarui");
            await load();
        } catch {
            toast.error("Terjadi kesalahan saat menyimpan");
        } finally {
            setSaving(false);
        }
    };

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

    const layerIndicators = data.indicators.map((i) => ({
        id: i.id,
        code: i.code,
        name: i.name,
        description: i.description,
        weight: i.weight,
        group: i.group,
        value: i.score?.value ?? 0,
    }));

    const evidenceValues = deriveEvidence(data.evidenceRecords);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                    Form penilaian 3 lapis. Model SAFAR ACES-H menampilkan
                    diagnosis kesenjangan & rekomendasi prioritas.
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowModel((v) => !v)}
                >
                    {showModel
                        ? "Sembunyikan Model SAFAR ACES-H"
                        : "Tampilkan Model SAFAR ACES-H"}
                </Button>
            </div>

            {showModel && (
                <AceshModelDiagram
                    data={{
                        acesScore: assessment.acesScore,
                        hyperlocalScore: assessment.hyperlocalScore,
                        baseScore: assessment.baseScore,
                        evidenceConfidenceScore:
                            assessment.evidenceConfidenceScore,
                        evidenceFactor: assessment.evidenceFactor,
                        verifiedScore: assessment.verifiedScore,
                        classification: assessment.classification,
                        verificationStatus: assessment.verificationStatus,
                        calculatedAt: assessment.calculatedAt,
                    }}
                    groupBreakdown={data.groupBreakdown.map((b) => ({
                        group: b.group,
                        groupScore: b.groupScore,
                        dimensionWeight: b.dimensionWeight ?? 0,
                    }))}
                    indicators={layerIndicators.map((i) => ({
                        id: i.id,
                        code: i.code,
                        name: i.name,
                        group: i.group,
                        weight: i.weight,
                        value: i.value,
                    }))}
                    evidenceRecords={data.evidenceRecords}
                    profile={profile}
                />
            )}

            <Tabs defaultValue="penilaian" className="space-y-4">
            <TabsList className="flex flex-wrap h-auto">
                <TabsTrigger value="penilaian">Penilaian</TabsTrigger>
                <TabsTrigger value="reachability">Keterjangkauan</TabsTrigger>
                <TabsTrigger value="result">Hasil & Verifikasi</TabsTrigger>
                <TabsTrigger value="history">Riwayat</TabsTrigger>
            </TabsList>

            <TabsContent value="penilaian" className="space-y-4">
                <Card>
                    <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                                Skor Kesiapan ACES (0–100)
                            </span>
                            <span className="text-2xl font-bold">
                                {assessment.acesScore.toFixed(1)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                · Hyperlocal
                            </span>
                            <span className="text-lg font-semibold">
                                {assessment.hyperlocalScore.toFixed(1)}
                            </span>
                        </div>
                        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            Tampilkan detail item
                            <Switch
                                checked={showDetail}
                                onCheckedChange={setShowDetail}
                            />
                        </label>
                    </CardContent>
                </Card>
                <AceshLayerForm
                    indicators={layerIndicators}
                    evidence={evidenceValues}
                    showDetail={showDetail}
                    saving={saving}
                    onSubmit={handleSaveLayer}
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
                                        {assessment.classification
                                            ? (CLASSIFICATION_LABELS[
                                                  assessment.classification
                                              ] ?? assessment.classification)
                                            : "Belum diklasifikasi"}
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
                                        verifikasi bukti lapangan & konfirmasi
                                        pengelola terlebih dahulu.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                                {
                                    label: "Kesiapan ACES",
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
                                    label: "Keyakinan Bukti",
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
                            Skor dasar = 65% × Kesiapan ACES + 35% × Hyperlocal.
                            Faktor bukti = 0,70 + 0,30 × Keyakinan Bukti/100,
                            diterapkan pada skor dasar untuk memperoleh skor
                            terverifikasi. Skor akhir dibulatkan 1 desimal dan
                            diklasifikasikan ke 5 level kesiapan.
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
                                                {entry.classification
                                                    ? (CLASSIFICATION_LABELS[
                                                          entry.classification
                                                      ] ?? entry.classification)
                                                    : "—"}
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
        </div>
    );
}
