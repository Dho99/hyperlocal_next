import Link from "next/link";
import { prisma } from "@/lib/prisma";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Pending" },
    APPROVED: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Tervalidasi" },
    REJECTED: { bg: "bg-red-50", text: "text-red-700", label: "Ditolak" },
    REVISION: { bg: "bg-blue-50", text: "text-blue-700", label: "Revisi" },
};

export default async function ValidasiUmkmPage() {
    const umkms = await prisma.umkm.findMany({
        where: { validationStatus: { in: ["PENDING", "REVISION"] } },
        include: {
            category: true,
            certifications: { take: 1, orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="flex flex-col gap-6 p-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-stone-900">
                    Validasi UMKM
                </h1>
                <p className="text-sm text-stone-500">
                    Tinjau dan validasi data UMKM yang menunggu persetujuan.
                </p>
            </div>

            <div className="border border-stone-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-stone-200 bg-stone-50">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                Nama UMKM
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                Kategori
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                Sertifikasi Halal
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                        {umkms.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="py-16 text-center text-sm text-stone-400"
                                >
                                    Tidak ada UMKM yang perlu divalidasi.
                                </td>
                            </tr>
                        ) : (
                            umkms.map((umkm) => {
                                const style = STATUS_STYLES[umkm.validationStatus] ?? STATUS_STYLES.PENDING;
                                const certStatus = umkm.certifications[0]?.status;
                                return (
                                    <tr key={umkm.id} className="hover:bg-stone-50/50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-stone-900">
                                            {umkm.name}
                                        </td>
                                        <td className="py-3 px-4 text-stone-600">
                                            {umkm.category?.name || (
                                                <span className="text-stone-400 italic">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            {certStatus ? (
                                                <span
                                                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                                                        certStatus === "VALID"
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : certStatus === "EXPIRED" || certStatus === "REVOKED"
                                                              ? "bg-red-50 text-red-700"
                                                              : "bg-stone-100 text-stone-600"
                                                    }`}
                                                >
                                                    {certStatus === "VALID"
                                                        ? "Tersertifikasi"
                                                        : certStatus === "EXPIRED"
                                                          ? "Kedaluwarsa"
                                                          : certStatus === "REVOKED"
                                                            ? "Dicabut"
                                                            : certStatus}
                                                </span>
                                            ) : (
                                                <span className="text-stone-400 italic text-xs">
                                                    Belum ada
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${style.bg} ${style.text}`}
                                            >
                                                {style.label}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Link
                                                href={`/validasi/umkm/${umkm.id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors"
                                            >
                                                Proses
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
