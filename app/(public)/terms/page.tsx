import { Gavel } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

const sections = [
    { id: "penggunaan", title: "Penggunaan Layanan", number: "1" },
    { id: "akun", title: "Akun & Keamanan", number: "2" },
    { id: "konten", title: "Konten Pengguna", number: "3" },
    { id: "akurasi", title: "Akurasi & Penafian Halal", number: "4" },
    {
        id: "kekayaan-intelektual",
        title: "Kekayaan Intelektual",
        number: "5",
    },
    { id: "pembatasan", title: "Pembatasan Tanggung Jawab", number: "6" },
    { id: "perubahan", title: "Perubahan Ketentuan", number: "7" },
    { id: "hukum", title: "Hukum yang Berlaku", number: "8" },
];

export const metadata: Metadata = {
    title: "Syarat dan Ketentuan",
    description: "Syarat dan Ketentuan penggunaan platform.",
};

function TermsSection({
    id,
    number,
    title,
    children,
}: {
    id: string;
    number: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section
            id={id}
            className="scroll-mt-28 border-t border-border py-8 first:border-t-0 first:pt-0"
        >
            <div className="mb-4 flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary dark:bg-accent/15 dark:text-accent">
                    {number}
                </span>
                <h2 className="text-xl font-bold leading-tight tracking-tight text-foreground md:text-2xl">
                    {title}
                </h2>
            </div>
            <div className="space-y-4 pl-11 text-base leading-7 text-muted-foreground">
                {children}
            </div>
        </section>
    );
}

export default function TermsAndConditionsPage() {
    const lastUpdated = new Date().toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-10 md:px-6 md:py-14 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8">
                <aside className="hidden lg:block">
                    <div className="sticky top-24 rounded-lg border border-border bg-card p-4 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary dark:bg-accent/15 dark:text-accent">
                                <Gavel className="size-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-foreground">
                                    Legalitas
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Daftar isi ketentuan
                                </p>
                            </div>
                        </div>
                        <nav className="space-y-1">
                            {sections.map((section) => (
                                <Link
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                >
                                    <span className="w-4 text-xs font-bold text-primary dark:text-accent">
                                        {section.number}
                                    </span>
                                    <span>{section.title}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>

                <article className="min-w-0">
                    <header className="mb-8 rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:bg-accent/15 dark:text-accent">
                            <Gavel className="size-3.5" />
                            Dokumen legal layanan
                        </div>
                        <h1 className="max-w-3xl text-3xl font-black tracking-tight text-foreground md:text-5xl">
                            Syarat & Ketentuan
                        </h1>
                        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
                            Harap baca Syarat dan Ketentuan ini secara saksama
                            sebelum menggunakan platform ini. Penggunaan
                            layanan kami berarti Anda menyetujui seluruh poin
                            hukum yang berlaku.
                        </p>
                        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-2">
                                <span className="size-2 rounded-full bg-primary dark:bg-accent" />
                                Dokumen resmi
                            </span>
                            <span aria-hidden="true">/</span>
                            <span>Terakhir diperbarui: {lastUpdated}</span>
                        </div>
                    </header>

                    <div className="rounded-lg border border-border bg-card px-6 py-2 shadow-sm md:px-8">
                        <TermsSection
                            id="penggunaan"
                            number="1"
                            title="Penggunaan Layanan"
                        >
                            <p>
                                Platform ini disediakan untuk membantu Anda
                                menemukan destinasi lokal yang ramah muslim.
                                Anda dilarang menggunakan data platform ini
                                untuk tujuan komersial tanpa izin atau
                                melakukan aktivitas yang merugikan stabilitas
                                sistem kami.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="akun"
                            number="2"
                            title="Akun & Keamanan"
                        >
                            <p>
                                Keamanan akun Anda adalah tanggung jawab
                                bersama. Kami menggunakan autentikasi pihak
                                ketiga untuk memastikan keamanan data login
                                Anda. Namun, Anda tetap berkewajiban untuk
                                tidak membagikan akses akun Anda kepada pihak
                                mana pun.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="konten"
                            number="3"
                            title="Konten Pengguna"
                        >
                            <p>
                                Setiap ulasan, foto, atau laporan yang Anda
                                kirimkan harus bersifat jujur dan tidak
                                mengandung unsur SARA atau provokasi. Anda
                                memberikan kami izin untuk menampilkan konten
                                tersebut sebagai bagian dari ekosistem informasi
                                platform.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="akurasi"
                            number="4"
                            title="Akurasi & Penafian Halal"
                        >
                            <div className="rounded-lg border border-border bg-muted/35 p-4">
                                <p className="mb-2 font-bold text-foreground">
                                    Penafian Penting (Disclaimer)
                                </p>
                                <p>
                                    Meskipun kami melakukan verifikasi, platform
                                    ini tidak memberikan jaminan mutlak atas
                                    status halal sebuah lokasi. Status halal
                                    dapat berubah sewaktu-waktu. Selalu lakukan
                                    verifikasi mandiri di tempat tujuan.
                                </p>
                            </div>
                        </TermsSection>

                        <TermsSection
                            id="kekayaan-intelektual"
                            number="5"
                            title="Kekayaan Intelektual"
                        >
                            <p>
                                Seluruh kode sumber, desain antarmuka, dan
                                algoritma rekomendasi di platform ini
                                dilindungi oleh hak cipta. Penggunaan tanpa izin
                                dapat dikenakan sanksi sesuai hukum yang berlaku
                                di Indonesia.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="pembatasan"
                            number="6"
                            title="Pembatasan Tanggung Jawab"
                        >
                            <p>
                                Kami tidak bertanggung jawab atas
                                ketidaknyamanan, kerugian finansial, atau dampak
                                lain yang timbul dari ketidakakuratan data di
                                platform. Layanan ini disediakan &quot;as is&quot;
                                untuk membantu komunitas.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="perubahan"
                            number="7"
                            title="Perubahan Ketentuan"
                        >
                            <p>
                                Syarat dan Ketentuan ini dapat kami ubah
                                sewaktu-waktu tanpa pemberitahuan sebelumnya.
                                Versi terbaru akan selalu tersedia di halaman
                                ini.
                            </p>
                        </TermsSection>

                        <TermsSection
                            id="hukum"
                            number="8"
                            title="Hukum yang Berlaku"
                        >
                            <p>
                                Segala perselisihan yang timbul dari penggunaan
                                platform ini akan diselesaikan di bawah
                                yurisdiksi hukum Republik Indonesia.
                            </p>
                        </TermsSection>
                    </div>
                </article>
            </div>
        </main>
    );
}
