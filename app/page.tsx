import Image from "next/image";
import Link from "next/link";
import {
    Bookmark,
    CheckCircle2,
    ChevronRight,
    Compass,
    Hotel,
    Landmark,
    Map as MapIcon,
    MapPin,
    Search,
    ShieldCheck,
    Sparkles,
    Star,
    Utensils,
} from "lucide-react";
import { HeroSection } from "@/components/public/home/hero-section";
import Navbar from "@/components/ui/navbar";
import { prisma } from "@/lib/prisma";

type DestinationCard = {
    id: string;
    name: string;
    location: string;
    category: string;
    rating: number;
    reviewCount: number;
    score: number | null;
    status: string;
    imageUrl: string | null;
};

type FacilityHighlight = {
    title: string;
    count: string;
    icon: typeof Landmark;
};

const reasons = [
    {
        title: "Data Terverifikasi",
        copy: "Destinasi diperkaya status validasi, skor kesiapan halal, rating, dan fasilitas pendukung dari database.",
        icon: ShieldCheck,
    },
    {
        title: "Informasi Hyperlocal",
        copy: "Kategori, kota, UMKM, dan aktivitas pengguna dirangkum dari data operasional yang terus bertambah.",
        icon: Compass,
    },
    {
        title: "Ramah Muslim",
        copy: "Fasilitas seperti tempat ibadah, kuliner halal, dan penginapan ditampilkan sesuai relasi yang tersedia.",
        icon: Sparkles,
    },
];

const steps = [
    {
        title: "Cari Kebutuhan",
        copy: "Masukkan kota, kategori, atau nama destinasi untuk membuka listing publik yang terhubung ke database.",
        icon: Search,
    },
    {
        title: "Cek Verifikasi",
        copy: "Bandingkan status, skor halal, rating, dan jumlah ulasan sebelum memilih tujuan.",
        icon: ShieldCheck,
    },
    {
        title: "Susun Rute",
        copy: "Gunakan kota populer dan rekomendasi sekitar sebagai titik awal itinerary perjalanan.",
        icon: MapIcon,
    },
];

const faqs = [
    {
        question: "Dari mana isi landing page diambil?",
        answer: "Angka, kategori, destinasi, fasilitas, UMKM, dan ulasan ditarik langsung dari database aplikasi.",
    },
    {
        question: "Apa arti skor pada kartu destinasi?",
        answer: "Skor publik saat ini dihitung dari rating destinasi approved karena database aktif belum memiliki kolom skor halal.",
    },
    {
        question: "Kenapa beberapa gambar tidak muncul?",
        answer: "Kartu akan menampilkan placeholder bila destinasi atau UMKM belum memiliki gambar yang tersimpan.",
    },
];

function formatNumber(value: number) {
    return new Intl.NumberFormat("id-ID").format(value);
}

function percent(value: number, total: number) {
    if (!total) return 0;
    return Math.round((value / total) * 100);
}

function locationLabel(city?: string | null, province?: string | null) {
    return [city, province].filter(Boolean).join(", ") || "Wilayah belum diisi";
}

function safeImage(src?: string | null) {
    if (!src) return null;
    if (src.startsWith("/")) return src;
    if (src.startsWith("https://images.unsplash.com/")) return src;
    if (src.startsWith("https://plus.unsplash.com/")) return src;
    return null;
}

function scoreLabel(score: number | null) {
    if (score == null) return "Belum Dinilai";
    if (score >= 80) return "A-Grade";
    if (score >= 60) return "B-Grade";
    return "C-Grade";
}

function toDestinationCard(destination: {
    id: string;
    name: string;
    city: string | null;
    province: string | null;
    status: string;
    rating: number | null;
    reviewCount: number | null;
    category: { name: string } | null;
    images: Array<{ imageUrl: string }>;
}): DestinationCard {
    return {
        id: destination.id,
        name: destination.name,
        location: locationLabel(destination.city, destination.province),
        category: destination.category?.name || "Destinasi",
        rating: destination.rating || 0,
        reviewCount: destination.reviewCount || 0,
        score:
            destination.status === "APPROVED"
                ? Math.round((destination.rating || 0) * 20)
                : null,
        status: destination.status,
        imageUrl: safeImage(destination.images[0]?.imageUrl),
    };
}

