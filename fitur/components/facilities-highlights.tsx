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
                    <div className="flex h-full flex-col justify-between rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md p-7 transition-all duration-300 hover:-translate-y-1 hover:bg-card/90 hover:shadow-lg hover:shadow-black/10">
                        <div>
                            <div className="flex size-14 items-center justify-center rounded-xl bg-accent/20 text-accent border border-accent/10 shadow-inner">
                                <first.icon className="size-6" />
                            </div>
                            <h3 className="mt-5 font-heading text-2xl font-bold text-foreground">
                                {first.title}
                            </h3>
                            <p className="mt-2 text-muted-foreground">{counts[0]}</p>
                        </div>
                        <CheckCircle2 className="mt-6 size-5 text-accent" />
                    </div>
                </motion.div>
                {rest.map((def, index) => (
                    <motion.div key={def.title} variants={itemVariants}>
                        <div className="flex h-full flex-col rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-card/90 hover:shadow-lg hover:shadow-black/10">
                            <div className="flex items-center justify-between">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-accent/20 text-accent border border-accent/10 shadow-inner">
                                    <def.icon className="size-5" />
                                </div>
                                <CheckCircle2 className="size-5 text-accent" />
                            </div>
                            <h3 className="mt-5 font-heading text-lg font-bold text-foreground">
                                {def.title}
                            </h3>
                            <p className="mt-1 text-muted-foreground">
                                {counts[index + 1]}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
