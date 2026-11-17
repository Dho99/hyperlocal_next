"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Loader2,
    CheckCircle2,
    XCircle,
    RefreshCw,
    BadgeCheck,
    FileText,
    X,
} from "lucide-react";
import { ImageDropzone } from "@/components/upload/image-dropzone";

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

const CERTIFICATION_STATUS_OPTIONS = [
    { value: "VALID", label: "Berlaku / Tersertifikasi" },
    { value: "PENDING", label: "Dalam Proses" },
    { value: "EXPIRED", label: "Kedaluwarsa" },
    { value: "REVOKED", label: "Dicabut" },
];

const inputClass =
    "w-full px-3 py-2 text-sm border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-stone-400 bg-white";

interface CertificationInitialValues {
    certificateNo: string | null;
    issuer: string | null;
    issuedAt: Date | string | null;
    expiredAt: Date | string | null;
    status: string;
    documentUrl: string | null;
    notes: string | null;
}

interface UmkmValidationFormProps {
    umkmId: string;
    currentStatus: string;
    currentNotes: string | null;
    initialCertification?: CertificationInitialValues | null;
}

function toDateInput(value: Date | string | null | undefined) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? ""
        : date.toISOString().slice(0, 10);
}

export function UmkmValidationForm({
    umkmId,
    currentStatus,
    currentNotes,
    initialCertification,
}: UmkmValidationFormProps) {
    const router = useRouter();
    const [status, setStatus] = useState(
        currentStatus === "PENDING" ? "APPROVED" : currentStatus,
    );
    const [notes, setNotes] = useState(currentNotes ?? "");

    const [hasCertification, setHasCertification] = useState(
        Boolean(initialCertification),
    );
    const [certificateNo, setCertificateNo] = useState(
        initialCertification?.certificateNo ?? "",
    );
    const [issuer, setIssuer] = useState(initialCertification?.issuer ?? "");
    const [issuedAt, setIssuedAt] = useState(
        toDateInput(initialCertification?.issuedAt),
    );
    const [expiredAt, setExpiredAt] = useState(
        toDateInput(initialCertification?.expiredAt),
    );
    const [certificationStatus, setCertificationStatus] = useState(
        initialCertification?.status ?? "VALID",
    );
    const [documentUrl, setDocumentUrl] = useState(
        initialCertification?.documentUrl ?? "",
    );
    const [certificationNotes, setCertificationNotes] = useState(
        initialCertification?.notes ?? "",
    );

    const [submitting, setSubmitting] = useState(false);

    const validStatuses = ["APPROVED", "REJECTED", "REVISION"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validStatuses.includes(status)) {
            toast.error("Status harus dipilih");
            return;
        }

        if (
            hasCertification &&
            !certificateNo.trim() &&
            !documentUrl.trim()
        ) {
            toast.error(
                "Isi nomor sertifikat atau unggah bukti sertifikat halal",
            );
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
                    certification: {
                        hasCertification,
                        certificateNo: certificateNo.trim() || null,
                        issuer: issuer.trim() || null,
                        issuedAt: issuedAt || null,
                        expiredAt: expiredAt || null,
                        status: certificationStatus,
                        documentUrl: documentUrl.trim() || null,
                        notes: certificationNotes.trim() || null,
                    },
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
                <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900 mb-1">
                    <BadgeCheck className="w-4 h-4 text-emerald-600" />
                    Sertifikasi Halal
                </h3>
                <p className="text-xs text-stone-500 mb-4">
                    Status sertifikasi halal dan bukti sertifikat UMKM.
                </p>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => setHasCertification(true)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md border transition-colors ${
                            hasCertification
                                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                : "border-stone-200 bg-white text-stone-500 hover:bg-stone-50"
                        }`}
                    >
                        <BadgeCheck className="w-3.5 h-3.5" />
                        Sudah Ada
                    </button>
                    <button
                        type="button"
                        onClick={() => setHasCertification(false)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md border transition-colors ${
                            !hasCertification
                                ? "border-amber-300 bg-amber-50 text-amber-700"
                                : "border-stone-200 bg-white text-stone-500 hover:bg-stone-50"
                        }`}
                    >
                        Belum Ada
                    </button>
                </div>

                {hasCertification ? (
                    <div className="mt-4 space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">
                                Nomor Sertifikat
                            </label>
                            <input
                                type="text"
                                value={certificateNo}
                                onChange={(e) =>
                                    setCertificateNo(e.target.value)
                                }
                                placeholder="Contoh: ID00110000234567"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">
                                Lembaga Penerbit
                            </label>
                            <input
                                type="text"
                                value={issuer}
                                onChange={(e) => setIssuer(e.target.value)}
                                placeholder="Contoh: BPJPH / MUI"
                                className={inputClass}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-stone-600 mb-1">
                                    Tanggal Terbit
                                </label>
                                <input
                                    type="date"
                                    value={issuedAt}
                                    onChange={(e) =>
                                        setIssuedAt(e.target.value)
                                    }
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-stone-600 mb-1">
                                    Berlaku Sampai
                                </label>
                                <input
                                    type="date"
                                    value={expiredAt}
                                    onChange={(e) =>
                                        setExpiredAt(e.target.value)
                                    }
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">
                                Status Keberlakuan
                            </label>
                            <select
                                value={certificationStatus}
                                onChange={(e) =>
                                    setCertificationStatus(e.target.value)
                                }
                                className={inputClass}
                            >
                                {CERTIFICATION_STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">
                                Bukti / Dokumen Sertifikat
                            </label>
                            {documentUrl ? (
                                <div className="flex items-center justify-between gap-2 rounded-md border border-stone-200 bg-stone-50 p-2">
                                    <a
                                        href={documentUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-emerald-700 hover:underline"
                                    >
                                        <FileText className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">
                                            Lihat bukti sertifikat
                                        </span>
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => setDocumentUrl("")}
                                        title="Hapus bukti sertifikat"
                                        className="text-red-600 hover:text-red-700 shrink-0"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <ImageDropzone
                                    folder="validations"
                                    multiple={false}
                                    maxFiles={1}
                                    onUploadComplete={(urls) =>
                                        setDocumentUrl(urls[0] ?? "")
                                    }
                                />
                            )}
                            <p className="mt-1 text-[10px] text-stone-400">
                                Unggah foto atau hasil pindai sertifikat halal
                                (maks. 5MB).
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">
                                Catatan Sertifikasi (Opsional)
                            </label>
                            <textarea
                                rows={2}
                                value={certificationNotes}
                                onChange={(e) =>
                                    setCertificationNotes(e.target.value)
                                }
                                placeholder="Catatan tambahan terkait sertifikasi..."
                                className={`${inputClass} resize-none`}
                            />
                        </div>
                    </div>
                ) : (
                    <p className="mt-3 text-xs text-stone-500">
                        UMKM ini belum memiliki sertifikat halal. Pilih
                        &ldquo;Sudah Ada&rdquo; bila sertifikat sudah diterima.
                    </p>
                )}
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
