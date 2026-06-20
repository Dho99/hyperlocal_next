"use client";

import Link from "next/link";
import { Search, MapPinPlus, CheckCircle } from "lucide-react";

interface EmptyStateProps {
    query: string;
}

export function EmptyState({ query }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="mb-6 relative">
                <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHI-H8QBo3m2I-3URqbkv6beHC3MImshtcOnZgWYOTw5X7V2yCJ02hF64QRpn79NhFklYSKLxyFqLwgfAfyTL4khmDdsEGamdPTtKOAW5TWRsjgfjNF5uZR0UNPplKoT3o-IfANqcIoheYZa-QAmYHtXJIuyey28IVG9dJF4NzQuIEnTFlYRydn7pIFSu64ZcMZ6doRbdzlXLIlAg5aLDpFsJtsFMQI_u8MIk5Ejoa6ywvoLr2nYb3-QDfrG0BXi9-Stiqz5zqg68"
                    alt="Ilustrasi Cloud"
                    className="w-48 md:w-64 h-auto mx-auto drop-shadow-xl animate-bounce duration-[3000ms]"
                />
            </div>

            <div className="max-w-2xl">
                <h1 className="font-heading text-[28px] md:text-5xl text-primary mb-3 tracking-tight font-bold">
                    Maaf, Destinasi Belum Tersedia
                </h1>

                <p className="text-base md:text-lg text-muted-foreground mb-10 leading-relaxed px-4">
                    Kami belum menemukan hasil untuk pencarian{" "}
                    <span className="font-semibold text-primary">
                        &ldquo;{query}&rdquo;
                    </span>
                    . Coba kata kunci lain atau bantu kami memperkaya data
                    dengan menyarankan tempat baru agar platform ini dapat
                    memberikan manfaat bagi lebih banyak pelancong.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <Link
                        href="/"
                        className="w-full md:w-auto bg-primary text-primary-foreground px-10 py-4 rounded-xl font-heading text-base font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-center"
                    >
                        Coba Pencarian Lain
                    </Link>

                    <Link
                        href="/"
                        className="w-full md:w-auto text-primary border-2 border-transparent hover:border-primary px-10 py-4 rounded-xl font-heading text-base font-bold transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <MapPinPlus className="size-5" />
                        Saran Tempat Baru
                    </Link>
                </div>

                <div className="mt-10 pt-10 border-t border-border/30">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                        Tips Pencarian
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <CheckCircle className="size-4 text-green-500" />
                            Periksa ejaan
                        </span>
                        <span className="flex items-center gap-1">
                            <CheckCircle className="size-4 text-green-500" />
                            Gunakan kata kunci umum
                        </span>
                        <span className="flex items-center gap-1">
                            <CheckCircle className="size-4 text-green-500" />
                            Cari berdasarkan kategori
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
