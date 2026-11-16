import {
    BadgeCheck,
    CalendarDays,
    ExternalLink,
    FileText,
    ShieldAlert,
    ShieldCheck,
} from "lucide-react";
import type { HalalCertification } from "@/types/umkm";

interface HalalCertificationSectionProps {
    certifications?: HalalCertification[];
}

const STATUS_META: Record<
    string,
    { label: string; className: string; icon: "valid" | "pending" | "invalid" }
> = {
    VALID: {
        label: "Sudah Ada — Tersertifikasi",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: "valid",
    },
    PENDING: {
        label: "Dalam Proses Sertifikasi",
        className: "border-amber-200 bg-amber-50 text-amber-700",
        icon: "pending",
    },
    EXPIRED: {
        label: "Sertifikat Kedaluwarsa",
        className: "border-red-200 bg-red-50 text-red-700",
        icon: "invalid",
    },
    REVOKED: {
        label: "Sertifikat Dicabut",
        className: "border-red-200 bg-red-50 text-red-700",
        icon: "invalid",
    },
};

function formatDate(value: Date | string | null) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function HalalCertificationSection({
    certifications = [],
}: HalalCertificationSectionProps) {
    const cert = certifications[0];

    if (!cert) {
        return (
            <section>
                <h2 className="font-heading text-xl font-bold text-stone-900 sm:text-2xl">
                    Sertifikasi Halal
                </h2>
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800">
                            Belum Ada Sertifikasi Halal
                        </p>
                        <p className="mt-1 text-sm text-amber-700">
                            UMKM ini belum melampirkan bukti sertifikasi halal.
                            Tetap periksa langsung kebersihan dan bahan produk
                            sebelum membeli.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    const meta = STATUS_META[cert.status] ?? STATUS_META.PENDING;
    const issuedAt = formatDate(cert.issuedAt);
    const expiredAt = formatDate(cert.expiredAt);
    const StatusIcon =
        meta.icon === "valid"
            ? BadgeCheck
            : meta.icon === "pending"
              ? ShieldCheck
              : ShieldAlert;

    return (
        <section>
            <h2 className="font-heading text-xl font-bold text-stone-900 sm:text-2xl">
                Sertifikasi Halal
            </h2>
            <div className="mt-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="flex size-11 items-center justify-center rounded-full bg-emerald-50">
                            <StatusIcon className="size-5 text-emerald-700" />
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-stone-900">
                                Status Sertifikasi
                            </p>
                            <span
                                className={`mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}
                            >
                                {meta.label}
                            </span>
                        </div>
                    </div>
                    {cert.documentUrl && (
                        <a
                            href={cert.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                        >
                            <FileText className="size-4" />
                            Lihat Bukti Sertifikat
                            <ExternalLink className="size-3.5" />
                        </a>
                    )}
                </div>

                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                    {cert.certificateNo && (
                        <div>
                            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                                Nomor Sertifikat
                            </dt>
                            <dd className="mt-0.5 text-sm font-medium text-stone-900">
                                {cert.certificateNo}
                            </dd>
                        </div>
                    )}
                    {cert.issuer && (
                        <div>
                            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                                Lembaga Penerbit
                            </dt>
                            <dd className="mt-0.5 text-sm font-medium text-stone-900">
                                {cert.issuer}
                            </dd>
                        </div>
                    )}
                    {(issuedAt || expiredAt) && (
                        <div className="sm:col-span-2">
                            <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
                                <CalendarDays className="size-3.5" />
                                Masa Berlaku
                            </dt>
                            <dd className="mt-0.5 text-sm font-medium text-stone-900">
                                {issuedAt ?? "Tidak diketahui"}
                                {expiredAt ? ` – ${expiredAt}` : " – tidak ada masa berlaku"}
                            </dd>
                        </div>
                    )}
                </dl>

                {cert.notes && (
                    <p className="mt-4 rounded-lg bg-stone-50 p-3 text-sm text-stone-600">
                        {cert.notes}
                    </p>
                )}
            </div>
        </section>
    );
}
