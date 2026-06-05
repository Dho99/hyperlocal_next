import { Separator } from "@/components/ui/separator";
import { Gavel, Scale } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

const sections = [
  { id: "penggunaan", title: "1. Penggunaan Layanan" },
  { id: "akun", title: "2. Akun & Keamanan" },
  { id: "konten", title: "3. Konten Pengguna" },
  { id: "akurasi", title: "4. Akurasi & Penafian Halal" },
  { id: "kekayaan-intelektual", title: "5. Kekayaan Intelektual" },
  { id: "pembatasan", title: "6. Pembatasan Tanggung Jawab" },
  { id: "perubahan", title: "7. Perubahan Ketentuan" },
  { id: "hukum", title: "8. Hukum yang Berlaku" },
];

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan | Hyperlocal",
  description: "Syarat dan Ketentuan penggunaan platform Hyperlocal.",
};

export default function TermsAndConditionsPage() {
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
                  <div className="w-8 h-8 rounded bg-stone-100 flex items-center justify-center">
                    <Gavel className="w-5 h-5 text-stone-700" />
                  </div>
                  <h3 className="font-bold text-stone-900">Legalitas</h3>
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
              <h1 className="text-3xl md:text-4xl font-black text-stone-900 mb-4 tracking-tight">Syarat & Ketentuan</h1>
              <div className="flex items-center gap-4 text-sm text-stone-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-stone-900" />
                  <span>Dokumen Resmi</span>
                </div>
                <span>•</span>
                <span>Terakhir Diperbarui: {lastUpdated}</span>
              </div>
            </header>

            <div className="prose prose-stone max-w-none 
              prose-headings:text-stone-900 prose-headings:font-bold prose-headings:tracking-tight
              prose-p:text-stone-600 prose-p:leading-relaxed prose-p:mb-6
              prose-li:text-stone-600 prose-li:leading-relaxed
              prose-strong:text-stone-900 prose-strong:font-bold">

              <p className="text-lg text-stone-500 leading-relaxed mb-12">
                Harap baca Syarat dan Ketentuan ini secara saksama sebelum menggunakan platform Hyperlocal. Penggunaan layanan kami berarti Anda menyetujui seluruh poin hukum yang berlaku.
              </p>

              <Separator className="my-12 opacity-50" />

              <section id="penggunaan" className="scroll-mt-8">
                <h2>1. Penggunaan Layanan</h2>
                <p>
                  Platform Hyperlocal disediakan untuk membantu Anda menemukan destinasi lokal yang ramah muslim. Anda dilarang menggunakan data platform ini untuk tujuan komersial tanpa izin atau melakukan aktivitas yang merugikan stabilitas sistem kami.
                </p>
              </section>

              <section id="akun" className="scroll-mt-8">
                <h2>2. Akun & Keamanan</h2>
                <p>
                  Keamanan akun Anda adalah tanggung jawab bersama. Kami menggunakan autentikasi pihak ketiga untuk memastikan keamanan data login Anda. Namun, Anda tetap berkewajiban untuk tidak membagikan akses akun Anda kepada pihak mana pun.
                </p>
              </section>

              <section id="konten" className="scroll-mt-8">
                <h2>3. Konten Pengguna</h2>
                <p>
                  Setiap ulasan, foto, atau laporan yang Anda kirimkan harus bersifat jujur dan tidak mengandung unsur SARA atau provokasi. Anda memberikan kami izin untuk menampilkan konten tersebut sebagai bagian dari ekosistem informasi platform.
                </p>
              </section>

              <section id="akurasi" className="scroll-mt-8">
                <h2>4. Akurasi & Penafian Halal</h2>
                <div className="p-6 bg-stone-50 border-l-4 border-stone-900 rounded-r-xl my-8">
                  <p className="font-bold text-stone-900 mb-2">Penafian Penting (Disclaimer)</p>
                  <p className="text-sm text-stone-600 mb-0">
                    Meskipun kami melakukan verifikasi, Hyperlocal tidak memberikan jaminan mutlak atas status halal sebuah lokasi. Status halal dapat berubah sewaktu-waktu. Selalu lakukan verifikasi mandiri di tempat tujuan.
                  </p>
                </div>
              </section>

              <section id="kekayaan-intelektual" className="scroll-mt-8">
                <h2>5. Kekayaan Intelektual</h2>
                <p>
                  Seluruh kode sumber, desain antarmuka, dan algoritma rekomendasi di Hyperlocal dilindungi oleh hak cipta. Penggunaan tanpa izin dapat dikenakan sanksi sesuai hukum yang berlaku di Indonesia.
                </p>
              </section>

              <section id="pembatasan" className="scroll-mt-8">
                <h2>6. Pembatasan Tanggung Jawab</h2>
                <p>
                  Kami tidak bertanggung jawab atas ketidaknyamanan, kerugian finansial, atau dampak lain yang timbul dari ketidakakuratan data di platform. Layanan ini disediakan &quot;as is&quot; untuk membantu komunitas.
                </p>
              </section>

              <section id="perubahan" className="scroll-mt-8">
                <h2>7. Perubahan Ketentuan</h2>
                <p>
                  Syarat dan Ketentuan ini dapat kami ubah sewaktu-waktu tanpa pemberitahuan sebelumnya. Versi terbaru akan selalu tersedia di halaman ini.
                </p>
              </section>

              <section id="hukum" className="scroll-mt-8">
                <h2>8. Hukum yang Berlaku</h2>
                <p>
                  Segala perselisihan yang timbul dari penggunaan platform ini akan diselesaikan di bawah yurisdiksi hukum Republik Indonesia.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
