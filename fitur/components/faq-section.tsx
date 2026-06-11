"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { Faq } from "@/fitur/data/utils";

interface FaqSectionProps {
    items: Faq[];
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

export function FaqSection({ items }: FaqSectionProps) {
    if (items.length === 0) return null;

    return (
        <section
            className="mx-auto max-w-4xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8"
            id="faq"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <h2 className="font-heading text-3xl font-bold tracking-tighter sm:text-4xl lg:text-5xl">
                    FAQ Perjalanan Halal
                </h2>
                <p className="mt-3 text-base text-stone-600">
                    Jawaban singkat untuk hal yang paling sering ditanyakan.
                </p>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className="mt-10 space-y-3"
            >
                {items.map((faq) => (
                    <motion.div key={faq.question} variants={itemVariants}>
                        <details className="group rounded-2xl border border-white/80 bg-white/40 backdrop-blur-md p-5 transition-all duration-300 hover:bg-white/60">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-base font-semibold text-stone-900">
                                {faq.question}
                                <ChevronRight className="size-5 shrink-0 text-amber-700 transition group-open:rotate-90" />
                            </summary>
                            <p className="mt-3 leading-7 text-stone-600">
                                {faq.answer}
                            </p>
                        </details>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
