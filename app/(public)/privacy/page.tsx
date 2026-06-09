import { Separator } from "@/components/ui/separator";
import { ShieldCheck } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

const sections = [
  { id: "pendahuluan", title: "1. Pendahuluan" },
  { id: "informasi-dikumpulkan", title: "2. Informasi yang Kami Kumpulkan" },
  { id: "penggunaan-informasi", title: "3. Penggunaan Informasi" },
  { id: "berbagi-data", title: "4. Berbagi Informasi" },
  { id: "keamanan", title: "5. Keamanan & Penyimpanan" },
  { id: "hak-pengguna", title: "6. Hak-hak Anda" },
  { id: "perubahan", title: "7. Perubahan Kebijakan" },
  { id: "kontak", title: "8. Kontak Kami" },
];

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan Privasi platform untuk perlindungan data pengguna.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <main className="bg-stone-50/50 min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">

          {/* Sidebar Navigation */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  </div>
                  <h3 className="font-bold text-stone-900">Privasi & Data</h3>
                </div>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <Link
                      key={section.id}
                      href={`#${section.id}`}
                      className="block w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-200 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                    >
                      {section.title}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 md:p-12">
            <header className="mb-12">
              <h1 className="text-3xl md:text-4xl font-black text-stone-900 mb-4 tracking-tight">Kebijakan Privasi</h1>
              <div className="flex items-center gap-4 text-sm text-stone-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Aktif & Terlindungi</span>
                </div>
                <span>•</span>
                <span>Terakhir Diperbarui: {lastUpdated}</span>
              </div>
            </header>

            <div className="prose prose-stone prose-emerald max-w-none 
              prose-headings:text-stone-900 prose-headings:font-bold prose-headings:tracking-tight
              prose-p:text-stone-600 prose-p:leading-relaxed prose-p:mb-6
              prose-li:text-stone-600 prose-li:leading-relaxed
              prose-strong:text-stone-900 prose-strong:font-bold">

              <p className="text-lg text-stone-500 leading-relaxed mb-12">
                Kami percaya bahwa transparansi adalah kunci kepercayaan. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda melalui platform kami.
              </p>

              <Separator className="my-12 opacity-50" />

              <section id="pendahuluan" className="scroll-mt-8">
                <h2>1. Pendahuluan</h2>
                <p>
                  Selamat datang di platform kami. Kebijakan ini berlaku untuk seluruh layanan yang kami berikan, baik melalui website maupun aplikasi mobile. Dengan menggunakan platform kami, Anda setuju dengan praktik pengumpulan data yang dijelaskan di sini.
                </p>
              </section>

              <section id="informasi-dikumpulkan" className="scroll-mt-8">
                <h2>2. Informasi yang Kami Kumpulkan</h2>
                <p>Kami mengumpulkan informasi melalui dua cara: informasi yang Anda berikan secara sukarela dan informasi yang dikumpulkan secara otomatis.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 not-prose">
                  <div className="p-5 border border-stone-100 bg-stone-50/50 rounded-xl">
                    <h4 className="font-bold text-stone-900 text-sm mb-2 uppercase tracking-wide">Data Sukarela</h4>
                    <ul className="text-sm text-stone-600 space-y-2">
                      <li className="flex gap-2">• Akun & Profil (Nama, Email)</li>
                      <li className="flex gap-2">• Konten (Ulasan, Foto, Rating)</li>
                      <li className="flex gap-2">• Komunikasi (Laporan, Pesan)</li>
                    </ul>
                  </div>
                  <div className="p-5 border border-stone-100 bg-stone-50/50 rounded-xl">
                    <h4 className="font-bold text-stone-900 text-sm mb-2 uppercase tracking-wide">Data Otomatis</h4>
                    <ul className="text-sm text-stone-600 space-y-2">
                      <li className="flex gap-2">• Data Lokasi (Koordinat GPS)</li>
                      <li className="flex gap-2">• Perangkat (IP, Browser, OS)</li>
                      <li className="flex gap-2">• Log Aktivitas (Pencarian, Klik)</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="penggunaan-informasi" className="scroll-mt-8">
                <h2>3. Penggunaan Informasi</h2>
                <p>Data Anda digunakan secara eksklusif untuk meningkatkan pengalaman Anda di platform ini:</p>
                <ul>
                  <li><strong>Personalisasi:</strong> Memberikan rekomendasi destinasi dan UMKM yang sesuai dengan preferensi Anda melalui teknologi AI.</li>
                  <li><strong>Verifikasi:</strong> Memproses dan memvalidasi sertifikasi halal untuk memastikan data yang ditampilkan akurat.</li>
                  <li><strong>Analisis:</strong> Memahami tren kunjungan untuk membantu komunitas lokal berkembang.</li>
                </ul>
              </section>

              <section id="berbagi-data" className="scroll-mt-8">
                <h2>4. Berbagi Informasi dengan Pihak Ketiga</h2>
                <p>Kami sangat selektif dalam berbagi informasi. Kami bekerja sama dengan:</p>
                <ul>
                  <li>Penyedia layanan cloud untuk penyimpanan data yang aman.</li>
                  <li>Layanan AI (OpenAI/Google) untuk fitur analisis sentimen dan asisten pintar.</li>
                  <li>Penyedia peta untuk integrasi navigasi lokasi.</li>
                </ul>
              </section>

              <section id="keamanan" className="scroll-mt-8">
                <h2>5. Keamanan dan Penyimpanan Data</h2>
                <p>
                  Data Anda disimpan menggunakan enkripsi tingkat lanjut (AES-256) pada server kami. Kami melakukan audit keamanan berkala untuk memastikan tidak ada celah akses yang tidak sah.
                </p>
              </section>

              <section id="hak-pengguna" className="scroll-mt-8">
                <h2>6. Hak-hak Anda</h2>
                <p>Anda memiliki kendali penuh atas data Anda:</p>
                <ul>
                  <li>Anda dapat meminta salinan data pribadi Anda kapan saja.</li>
                  <li>Anda memiliki hak untuk memperbarui atau menghapus informasi profil.</li>
                  <li>Anda dapat menonaktifkan akun Anda secara permanen.</li>
                </ul>
              </section>

              <section id="perubahan" className="scroll-mt-8">
                <h2>7. Perubahan Kebijakan</h2>
                <p>
                  Kami dapat memperbarui kebijakan ini untuk menyesuaikan dengan regulasi terbaru. Kami akan memberikan notifikasi melalui aplikasi atau email jika terdapat perubahan signifikan.
                </p>
              </section>

              <section id="kontak" className="scroll-mt-8">
                <h2>8. Kontak Kami</h2>
                <p>
                  Jika Anda memiliki pertanyaan lebih lanjut, tim privasi kami siap membantu Anda melalui:
                  <span className="font-bold"> support@halaltourism.id</span>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
