"use client";

import Link from "next/link";
import { RefreshCcw, MoveLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * Custom 404 Not Found Page
 * Design Specs: Retrieved from Stitch Project (HalalMap)
 * Colors: Surface (#fdf7ff), Primary (#4f378a), Outline (#7a7582)
 * Typography: Montserrat (Headings), Inter (Body)
 */
export default function NotFound() {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    // Prevent hydration mismatch for window.location actions
    useEffect(() => {
        setMounted(true); //eslint-disable-line
    }, []);

    return (
        <main className="min-h-screen bg-[#fdf7ff] flex flex-col items-center justify-center p-6 md:p-10 font-sans selection:bg-[#e9ddff]">
            <div className="w-full max-w-[1280px] mx-auto flex flex-col items-center text-center space-y-8 md:space-y-12">
                {/* Illustration (External URL from Stitch Design System) */}
                <div className="relative w-full max-w-[280px] md:max-w-md aspect-square mb-2 md:mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOx0y-DO8q99S5adBkoPmA3HqoFfI5QNH0Pm8PhPRUIVfPQA_e4SGCz0xV0jndhFJlDNVxR2LGFDYUiml0Bu8tXMEfZHIgev7Lj92dSvuCB93RDCowbb8vE9SclPQUCtLblON6NfE9n_xOFgeRCnLh0ZG3CivHpdvd557a6N_Ot30nJDM71ZwhnVK4P7T4R1cttjvHC9TIS7r0Fqjk44w4yDbeIIgvg6B1erL6L5c8hcNeIprzOB2B2xd9UYHqmzQvD_WkYzUMQHo"
                        alt="404 Error Illustration"
                        className="object-contain w-full h-full drop-shadow-sm"
                        loading="lazy"
                    />
                </div>

                {/* Text Content */}
                <div className="flex flex-col gap-4 md:gap-6 max-w-2xl px-4">
                    <h1
                        className="font-bold text-[#1d1b20] text-3xl md:text-5xl lg:text-6xl tracking-tight leading-tight"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                        404 - Halaman Tidak Ditemukan
                    </h1>
                    <p
                        className="text-[#494551] text-base md:text-xl leading-relaxed"
                        style={{ fontFamily: "Inter, sans-serif" }}
                    >
                        Mohon maaf, halaman yang Anda cari tidak dapat
                        ditemukan, telah dipindahkan, atau mungkin tidak pernah
                        ada. Silakan periksa kembali URL atau kembali ke
                        beranda.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
                    <button
                        onClick={() => mounted && window.location.reload()}
                        className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-3.5 md:py-4 rounded-xl border border-[#7a7582] text-[#4f378a] hover:bg-[#e6e0e9] transition-all duration-200 font-semibold active:scale-[0.98] active:opacity-80"
                        style={{ fontFamily: "Inter, sans-serif" }}
                    >
                        <RefreshCcw className="w-5 h-5" />
                        <span>Muat Ulang Halaman</span>
                    </button>

                    <button
                        onClick={() => router.back()}
                        className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-3.5 md:py-4 rounded-xl bg-[#4f378a] text-[#ffffff] hover:bg-[#6750a4] transition-all duration-200 font-semibold shadow-md hover:shadow-lg active:scale-[0.98] active:opacity-80"
                        style={{ fontFamily: "Inter, sans-serif" }}
                    >
                        <MoveLeftIcon className="w-5 h-5" />
                        <span>Kembali</span>
                    </button>
                </div>
            </div>

            {/* Footer Text */}
            <div
                className="mt-20 text-center text-[#7a7582] text-xs md:text-sm tracking-wide"
                style={{ fontFamily: "Inter, sans-serif" }}
            >
                © {new Date().getFullYear()} HalalQuest Discovery. Empowering
                the global Muslim traveler.
            </div>
        </main>
    );
}
