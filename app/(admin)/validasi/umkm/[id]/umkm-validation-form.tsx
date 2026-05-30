"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

const STATUS_OPTIONS = [
    {
        value: "APPROVED",
        label: "Tervalidasi",
        description: "UMKM memenuhi persyaratan",
        icon: CheckCircle2,
        activeClass: "border-emerald-300 bg-emerald-50",
        activeText: "text-emerald-800",
        iconClass: "text-emerald-600",
    },
    {
        value: "REJECTED",
        label: "Ditolak",
        description: "UMKM tidak memenuhi persyaratan",
        icon: XCircle,
        activeClass: "border-red-300 bg-red-50",
        activeText: "text-red-800",
        iconClass: "text-red-600",
    },
    {
        value: "REVISION",
        label: "Perlu Revisi",
        description: "UMKM perlu melengkapi data",
        icon: RefreshCw,
        activeClass: "border-blue-300 bg-blue-50",
        activeText: "text-blue-800",
        iconClass: "text-blue-600",
    },
];

interface UmkmValidationFormProps {
    umkmId: string;
    currentStatus: string;
    currentNotes: string | null;
}

export function UmkmValidationForm({
    umkmId,
    currentStatus,
    currentNotes,
}: UmkmValidationFormProps) {
    const router = useRouter();
    const [status, setStatus] = useState(
        currentStatus === "PENDING" ? "APPROVED" : currentStatus,
    );
    const [notes, setNotes] = useState(currentNotes ?? "");
    const [submitting, setSubmitting] = useState(false);

    const validStatuses = ["APPROVED", "REJECTED", "REVISION"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validStatuses.includes(status)) {
            toast.error("Status harus dipilih");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/admin/validasi/umkm/${umkmId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    validationStatus: status,
                    surveyorNote: notes || null,
                }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success(
                    data.message || "Status validasi berhasil diperbarui",
                );
                router.push("/validasi/umkm");
                router.refresh();
            } else {
                toast.error(data.message || "Gagal memperbarui status");
            }
        } catch {
            toast.error("Terjadi kesalahan koneksi");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="border border-stone-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-stone-900 mb-1">
                    Keputusan Validasi
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                    Tentukan status validasi UMKM.
                </p>

                <div className="space-y-2">
                    {STATUS_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isActive = status === opt.value;
                        return (
                            <label
                                key={opt.value}
                                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                    isActive
                                        ? opt.activeClass
                                        : "border-stone-200 bg-white hover:bg-stone-50"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value={opt.value}
                                    checked={isActive}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="mt-0.5 sr-only"
                                />
                                <Icon
                                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                                        isActive
                                            ? opt.iconClass
                                            : "text-stone-400"
                                    }`}
                                />
                                <div className="flex-1 min-w-0">
                                    <span
                                        className={`text-sm font-medium ${
                                            isActive
                                                ? opt.activeText
                                                : "text-stone-800"
                                        }`}
                                    >
                                        {opt.label}
                                    </span>
                                    <p className="text-xs text-stone-500 mt-0.5">
                                        {opt.description}
                                    </p>
                                </div>
                                <div
                                    className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 ${
                                        isActive
                                            ? "border-emerald-600 bg-emerald-600"
                                            : "border-stone-300"
                                    }`}
                                    style={
                                        isActive
                                            ? {
                                                  backgroundImage:
                                                      "radial-gradient(circle, #fff 2px, transparent 2px)",
                                              }
                                            : undefined
                                    }
                                />
                            </label>
                        );
                    })}
                </div>
            </div>

            <div className="border border-stone-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-stone-900 mb-1">
                    Catatan Surveyor
                </h3>
                <p className="text-xs text-stone-500 mb-3">
                    Berikan alasan atau catatan untuk pengaju.
                </p>
                <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tambahkan catatan surveyor..."
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-stone-400 resize-none bg-white"
                />
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center gap-2"
            >
                {submitting ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                    </>
                ) : (
                    "Simpan Validasi"
                )}
            </button>
        </form>
    );
}
