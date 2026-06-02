import Link from "next/link";
import { Home, WifiOff } from "lucide-react";
import { RetryButton } from "./retry-button";

export default function OfflinePage() {
    return (
        <main className="min-h-screen bg-white text-neutral-950">
            <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-8 flex size-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
                    <WifiOff className="size-10" aria-hidden="true" />
                </div>

                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    Koneksi Terputus
                </p>
                <h1 className="font-heading text-4xl font-bold leading-tight text-neutral-950 sm:text-5xl">
                    Anda sedang offline
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">
                    Beberapa halaman Priangan Halal Tourism belum tersedia tanpa
                    internet. Periksa koneksi Anda, lalu muat ulang aplikasi
                    untuk melanjutkan eksplorasi.
                </p>

                <div className="mt-9 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                        href="/"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-800 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900"
                    >
                        <Home className="size-4" aria-hidden="true" />
                        Beranda
                    </Link>
                    <RetryButton />
                </div>
            </section>
        </main>
    );
}
