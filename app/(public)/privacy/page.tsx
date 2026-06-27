import { ShieldCheck } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

const sections = [
    { id: "pendahuluan", title: "Pendahuluan", number: "1" },
    {
        id: "informasi-dikumpulkan",
        title: "Informasi yang Kami Kumpulkan",
        number: "2",
    },
    { id: "penggunaan-informasi", title: "Penggunaan Informasi", number: "3" },
    { id: "berbagi-data", title: "Berbagi Informasi", number: "4" },
    { id: "keamanan", title: "Keamanan & Penyimpanan", number: "5" },
    { id: "hak-pengguna", title: "Hak-hak Anda", number: "6" },
    { id: "perubahan", title: "Perubahan Kebijakan", number: "7" },
    { id: "kontak", title: "Kontak Kami", number: "8" },
];

const voluntaryData = [
    "Akun & profil seperti nama dan email.",
    "Konten yang Anda kirimkan, termasuk ulasan, foto, dan rating.",
    "Komunikasi melalui laporan, pesan, atau formulir bantuan.",
];

const automaticData = [
    "Data lokasi yang Anda izinkan, termasuk koordinat GPS.",
    "Informasi perangkat seperti IP, browser, dan sistem operasi.",
    "Log aktivitas seperti pencarian, klik, dan halaman yang dibuka.",
];

export const metadata: Metadata = {
    title: "Kebijakan Privasi",
    description: "Kebijakan Privasi platform untuk perlindungan data pengguna.",
};

function PolicySection({
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

function BulletList({ items }: { items: string[] }) {
    return (
        <ul className="list-disc space-y-2 pl-5">
            {items.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    );
}

export default function PrivacyPolicyPage() {
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
                                <ShieldCheck className="size-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-foreground">
                                    Privasi & Data
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Daftar isi kebijakan
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
                            <ShieldCheck className="size-3.5" />
                            Perlindungan data pengguna
                        </div>
                        <h1 className="max-w-3xl text-3xl font-black tracking-tight text-foreground md:text-5xl">
                            Kebijakan Privasi
                        </h1>
                        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
                            Kami percaya bahwa transparansi adalah kunci
                            kepercayaan. Kebijakan ini menjelaskan bagaimana
                            kami mengumpulkan, menggunakan, dan melindungi
                            informasi pribadi Anda melalui platform kami.
                        </p>
                        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-2">
                                <span className="size-2 rounded-full bg-primary dark:bg-accent" />
                                Aktif & terlindungi
                            </span>
                            <span aria-hidden="true">/</span>
                            <span>Terakhir diperbarui: {lastUpdated}</span>
                        </div>
                    </header>

                    <div className="rounded-lg border border-border bg-card px-6 py-2 shadow-sm md:px-8">
                        <PolicySection
                            id="pendahuluan"
                            number="1"
                            title="Pendahuluan"
                        >
                            <p>
                                Selamat datang di platform kami. Kebijakan ini
                                berlaku untuk seluruh layanan yang kami berikan,
                                baik melalui website maupun aplikasi mobile.
                                Dengan menggunakan platform kami, Anda setuju
                                dengan praktik pengumpulan data yang dijelaskan
                                di sini.
                            </p>
                        </PolicySection>

                        <PolicySection
                            id="informasi-dikumpulkan"
                            number="2"
                            title="Informasi yang Kami Kumpulkan"
                        >
                            <p>
                                Kami mengumpulkan informasi melalui dua cara:
                                informasi yang Anda berikan secara sukarela dan
                                informasi yang dikumpulkan secara otomatis.
                            </p>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-lg border border-border bg-muted/35 p-4">
                                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground">
                                        Data Sukarela
                                    </h3>
                                    <BulletList items={voluntaryData} />
                                </div>
                                <div className="rounded-lg border border-border bg-muted/35 p-4">
                                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground">
                                        Data Otomatis
                                    </h3>
                                    <BulletList items={automaticData} />
                                </div>
                            </div>
                        </PolicySection>

                        <PolicySection
                            id="penggunaan-informasi"
                            number="3"
                            title="Penggunaan Informasi"
                        >
                            <p>
                                Data Anda digunakan secara eksklusif untuk
                                meningkatkan pengalaman Anda di platform ini.
                            </p>
                            <BulletList
                                items={[
                                    "Personalisasi rekomendasi destinasi dan UMKM sesuai preferensi Anda.",
                                    "Verifikasi dan validasi sertifikasi halal agar data yang tampil tetap akurat.",
                                    "Analisis tren kunjungan untuk membantu komunitas lokal berkembang.",
                                ]}
                            />
                        </PolicySection>

                        <PolicySection
                            id="berbagi-data"
                            number="4"
                            title="Berbagi Informasi dengan Pihak Ketiga"
                        >
                            <p>
                                Kami sangat selektif dalam berbagi informasi.
                                Data hanya dibagikan ketika diperlukan untuk
                                menjalankan layanan.
                            </p>
                            <BulletList
                                items={[
                                    "Penyedia layanan cloud untuk penyimpanan data yang aman.",
                                    "Layanan AI untuk fitur analisis sentimen dan asisten pintar.",
                                    "Penyedia peta untuk integrasi navigasi lokasi.",
                                ]}
                            />
                        </PolicySection>

                        <PolicySection
                            id="keamanan"
                            number="5"
                            title="Keamanan dan Penyimpanan Data"
                        >
                            <p>
                                Data Anda disimpan menggunakan enkripsi tingkat
                                lanjut pada server kami. Kami juga melakukan
                                audit keamanan berkala untuk memastikan tidak
                                ada celah akses yang tidak sah.
                            </p>
                        </PolicySection>

                        <PolicySection
                            id="hak-pengguna"
                            number="6"
                            title="Hak-hak Anda"
                        >
                            <p>Anda memiliki kendali penuh atas data Anda.</p>
                            <BulletList
                                items={[
                                    "Meminta salinan data pribadi Anda kapan saja.",
                                    "Memperbarui atau menghapus informasi profil.",
                                    "Menonaktifkan akun secara permanen.",
                                ]}
                            />
                        </PolicySection>

                        <PolicySection
                            id="perubahan"
                            number="7"
                            title="Perubahan Kebijakan"
                        >
                            <p>
                                Kami dapat memperbarui kebijakan ini untuk
                                menyesuaikan dengan regulasi terbaru. Jika ada
                                perubahan signifikan, kami akan memberikan
                                notifikasi melalui aplikasi atau email.
                            </p>
                        </PolicySection>

                        <PolicySection
                            id="kontak"
                            number="8"
                            title="Kontak Kami"
                        >
                            <p>
                                Jika Anda memiliki pertanyaan lebih lanjut, tim
                                privasi kami siap membantu melalui{" "}
                                <span className="font-bold text-foreground">
                                    support@halaltourism.id
                                </span>
                                .
                            </p>
                        </PolicySection>
                    </div>
                </article>
            </div>
        </main>
    );
}
