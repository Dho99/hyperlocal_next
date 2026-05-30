"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatNumber } from "@/fitur/data/utils";

interface CtaSectionProps {
    totalDestinations: number;
    totalUmkms: number;
}

export function CtaSection({ totalDestinations, totalUmkms }: CtaSectionProps) {
    return (
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-emerald-900 px-6 py-14 text-center text-white shadow-xl shadow-emerald-900/20 sm:py-16"
            >
                <p className="font-heading text-sm font-semibold text-amber-300">
                    {formatNumber(totalDestinations)} destinasi dan{" "}
                    {formatNumber(totalUmkms)} UMKM siap dijelajahi
                </p>
                <h2 className="mx-auto mt-4 max-w-3xl font-heading text-3xl font-bold leading-tight tracking-tighter sm:text-4xl">
                    Temukan destinasi halal, fasilitas terdekat, dan rute
                    terbaik dalam satu tempat.
                </h2>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-emerald-900 transition hover:bg-amber-50"
                        href="/destinasi"
                    >
                        Mulai Eksplorasi
                        <ChevronRight className="size-4" />
                    </Link>
                    <Link
                        className="inline-flex items-center justify-center rounded-lg border border-white/35 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                        href="/peta"
                    >
                        Lihat Peta
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
