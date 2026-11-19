"use client";

import { useState } from "react";
import { ScanSearch } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function ExifValidationSetting({
    initialEnabled,
}: {
    initialEnabled: boolean;
}) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function updateSetting(nextEnabled: boolean) {
        setSaving(true);
        setError(null);

        try {
            const response = await fetch("/api/admin/settings/photo-validation", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isExifValidationEnabled: nextEnabled }),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error ?? "Gagal menyimpan pengaturan.");
            }

            setEnabled(result.data.isExifValidationEnabled);
            toast.success(
                result.data.isExifValidationEnabled
                    ? "Validasi EXIF diaktifkan"
                    : "Validasi EXIF dinonaktifkan",
            );
        } catch (cause: unknown) {
            const message =
                cause instanceof Error ? cause.message : "Gagal menyimpan pengaturan.";
            setError(message);
            toast.error(message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex-row items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                    <ScanSearch className="size-5" aria-hidden="true" />
                </div>
                <div>
                    <CardTitle>Validasi EXIF foto bukti</CardTitle>
                    <CardDescription className="mt-2">
                        Atur apakah sistem mengambil metadata GPS dan waktu dari foto,
                        lalu memeriksa kecocokannya dengan lokasi bukti.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                    <div className="space-y-1">
                        <Label htmlFor="exif-validation-switch" className="cursor-pointer">
                            {enabled ? "Validasi aktif" : "Validasi nonaktif"}
                        </Label>
                        <p id="exif-validation-description" className="text-sm text-muted-foreground">
                            {enabled
                                ? "Foto bukti diperiksa saat diunggah dan disimpan."
                                : "Foto tetap dapat diunggah, tanpa mengambil atau memeriksa metadata EXIF."}
                        </p>
                    </div>
                    <Switch
                        id="exif-validation-switch"
                        aria-describedby="exif-validation-description"
                        checked={enabled}
                        disabled={saving}
                        onCheckedChange={updateSetting}
                    />
                </div>
                <p className="text-xs text-muted-foreground" aria-live="polite">
                    {saving
                        ? "Menyimpan pengaturan..."
                        : error ?? "Pengaturan berlaku untuk upload berikutnya. Metadata foto lama tidak dihapus."}
                </p>
            </CardContent>
        </Card>
    );
}
