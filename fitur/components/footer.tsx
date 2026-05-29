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
                    <a
                        className="transition hover:text-[#4f378a]"
                        href={href}
                        key={label}
                    >
                        {label}
                    </a>
                ))}
            </div>
        </div>
    );
}

export function Footer() {
    return (
        <footer className="border-t border-[#cbc4d2]/60 bg-white/70">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.3fr_0.7fr_0.7fr_1fr] lg:px-8">
                <div>
                    <a
                        className="font-heading text-2xl font-bold text-[#4f378a]"
                        href="#home"
                    >
                        HyperLocal
                    </a>
                    <p className="mt-4 max-w-sm text-sm leading-7 text-[#494551]">
                        Platform penemuan destinasi halal, fasilitas
                        muslim-friendly, dan rekomendasi wisata berbasis
                        insight lokal.
                    </p>
                </div>
                <FooterLinks
                    links={[
                        ["Destinasi", "#popular"],
                        ["Terverifikasi", "#verified"],
                        ["Peta", "#map"],
                        ["FAQ", "#faq"],
                    ]}
                    title="Jelajah"
                />
                <FooterLinks
                    links={[
                        ["Cara Kerja", "#how-it-works"],
                        ["Fasilitas", "#facilities"],
                        ["Ulasan", "#reviews"],
                        ["Newsletter", "#newsletter"],
                    ]}
                    title="Dukungan"
                />
                <div>
                    <h3 className="font-heading text-sm font-bold uppercase tracking-[0.12em] text-[#4f378a]">
                        Update Lokal
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#494551]">
                        Ikuti rekomendasi mingguan dan info destinasi baru.
                    </p>
                    <form action="#newsletter" className="mt-4 flex gap-2">
                        <input
                            aria-label="Email footer"
                            className="h-10 min-w-0 flex-1 rounded-lg border border-[#cbc4d2] bg-[#fdf7ff] px-3 text-sm outline-none focus:border-[#4f378a]"
                            placeholder="Email"
                            type="email"
                        />
                        <button
                            className="h-10 rounded-lg bg-[#4f378a] px-4 text-sm font-bold text-white"
                            type="submit"
                        >
                            Kirim
                        </button>
                    </form>
                </div>
            </div>
            <div className="border-t border-[#e6e0e9] px-4 py-5 text-center text-xs text-[#494551] sm:px-6 lg:px-8">
                © 2026 HyperLocal. Semua hak dilindungi.
            </div>
        </footer>
    );
}
