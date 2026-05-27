import Image from "next/image";
import {
    Bell,
    Bookmark,
    CheckCircle2,
    ChevronRight,
    Compass,
    Hotel,
    Landmark,
    Map,
    MapPin,
    Menu,
    Search,
    ShieldCheck,
    Sparkles,
    Star,
    Utensils,
} from "lucide-react";
import { HeroMapSection } from "@/components/public/home/hero-map-section";
import { HeroSection } from "@/components/public/home/hero-section";
import Navbar from "@/components/ui/navbar";

const destinations = [
    {
        title: "Danau Toba Eco Lodge",
        location: "Sumatera Utara",
        grade: "A-Grade",
        tag: "Penginapan",
        rating: "4.9",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    },
    {
        title: "Sate Khas Senayan",
        location: "Jakarta Selatan",
        grade: "A-Grade",
        tag: "Kuliner",
        rating: "4.8",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80",
    },
    {
        title: "Masjid Raya Al-Jabbar",
        location: "Bandung",
        grade: "A-Grade",
        tag: "Masjid",
        rating: "5.0",
        image: "https://images.unsplash.com/photo-1564121211835-e88c852648ab?auto=format&fit=crop&w=900&q=80",
    },
    {
        title: "Tegallalang Rice Terrace",
        location: "Bali",
        grade: "B-Grade",
        tag: "Wisata",
        rating: "4.7",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80",
    },
];

const routes = [
    {
        title: "Safari di Bandung",
        meta: "1 Hari - 5 Destinasi",
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=900&q=80",
    },
    {
        title: "Wisata Religi Jakarta",
        meta: "2 Hari - 8 Destinasi",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80",
    },
    {
        title: "Eksplor Bali Halal",
        meta: "3 Hari - 12 Destinasi",
        image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=900&q=80",
    },
];

const reasons = [
    {
        title: "Data Terverifikasi",
        copy: "Setiap destinasi dan fasilitas telah melalui proses verifikasi ketat untuk memastikan standar halal.",
        icon: ShieldCheck,
    },
    {
        title: "Informasi Hyperlocal",
        copy: "Temukan rekomendasi dari warga lokal untuk pengalaman wisata yang otentik dan mendalam.",
        icon: Compass,
    },
    {
        title: "Ramah Muslim",
        copy: "Fasilitas yang disesuaikan untuk kebutuhan wisatawan muslim, mulai dari tempat ibadah hingga makanan.",
        icon: Sparkles,
    },
];

const verifiedDestinations = [
    {
        title: "Lembang Asri Resort",
        location: "Bandung, Jawa Barat",
        score: "98",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80",
    },
    {
        title: "Nyiur Resort Pangandaran",
        location: "Pangandaran, Jawa Barat",
        score: "94",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
    },
    {
        title: "Resto Laut Berkah",
        location: "Lombok, Nusa Tenggara Barat",
        score: "96",
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80",
    },
];

const nearbyPlaces = [
    {
        title: "Masjid Agung Al-Ikhlas",
        distance: "0.4 km",
        type: "Masjid",
        icon: Landmark,
    },
    {
        title: "Dapur Sunda Halal",
        distance: "0.7 km",
        type: "Kuliner",
        icon: Utensils,
    },
    {
        title: "Villa Syariah Lestari",
        distance: "1.2 km",
        type: "Penginapan",
        icon: Hotel,
    },
];

const steps = [
    {
        title: "Cari Kebutuhan",
        copy: "Masukkan kota, kategori, atau nama destinasi untuk menemukan pilihan terdekat.",
        icon: Search,
    },
    {
        title: "Cek Verifikasi",
        copy: "Bandingkan badge halal, fasilitas ibadah, rating, dan jarak dalam satu tampilan.",
        icon: ShieldCheck,
    },
    {
        title: "Susun Rute",
        copy: "Simpan destinasi pilihan dan buka peta untuk merencanakan perjalanan.",
        icon: Map,
    },
];

const facilities = [
    { title: "Mushola & Masjid", count: "426 lokasi", icon: Landmark },
    { title: "Restoran Halal", count: "1,120 UMKM", icon: Utensils },
    { title: "Hotel Syariah", count: "318 penginapan", icon: Hotel },
    { title: "Rute Keluarga", count: "84 itinerary", icon: Sparkles },
];

const faqs = [
    {
        question: "Seberapa sering data diperbarui?",
        answer: "Data prioritas diperbarui berkala dari sumber publik, mitra lokal, dan laporan komunitas.",
    },
    {
        question: "Apa beda Verified Halal dan Muslim Friendly?",
        answer: "Verified Halal memiliki bukti sertifikasi atau validasi kuat, sedangkan Muslim Friendly menunjukkan fasilitas pendukung yang layak untuk wisatawan muslim.",
    },
    {
        question: "Apakah bisa menyimpan rencana perjalanan?",
        answer: "Bisa. Destinasi favorit dapat disimpan sebagai bahan itinerary sebelum membuka peta penuh.",
    },
];

