"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { facilityDefinitions } from "@/fitur/data/static-data";
import { formatNumber } from "@/fitur/data/utils";
import { SectionHeading } from "@/components/public/home/section-heading";

interface FacilitiesHighlightsProps {
    totalFacilities: number;
    totalUmkms: number;
    validCertifications: number;
    approvedDestinations: number;
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

export function FacilitiesHighlights({
    totalFacilities,
    totalUmkms,
    validCertifications,
    approvedDestinations,
}: FacilitiesHighlightsProps) {
    const counts = [
        `${formatNumber(totalFacilities)} item`,
        `${formatNumber(totalUmkms)} usaha`,
        `${formatNumber(validCertifications)} sertifikat`,
        `${formatNumber(approvedDestinations)} lokasi`,
    ];

    const [first, ...rest] = facilityDefinitions;

    return (
        <section
            className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8"
            id="facilities"
        >
            <SectionHeading
                action="Lihat Destinasi"
                actionHref="/destinasi"
                eyebrow="Ringkasan fasilitas, UMKM, sertifikasi, dan status destinasi."
                title="Highlight Fasilitas"
            />
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className="mt-8 grid gap-4 md:grid-cols-3"
            >
                <motion.div
                    variants={itemVariants}
                    className="md:col-span-1 md:row-span-2"
                >
                    <div className="flex h-full flex-col justify-between rounded-2xl border border-stone-200/60 bg-stone-50/50 p-7">
                        <div>
                            <div className="flex size-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-900">
                                <first.icon className="size-6" />
                            </div>
                            <h3 className="mt-5 font-heading text-2xl font-bold text-stone-900">
                                {first.title}
                            </h3>
                            <p className="mt-2 text-stone-600">{counts[0]}</p>
                        </div>
                        <CheckCircle2 className="mt-6 size-5 text-emerald-600" />
                    </div>
                </motion.div>
                {rest.map((def, index) => (
                    <motion.div key={def.title} variants={itemVariants}>
                        <div className="flex h-full flex-col rounded-2xl border border-stone-200/60 bg-stone-50/50 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-900">
                                    <def.icon className="size-5" />
                                </div>
                                <CheckCircle2 className="size-5 text-emerald-600" />
                            </div>
                            <h3 className="mt-5 font-heading text-lg font-bold text-stone-900">
                                {def.title}
                            </h3>
                            <p className="mt-1 text-stone-600">
                                {counts[index + 1]}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
