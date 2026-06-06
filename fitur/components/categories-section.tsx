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
                        className="flex h-full flex-col justify-end rounded-2xl border border-stone-200/60 bg-stone-50/50 p-7 transition hover:bg-stone-100"
                        href={`/destinasi?category=${hero.id}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex size-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-900">
                                <MapIcon className="size-6" />
                            </div>
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                                {formatNumber(hero._count.destinations)} lokasi
                            </span>
                        </div>
                        <h3 className="mt-5 font-heading text-2xl font-bold text-stone-900">
                            {hero.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-stone-600">
                            {hero.description ||
                                `${formatNumber(hero._count.umkms)} UMKM terkait kategori ini.`}
                        </p>
                    </Link>
                </motion.div>
                {rest.map((category) => (
                    <motion.div key={category.id} variants={itemVariants}>
                        <Link
                            className="flex h-full flex-col rounded-2xl border border-stone-200/60 bg-stone-50/50 p-5 transition hover:bg-stone-100"
                            href={`/destinasi?category=${category.id}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-900">
                                    <MapIcon className="size-5" />
                                </div>
                                <span className="text-xs font-bold text-amber-700">
                                    {formatNumber(category._count.destinations)}{" "}
                                    lokasi
                                </span>
                            </div>
                            <h3 className="mt-4 font-heading text-lg font-bold text-stone-900">
                                {category.name}
                            </h3>
                            <p className="mt-2 text-sm text-stone-600">
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
