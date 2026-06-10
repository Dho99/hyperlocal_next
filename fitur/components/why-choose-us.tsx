"use client";

import { motion } from "framer-motion";
import { reasons } from "@/fitur/data/static-data";
import { TopographicPattern } from "@/components/ui/topographic-pattern";

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function WhyChooseUs() {
    return (
        <section
            className="relative mx-auto max-w-7xl scroll-mt-20 overflow-hidden px-4 py-20 sm:px-6 lg:px-8"
            id="why"
        >
            <TopographicPattern className="pointer-events-none absolute inset-0 select-none text-emerald-900" />
            <div className="relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <h2 className="font-heading text-3xl font-bold tracking-tighter sm:text-4xl lg:text-5xl">
                        Kenapa Memilih Kami
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-stone-600">
                        Landing page ini membaca data operasional platform,
                        sehingga jumlah, kategori, dan rekomendasi ikut berubah
                        saat database diperbarui.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    className="mt-14 grid gap-8 md:grid-cols-3"
                >
                    {reasons.map((reason, index) => {
                        const Icon = reason.icon;
                        return (
                            <motion.article
                                key={reason.title}
                                variants={itemVariants}
                                className={`rounded-2xl border border-white/80 bg-white/40 backdrop-blur-md p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/70 hover:shadow-lg hover:shadow-stone-950/5 ${
                                    index === 1 ? "md:translate-y-8 md:hover:translate-y-7" : ""
                                }`}
                            >
                                <div className="flex items-start gap-5">
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100/80 text-emerald-900 border border-emerald-200/30 shadow-inner">
                                        <Icon className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-heading text-lg font-bold text-stone-900">
                                            {reason.title}
                                        </h3>
                                        <p className="mt-1.5 leading-6 text-stone-600">
                                            {reason.copy}
                                        </p>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