export default function Home() {
    return (
        <main className="min-h-screen bg-[#fdf7ff] text-[#1d1b20]">
            <Navbar />
            <HeroSection />

            <section
                className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8"
                id="why"
            >
                <div className="text-center">
                    <h2 className="font-heading text-3xl font-semibold">
                        Kenapa Memilih Kami
                    </h2>
                    <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#494551]">
                        Kami berkomitmen memberikan pengalaman wisata yang aman,
                        nyaman, dan sesuai dengan prinsip-prinsip halal.
                    </p>
                </div>
                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {reasons.map((reason) => (
                        <article
                            className="rounded-xl border border-[#cbc4d2]/60 bg-white/55 p-7 text-center shadow-sm"
                            key={reason.title}
                        >
                            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#e1d4fd] text-[#4f378a]">
                                <reason.icon className="size-5" />
                            </div>
                            <h3 className="mt-5 font-heading text-lg font-semibold">
                                {reason.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-[#494551]">
                                {reason.copy}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            <section
                className="mx-auto max-w-7xl scroll-mt-20 px-4 py-10 sm:px-6 lg:px-8"
                id="popular"
            >
                <SectionHeading
                    action="Lihat Semua"
                    actionHref="#verified"
                    eyebrow="Destinasi pilihan dengan rating tinggi dan verifikasi lengkap."
                    title="Rekomendasi Terpopuler"
                />
                <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {destinations.map((destination) => (
                        <article
                            className="group overflow-hidden rounded-xl border border-[#cbc4d2]/50 bg-white shadow-lg shadow-[#0f172a]/5 transition hover:-translate-y-1 hover:shadow-xl"
                            key={destination.title}
                        >
                            <div className="relative aspect-[16/10] overflow-hidden">
                                <Image
                                    alt={destination.title}
                                    className="object-cover transition duration-500 group-hover:scale-105"
                                    fill
                                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                                    src={destination.image}
                                />
                                <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-bold text-[#4f378a] shadow-sm backdrop-blur-md">
                                    <CheckCircle2 className="size-3.5" />
                                    Verified
                                </div>
                                <a
                                    aria-label={`Simpan ${destination.title}`}
                                    className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/75 text-[#4f378a] backdrop-blur-md"
                                    href="#newsletter"
                                >
                                    <Bookmark className="size-4" />
                                </a>
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="font-heading text-base font-bold leading-tight">
                                        {destination.title}
                                    </h3>
                                    <span className="inline-flex items-center gap-1 rounded-md bg-[#ffdf93]/55 px-2 py-1 text-xs font-semibold text-[#594400]">
                                        <Star className="size-3 fill-current" />
                                        {destination.rating}
                                    </span>
                                </div>
                                <p className="mt-3 flex items-center gap-1 text-xs text-[#494551]">
                                    <MapPin className="size-3.5" />
                                    {destination.location}
                                </p>
                                <div className="mt-4 flex items-center justify-between border-t border-[#e6e0e9] pt-3 text-[11px] font-bold uppercase tracking-wide">
                                    <span className="rounded bg-[#e9ddff] px-2 py-1 text-[#4f378a]">
                                        {destination.tag}
                                    </span>
                                    <span className="text-[#4f378a]">
                                        {destination.grade}
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section
                className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8"
                id="verified"
            >
                <SectionHeading
                    action="Lihat Verifikasi"
                    actionHref="#nearby"
                    eyebrow="Pilihan destinasi dengan skor kesiapan halal tertinggi."
                    title="Destinasi Terverifikasi"
                />
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    {verifiedDestinations.map((destination) => (
                        <article
                            className="overflow-hidden rounded-xl border border-[#cbc4d2]/60 bg-white shadow-lg shadow-[#0f172a]/5"
                            key={destination.title}
                        >
                            <div className="relative aspect-[16/9]">
                                <Image
                                    alt={destination.title}
                                    className="object-cover"
                                    fill
                                    sizes="(min-width: 1024px) 33vw, 100vw"
                                    src={destination.image}
                                />
                                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-xs font-bold text-[#4f378a] shadow-sm backdrop-blur-md">
                                    <CheckCircle2 className="size-4" />
                                    Verified Halal
                                </div>
                                <div className="absolute bottom-4 right-4 rounded-full bg-[#00856f] px-3 py-2 text-sm font-bold text-white shadow-lg">
                                    {destination.score}%
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-heading text-xl font-bold">
                                    {destination.title}
                                </h3>
                                <p className="mt-2 flex items-center gap-2 text-sm text-[#494551]">
                                    <MapPin className="size-4" />
                                    {destination.location}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section
                className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8"
                id="nearby"
            >
                <div className="grid gap-6 rounded-xl border border-[#cbc4d2]/60 bg-white/65 p-6 shadow-sm lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#4f378a]">
                            Rekomendasi Sekitar
                        </p>
                        <h2 className="mt-3 font-heading text-3xl font-semibold">
                            Fasilitas halal dekat tujuanmu
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-[#494551]">
                            Kombinasikan destinasi utama dengan masjid, kuliner
                            halal, dan penginapan ramah muslim yang berada dalam
                            radius dekat.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {nearbyPlaces.map((place) => (
                            <article
                                className="rounded-xl border border-[#e6e0e9] bg-white p-5"
                                key={place.title}
                            >
                                <div className="flex size-11 items-center justify-center rounded-lg bg-[#e9ddff] text-[#4f378a]">
                                    <place.icon className="size-5" />
                                </div>
                                <h3 className="mt-4 font-heading text-base font-bold">
                                    {place.title}
                                </h3>
                                <p className="mt-2 text-sm text-[#494551]">
                                    {place.distance} - {place.type}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section
                className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8"
                id="routes"
            >
                <SectionHeading
                    action="Jelajahi Semua Rute"
                    actionHref="#map"
                    eyebrow="Ide perjalanan terkurasi untuk pengalaman maksimal."
                    title="Inspirasi Rute"
                />
                <div className="mt-6 grid gap-6 md:grid-cols-3">
                    {routes.map((route) => (
                        <article
                            className="group relative aspect-[16/9] overflow-hidden rounded-xl border border-white/60 bg-white shadow-lg shadow-[#0f172a]/5"
                            key={route.title}
                        >
                            <Image
                                alt={route.title}
                                className="object-cover transition duration-500 group-hover:scale-105"
                                fill
                                sizes="(min-width: 768px) 33vw, 100vw"
                                src={route.image}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                                <h3 className="font-heading text-lg font-bold">
                                    {route.title}
                                </h3>
                                <p className="mt-2 flex items-center gap-1 text-xs">
                                    <Compass className="size-3.5" />
                                    {route.meta}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
            {/* 
            <section
                className="relative h-[100vh] scroll-mt-20 overflow-hidden"
                id="map"
            >
                <HeroMapSection />
            </section> */}

            <section
                className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8"
                id="how-it-works"
            >
                <div className="text-center">
                    <h2 className="font-heading text-3xl font-semibold">
                        Cara Kerja Hyperlocal
                    </h2>
                    <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#494551]">
                        Mulai dari pencarian sampai rencana perjalanan, semua
                        dibuat ringkas agar keputusan wisata lebih percaya diri.
                    </p>
                </div>
                <div className="mt-8 grid gap-6 md:grid-cols-3">
                    {steps.map((step, index) => (
                        <article
                            className="relative rounded-xl border border-[#cbc4d2]/60 bg-white p-7 shadow-sm"
                            key={step.title}
                        >
                            <div className="absolute right-5 top-5 font-heading text-4xl font-bold text-[#e6e0e9]">
                                0{index + 1}
                            </div>
                            <div className="flex size-12 items-center justify-center rounded-full bg-[#4f378a] text-white">
                                <step.icon className="size-5" />
                            </div>
                            <h3 className="mt-5 font-heading text-lg font-semibold">
                                {step.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-[#494551]">
                                {step.copy}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            <section
                className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8"
                id="facilities"
            >
                <SectionHeading
                    action="Lihat Semua"
                    actionHref="#reviews"
                    eyebrow="Fasilitas utama yang paling sering dicari traveller muslim."
                    title="Highlight Fasilitas"
                />
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {facilities.map((facility) => (
                        <article
                            className="rounded-xl border border-[#cbc4d2]/60 bg-white p-6 shadow-sm"
                            key={facility.title}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-[#e1d4fd] text-[#4f378a]">
                                    <facility.icon className="size-5" />
                                </div>
                                <CheckCircle2 className="size-5 text-[#00856f]" />
                            </div>
                            <h3 className="mt-5 font-heading text-lg font-bold">
                                {facility.title}
                            </h3>
                            <p className="mt-1 text-sm text-[#494551]">
                                {facility.count}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="scroll-mt-20 bg-white/45 py-16" id="reviews">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="font-heading text-3xl font-semibold">
                            Testimoni Traveller
                        </h2>
                        <p className="mt-2 text-sm text-[#494551]">
                            Pengalaman nyata dari mereka yang telah menjelajahi
                            destinasi pilihan kami.
                        </p>
                    </div>
                    <div className="mt-8 grid gap-6 md:grid-cols-3">
                        {["Aisyah R.", "Budi S.", "Dina M."].map((name) => (
                            <article
                                className="rounded-xl border border-[#cbc4d2]/60 bg-white p-6 shadow-sm"
                                key={name}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-[#e1d4fd] font-bold text-[#4f378a]">
                                        {name[0]}
                                    </div>
                                    <div>
                                        <p className="font-heading text-sm font-bold">
                                            {name}
                                        </p>
                                        <div className="mt-1 flex text-[#c9a74d]">
                                            {Array.from({ length: 5 }).map(
                                                (_, index) => (
                                                    <Star
                                                        className="size-3.5 fill-current"
                                                        key={index}
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-5 text-sm italic leading-7 text-[#494551]">
                                    &quot;Sangat membantu menemukan restoran
                                    halal saat liburan. Informasinya akurat dan
                                    rekomendasinya cocok untuk keluarga.&quot;
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section
                className="mx-auto max-w-4xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8"
                id="faq"
            >
                <div className="text-center">
                    <h2 className="font-heading text-3xl font-semibold">
                        FAQ Perjalanan Halal
                    </h2>
                    <p className="mt-2 text-sm text-[#494551]">
                        Jawaban singkat untuk hal yang paling sering ditanyakan.
                    </p>
                </div>
                <div className="mt-8 space-y-3">
                    {faqs.map((faq) => (
                        <details
                            className="group rounded-xl border border-[#cbc4d2]/60 bg-white p-5 shadow-sm"
                            key={faq.question}
                        >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-base font-semibold">
                                {faq.question}
                                <ChevronRight className="size-5 shrink-0 text-[#4f378a] transition group-open:rotate-90" />
                            </summary>
                            <p className="mt-3 text-sm leading-6 text-[#494551]">
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </section>

            <section
                className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8"
                id="newsletter"
            >
                <div className="rounded-xl border border-[#cbc4d2]/60 bg-white p-6 shadow-lg shadow-[#0f172a]/5 md:flex md:items-center md:justify-between md:gap-8 md:p-8">
                    <div>
                        <h2 className="font-heading text-2xl font-semibold">
                            Dapatkan rekomendasi halal terbaru
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[#494551]">
                            Newsletter mingguan berisi destinasi baru, promo
                            lokal, dan panduan fasilitas muslim-friendly.
                        </p>
                    </div>
                    <form
                        action="#newsletter"
                        className="mt-5 flex gap-2 md:mt-0 md:min-w-[420px]"
                    >
                        <input
                            aria-label="Email newsletter"
                            className="h-12 min-w-0 flex-1 rounded-lg border border-[#cbc4d2] bg-[#fdf7ff] px-4 text-sm outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#e1d4fd]"
                            placeholder="Email Anda"
                            type="email"
                        />
                        <button
                            className="h-12 rounded-lg bg-[#4f378a] px-5 text-sm font-bold text-white"
                            type="submit"
                        >
                            Daftar
                        </button>
                    </form>
                </div>
            </section>

            <section className="px-4 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl overflow-hidden rounded-xl bg-[#4f378a] px-6 py-12 text-center text-white shadow-xl shadow-[#4f378a]/20">
                    <p className="font-heading text-sm font-semibold text-[#cfbcff]">
                        Siap mulai perjalanan yang lebih tenang?
                    </p>
                    <h2 className="mx-auto mt-3 max-w-3xl font-heading text-3xl font-bold leading-tight sm:text-4xl">
                        Temukan destinasi halal, fasilitas terdekat, dan rute
                        terbaik dalam satu tempat.
                    </h2>
                    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                        <a
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#4f378a]"
                            href="#popular"
                        >
                            Mulai Eksplorasi
                            <ChevronRight className="size-4" />
                        </a>
                        <a
                            className="inline-flex items-center justify-center rounded-lg border border-white/35 px-5 py-3 text-sm font-bold text-white"
                            href="#map"
                        >
                            Lihat Peta
                        </a>
                    </div>
                </div>
            </section>

            <footer className="border-t border-[#cbc4d2]/60 bg-white/70">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.3fr_0.7fr_0.7fr_1fr] lg:px-8">
                    <div>
                        <a
                            className="font-heading text-2xl font-bold text-[#4f378a]"
                            href="#home"
                        >
                            Hyperlocal
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
                    © 2026 Hyperlocal. Semua hak dilindungi.
                </div>
            </footer>
        </main>
    );
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

function SectionHeading({
    action,
    actionHref = "#popular",
    eyebrow,
    title,
}: {
    action: string;
    actionHref?: string;
    eyebrow: string;
    title: string;
}) {
    return (
        <div className="flex items-end justify-between gap-4">
            <div>
                <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
                    {title}
                </h2>
                <p className="mt-2 text-sm text-[#494551]">{eyebrow}</p>
            </div>
            <a
                className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-[#4f378a] sm:inline-flex"
                href={actionHref}
            >
                {action}
                <ChevronRight className="size-4" />
            </a>
        </div>
    );
}
