import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AlertTriangle } from "lucide-react";

const TRIAGE_NOTE =
    "PERLU ATENSI KHUSUS: Skor awal di bawah ambang batas minimal ekosistem.";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Pending" },
    APPROVED: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Tervalidasi" },
    REJECTED: { bg: "bg-red-50", text: "text-red-700", label: "Ditolak" },
    REVISION: { bg: "bg-blue-50", text: "text-blue-700", label: "Revisi" },
};

function isTriageNote(note: string | null): boolean {
    return note?.includes(TRIAGE_NOTE) ?? false;
}

export default async function ValidasiPenginapanPage() {
    const accommodations = await prisma.accommodation.findMany({
        where: { validationStatus: { in: ["PENDING", "REVISION"] } },
        include: {
            images: { where: { isPrimary: true }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="flex flex-col gap-6 p-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-stone-900">
                    Validasi Penginapan
                </h1>
                <p className="text-sm text-stone-500">
                    Tinjau dan validasi data penginapan yang menunggu persetujuan.
                </p>
            </div>

            <div className="border border-stone-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-stone-200 bg-stone-50">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                Nama Penginapan
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                Kota
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                Rating
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
                        {accommodations.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="py-16 text-center text-sm text-stone-400"
                                >
                                    Tidak ada penginapan yang perlu divalidasi.
                                </td>
                            </tr>
                        ) : (
                            accommodations.map((acc) => {
                                const style = STATUS_STYLES[acc.validationStatus] ?? STATUS_STYLES.PENDING;
                                const hasTriage = isTriageNote(acc.surveyorNote);
                                return (
                                    <tr key={acc.id} className={`transition-colors ${
                                        hasTriage
                                            ? "border-l-4 border-amber-400 bg-amber-50/50 hover:bg-amber-50/80"
                                            : "hover:bg-stone-50/50"
                                    }`}>
                                        <td className="py-3 px-4 font-medium text-stone-900">
                                            <div className="flex items-center gap-2">
                                                <span>{acc.name}</span>
                                                {hasTriage && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-amber-100 text-amber-700 border border-amber-300">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Perlu Atensi Khusus
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-stone-600">
                                            {acc.city || (
                                                <span className="text-stone-400 italic">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-stone-600">
                                            {acc.rating ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    {acc.rating.toFixed(1)}
                                                </span>
                                            ) : (
                                                <span className="text-stone-400 italic">-</span>
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
                                                href={`/validasi/penginapan/${acc.id}`}
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