async function getLandingData() {
    const [
        totalDestinations,
        approvedDestinations,
        totalUmkms,
        validCertifications,
        totalFacilities,
        categories,
        popularRaw,
        verifiedRaw,
        recentReviews,
        topUmkms,
    ] = await Promise.all([
        prisma.destination.count(),
        prisma.destination.count({ where: { status: "APPROVED" } }),
        prisma.umkm.count(),
        prisma.halalCertification.count({ where: { status: "VALID" } }),
        prisma.halalFacility.count(),
        prisma.category.findMany({
            take: 8,
            orderBy: [{ destinations: { _count: "desc" } }, { name: "asc" }],
            include: {
                _count: {
                    select: {
                        destinations: true,
                        umkms: true,
                    },
                },
            },
        }),
        prisma.destination.findMany({
            take: 8,
            where: { status: "APPROVED" },
            orderBy: [
                { reviewCount: "desc" },
                { rating: "desc" },
                { updatedAt: "desc" },
            ],
            select: {
                id: true,
                name: true,
                city: true,
                province: true,
                status: true,
                rating: true,
                reviewCount: true,
                category: {
                    select: {
                        name: true,
                    },
                },
                images: {
                    take: 1,
                    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
                    select: {
                        imageUrl: true,
                    },
                },
            },
        }),
        prisma.destination.findMany({
            take: 6,
            where: { status: "APPROVED" },
            orderBy: [
                { rating: "desc" },
                { reviewCount: "desc" },
                { updatedAt: "desc" },
            ],
            select: {
                id: true,
                name: true,
                city: true,
                province: true,
                status: true,
                rating: true,
                reviewCount: true,
                category: {
                    select: {
                        name: true,
                    },
                },
                images: {
                    take: 1,
                    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
                    select: {
                        imageUrl: true,
                    },
                },
            },
        }),
        prisma.review.findMany({
            take: 3,
            where: {
                comment: { not: null },
            },
            orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
            include: {
                user: true,
                destination: {
                    select: {
                        name: true,
                        city: true,
                    },
                },
            },
        }),
        prisma.umkm.findMany({
            take: 6,
            orderBy: [
                { reviewCount: "desc" },
                { rating: "desc" },
                { updatedAt: "desc" },
            ],
            select: {
                id: true,
                name: true,
                rating: true,
                reviewCount: true,
                category: {
                    select: {
                        name: true,
                    },
                },
                destination: {
                    select: {
                        city: true,
                        province: true,
                    },
                },
                certifications: {
                    where: { status: "VALID" },
                    take: 1,
                    select: {
                        id: true,
                        status: true,
                    },
                },
                images: {
                    take: 1,
                    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
                    select: {
                        imageUrl: true,
                    },
                },
            },
        }),
    ]);

    const popular = popularRaw.map(toDestinationCard);
    const verifiedSource = verifiedRaw.length ? verifiedRaw : popularRaw;
    const verified = verifiedSource.map(toDestinationCard).slice(0, 3);

    const categoryLinks = categories.slice(0, 4).map((category) => ({
        label: category.name,
        href: `/destinasi?category=${category.id}`,
    }));

    const facilityHighlights: FacilityHighlight[] = [
        {
            title: "Fasilitas Halal",
            count: `${formatNumber(totalFacilities)} item`,
            icon: Landmark,
        },
        {
            title: "UMKM Terdata",
            count: `${formatNumber(totalUmkms)} usaha`,
            icon: Utensils,
        },
        {
            title: "Sertifikasi Valid",
            count: `${formatNumber(validCertifications)} sertifikat`,
            icon: ShieldCheck,
        },
        {
            title: "Destinasi Approved",
            count: `${formatNumber(approvedDestinations)} lokasi`,
            icon: Hotel,
        },
    ];

    const routeIdeas = Array.from(
        new globalThis.Map(
            popular
                .filter((destination) => destination.location !== "Wilayah belum diisi")
                .map((destination) => [destination.location, destination]),
        ).values(),
    ).slice(0, 3);

    return {
        stats: {
            totalDestinations,
            approvedDestinations,
            totalUmkms,
            validCertifications,
            totalFacilities,
            verifiedPercent: percent(approvedDestinations, totalDestinations),
        },
        categories,
        categoryLinks,
        popular,
        verified,
        recentReviews,
        topUmkms,
        facilityHighlights,
        routeIdeas,
    };
}

