"use client";

import { useMemo, useState } from "react";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const DEFAULT_SCORING_CONFIG = {
    version: "ACES-H-1.0", accessWeight: 20, communicationWeight: 15,
    environmentWeight: 20, servicesWeight: 45, spatialAccessibilityWeight: 30,
    functionalAvailabilityWeight: 25, halalAssuranceWeight: 20,
    ecosystemConnectivityWeight: 15, embeddednessContinuityWeight: 10,
    sourceReliabilityWeight: 15, documentEvidenceWeight: 20,
    photoGeolocationWeight: 15, managementConfirmationWeight: 10,
    fieldValidationWeight: 25, dataFreshnessWeight: 15, baseAcesWeight: 65,
    baseHyperlocalWeight: 35, evidenceFactorBase: 70, evidenceFactorRange: 30,
};

export type ScoringConfigFormValue = typeof DEFAULT_SCORING_CONFIG;
type Config = ScoringConfigFormValue;
type NumberKey = Exclude<keyof Config, "version">;
type Field = { key: NumberKey; label: string };
type Section = { title: string; description: string; fields: Field[] };

const SECTIONS: Section[] = [
    { title: "ACES Readiness", description: "Total bobot empat domain harus 100%.", fields: [
        { key: "accessWeight", label: "Access" }, { key: "communicationWeight", label: "Communication" },
        { key: "environmentWeight", label: "Environment" }, { key: "servicesWeight", label: "Services" },
    ] },
    { title: "Hyperlocal Halal Ecosystem", description: "Total bobot lima dimensi harus 100%.", fields: [
        { key: "spatialAccessibilityWeight", label: "Spatial Accessibility" }, { key: "functionalAvailabilityWeight", label: "Functional Availability" },
        { key: "halalAssuranceWeight", label: "Halal Assurance" }, { key: "ecosystemConnectivityWeight", label: "Ecosystem Connectivity" },
        { key: "embeddednessContinuityWeight", label: "Embeddedness & Continuity" },
    ] },
    { title: "Evidence Confidence", description: "Total bobot enam komponen bukti harus 100%.", fields: [
        { key: "sourceReliabilityWeight", label: "Source Reliability" }, { key: "documentEvidenceWeight", label: "Document Evidence" },
        { key: "photoGeolocationWeight", label: "Photo & Geolocation" }, { key: "managementConfirmationWeight", label: "Management Confirmation" },
        { key: "fieldValidationWeight", label: "Field Validation" }, { key: "dataFreshnessWeight", label: "Data Freshness" },
    ] },
    { title: "Komposisi Base ACES-H", description: "Pembagian ACES dan Hyperlocal harus 100%.", fields: [
        { key: "baseAcesWeight", label: "ACES" }, { key: "baseHyperlocalWeight", label: "Hyperlocal" },
    ] },
    { title: "Evidence Factor", description: "Nilai dasar dan rentang koreksi harus berjumlah 100%.", fields: [
        { key: "evidenceFactorBase", label: "Faktor Dasar" }, { key: "evidenceFactorRange", label: "Rentang Koreksi" },
    ] },
];

export function AceshScoringSettingsForm({ initialConfig }: { initialConfig: Config }) {
    const [config, setConfig] = useState<Config>(initialConfig);
    const [saving, setSaving] = useState(false);

    const totals = useMemo(() => SECTIONS.map((section) =>
        section.fields.reduce((sum, field) => sum + config[field.key], 0)), [config]);
    const valid = totals.every((total) => Math.abs(total - 100) <= 0.001);

    function update(key: NumberKey, rawValue: string) {
        const value = rawValue === "" ? 0 : Number(rawValue);
        setConfig((current) => ({ ...current, [key]: Number.isFinite(value) ? value : 0 }));
    }

    async function save() {
        if (!valid) { toast.error("Semua kelompok bobot harus berjumlah 100%."); return; }
        setSaving(true);
        try {
            const response = await fetch("/api/admin/acesh/scoring-config", {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error ?? "Gagal menyimpan konfigurasi");
            toast.success("Bobot ACES-H berhasil disimpan");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal menyimpan konfigurasi");
        } finally { setSaving(false); }
    }

    return <div className="space-y-5">
        <Card><CardHeader><CardTitle>Versi Perhitungan</CardTitle><CardDescription>Versi dicatat pada setiap snapshot hasil perhitungan.</CardDescription></CardHeader><CardContent className="max-w-sm space-y-2"><Label htmlFor="version">Nama versi</Label><Input id="version" value={config.version} onChange={(event) => setConfig((current) => ({ ...current, version: event.target.value }))} /></CardContent></Card>
        {SECTIONS.map((section, sectionIndex) => {
            const total = totals[sectionIndex]; const isValid = Math.abs(total - 100) <= 0.001;
            return <Card key={section.title}><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle>{section.title}</CardTitle><CardDescription className="mt-1">{section.description}</CardDescription></div><div className={isValid ? "text-sm font-semibold text-emerald-600" : "text-sm font-semibold text-destructive"}>Total: {total}%</div></div></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.fields.map((field) => <div className="space-y-2" key={field.key}><Label htmlFor={field.key}>{field.label}</Label><div className="relative"><Input id={field.key} type="number" min="0" max="100" step="0.1" value={config[field.key]} onChange={(event) => update(field.key, event.target.value)} className="pr-9" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span></div></div>)}
            </CardContent></Card>;
        })}
        <div className="sticky bottom-4 flex flex-wrap justify-end gap-3 rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur"><Button type="button" variant="outline" onClick={() => setConfig(DEFAULT_SCORING_CONFIG)} disabled={saving}><RotateCcw className="mr-2 size-4" />Reset Bobot 1.0</Button><Button type="button" onClick={save} disabled={saving || !valid || !config.version.trim()}>{saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}Simpan Bobot</Button></div>
    </div>;
}
