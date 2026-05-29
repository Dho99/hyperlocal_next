import Link from "next/link";
import { formatNumber } from "@/fitur/data/landing-data";

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
            <h3 className="font-heading text-sm font-bold uppercase tracking-[0.12em] text-[#4f378a]">
                {title}
            </h3>
            <div className="mt-4 grid gap-3 text-sm text-[#494551]">
                {links.map(([label, href]) => (
                    <Link
                        className="transition hover:text-[#4f378a]"
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
        <footer className="border-t border-[#cbc4d2]/60 bg-white/70">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.3fr_0.7fr_0.7fr_1fr] lg:px-8">
                <div>
                    <Link
                        className="font-heading text-2xl font-bold text-[#4f378a]"
                        href="/"
                    >
                        Hyperlocal
                    </Link>
                    <p className="mt-4 max-w-sm text-sm leading-7 text-[#494551]">
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
                    ]}
                    title="Dukungan"
                />
                <div>
                    <h3 className="font-heading text-sm font-bold uppercase tracking-[0.12em] text-[#4f378a]">
                        Ringkasan Data
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#494551]">
                        {formatNumber(stats.approvedDestinations)} destinasi
                        approved, {formatNumber(stats.validCertifications)}{" "}
                        sertifikasi valid, dan{" "}
                        {formatNumber(stats.totalFacilities)} fasilitas halal.
                    </p>
                </div>
            </div>
            <div className="border-t border-[#e6e0e9] px-4 py-5 text-center text-xs text-[#494551] sm:px-6 lg:px-8">
                © 2026 Hyperlocal. Semua hak dilindungi.
            </div>
        </footer>
    );
}
