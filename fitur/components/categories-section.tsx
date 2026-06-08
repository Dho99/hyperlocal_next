"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Map as MapIcon } from "lucide-react";
import { SectionHeading } from "@/components/public/home/section-heading";
import { formatNumber } from "@/fitur/data/utils";
import { EmptyState } from "./empty-state";

interface CategoryWithCounts {
    id: string;
    name: string;
    description: string | null;
    _count: {
        destinations: number;
        umkms: number;
    };
}

interface CategoriesSectionProps {
    categories: CategoryWithCounts[];
}

const categoryBackgroundUrls: Record<string, string> = {
    "Wisata Alam": "/wisata_alam.jpg",
    Pantai: "/Pantai.jpg",
    "Taman & Rekreasi": "/taman_rekreasi.jpg",
    "Wisata Religi": "/Wisata_religi.jpg",
    "Fashion Muslim": "/fashion_muslim.jpg",
    "Hotel Syariah": "/Hotel_Syariah.jpg",
    "Kuliner Halal": "/makanan_halal2.jpg",
    "Oleh-Oleh & Souvenir": "/souvenir.jpg",
};

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function CategoriesSection({ categories }: CategoriesSectionProps) {
    if (categories.length === 0) {
        return (
            <section className="mx-auto max-w-7xl scroll-mt-20 px-4 py-10 sm:px-6 lg:px-8" id="categories">
                <SectionHeading
                    action="Lihat Destinasi"
                    actionHref="/destinasi"
                    eyebrow="0 kategori aktif dari database."
                    title="Kategori Destinasi"
                />
                <EmptyState message="Belum ada kategori di database." />
            </section>
        );
    }

    const [hero, ...rest] = categories;

    return (
        <section
            className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8"
            id="categories"
        >
            <SectionHeading
                action="Lihat Destinasi"
                actionHref="/destinasi"
                eyebrow={`${formatNumber(categories.length)} kategori aktif dari database.`}
                title="Kategori Destinasi"
            />
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className="mt-8 grid gap-4 md:grid-cols-4"
            >
                <motion.div
                    variants={itemVariants}
                    className="md:col-span-2 md:row-span-2"
                >
                    <Link
                        suppressHydrationWarning
                        className="relative flex h-full flex-col justify-end overflow-hidden rounded-2xl border border-stone-200/60 p-7 text-white transition hover:opacity-95"
                        href={`/destinasi?category=${hero.id}`}
                    >
                        <div
                            suppressHydrationWarning
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl -z-10"
                            style={{
                                backgroundImage: `url('${categoryBackgroundUrls[hero.name] || '/stone-pattern.jpg'}')`,
                            }}
                        />
                        <div suppressHydrationWarning className="absolute inset-0 bg-stone-950/20" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex size-14 items-center justify-center rounded-xl bg-white/80 text-emerald-900 backdrop-blur-sm">
                                <MapIcon className="size-6" />
                            </div>
                            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-amber-800 backdrop-blur-sm">
                                {formatNumber(hero._count.destinations)} lokasi
                            </span>
                        </div>
                        <h3 className="relative z-10 mt-5 font-heading text-2xl font-bold text-white">
                            {hero.name}
                        </h3>
                        <p className="relative z-10 mt-2 text-sm leading-6 text-white">
                            {hero.description ||
                                `${formatNumber(hero._count.umkms)} UMKM terkait kategori ini.`}
                        </p>
                    </Link>
                </motion.div>
                {rest.map((category) => (
                    <motion.div key={category.id} variants={itemVariants}>
                        <Link
                            suppressHydrationWarning
                            className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/60 p-5 text-white transition hover:opacity-95"
                            href={`/destinasi?category=${category.id}`}
                        >
                            <div
                                suppressHydrationWarning
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl -z-10"
                                style={{
                                    backgroundImage: `url('${categoryBackgroundUrls[category.name] || '/stone-pattern.jpg'}')`,
                                }}
                            />
                            <div suppressHydrationWarning className="absolute inset-0 bg-stone-950/20" />
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex size-11 items-center justify-center rounded-lg bg-white/80 text-emerald-900 backdrop-blur-sm">
                                    <MapIcon className="size-5" />
                                </div>
                                <span className="relative z-10 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-amber-700 backdrop-blur-sm">
                                    {formatNumber(category._count.destinations)} lokasi
                                </span>
                            </div>
                            <h3 className="relative z-10 mt-4 font-heading text-lg font-bold text-white">
                                {category.name}
                            </h3>
                            <p className="relative z-10 mt-2 text-sm text-white">
                                {category.description ||
                                    `${formatNumber(category._count.umkms)} UMKM terkait.`}
                            </p>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
