"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatNumber } from "@/fitur/data/utils";
import { BrandLogo } from "@/components/ui/brand-logo";

interface FooterStats {
    approvedDestinations: number;
    validCertifications: number;
    totalFacilities: number;
}

interface FooterProps {
    stats: FooterStats;
}

function FooterLinks({
    links,
    title,
}: {
    links: Array<[string, string]>;
    title: string;
}) {
    return (
        <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-[0.12em] text-emerald-900">
                {title}
            </h3>
            <div className="mt-4 grid gap-3 text-sm text-stone-600">
                {links.map(([label, href]) => (
                    <Link
                        className="transition hover:text-emerald-900"
                        href={href}
                        key={label}
                    >
                        {label}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export function Footer({ stats }: FooterProps) {
    return (
        <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="border-t border-stone-200/60 bg-white/70"
        >
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.3fr_0.7fr_0.7fr_1fr] lg:px-8">
                <div>
                    <Link
                        className="inline-flex items-center"
                        href="/"
                        aria-label="Beranda"
                    >
                        <BrandLogo size="lg" />
                    </Link>
                    <p className="mt-4 max-w-sm text-sm leading-7 text-stone-600">
                        Platform penemuan destinasi halal, fasilitas
                        muslim-friendly, dan rekomendasi wisata berbasis
                        insight lokal.
                    </p>
                </div>
                <FooterLinks
                    links={[
                        ["Destinasi", "/destinasi"],
                        ["Kategori", "#categories"],
                        ["Terverifikasi", "#verified"],
                        ["FAQ", "#faq"],
                    ]}
                    title="Jelajah"
                />
                <FooterLinks
                    links={[
                        ["Cara Kerja", "#how-it-works"],
                        ["Fasilitas", "#facilities"],
                        ["Ulasan", "#reviews"],
                        ["Peta", "/peta"],
                        ["Syarat & Ketentuan", "/terms"],
                        ["Kebijakan Privasi", "/privacy"],
                    ]}
                    title="Dukungan"
                />
                <div>
                    <h3 className="font-heading text-sm font-bold uppercase tracking-[0.12em] text-emerald-900">
                        Ringkasan Data
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-stone-600">
                        {formatNumber(stats.approvedDestinations)} destinasi
                        approved, {formatNumber(stats.validCertifications)}{" "}
                        sertifikasi valid, dan{" "}
                        {formatNumber(stats.totalFacilities)} fasilitas halal.
                    </p>
                </div>
            </div>
            <div className="border-t border-stone-200 px-4 py-5 text-center text-xs text-stone-600 sm:px-6 lg:px-8">
                © 2026. Semua hak dilindungi.
            </div>
        </motion.footer>
    );
}
