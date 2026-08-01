"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export interface IndicatorEditorItem {
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
}

interface IndicatorGroupEditorProps {
    title: string;
    description: string;
    indicators: IndicatorEditorItem[];
    groupBreakdown: {
        group: string;
        label: string;
        groupScore: number;
        dimensionWeight: number | null;
        contribution: number | null;
    } | null;
    destinationId: string;
    onSaved?: () => void;
}

const VALUE_LABELS: Record<number, string> = {
    0: "Tidak tersedia",
    1: "Sangat rendah",
    2: "Cukup",
    3: "Baik",
    4: "Sangat baik",
};

export function IndicatorGroupEditor({
    title,
    description,
    indicators,
    groupBreakdown,
    destinationId,
    onSaved,
}: IndicatorGroupEditorProps) {
    const [values, setValues] = useState<Record<string, number>>(() =>
        Object.fromEntries(
            indicators.map((i) => [i.id, i.score?.value ?? 0]),
        ),
    );
    const [notes, setNotes] = useState<Record<string, string>>(() =>
        Object.fromEntries(
            indicators
                .filter((i) => i.score?.notes)
                .map((i) => [i.id, i.score!.notes!]),
        ),
    );
    const [saving, setSaving] = useState(false);

    if (indicators.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                    Belum ada indikator untuk kelompok ini.
                </CardContent>
            </Card>
        );
    }

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(
                `/api/admin/destinations/${destinationId}/acesh-assessment`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        scores: indicators.map((i) => ({
                            indicatorId: i.id,
                            value: values[i.id] ?? 0,
                            notes: notes[i.id] || null,
                        })),
                    }),
                },
            );
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Gagal menyimpan penilaian");
                return;
            }
            toast.success("Penilaian disimpan & skor diperbarui");
            onSaved?.();
        } catch {
            toast.error("Terjadi kesalahan saat menyimpan");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <Button onClick={handleSave} disabled={saving} size="sm">
                    {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    Simpan
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {indicators.map((indicator) => (
                    <div
                        key={indicator.id}
                        className="rounded-lg border p-4 space-y-3"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-muted-foreground">
                                        {indicator.code}
                                    </span>
                                    <p className="font-medium">{indicator.name}</p>
                                    <Badge variant="secondary">
                                        Bobot {indicator.weight}
                                    </Badge>
                                </div>
                                {indicator.description && (
                                    <p className="text-xs text-muted-foreground">
                                        {indicator.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min={0}
                                    max={4}
                                    step={1}
                                    className="w-20 text-center"
                                    value={values[indicator.id] ?? 0}
                                    onChange={(e) => {
                                        const v = Math.max(
                                            0,
                                            Math.min(4, Number(e.target.value) || 0),
                                        );
                                        setValues((prev) => ({
                                            ...prev,
                                            [indicator.id]: v,
                                        }));
                                    }}
                                />
                                <div className="w-40 text-xs text-muted-foreground">
                                    {(values[indicator.id] ?? 0) * 25}/100
                                    <br />
                                    {VALUE_LABELS[values[indicator.id] ?? 0]}
                                </div>
                            </div>
                        </div>
                        <Input
                            placeholder="Catatan penilaian (opsional)"
                            className="text-sm"
                            value={notes[indicator.id] ?? ""}
                            onChange={(e) =>
                                setNotes((prev) => ({
                                    ...prev,
                                    [indicator.id]: e.target.value,
                                }))
                            }
                        />
                    </div>
                ))}

                {groupBreakdown && (
                    <div className="rounded-lg bg-muted/40 p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">
                                Subtotal {groupBreakdown.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Bobot dimensi:{" "}
                                {groupBreakdown.dimensionWeight != null
                                    ? `${groupBreakdown.dimensionWeight * 100}%`
                                    : "-"}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold">
                                {groupBreakdown.groupScore.toFixed(1)}
                            </p>
                            {groupBreakdown.contribution != null && (
                                <p className="text-xs text-muted-foreground">
                                    Kontribusi:{" "}
                                    {groupBreakdown.contribution.toFixed(1)}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
