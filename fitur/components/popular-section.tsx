"use client";

import { motion } from "framer-motion";
import type { DestinationCard } from "@/fitur/data/utils";
import { SectionHeading } from "@/components/public/home/section-heading";
import { DestinationCardComponent } from "./destination-card";
import { EmptyState } from "./empty-state";

interface PopularSectionProps {
    items: DestinationCard[];
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

export function PopularSection({ items }: PopularSectionProps) {
    if (items.length === 0) {
        return (
            <section className="mx-auto max-w-7xl scroll-mt-20 px-4 py-10 sm:px-6 lg:px-8" id="popular">
                <SectionHeading
                    action="Lihat Semua"
                    actionHref="/destinasi"
                    eyebrow="Diurutkan dari jumlah ulasan, rating, dan pembaruan terbaru."
                    title="Rekomendasi Terpopuler"
                />
                <EmptyState message="Belum ada destinasi approved untuk ditampilkan." />
            </section>
        );
    }

    return (
        <section
            className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8"
            id="popular"
        >
            <SectionHeading
                action="Lihat Semua"
                actionHref="/destinasi"
                eyebrow="Diurutkan dari jumlah ulasan, rating, dan pembaruan terbaru."
                title="Rekomendasi Terpopuler"
            />
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
                {items.slice(0, 4).map((destination) => (
                    <motion.div key={destination.id} variants={itemVariants}>
                        <DestinationCardComponent destination={destination} />
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
