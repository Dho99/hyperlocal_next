"use client";

import { motion } from "framer-motion";
import { Utensils } from "lucide-react";
import type { UmkmCard } from "@/fitur/data/utils";
import { TopographicPattern } from "@/components/ui/topographic-pattern";

interface NearbyPlacesProps {
    items: UmkmCard[];
}

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function NearbyPlaces({ items }: NearbyPlacesProps) {
    if (items.length === 0) return null;

    return (
        <section className="relative mx-auto max-w-7xl scroll-mt-20 overflow-hidden px-4 py-16 sm:px-6 lg:px-8" id="nearby">
            <TopographicPattern className="pointer-events-none absolute inset-0 select-none text-emerald-900" />
            <div className="relative grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5 }}
                >
                    <p className="text-sm font-bold uppercase tracking-[0.12em] text-amber-700">
                        Rekomendasi Sekitar
                    </p>
                    <h2 className="mt-3 font-heading text-3xl font-bold tracking-tighter text-stone-900 sm:text-4xl">
                        UMKM dan fasilitas dekat destinasi
                    </h2>
                    <p className="mt-4 leading-7 text-stone-600">
                        Daftar ini memakai UMKM yang terhubung ke kategori,
                        destinasi, sertifikasi, dan rating di database.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    className="grid gap-4 md:grid-cols-3"
                >
                    {items.map((umkm) => (
                        <motion.article
                            key={umkm.id}
                            variants={itemVariants}
                            className="rounded-2xl border border-white/80 bg-white/40 backdrop-blur-md p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/70 hover:shadow-lg hover:shadow-stone-950/5"
                        >
                            <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-900">
                                <Utensils className="size-5" />
                            </div>
                            <h3 className="mt-4 line-clamp-2 font-heading text-base font-bold text-stone-900">
                                {umkm.name}
                            </h3>
                            <p className="mt-2 text-sm text-stone-600">
                                {umkm.categoryName || "UMKM"} - {umkm.location}
                            </p>
                            {umkm.hasCertification && (
                                <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                                    Sertifikat valid
                                </span>
                            )}
                        </motion.article>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