export default async function Home() {
    const data = await getLandingData();

    return (
        <main className="min-h-screen bg-[#fdf7ff] text-[#1d1b20]">
            <Navbar />
            <HeroSection
                categoryLinks={
                    data.categoryLinks.length
                        ? data.categoryLinks
                        : [{ label: "Lihat Destinasi", href: "/destinasi" }]
                }
                stats={[
                    {
                        label: "Total Destinasi",
                        value: formatNumber(data.stats.totalDestinations),
                        icon: "map",
                    },
                    {
                        label: "Total UMKM",
                        value: formatNumber(data.stats.totalUmkms),
                        icon: "utensils",
                    },
                    {
                        label: "Terverifikasi",
                        value: `${data.stats.verifiedPercent}%`,
                        icon: "shield",
                    },
                ]}
            />

            <section
                className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8"
                id="why"
            >
                <div className="text-center">
                    <h2 className="font-heading text-3xl font-semibold">
                        Kenapa Memilih Kami
                    </h2>
                    <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#494551]">
                        Landing page ini membaca data operasional Hyperlocal,
                        sehingga jumlah, kategori, dan rekomendasi ikut berubah
                        saat database diperbarui.
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
                id="categories"
            >
                <SectionHeading
                    action="Lihat Destinasi"
                    actionHref="/destinasi"
                    eyebrow={`${formatNumber(data.categories.length)} kategori aktif dari database.`}
                    title="Kategori Destinasi"
                />
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {data.categories.length ? (
                        data.categories.map((category) => (
                            <Link
                                className="rounded-xl border border-[#cbc4d2]/60 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                href={`/destinasi?category=${category.id}`}
                                key={category.id}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex size-11 items-center justify-center rounded-lg bg-[#e9ddff] text-[#4f378a]">
                                        <MapIcon className="size-5" />
                                    </div>
                                    <span className="text-xs font-bold text-[#4f378a]">
                                        {formatNumber(
                                            category._count.destinations,
                                        )}{" "}
                                        lokasi
                                    </span>
                                </div>
                                <h3 className="mt-4 font-heading text-lg font-bold">
                                    {category.name}
                                </h3>
                                <p className="mt-2 text-sm text-[#494551]">
                                    {category.description ||
                                        `${formatNumber(category._count.umkms)} UMKM terkait kategori ini.`}
                                </p>
                            </Link>
                        ))
                    ) : (
                        <EmptyState message="Belum ada kategori di database." />
                    )}
                </div>
            </section>

            <section
                className="mx-auto max-w-7xl scroll-mt-20 px-4 py-10 sm:px-6 lg:px-8"
                id="popular"
            >
                <SectionHeading
                    action="Lihat Semua"
                    actionHref="/destinasi"
                    eyebrow="Diurutkan dari jumlah ulasan, rating, dan pembaruan terbaru."
                    title="Rekomendasi Terpopuler"
                />
                <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {data.popular.length ? (
                        data.popular.slice(0, 4).map((destination) => (
                            <DestinationPreview
                                destination={destination}
                                key={destination.id}
                            />
                        ))
                    ) : (
                        <EmptyState message="Belum ada destinasi approved untuk ditampilkan." />
                    )}
                </div>
            </section>

            <section
                className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8"
                id="verified"
            >
                <SectionHeading
                    action="Buka Listing"
                    actionHref="/destinasi"
                    eyebrow="Pilihan dengan skor kesiapan halal tertinggi."
                    title="Destinasi Terverifikasi"
                />
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    {data.verified.length ? (
                        data.verified.map((destination) => (
                            <VerifiedDestination
                                destination={destination}
                                key={destination.id}
                            />
                        ))
                    ) : (
                        <EmptyState message="Belum ada destinasi dengan skor halal." />
                    )}
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
                            UMKM dan fasilitas dekat destinasi
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-[#494551]">
                            Daftar ini memakai UMKM yang terhubung ke kategori,
                            destinasi, sertifikasi, dan rating di database.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {data.topUmkms.length ? (
                            data.topUmkms.slice(0, 3).map((umkm) => (
                                <article
                                    className="rounded-xl border border-[#e6e0e9] bg-white p-5"
                                    key={umkm.id}
                                >
                                    <div className="flex size-11 items-center justify-center rounded-lg bg-[#e9ddff] text-[#4f378a]">
                                        <Utensils className="size-5" />
                                    </div>
                                    <h3 className="mt-4 line-clamp-2 font-heading text-base font-bold">
                                        {umkm.name}
                                    </h3>
                                    <p className="mt-2 text-sm text-[#494551]">
                                        {umkm.category?.name || "UMKM"} -{" "}
                                        {locationLabel(
                                            umkm.destination?.city,
                                            umkm.destination?.province,
                                        )}
                                    </p>
                                    {umkm.certifications.length > 0 && (
                                        <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                                            Sertifikat valid
                                        </span>
                                    )}
                                </article>
                            ))
                        ) : (
                            <EmptyState message="Belum ada UMKM di database." />
                        )}
                    </div>
                </div>
            </section>

            <section
                className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 lg:px-8"
                id="routes"
            >
                <SectionHeading
                    action="Jelajahi Semua"
                    actionHref="/destinasi"
                    eyebrow="Ide perjalanan dibuat dari wilayah destinasi populer."
                    title="Inspirasi Rute"
                />
                <div className="mt-6 grid gap-6 md:grid-cols-3">
                    {data.routeIdeas.length ? (
                        data.routeIdeas.map((route) => (
                            <Link
                                className="group relative aspect-[16/9] overflow-hidden rounded-xl border border-white/60 bg-white shadow-lg shadow-[#0f172a]/5"
                                href={`/destinasi?search=${encodeURIComponent(route.location)}`}
                                key={route.location}
                            >
                                {route.imageUrl ? (
                                    <Image
                                        alt={route.name}
                                        className="object-cover transition duration-500 group-hover:scale-105"
                                        fill
                                        sizes="(min-width: 768px) 33vw, 100vw"
                                        src={route.imageUrl}
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-[#e9ddff]" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                                    <h3 className="font-heading text-lg font-bold">
                                        Jelajah {route.location}
                                    </h3>
                                    <p className="mt-2 flex items-center gap-1 text-xs">
                                        <Compass className="size-3.5" />
                                        Berawal dari {route.name}
                                    </p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <EmptyState message="Belum ada wilayah populer untuk rute." />
                    )}
                </div>
            </section>

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
                    action="Lihat Destinasi"
                    actionHref="/destinasi"
                    eyebrow="Ringkasan fasilitas, UMKM, sertifikasi, dan status destinasi."
                    title="Highlight Fasilitas"
                />
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {data.facilityHighlights.map((facility) => (
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
                            Ulasan terbaru dengan rating tertinggi dari database.
                        </p>
                    </div>
                    <div className="mt-8 grid gap-6 md:grid-cols-3">
                        {data.recentReviews.length ? (
                            data.recentReviews.map((review) => (
                                <article
                                    className="rounded-xl border border-[#cbc4d2]/60 bg-white p-6 shadow-sm"
                                    key={review.id}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-[#e1d4fd] font-bold text-[#4f378a]">
                                            {review.user.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-heading text-sm font-bold">
                                                {review.user.name}
                                            </p>
                                            <div className="mt-1 flex text-[#c9a74d]">
                                                {Array.from({
                                                    length: review.rating,
                                                }).map((_, index) => (
                                                    <Star
                                                        className="size-3.5 fill-current"
                                                        key={index}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-5 line-clamp-4 text-sm italic leading-7 text-[#494551]">
                                        &quot;{review.comment}&quot;
                                    </p>
                                    {review.destination && (
                                        <p className="mt-4 text-xs font-semibold text-[#4f378a]">
                                            {review.destination.name}
                                        </p>
                                    )}
                                </article>
                            ))
                        ) : (
                            <EmptyState message="Belum ada ulasan traveller." />
                        )}
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

            <section className="px-4 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl overflow-hidden rounded-xl bg-[#4f378a] px-6 py-12 text-center text-white shadow-xl shadow-[#4f378a]/20">
                    <p className="font-heading text-sm font-semibold text-[#cfbcff]">
                        {formatNumber(data.stats.totalDestinations)} destinasi
                        dan {formatNumber(data.stats.totalUmkms)} UMKM siap
                        dijelajahi
                    </p>
                    <h2 className="mx-auto mt-3 max-w-3xl font-heading text-3xl font-bold leading-tight sm:text-4xl">
                        Temukan destinasi halal, fasilitas terdekat, dan rute
                        terbaik dalam satu tempat.
                    </h2>
                    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#4f378a]"
                            href="/destinasi"
                        >
                            Mulai Eksplorasi
                            <ChevronRight className="size-4" />
                        </Link>
                        <a
                            className="inline-flex items-center justify-center rounded-lg border border-white/35 px-5 py-3 text-sm font-bold text-white"
                            href="#home"
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
                            ["Peta", "#home"],
                        ]}
                        title="Dukungan"
                    />
                    <div>
                        <h3 className="font-heading text-sm font-bold uppercase tracking-[0.12em] text-[#4f378a]">
                            Ringkasan Data
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-[#494551]">
                            {formatNumber(data.stats.approvedDestinations)}{" "}
                            destinasi approved,{" "}
                            {formatNumber(data.stats.validCertifications)}{" "}
                            sertifikasi valid, dan{" "}
                            {formatNumber(data.stats.totalFacilities)} fasilitas
                            halal.
                        </p>
                    </div>
                </div>
                <div className="border-t border-[#e6e0e9] px-4 py-5 text-center text-xs text-[#494551] sm:px-6 lg:px-8">
                    © 2026 Hyperlocal. Semua hak dilindungi.
                </div>
            </footer>
        </main>
    );
}

function DestinationPreview({ destination }: { destination: DestinationCard }) {
    return (
        <Link
            className="group overflow-hidden rounded-xl border border-[#cbc4d2]/50 bg-white shadow-lg shadow-[#0f172a]/5 transition hover:-translate-y-1 hover:shadow-xl"
            href={`/destinasi/${destination.id}`}
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-[#f2ecf4]">
                {destination.imageUrl ? (
                    <Image
                        alt={destination.name}
                        className="object-cover transition duration-500 group-hover:scale-105"
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                        src={destination.imageUrl}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-[#4f378a]">
                        <MapPin className="size-10" />
                    </div>
                )}
                {destination.status === "APPROVED" && (
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-bold text-[#4f378a] shadow-sm backdrop-blur-md">
                        <CheckCircle2 className="size-3.5" />
                        Verified
                    </div>
                )}
                <span
                    aria-label={`Simpan ${destination.name}`}
                    className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/75 text-[#4f378a] backdrop-blur-md"
                >
                    <Bookmark className="size-4" />
                </span>
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 font-heading text-base font-bold leading-tight">
                        {destination.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#ffdf93]/55 px-2 py-1 text-xs font-semibold text-[#594400]">
                        <Star className="size-3 fill-current" />
                        {destination.rating.toFixed(1)}
                    </span>
                </div>
                <p className="mt-3 flex items-center gap-1 text-xs text-[#494551]">
                    <MapPin className="size-3.5 shrink-0" />
                    <span className="line-clamp-1">{destination.location}</span>
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-[#e6e0e9] pt-3 text-[11px] font-bold uppercase tracking-wide">
                    <span className="rounded bg-[#e9ddff] px-2 py-1 text-[#4f378a]">
                        {destination.category}
                    </span>
                    <span className="text-[#4f378a]">
                        {scoreLabel(destination.score)}
                    </span>
                </div>
            </div>
        </Link>
    );
}

function VerifiedDestination({ destination }: { destination: DestinationCard }) {
    return (
        <Link
            className="overflow-hidden rounded-xl border border-[#cbc4d2]/60 bg-white shadow-lg shadow-[#0f172a]/5"
            href={`/destinasi/${destination.id}`}
        >
            <div className="relative aspect-[16/9] bg-[#f2ecf4]">
                {destination.imageUrl ? (
                    <Image
                        alt={destination.name}
                        className="object-cover"
                        fill
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        src={destination.imageUrl}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-[#4f378a]">
                        <ShieldCheck className="size-12" />
                    </div>
                )}
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-xs font-bold text-[#4f378a] shadow-sm backdrop-blur-md">
                    <CheckCircle2 className="size-4" />
                    Verified Halal
                </div>
                <div className="absolute bottom-4 right-4 rounded-full bg-[#00856f] px-3 py-2 text-sm font-bold text-white shadow-lg">
                    {destination.score ?? 0}%
                </div>
            </div>
            <div className="p-5">
                <h3 className="line-clamp-2 font-heading text-xl font-bold">
                    {destination.name}
                </h3>
                <p className="mt-2 flex items-center gap-2 text-sm text-[#494551]">
                    <MapPin className="size-4 shrink-0" />
                    {destination.location}
                </p>
            </div>
        </Link>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="col-span-full rounded-xl border border-dashed border-[#cbc4d2] bg-white/60 p-8 text-center text-sm font-medium text-[#494551]">
            {message}
        </div>
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
            <Link
                className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-[#4f378a] sm:inline-flex"
                href={actionHref}
            >
                {action}
                <ChevronRight className="size-4" />
            </Link>
        </div>
    );
}
