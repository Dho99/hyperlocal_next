"use client";

import { motion } from "framer-motion";
import { steps } from "@/fitur/data/static-data";

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.2 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function HowItWorks() {
    return (
        <section className="bg-emerald-900" id="how-it-works">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <h2 className="font-heading text-3xl font-bold tracking-tighter text-white sm:text-4xl lg:text-5xl">
                        Cara Kerja Hyperlocal
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-emerald-100">
                        Mulai dari pencarian sampai rencana perjalanan, semua
                        dibuat ringkas agar keputusan wisata lebih percaya diri.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    className="mt-14 grid gap-8 md:grid-cols-3"
                >
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.article
                                key={step.title}
                                variants={itemVariants}
                                className="relative"
                            >
                                <span className="font-heading text-7xl font-bold text-emerald-700/40">
                                    0{index + 1}
                                </span>
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-700/40 text-white">
                                    <Icon className="size-6" />
                                </div>
                                <h3 className="mt-5 font-heading text-xl font-bold text-white">
                                    {step.title}
                                </h3>
                                <p className="mt-2 leading-6 text-emerald-100">
                                    {step.copy}
                                </p>
                            </motion.article>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
