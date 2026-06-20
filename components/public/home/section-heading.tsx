"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface SectionHeadingProps {
    title: string;
    eyebrow: string;
    action?: string;
    actionHref?: string;
}

export function SectionHeading({
    title,
    eyebrow,
    action,
    actionHref = "#popular",
}: SectionHeadingProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="flex items-end justify-between gap-4"
        >
            <div>
                <h2 className="font-heading text-3xl font-bold tracking-tighter sm:text-4xl lg:text-5xl">
                    {title}
                </h2>
                <p className="mt-2 text-base text-muted-foreground">{eyebrow}</p>
            </div>
            {action && (
                <a
                    className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-accent sm:inline-flex"
                    href={actionHref}
                >
                    {action}
                    <ChevronRight className="size-4" />
                </a>
            )}
        </motion.div>
    );
}
