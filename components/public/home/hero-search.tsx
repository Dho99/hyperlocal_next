"use client";

import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, Navigation, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const NEARBY_REGEX = /terdekat|sekitar|nearby|dekat sini/i;
const GPS_TIMEOUT = 8000;

function getGpsErrorMessage(code: number): string {
    switch (code) {
        case 1:
            return "Akses lokasi dimatikan. Silakan izinkan akses lokasi di browser Anda.";
        case 2:
            return "Posisi tidak tersedia saat ini. Coba lagi nanti.";
        case 3:
            return "Waktu permintaan lokasi habis. Coba lagi.";
        default:
            return "Gagal mendapatkan lokasi.";
    }
}

export function HeroSearch() {
    const [query, setQuery] = useState("");
    const [showGpsModal, setShowGpsModal] = useState(false);
    const [gpsError, setGpsError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;

        if (NEARBY_REGEX.test(trimmed)) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude: lat, longitude: lng } = pos.coords;
                    router.push(
                        `/explore?q=${encodeURIComponent(trimmed)}&lat=${lat}&lng=${lng}`,
                    );
                },
                (err) => {
                    setGpsError(getGpsErrorMessage(err.code));
                    setShowGpsModal(true);
                },
                {
                    enableHighAccuracy: true,
                    timeout: GPS_TIMEOUT,
                    maximumAge: 60000,
                },
            );
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Menganalisis permintaan...");

        try {
            const res = await fetch("/api/assistant/route-finder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: trimmed }),
            });

            if (!res.ok) throw new Error("Gagal memproses permintaan");

            const data = await res.json();
            toast.dismiss(toastId);

            if (data.intent === "DESTINATION_SEARCH") {
                router.push(data.redirectTo);
            } else if (data.intent === "ITINERARY_RECOMMENDATION") {
                sessionStorage.setItem(
                    "itinerary_payload",
                    JSON.stringify(data.payload),
                );
                toast.success("Rencana perjalanan siap!");
                router.push("/itinerary-recommendation");
            }
        } catch {
            toast.dismiss(toastId);
            toast.error("Terjadi kesalahan. Coba lagi nanti.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                onSubmit={handleSubmit}
                className="mx-auto mt-7 flex max-w-3xl items-center gap-3 rounded-2xl bg-white/80 p-2 shadow-lg shadow-black/10 ring-1 ring-white/40 backdrop-blur-md"
            >
                {loading ? (
                    <Loader2 className="ml-3 size-5 shrink-0 animate-spin text-emerald-700" />
                ) : (
                    <Search className="ml-3 size-5 shrink-0 text-stone-500" />
                )}
                <input
                    aria-label="Cari destinasi"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-500"
                    placeholder="Cari destinasi, buat rencana perjalanan..."
                    disabled={loading}
                />
                <button
                    className="hidden h-12 rounded-xl bg-emerald-900 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-900/25 transition hover:bg-emerald-800 sm:block disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Memproses..." : "Cari Sekarang"}
                </button>
            </motion.form>

            <AlertDialog open={showGpsModal} onOpenChange={setShowGpsModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogMedia>
                            <Navigation className="size-8 text-emerald-900" />
                        </AlertDialogMedia>
                        <AlertDialogTitle>
                            Akses Lokasi Dibutuhkan
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda mencari destinasi di sekitar Anda, namun akses
                            lokasi dimatikan. Silakan izinkan akses lokasi di
                            browser Anda, atau gunakan kata kunci spesifik
                            seperti &ldquo;di Tasikmalaya&rdquo;.
                            {gpsError && (
                                <span className="mt-2 block text-red-600">
                                    {gpsError}
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            onClick={() => setShowGpsModal(false)}
                        >
                            Mengerti
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
