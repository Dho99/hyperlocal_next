"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Trash2,
    Loader2,
    Plus,
    MapPin,
    CheckCircle2,
    FileText,
    ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

export interface EvidenceRecordItem {
    id: string;
    evidenceType: string;
    source: string | null;
    sourceReliabilityScore: number | null;
    documentUrl: string | null;
    photoUrl: string | null;
    latitude: string | number | null;
    longitude: string | number | null;
    managementConfirmed: boolean;
    fieldValidated: boolean;
    dataDate: string | null;
    validatedAt: string | null;
    notes: string | null;
    validator?: { name: string | null; email: string | null } | null;
    createdAt: string;
}

interface EvidencePanelProps {
    destinationId: string;
    records: EvidenceRecordItem[];
    onChanged: () => void;
}

const EVIDENCE_TYPES = [
    "SOURCE",
    "DOCUMENT",
    "PHOTO",
    "GEOLOCATION",
    "MANAGEMENT_CONFIRMATION",
    "FIELD_VALIDATION",
    "OTHER",
];

export function EvidencePanel({ destinationId, records, onChanged }: EvidencePanelProps) {
    const [showForm, setShowForm] = useState(false);
    const [busy, setBusy] = useState(false);

    const [form, setForm] = useState({
        evidenceType: "PHOTO",
        source: "",
        sourceReliabilityScore: "",
        documentUrl: "",
        photoUrl: "",
        latitude: "",
        longitude: "",
        managementConfirmed: false,
        fieldValidated: false,
        dataDate: "",
        notes: "",
    });

    const handleSubmit = async () => {
        setBusy(true);
        try {
            const body: Record<string, unknown> = {
                evidenceType: form.evidenceType,
                source: form.source || null,
                sourceReliabilityScore: form.sourceReliabilityScore
                    ? Math.max(0, Math.min(100, Number(form.sourceReliabilityScore)))
                    : null,
                documentUrl: form.documentUrl || null,
                photoUrl: form.photoUrl || null,
                latitude: form.latitude ? Number(form.latitude) : null,
                longitude: form.longitude ? Number(form.longitude) : null,
                managementConfirmed: form.managementConfirmed,
                fieldValidated: form.fieldValidated,
                dataDate: form.dataDate ? new Date(form.dataDate).toISOString() : null,
                notes: form.notes || null,
            };
            const res = await fetch(
                `/api/admin/destinations/${destinationId}/evidence`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                },
            );
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Gagal menambah evidence");
                return;
            }
            toast.success("Evidence ditambahkan & skor diperbarui");
            setShowForm(false);
            setForm({
                evidenceType: "PHOTO",
                source: "",
                sourceReliabilityScore: "",
                documentUrl: "",
                photoUrl: "",
                latitude: "",
                longitude: "",
                managementConfirmed: false,
                fieldValidated: false,
                dataDate: "",
                notes: "",
            });
            onChanged();
        } catch {
            toast.error("Terjadi kesalahan saat menambah evidence");
        } finally {
            setBusy(false);
        }
    };

    const handleToggle = async (id: string, key: "managementConfirmed" | "fieldValidated") => {
        try {
            const record = records.find((r) => r.id === id);
            if (!record) return;
            await fetch(`/api/admin/evidence/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [key]: !record[key] }),
            });
            onChanged();
        } catch {
            toast.error("Gagal memperbarui status evidence");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/admin/evidence/${id}`, { method: "DELETE" });
            toast.success("Evidence dihapus");
            onChanged();
        } catch {
            toast.error("Gagal menghapus evidence");
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle className="text-lg">Evidence Validation</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {records.length} rekaman — konfirmasi pengelola & validasi
                        lapangan memengaruhi Evidence Confidence Score.
                    </p>
                </div>
                <Button size="sm" onClick={() => setShowForm((v) => !v)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Evidence
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {showForm && (
                    <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs font-medium">Tipe Evidence</label>
                                <Select
                                    value={form.evidenceType}
                                    onValueChange={(v) =>
                                        setForm((f) => ({ ...f, evidenceType: v }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EVIDENCE_TYPES.map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {t}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-xs font-medium">Sumber Data</label>
                                <Input
                                    placeholder="Contoh: Dinas Pariwisata, survei lapangan"
                                    value={form.source}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, source: e.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium">
                                    Skor Keandalan Sumber (0–100)
                                </label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    placeholder="70"
                                    value={form.sourceReliabilityScore}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            sourceReliabilityScore: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium">URL Dokumen</label>
                                <Input
                                    placeholder="https://..."
                                    value={form.documentUrl}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, documentUrl: e.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium">URL Foto</label>
                                <Input
                                    placeholder="https://..."
                                    value={form.photoUrl}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, photoUrl: e.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium">Tanggal Data</label>
                                <Input
                                    type="date"
                                    value={form.dataDate}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, dataDate: e.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium">Latitude</label>
                                <Input
                                    placeholder="-7.3274"
                                    value={form.latitude}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, latitude: e.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium">Longitude</label>
                                <Input
                                    placeholder="108.2207"
                                    value={form.longitude}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, longitude: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="flex items-end gap-2 pb-1">
                                <Button
                                    size="sm"
                                    variant={
                                        form.managementConfirmed ? "default" : "outline"
                                    }
                                    onClick={() =>
                                        setForm((f) => ({
                                            ...f,
                                            managementConfirmed: !f.managementConfirmed,
                                        }))
                                    }
                                >
                                    <CheckCircle2 className="mr-1 h-4 w-4" />
                                    Konfirmasi Pengelola
                                </Button>
                                <Button
                                    size="sm"
                                    variant={form.fieldValidated ? "default" : "outline"}
                                    onClick={() =>
                                        setForm((f) => ({
                                            ...f,
                                            fieldValidated: !f.fieldValidated,
                                        }))
                                    }
                                >
                                    <MapPin className="mr-1 h-4 w-4" />
                                    Validasi Lapangan
                                </Button>
                            </div>
                        </div>
                        <Input
                            placeholder="Catatan validasi"
                            value={form.notes}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, notes: e.target.value }))
                            }
                        />
                        <div className="flex justify-end">
                            <Button onClick={handleSubmit} disabled={busy}>
                                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan Evidence
                            </Button>
                        </div>
                    </div>
                )}

                {records.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Belum ada evidence. Tambahkan minimal satu rekaman agar
                        Evidence Confidence dapat dinilai.
                    </p>
                ) : (
                    records.map((record) => (
                        <div key={record.id} className="rounded-lg border p-4 space-y-2">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge>{record.evidenceType}</Badge>
                                        {record.source && (
                                            <span className="text-xs text-muted-foreground">
                                                {record.source}
                                            </span>
                                        )}
                                        {record.sourceReliabilityScore != null && (
                                            <Badge variant="secondary">
                                                Reliabilitas {record.sourceReliabilityScore}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        {record.documentUrl && (
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" /> Dokumen
                                            </span>
                                        )}
                                        {record.photoUrl && (
                                            <span className="flex items-center gap-1">
                                                <ImageIcon className="h-3 w-3" /> Foto
                                            </span>
                                        )}
                                        {record.latitude != null && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {record.latitude}, {record.longitude}
                                            </span>
                                        )}
                                        {record.dataDate && (
                                            <span>
                                                Data:{" "}
                                                {new Date(record.dataDate).toLocaleDateString(
                                                    "id-ID",
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    {record.notes && (
                                        <p className="text-xs">{record.notes}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        size="sm"
                                        variant={
                                            record.managementConfirmed ? "default" : "outline"
                                        }
                                        onClick={() =>
                                            handleToggle(record.id, "managementConfirmed")
                                        }
                                    >
                                        Pengelola
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={
                                            record.fieldValidated ? "default" : "outline"
                                        }
                                        onClick={() =>
                                            handleToggle(record.id, "fieldValidated")
                                        }
                                    >
                                        Lapangan
                                    </Button>
                                    <Button
                                        size="icon-sm"
                                        variant="ghost"
                                        onClick={() => handleDelete(record.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
