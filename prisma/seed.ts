import {
    PrismaClient,
    CertificationStatus,
    ValidationStatus,
    CategoryType,
} from "../lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";
import { auth } from "@/lib/auth";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Cleaning up database...");
    await prisma.user.deleteMany();
    await prisma.account.deleteMany();
    await prisma.destinationFacilityEvidence.deleteMany();
    await prisma.destinationInteraction.deleteMany();
    await prisma.destinationTrend.deleteMany();
    await prisma.userInteraction.deleteMany();
    await prisma.reviewSentiment.deleteMany();
    await prisma.review.deleteMany();
    await prisma.itineraryItem.deleteMany();
    await prisma.itinerary.deleteMany();
    await prisma.validationEvidence.deleteMany();
    await prisma.halalValidation.deleteMany();
    await prisma.halalCertification.deleteMany();
    await prisma.umkmHalalFacility.deleteMany();
    await prisma.umkmImage.deleteMany();
    await prisma.umkm.deleteMany();
    await prisma.accommodationHalalFacility.deleteMany();
    await prisma.accommodationImage.deleteMany();
    await prisma.accommodation.deleteMany();
    await prisma.externalPlaceSource.deleteMany();
    await prisma.destinationHalalFacility.deleteMany();
    await prisma.destinationImage.deleteMany();
    await prisma.destination.deleteMany();
    await prisma.halalReadinessScore.deleteMany();
    await prisma.halalFacility.deleteMany();
    await prisma.category.deleteMany();

    console.log("Seeding Tasikmalaya halal tourism data...\n");

    const usersData = [
        {
            email: "admin@gmail.com",
            password: "password",
            name: "Administrator",
            role: "admin",
        },
        {
            email: "user@gmail.com",
            password: "password",
            name: "Regular User",
            role: "user",
        }
    ];

    for (const data of usersData) {
        await auth.api.signUpEmail({ body: data });
    }

    console.log(`  ✓ ${usersData.length} users created`);

    // ── 1. Categories ──────────────────────────────────────────────────
    const categoryData = [
        { name: "Wisata Alam", slug: "wisata-alam", description: "Destinasi wisata alam pegunungan, air terjun, dan pemandian alami.", type: CategoryType.DESTINATION },
        { name: "Wisata Religi", slug: "wisata-religi", description: "Destinasi religi, sejarah, dan budaya Islam.", type: CategoryType.DESTINATION },
        { name: "Taman & Rekreasi", slug: "taman-rekreasi", description: "Taman kota, alun-alun, dan area rekreasi keluarga.", type: CategoryType.DESTINATION },
        { name: "Pantai", slug: "pantai", description: "Wisata pantai dan pesisir yang indah.", type: CategoryType.DESTINATION },
        { name: "Kuliner Halal", slug: "kuliner-halal", description: "Makanan dan minuman halal khas daerah.", type: CategoryType.UMKM },
        { name: "Oleh-Oleh & Souvenir", slug: "oleh-oleh-souvenir", description: "Pusat oleh-oleh, batik, dan kerajinan tangan.", type: CategoryType.UMKM },
        { name: "Fashion Muslim", slug: "fashion-muslim", description: "Busana dan aksesoris muslim.", type: CategoryType.UMKM },
        { name: "Hotel Syariah", slug: "hotel-syariah", description: "Hotel dengan konsep dan fasilitas ramah muslim.", type: CategoryType.ACCOMMODATION },
        { name: "Villa & Homestay", slug: "villa-homestay", description: "Villa dan homestay keluarga dengan nuansa islami.", type: CategoryType.ACCOMMODATION },
        { name: "Penginapan Murah", slug: "penginapan-murah", description: "Penginapan budget ramah muslim.", type: CategoryType.ACCOMMODATION },
    ];

    const categories: Record<string, { id: string }> = {};
    for (const data of categoryData) {
        const cat = await prisma.category.create({ data });
        categories[cat.slug] = cat;
    }
    console.log(`  ✓ ${categoryData.length} categories created`);

    // ── 2. HalalFacility ──────────────────────────────────────────────
    const facilityData = [
        { name: "Musala Terpisah (Pria/Wanita)", facilityType: "ibadah", weight: 25, maxDistance: 1.0 },
        { name: "Sajadah & Mukena Bersih", facilityType: "ibadah", weight: 15, maxDistance: 0.5 },
        { name: "Sertifikasi Halal MUI", facilityType: "sertifikasi", weight: 30, maxDistance: 0.0 },
        { name: "Toilet Bersih & Tempat Wudhu", facilityType: "sanitasi", weight: 20, maxDistance: 0.3 },
        { name: "Restoran / Kuliner Halal", facilityType: "kuliner", weight: 25, maxDistance: 2.0 },
        { name: "Mushola 24 Jam", facilityType: "ibadah", weight: 25, maxDistance: 1.0 },
        { name: "Kolam Renang Syar'i", facilityType: "rekreasi", weight: 10, maxDistance: 0.0 },
        { name: "WiFi Gratis", facilityType: "fasilitas", weight: 5, maxDistance: 0.0 },
        { name: "Parkir Luas & Aman", facilityType: "fasilitas", weight: 10, maxDistance: 0.0 },
        { name: "Area Bermain Anak", facilityType: "fasilitas", weight: 10, maxDistance: 0.0 },
        { name: "Air Minum Galon Gratis", facilityType: "fasilitas", weight: 5, maxDistance: 0.0 },
    ];

    const facilities: Record<string, { id: string }> = {};
    for (const data of facilityData) {
        const f = await prisma.halalFacility.create({ data });
        facilities[f.name] = f;
    }
    console.log(`  ✓ ${facilityData.length} halal facilities created`);

    // ── 3. Destinations (Tasikmalaya) ─────────────────────────────────
    const destinationData = [
        {
            name: "Pantai Karang Tawulan",
            slug: "pantai-karang-tawulan",
            categorySlug: "pantai",
            city: "Tasikmalaya",
            province: "Jawa Barat",
            lat: -7.6614,
            lng: 108.3739,
            address: "Desa Cimanuk, Kecamatan Cikalong, Tasikmalaya",
            rating: 4.5,
            reviewCount: 128,
            halalScore: 78,
            status: ValidationStatus.APPROVED,
            description: {
                type: "doc",
                content: [
                    { type: "paragraph", content: [{ type: "text", text: "Pantai Karang Tawulan adalah destinasi wisata bahari yang memukau di pesisir selatan Tasikmalaya. Dikenal dengan formasi karang unik dan pasir putih yang bersih, pantai ini menjadi favorit keluarga untuk menghabiskan akhir pekan." }] },
                    { type: "paragraph", content: [{ type: "text", text: "Fasilitas ramah muslim tersedia lengkap, termasuk musala yang bersih, area wudhu terpisah, dan berbagai pilihan kuliner halal di sekitar pantai. Pengunjung juga dapat menikmati pemandangan matahari terbenam yang spektakuler." }] },
                ],
            },
            openingHours: { senin: "07:00-17:00", selasa: "07:00-17:00", rabu: "07:00-17:00", kamis: "07:00-17:00", jumat: "07:00-17:00", sabtu: "06:00-17:30", minggu: "06:00-17:30" },
            facilities: [
                { facilityName: "Musala Terpisah (Pria/Wanita)", facilityLat: -7.6612, facilityLng: 108.3737, placeName: "Musala Al-Barakah" },
                { facilityName: "Toilet Bersih & Tempat Wudhu", placeName: "Toilet Umum Pantai" },
                { facilityName: "Parkir Luas & Aman", placeName: "Area Parkir Timur" },
                { facilityName: "Restoran / Kuliner Halal", placeName: "Warung Makan Bahari" },
            ],
            images: [
                { imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", caption: "Pemandangan Pantai Karang Tawulan", isPrimary: true },
                { imageUrl: "https://images.unsplash.com/photo-1519046904884-53103b34b689?w=800", caption: "Pasir putih dan ombak", isPrimary: false },
            ],
        },
        {
            name: "Kampung Naga",
            slug: "kampung-naga",
            categorySlug: "wisata-religi",
            city: "Tasikmalaya",
            province: "Jawa Barat",
            lat: -7.4117,
            lng: 108.1281,
            address: "Desa Neglasari, Kecamatan Salawu, Tasikmalaya",
            rating: 4.7,
            reviewCount: 215,
            halalScore: 72,
            status: ValidationStatus.APPROVED,
            description: {
                type: "doc",
                content: [
                    { type: "paragraph", content: [{ type: "text", text: "Kampung Naga merupakan desa adat yang masih mempertahankan tradisi dan kearifan lokal masyarakat Sunda. Terletak di lembah yang asri, desa ini menawarkan pengalaman wisata budaya yang autentik dan sarat nilai-nilai religi." }] },
                    { type: "paragraph", content: [{ type: "text", text: "Pengunjung dapat belajar tentang arsitektur tradisional, kesenian Islam, dan kuliner khas yang semuanya terjamin halal. Pemandu wisata lokal siap menemani dan menjelaskan sejarah serta filosofi setiap sudut desa." }] },
                ],
            },
            openingHours: { senin: "08:00-16:00", selasa: "08:00-16:00", rabu: "08:00-16:00", kamis: "08:00-16:00", jumat: "08:00-16:00", sabtu: "07:00-17:00", minggu: "07:00-17:00" },
            facilities: [
                { facilityName: "Mushola 24 Jam", placeName: "Mushola Al-Hidayah" },
                { facilityName: "Sajadah & Mukena Bersih", placeName: "Ruang Ibadah Pengunjung" },
                { facilityName: "Toilet Bersih & Tempat Wudhu", placeName: "Toilet Umum Kampung Naga" },
            ],
            images: [
                { imageUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800", caption: "Suasana Kampung Naga", isPrimary: true },
                { imageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800", caption: "Arsitektur tradisional Sunda", isPrimary: false },
            ],
        },
        {
            name: "Cipatujah Beach",
            slug: "cipatujah-beach",
            categorySlug: "pantai",
            city: "Tasikmalaya",
            province: "Jawa Barat",
            lat: -7.7326,
            lng: 108.2081,
            address: "Desa Cipatujah, Kecamatan Cipatujah, Tasikmalaya",
            rating: 4.3,
            reviewCount: 95,
            halalScore: 80,
            status: ValidationStatus.APPROVED,
            description: {
                type: "doc",
                content: [
                    { type: "paragraph", content: [{ type: "text", text: "Cipatujah Beach menawarkan panorama pantai selatan yang eksotis dengan hamparan pasir hitam yang unik. Ombaknya yang tenang cocok untuk bermain air bersama keluarga." }] },
                    { type: "paragraph", content: [{ type: "text", text: "Tersedia berbagai fasilitas pendukung seperti penginapan syariah, rumah makan halal, dan pusat oleh-oleh khas Tasikmalaya. Spot foto yang instagramable tersebar di sepanjang bibir pantai." }] },
                ],
            },
            openingHours: { senin: "07:00-17:00", selasa: "07:00-17:00", rabu: "07:00-17:00", kamis: "07:00-17:00", jumat: "07:00-17:00", sabtu: "06:00-17:30", minggu: "06:00-17:30" },
            facilities: [
                { facilityName: "Musala Terpisah (Pria/Wanita)", facilityLat: -7.7324, facilityLng: 108.2079, placeName: "Musala Al-Ikhlas" },
                { facilityName: "Restoran / Kuliner Halal", placeName: "RM Samudra Halal" },
                { facilityName: "Parkir Luas & Aman", placeName: "Parkir Cipatujah" },
            ],
            images: [
                { imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800", caption: "Hamparan pasir hitam Cipatujah", isPrimary: true },
            ],
        },
        {
            name: "Situ Gede",
            slug: "situ-gede",
            categorySlug: "taman-rekreasi",
            city: "Tasikmalaya",
            province: "Jawa Barat",
            lat: -7.3672,
            lng: 108.2256,
            address: "Kelurahan Mangkubumi, Kecamatan Mangkubumi, Tasikmalaya",
            rating: 4.1,
            reviewCount: 72,
            halalScore: 75,
            status: ValidationStatus.PENDING,
            description: {
                type: "doc",
                content: [
                    { type: "paragraph", content: [{ type: "text", text: "Situ Gede adalah danau alami yang menjadi ikon wisata air tawar di Tasikmalaya. Dikelilingi pepohonan rindang, tempat ini cocok untuk piknik keluarga, memancing, atau sekadar menikmati udara segar." }] },
                    { type: "paragraph", content: [{ type: "text", text: "Terdapat area jogging track, perahu bebek, dan warung-warung yang menyajikan makananan halal. Suasana teduh dan tenang membuat Situ Gede menjadi pilihan tepat untuk relaksasi." }] },
                ],
            },
            openingHours: { senin: "06:00-18:00", selasa: "06:00-18:00", rabu: "06:00-18:00", kamis: "06:00-18:00", jumat: "06:00-18:00", sabtu: "05:30-18:30", minggu: "05:30-18:30" },
            facilities: [
                { facilityName: "Mushola 24 Jam", placeName: "Mushola Situ Gede" },
                { facilityName: "Toilet Bersih & Tempat Wudhu", placeName: "Toilet Umum" },
                { facilityName: "Area Bermain Anak", placeName: "Playground Keluarga" },
                { facilityName: "Restoran / Kuliner Halal", placeName: "Kantin Halal Situ Gede" },
            ],
            images: [
                { imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800", caption: "Pemandangan Situ Gede", isPrimary: true },
                { imageUrl: "https://images.unsplash.com/photo-1470071459604-10b0d12b5ebf?w=800", caption: "Area piknik keluarga", isPrimary: false },
            ],
        },
        {
            name: "Gunung Galunggung",
            slug: "gunung-galunggung",
            categorySlug: "wisata-alam",
            city: "Tasikmalaya",
            province: "Jawa Barat",
            lat: -7.2508,
            lng: 108.0794,
            address: "Kecamatan Sukaratu, Tasikmalaya",
            rating: 4.6,
            reviewCount: 187,
            halalScore: 68,
            status: ValidationStatus.APPROVED,
            description: {
                type: "doc",
                content: [
                    { type: "paragraph", content: [{ type: "text", text: "Gunung Galunggung adalah gunung berapi aktif yang menawarkan panorama kawah dan hutan tropis yang memukau. Trek menuju puncak memberikan pengalaman petualangan yang tak terlupakan bagi para pecinta alam." }] },
                    { type: "paragraph", content: [{ type: "text", text: "Di kawasan ini terdapat pemandian air panas alami, camping ground, dan fasilitas ibadah yang memadai. Udara sejuk pegunungan dan pemandangan sunrise dari puncak menjadi daya tarik utama." }] },
                ],
            },
            openingHours: { senin: "06:00-17:00", selasa: "06:00-17:00", rabu: "06:00-17:00", kamis: "06:00-17:00", jumat: "06:00-17:00", sabtu: "05:00-17:30", minggu: "05:00-17:30" },
            facilities: [
                { facilityName: "Mushola 24 Jam", facilityLat: -7.2505, facilityLng: 108.0792, placeName: "Mushola Gunung Galunggung" },
                { facilityName: "Sajadah & Mukena Bersih", placeName: "Pos Peminjaman Peralatan Ibadah" },
                { facilityName: "Parkir Luas & Aman", placeName: "Parkir Basecamp Galunggung" },
            ],
            images: [
                { imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800", caption: "Kawah Gunung Galunggung", isPrimary: true },
                { imageUrl: "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=800", caption: "Pemandian air panas", isPrimary: false },
            ],
        },
        {
            name: "Pemandian Cipanas",
            slug: "pemandian-cipanas",
            categorySlug: "wisata-alam",
            city: "Tasikmalaya",
            province: "Jawa Barat",
            lat: -7.1739,
            lng: 108.1217,
            address: "Desa Cipanas, Kecamatan Sukaratu, Tasikmalaya",
            rating: 4.2,
            reviewCount: 63,
            halalScore: 82,
            status: ValidationStatus.PENDING,
            description: {
                type: "doc",
                content: [
                    { type: "paragraph", content: [{ type: "text", text: "Pemandian Cipanas adalah destinasi wisata air panas alami yang terletak di lereng Gunung Galunggung. Air belerang hangatnya dipercaya baik untuk kesehatan kulit dan relaksasi otot." }] },
                    { type: "paragraph", content: [{ type: "text", text: "Fasilitas pemandian terpisah untuk pria dan wanita tersedia demi kenyamanan pengunjung muslim. Terdapat juga kafe yang menyajikan makanan dan minuman halal di area kompleks pemandian." }] },
                ],
            },
            openingHours: { senin: "07:00-17:00", selasa: "07:00-17:00", rabu: "07:00-17:00", kamis: "07:00-17:00", jumat: "07:00-17:00", sabtu: "06:00-17:30", minggu: "06:00-17:30" },
            facilities: [
                { facilityName: "Musala Terpisah (Pria/Wanita)", placeName: "Musala Cipanas" },
                { facilityName: "Toilet Bersih & Tempat Wudhu", placeName: "Toilet & Wudhu Area Kolam" },
                { facilityName: "Restoran / Kuliner Halal", placeName: "Kafe Cipanas Halal" },
            ],
            images: [
                { imageUrl: "https://images.unsplash.com/photo-1572854596645-f5e7faf5d3e4?w=800", caption: "Kolam pemandian air panas", isPrimary: true },
            ],
        },
        {
            name: "Curug Cipondok",
            slug: "curug-cipondok",
            categorySlug: "wisata-alam",
            city: "Tasikmalaya",
            province: "Jawa Barat",
            lat: -7.3267,
            lng: 108.2911,
            address: "Desa Cipondok, Kecamatan Sukaresik, Tasikmalaya",
            rating: 4.4,
            reviewCount: 51,
            halalScore: 70,
            status: ValidationStatus.APPROVED,
            description: {
                type: "doc",
                content: [
                    { type: "paragraph", content: [{ type: "text", text: "Curug Cipondok adalah air terjun tersembunyi di kawasan hutan lindung Tasikmalaya. Dengan ketinggian sekitar 25 meter, air terjun ini menawarkan kesegaran alam yang masih alami dan jauh dari keramaian." }] },
                    { type: "paragraph", content: [{ type: "text", text: "Perjalanan menuju curug ini membutuhkan trekking singkat melewati perkebunan warga dan hutan kecil. Sesampainya di lokasi, pengunjung akan dimanjakan dengan kolam alami berair jernih yang aman untuk berenang." }] },
                ],
            },
            openingHours: { senin: "07:00-16:00", selasa: "07:00-16:00", rabu: "07:00-16:00", kamis: "07:00-16:00", jumat: "07:00-16:00", sabtu: "06:00-16:30", minggu: "06:00-16:30" },
            facilities: [
                { facilityName: "Mushola 24 Jam", placeName: "Mushola Cipondok" },
                { facilityName: "Parkir Luas & Aman", placeName: "Parkir Curug Cipondok" },
            ],
            images: [
                { imageUrl: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800", caption: "Air terjun Curug Cipondok", isPrimary: true },
                { imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", caption: "Kolam alami di bawah curug", isPrimary: false },
            ],
        },
        {
            name: "Alun-Alun Tasikmalaya",
            slug: "alun-alun-tasikmalaya",
            categorySlug: "taman-rekreasi",
            city: "Tasikmalaya",
            province: "Jawa Barat",
            lat: -7.3279,
            lng: 108.2203,
            address: "Kelurahan Tawang, Kecamatan Tawang, Tasikmalaya",
            rating: 4.0,
            reviewCount: 110,
            halalScore: 85,
            status: ValidationStatus.APPROVED,
            description: {
                type: "doc",
                content: [
                    { type: "paragraph", content: [{ type: "text", text: "Alun-Alun Tasikmalaya adalah pusat keramaian kota yang menjadi tempat favorit warga untuk bersantai dan berkumpul. Area hijau yang luas dilengkapi dengan air mancur dan taman bermain anak." }] },
                    { type: "paragraph", content: [{ type: "text", text: "Dikelilingi oleh Masjid Agung Tasikmalaya dan berbagai pusat kuliner halal, alun-alun ini menjadi titik nol yang strategis untuk memulai eksplorasi kota. Setiap akhir pekan, berbagai acara budaya dan keagamaan digelar di sini." }] },
                ],
            },
            openingHours: { senin: "05:00-22:00", selasa: "05:00-22:00", rabu: "05:00-22:00", kamis: "05:00-22:00", jumat: "05:00-22:00", sabtu: "05:00-23:00", minggu: "05:00-23:00" },
            facilities: [
                { facilityName: "Mushola 24 Jam", placeName: "Mushola Alun-Alun" },
                { facilityName: "Sajadah & Mukena Bersih", placeName: "Ruang Ibadah Mushola Alun-Alun" },
                { facilityName: "Toilet Bersih & Tempat Wudhu", placeName: "Toilet Umum Alun-Alun" },
                { facilityName: "WiFi Gratis", placeName: "WiFi Kota Tasikmalaya" },
                { facilityName: "Area Bermain Anak", placeName: "Taman Bermain Alun-Alun" },
            ],
            images: [
                { imageUrl: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800", caption: "Suasana Alun-Alun Tasikmalaya", isPrimary: true },
                { imageUrl: "https://images.unsplash.com/photo-1573137782338-1b1c8d8e0b0f?w=800", caption: "Masjid Agung Tasikmalaya", isPrimary: false },
            ],
        },
    ];

    const destinations: Record<string, { id: string }> = {};
    for (const d of destinationData) {
        const categoryId = categories[d.categorySlug]!.id;
        const dest = await prisma.destination.create({
            data: {
                name: d.name,
                slug: d.slug,
                categoryId,
                city: d.city,
                province: d.province,
                address: d.address,
                latitude: d.lat,
                longitude: d.lng,
                rating: d.rating,
                reviewCount: d.reviewCount,
                halalScore: d.halalScore,
                status: d.status,
                description: d.description,
                openingHours: d.openingHours,
                images: { create: d.images },
                destinationHalalFacilities: {
                    create: d.facilities.map(f => ({
                        facilityId: facilities[f.facilityName]!.id,
                        latitude: "facilityLat" in f ? (f.facilityLat ?? null) : null,
                        longitude: "facilityLng" in f ? (f.facilityLng ?? null) : null,
                        name: f.placeName,
                    })),
                },
            },
        });
        destinations[d.slug] = dest;
    }
    console.log(`  ✓ ${destinationData.length} destinations with images & facilities created`);

    // ── 4. Accommodations ─────────────────────────────────────────────
    const accommodationData = [
        {
            name: "Hotel Santika Tasikmalaya",
            city: "Tasikmalaya",
            province: "Jawa Barat",
            address: "Jl. Raya Singaparna KM 3, Tasikmalaya",
            lat: -7.3450,
            lng: 108.2180,
            phone: "0265-331234",
            website: "https://santika.com/tasikmalaya",
            rating: 4.3,
            reviewCount: 235,
            validationStatus: "APPROVED",
            description: {
                type: "doc",
                content: [
                    { type: "paragraph", content: [{ type: "text", text: "Hotel Santika Tasikmalaya menawarkan pengalaman menginap nyaman dengan standar pelayanan bintang tiga. Terletak strategis di pusat kota, hotel ini mudah diakses dari berbagai destinasi wisata." }] },
                    { type: "paragraph", content: [{ type: "text", text: "Fasilitas ramah muslim meliputi musala yang bersih, restoran dengan sertifikasi halal, dan kolam renang dengan jadwal terpisah. Setiap kamar dilengkapi sajadah, mukena, dan Al-Quran." }] },
                ],
            },
            facilityNames: ["Musala Terpisah (Pria/Wanita)", "Restoran / Kuliner Halal", "Parkir Luas & Aman", "WiFi Gratis", "Kolam Renang Syar'i"],
            images: [
                { imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", caption: "Eksterior Hotel Santika", isPrimary: true },
                { imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800", caption: "Kamar Deluxe Hotel Santika", isPrimary: false },
            ],
        },
        {
            name: "Cordela Suites Tasikmalaya",
            city: "Tasikmalaya",
            province: "Jawa Barat",
            address: "Jl. HZ Mustofa No. 168, Tasikmalaya",
            lat: -7.3290,
            lng: 108.2150,
            phone: "0265-312345",
            website: "https://cordela-hotel.com",
            rating: 4.1,
            reviewCount: 178,
            validationStatus: "APPROVED",
            description: {
                type: "doc",
                content: [
                    { type: "paragraph", content: [{ type: "text", text: "Cordela Suites menyuguhkan akomodasi bergaya modern dengan sentuhan lokal. Berlokasi di pusat bisnis Tasikmalaya, hotel ini menjadi pilihan tepat bagi wisatawan bisnis maupun liburan." }] },
                    { type: "paragraph", content: [{ type: "text", text: "Seluruh makanan dan minuman di restoran hotel telah bersertifikat halal. Tersedia juga ruang ibadah yang nyaman dan area parkir luas untuk kenyamanan tamu." }] },
                ],
            },
            facilityNames: ["Mushola 24 Jam", "Restoran / Kuliner Halal", "WiFi Gratis", "Parkir Luas & Aman"],
            images: [
                { imageUrl: "https://images.unsplash.com/photo-1582719478250-b89a7a1e5c6f?w=800", caption: "Lobby Cordela Suites", isPrimary: true },
                { imageUrl: "https://images.unsplash.com/photo-1590490359683-658d3d6f972e?w=800", caption: "Kamar Cordela Suites", isPrimary: false },
            ],
        },
        {
            name: "Grand Metro Hotel",
            city: "Tasikmalaya",
            province: "Jawa Barat",
            address: "Jl. Veteran No. 55, Tasikmalaya",
            lat: -7.3270,
            lng: 108.2210,
            phone: "0265-334455",
            website: "https://grandmetrohotel.com",
            rating: 3.8,
            reviewCount: 92,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    { type: "paragraph", content: [{ type: "text", text: "Grand Metro Hotel adalah hotel budget-friendly yang cocok untuk backpacker dan wisatawan hemat. Walau dengan harga terjangkau, kenyamanan tamu tetap menjadi prioritas utama." }] },
                    { type: "paragraph", content: [{ type: "text", text: "Hotel ini menyediakan musala sederhana dan bekerja sama dengan rumah makan halal di sekitar hotel untuk layanan antar makanan." }] },
                ],
            },
            facilityNames: ["Mushola 24 Jam", "WiFi Gratis"],
            images: [
                { imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800", caption: "Fasad Grand Metro Hotel", isPrimary: true },
            ],
        },
        {
            name: "Narita Hotel",
            city: "Tasikmalaya",
            province: "Jawa Barat",
            address: "Jl. RE Martadinata No. 78, Tasikmalaya",
            lat: -7.3230,
            lng: 108.2250,
            phone: "0265-345678",
            website: "https://naritahotel.com",
            rating: 4.0,
            reviewCount: 145,
            validationStatus: "APPROVED",
            description: {
                type: "doc",
                content: [
                    { type: "paragraph", content: [{ type: "text", text: "Narita Hotel mengusung konsep modern islami dengan desain interior yang elegan. Terletak di kawasan strategis dekat pusat perbelanjaan dan kuliner." }] },
                    { type: "paragraph", content: [{ type: "text", text: "Fasilitas lengkap termasuk musala dengan kapasitas 40 jamaah, restoran halal, dan sajadah di setiap kamar. Hotel ini juga menyediakan paket wisata halal Tasikmalaya." }] },
                ],
            },
            facilityNames: ["Musala Terpisah (Pria/Wanita)", "Sajadah & Mukena Bersih", "Restoran / Kuliner Halal", "WiFi Gratis", "Parkir Luas & Aman"],
            images: [
                { imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800", caption: "Eksterior Narita Hotel", isPrimary: true },
                { imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800", caption: "Kamar Eksekutif Narita", isPrimary: false },
            ],
        },
        {
            name: "Pondok Wisata Syariah",
            city: "Tasikmalaya",
            province: "Jawa Barat",
            address: "Kampung Naga, Desa Neglasari, Tasikmalaya",
            lat: -7.4125,
            lng: 108.1290,
            phone: "0812-3456-7890",
            rating: 4.5,
            reviewCount: 67,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    { type: "paragraph", content: [{ type: "text", text: "Pondok Wisata Syariah adalah penginapan bernuansa tradisional yang terletak di kawasan Kampung Naga. Pengunjung dapat merasakan pengalaman tinggal di rumah panggung khas Sunda dengan segala kenyamanan modern." }] },
                    { type: "paragraph", content: [{ type: "text", text: "Seluruh area pondok menerapkan prinsip syariah, termasuk pemisahan area tamu pria dan wanita. Makanan yang disajikan adalah masakan rumahan halal khas Tasikmalaya." }] },
                ],
            },
            facilityNames: ["Mushola 24 Jam", "Sajadah & Mukena Bersih", "Restoran / Kuliner Halal"],
            images: [
                { imageUrl: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800", caption: "Pondok Wisata Syariah", isPrimary: true },
                { imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800", caption: "Suasana halaman pondok", isPrimary: false },
            ],
        },
        {
            name: "Penginapan Griya Asri",
            city: "Tasikmalaya",
            province: "Jawa Barat",
            address: "Jl. Cihideung No. 25, Tasikmalaya",
            lat: -7.3350,
            lng: 108.2170,
            phone: "0265-356789",
            rating: 3.5,
            reviewCount: 34,
            validationStatus: "APPROVED",
            description: {
                type: "doc",
                content: [
                    { type: "paragraph", content: [{ type: "text", text: "Griya Asri adalah penginapan budget yang bersih dan nyaman untuk persinggahan singkat. Cocok bagi wisatawan yang ingin menghemat biaya akomodasi tanpa mengorbankan kebersihan dan kenyamanan." }] },
                    { type: "paragraph", content: [{ type: "text", text: "Tersedia musala kecil dan area parkir yang terbatas. Pengelola penginapan juga dapat membantu merekomendasikan kuliner halal di sekitar lokasi." }] },
                ],
            },
            facilityNames: ["Mushola 24 Jam", "WiFi Gratis"],
            images: [
                { imageUrl: "https://images.unsplash.com/photo-1520277739336-d8d0cb8468f1?w=800", caption: "Penginapan Griya Asri", isPrimary: true },
            ],
        },
    ];

    for (const a of accommodationData) {
        await prisma.accommodation.create({
            data: {
                name: a.name,
                slug: a.name.toLowerCase().replace(/ /g, '-').replace(/&/g, 'dan'),
                city: a.city,
                province: a.province,
                address: a.address,
                latitude: a.lat,
                longitude: a.lng,
                phone: a.phone,
                website: a.website,
                rating: a.rating,
                reviewCount: a.reviewCount,
                validationStatus: a.validationStatus,
                description: a.description,
                images: { create: a.images },
                facilities: {
                    create: a.facilityNames.map(fn => ({
                        facilityId: facilities[fn]!.id,
                    })),
                },
            },
        });
    }
    console.log(`  ✓ ${accommodationData.length} accommodations with images & facilities created`);

    // ── 5. UMKMs ──────────────────────────────────────────────────────
    const umkmData = [
        {
            name: "Nasi Toto Khas Tasik",
            slug: "nasi-toto-khas-tasik",
            owner: "H. Asep",
            destinationSlug: "kampung-naga",
            categorySlug: "kuliner-halal",
            address: "Jl. Kampung Naga No. 1, Tasikmalaya",
            phone: "0812-2001-1001",
            rating: 4.6,
            reviewCount: 89,
            validationStatus: "APPROVED",
            description: "Nasi Toto adalah hidangan khas Tasikmalaya yang terdiri dari nasi liwet dengan lauk pauk komplit dan sambal dadak yang menggugah selera.",
            openingHours: { senin: "07:00-21:00", selasa: "07:00-21:00", rabu: "07:00-21:00", kamis: "07:00-21:00", jumat: "07:00-21:00", sabtu: "07:00-22:00", minggu: "07:00-22:00" },
            facilityNames: ["Sertifikasi Halal MUI", "Mushola 24 Jam"],
            hasCert: true, certStatus: CertificationStatus.VALID, certIssuer: "MUI Tasikmalaya", certNo: "MUI-HALAL-2026-001",
        },
        {
            name: "Sate Maranggi H. Jalal",
            slug: "sate-maranggi-h-jalal",
            owner: "H. Jalal",
            destinationSlug: "alun-alun-tasikmalaya",
            categorySlug: "kuliner-halal",
            address: "Jl. Alun-Alun No. 5, Tasikmalaya",
            phone: "0812-2001-1002",
            rating: 4.8,
            reviewCount: 156,
            validationStatus: "APPROVED",
            description: "Sate Maranggi legendaris yang sudah beroperasi sejak 1985. Daging sapi pilihan dibumbui kecap manis dan rempah khas, dipanggang dengan arang hingga sempurna.",
            openingHours: { senin: "09:00-22:00", selasa: "09:00-22:00", rabu: "09:00-22:00", kamis: "09:00-22:00", jumat: "09:00-22:00", sabtu: "09:00-23:00", minggu: "09:00-23:00" },
            facilityNames: ["Sertifikasi Halal MUI", "Toilet Bersih & Tempat Wudhu"],
            hasCert: true, certStatus: CertificationStatus.VALID, certIssuer: "MUI Tasikmalaya", certNo: "MUI-HALAL-2026-002",
        },
        {
            name: "Batagor & Cilok Riri",
            slug: "batagor-cilok-riri",
            owner: "Riri",
            categorySlug: "kuliner-halal",
            address: "Jl. HZ Mustofa No. 45, Tasikmalaya",
            phone: "0812-2001-1003",
            rating: 4.0,
            reviewCount: 45,
            validationStatus: "PENDING",
            description: "Batagor dan cilok homemade dengan bumbu kacang spesial. Cocok untuk cemilan sore bersama keluarga.",
            openingHours: { senin: "08:00-18:00", selasa: "08:00-18:00", rabu: "08:00-18:00", kamis: "08:00-18:00", jumat: "08:00-18:00", sabtu: "08:00-20:00", minggu: "08:00-20:00" },
            facilityNames: ["Sertifikasi Halal MUI"],
            hasCert: true, certStatus: CertificationStatus.PENDING, certIssuer: "MUI Tasikmalaya", certNo: "MUI-HALAL-2026-003",
        },
        {
            name: "Pisang Bolen Chaplin",
            slug: "pisang-bolen-chaplin",
            owner: "Chaplin",
            categorySlug: "kuliner-halal",
            address: "Jl. RE Martadinata No. 12, Tasikmalaya",
            phone: "0812-2001-1004",
            rating: 4.3,
            reviewCount: 72,
            validationStatus: "APPROVED",
            description: "Pisang Bolen dan aneka pastry premium buatan tangan. Bahan berkualitas dan tanpa pengawet, cocok untuk oleh-oleh.",
            openingHours: { senin: "07:00-20:00", selasa: "07:00-20:00", rabu: "07:00-20:00", kamis: "07:00-20:00", jumat: "07:00-20:00", sabtu: "07:00-21:00", minggu: "07:00-21:00" },
            facilityNames: ["Sertifikasi Halal MUI"],
            hasCert: true, certStatus: CertificationStatus.VALID, certIssuer: "LP2OM MUI Jabar", certNo: "MUI-HALAL-2026-004",
        },
        {
            name: "Tahu Susu Le Luhur",
            slug: "tahu-susu-le-luhur",
            owner: "Luhur",
            categorySlug: "kuliner-halal",
            address: "Jl. Cihideung No. 30, Tasikmalaya",
            phone: "0812-2001-1005",
            rating: 4.1,
            reviewCount: 58,
            validationStatus: "APPROVED",
            description: "Tahu susu khas Tasikmalaya yang lembut dan gurih. Digoreng crispy di tempat, disajikan dengan cabe rawit dan petis.",
            openingHours: { senin: "06:00-17:00", selasa: "06:00-17:00", rabu: "06:00-17:00", kamis: "06:00-17:00", jumat: "06:00-17:00", sabtu: "06:00-18:00", minggu: "06:00-18:00" },
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Opak Bakar H. Ujang",
            slug: "opak-bakar-h-ujang",
            owner: "H. Ujang",
            destinationSlug: "cipatujah-beach",
            categorySlug: "kuliner-halal",
            address: "Kawasan Cipatujah Beach, Tasikmalaya",
            phone: "0812-2001-1006",
            rating: 3.9,
            reviewCount: 28,
            validationStatus: "PENDING",
            description: "Opak bakar dan aneka seafood segar yang langsung ditangkap nelayan setempat. Dimasak dengan bumbu khas pesisir selatan.",
            openingHours: { senin: "09:00-18:00", selasa: "09:00-18:00", rabu: "09:00-18:00", kamis: "09:00-18:00", jumat: "09:00-18:00", sabtu: "08:00-19:00", minggu: "08:00-19:00" },
            facilityNames: ["Restoran / Kuliner Halal"],
            hasCert: true, certStatus: CertificationStatus.PENDING, certIssuer: "MUI Tasikmalaya", certNo: "MUI-HALAL-2026-005",
        },
        {
            name: "Kopi Gunung Galunggung",
            slug: "kopi-gunung-galunggung",
            owner: "Mang Udin",
            destinationSlug: "gunung-galunggung",
            categorySlug: "kuliner-halal",
            address: "Basecamp Gunung Galunggung, Tasikmalaya",
            phone: "0812-2001-1007",
            rating: 4.4,
            reviewCount: 63,
            validationStatus: "PENDING",
            description: "Kedai kopi yang menyajikan kopi arabika khas Galunggung. Nikmati secangkir kopi hangat sambil menikmati panorama pegunungan.",
            openingHours: { senin: "06:00-17:00", selasa: "06:00-17:00", rabu: "06:00-17:00", kamis: "06:00-17:00", jumat: "06:00-17:00", sabtu: "05:00-18:00", minggu: "05:00-18:00" },
            facilityNames: ["Mushola 24 Jam", "Toilet Bersih & Tempat Wudhu"],
            hasCert: true, certStatus: CertificationStatus.PENDING, certIssuer: "MUI Tasikmalaya", certNo: "MUI-HALAL-2026-006",
        },
        {
            name: "Geprek Bensu Halal",
            slug: "geprek-bensu-halal",
            owner: "Bensu",
            categorySlug: "kuliner-halal",
            address: "Jl. Veteran No. 20, Tasikmalaya",
            phone: "0812-2001-1008",
            rating: 4.2,
            reviewCount: 134,
            validationStatus: "APPROVED",
            description: "Ayam geprek kekinian dengan level pedas yang bisa disesuaikan. Menggunakan ayam segar dan sambal homemade pilihan.",
            openingHours: { senin: "10:00-22:00", selasa: "10:00-22:00", rabu: "10:00-22:00", kamis: "10:00-22:00", jumat: "10:00-22:00", sabtu: "10:00-22:30", minggu: "10:00-22:30" },
            facilityNames: ["Sertifikasi Halal MUI"],
            hasCert: false,
        },
        {
            name: "Batik Tasik Malaya",
            slug: "batik-tasik-malaya",
            owner: "Ibu Sari",
            destinationSlug: "alun-alun-tasikmalaya",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Alun-Alun Barat No. 3, Tasikmalaya",
            phone: "0812-2001-1009",
            rating: 4.5,
            reviewCount: 97,
            validationStatus: "APPROVED",
            description: "Pusat batik tulis dan cap khas Tasikmalaya dengan motif tradisional yang indah. Tersedia juga kain sutra dan songket.",
            openingHours: { senin: "08:00-20:00", selasa: "08:00-20:00", rabu: "08:00-20:00", kamis: "08:00-20:00", jumat: "08:00-20:00", sabtu: "08:00-21:00", minggu: "08:00-21:00" },
            facilityNames: ["Sertifikasi Halal MUI"],
            hasCert: true, certStatus: CertificationStatus.VALID, certIssuer: "MUI Tasikmalaya", certNo: "MUI-HALAL-2026-007",
        },
        {
            name: "Pusat Oleh-Oleh Priangan",
            slug: "pusat-oleh-oleh-priangan",
            owner: "Budi",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. HZ Mustofa No. 100, Tasikmalaya",
            phone: "0812-2001-1010",
            rating: 3.8,
            reviewCount: 41,
            validationStatus: "APPROVED",
            description: "Toko oleh-oleh terlengkap di Tasikmalaya. Mulai dari makanan ringan, kerajinan tangan, hingga aksesoris islami.",
            openingHours: { senin: "07:00-21:00", selasa: "07:00-21:00", rabu: "07:00-21:00", kamis: "07:00-21:00", jumat: "07:00-21:00", sabtu: "07:00-22:00", minggu: "07:00-22:00" },
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Keripik Singkong Sari Rasa",
            slug: "keripik-singkong-sari-rasa",
            owner: "Sari",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Cipatujah No. 10, Tasikmalaya",
            phone: "0812-2001-1011",
            rating: 4.0,
            reviewCount: 36,
            validationStatus: "APPROVED",
            description: "Keripik singkong aneka rasa buatan rumahan. Renyah, gurih, dan tahan lama. Oleh-oleh favorit wisatawan.",
            openingHours: { senin: "06:00-18:00", selasa: "06:00-18:00", rabu: "06:00-18:00", kamis: "06:00-18:00", jumat: "06:00-18:00", sabtu: "06:00-19:00", minggu: "06:00-19:00" },
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Muslim Fashion Studio",
            slug: "muslim-fashion-studio",
            owner: "Fathonah",
            categorySlug: "fashion-muslim",
            address: "Jl. RE Martadinata No. 55, Tasikmalaya",
            phone: "0812-2001-1012",
            rating: 4.3,
            reviewCount: 52,
            validationStatus: "PENDING",
            description: "Studio fashion muslim yang menyediakan gamis, hijab, dan busana muslim modern. Tersedia jasa jahit custom sesuai keinginan.",
            openingHours: { senin: "08:00-20:00", selasa: "08:00-20:00", rabu: "08:00-20:00", kamis: "08:00-20:00", jumat: "08:00-20:00", sabtu: "08:00-21:00", minggu: "08:00-21:00" },
            facilityNames: [],
            hasCert: false,
        },
    ];

    for (const u of umkmData) {
        const connectData: Record<string, any> = {};
        if (u.destinationSlug) {
            connectData.destination = { connect: { id: destinations[u.destinationSlug]!.id } };
        }
        if (u.categorySlug) {
            connectData.category = { connect: { id: categories[u.categorySlug]!.id } };
        }

        const certData: Record<string, any> = {};
        if (u.hasCert) {
            certData.certifications = {
                create: {
                    certificateNo: u.certNo,
                    issuer: u.certIssuer,
                    issuedAt: new Date("2025-01-01"),
                    expiredAt: new Date("2027-01-01"),
                    status: u.certStatus,
                },
            };
        }

        const destLat = u.destinationSlug ? destinationData.find(d => d.slug === u.destinationSlug)?.lat : undefined;
        const destLng = u.destinationSlug ? destinationData.find(d => d.slug === u.destinationSlug)?.lng : undefined;

        await prisma.umkm.create({
            data: {
                name: u.name,
                slug: u.slug,
                owner: u.owner,
                address: u.address,
                phone: u.phone,
                rating: u.rating,
                reviewCount: u.reviewCount,
                validationStatus: u.validationStatus,
                description: u.description,
                openingHours: u.openingHours,
                latitude: destLat,
                longitude: destLng,
                images: {
                    create: {
                        imageUrl: `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800`,
                        caption: `${u.name}`,
                        isPrimary: true,
                    },
                },
                umkmHalalFacilities: {
                    create: u.facilityNames.map(fn => ({
                        facilityId: facilities[fn]!.id,
                    })),
                },
                ...connectData,
                ...certData,
            },
        });
    }
    console.log(`  ✓ ${umkmData.length} UMKMs with images & facilities created`);
    const certCount = umkmData.filter(u => u.hasCert).length;
    console.log(`    - ${certCount} halal certifications included`);

    // ── 6. HalalReadinessScore ────────────────────────────────────────
    const readinessData = [
        { regionName: "Kecamatan Cihideung", regionType: "kecamatan", destinationCount: 8, halalFacilityScore: 12.5, halalFoodScore: 18.3, worshipAccessScore: 15.0, transportAccessScore: 9.2, totalScore: 15.3, recommendation: "Fasilitas transportasi masih perlu ditingkatkan untuk menunjang akses wisatawan." },
        { regionName: "Kecamatan Tawang", regionType: "kecamatan", destinationCount: 6, halalFacilityScore: 10.2, halalFoodScore: 14.7, worshipAccessScore: 12.1, transportAccessScore: 8.5, totalScore: 12.3, recommendation: "Perlu penambahan restoran halal dan peningkatan akses transportasi publik." },
        { regionName: "Kecamatan Indihiang", regionType: "kecamatan", destinationCount: 5, halalFacilityScore: 8.0, halalFoodScore: 11.5, worshipAccessScore: 9.8, transportAccessScore: 7.0, totalScore: 9.8, recommendation: "Pengembangan fasilitas ibadah dan kuliner halal perlu diprioritaskan." },
        { regionName: "Kecamatan Mangkubumi", regionType: "kecamatan", destinationCount: 4, halalFacilityScore: 7.3, halalFoodScore: 9.2, worshipAccessScore: 8.5, transportAccessScore: 6.3, totalScore: 8.3, recommendation: "Potensi wisata perlu digali lebih lanjut dengan dukungan fasilitas dasar." },
        { regionName: "Kecamatan Bungursari", regionType: "kecamatan", destinationCount: 3, halalFacilityScore: 5.1, halalFoodScore: 7.8, worshipAccessScore: 6.2, transportAccessScore: 5.0, totalScore: 6.4, recommendation: "Pengembangan kawasan wisata baru dan peningkatan akses jalan sangat disarankan." },
        { regionName: "Kota Tasikmalaya", regionType: "kota", destinationCount: 26, halalFacilityScore: 9.8, halalFoodScore: 14.3, worshipAccessScore: 11.7, transportAccessScore: 8.1, totalScore: 11.9, recommendation: "Kota Tasikmalaya memiliki potensi besar sebagai destinasi wisata halal. Fokus pada standardisasi fasilitas dan promosi terpadu." },
    ];

    for (const data of readinessData) {
        await prisma.halalReadinessScore.create({ data });
    }
    console.log(`  ✓ ${readinessData.length} halal readiness scores created`);

    // ── 6. CoverageAreas (Pre-loaded cultural regions) ─────────────────
    const prianganTimurGeoJson = {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: { name: "Priangan Timur" },
                geometry: {
                    type: "MultiPolygon",
                    coordinates: [
                        [
                            [
                                [108.0, -7.0],
                                [108.8, -7.1],
                                [108.9, -7.3],
                                [108.7, -7.5],
                                [108.5, -7.7],
                                [108.3, -7.8],
                                [108.1, -7.7],
                                [107.9, -7.5],
                                [107.8, -7.3],
                                [107.9, -7.1],
                                [108.0, -7.0],
                            ],
                        ],
                    ],
                },
            },
        ],
    };

    await prisma.coverageArea.upsert({
        where: { id: "priangan-timur" },
        update: {
            name: "Priangan Timur",
            level: "REGIONAL",
            geoJsonData: prianganTimurGeoJson,
            colorHex: "#047857",
            isActive: true,
        },
        create: {
            id: "priangan-timur",
            name: "Priangan Timur",
            level: "REGIONAL",
            geoJsonData: prianganTimurGeoJson,
            colorHex: "#047857",
            isActive: true,
        },
    });
    console.log("  ✓ Coverage area 'Priangan Timur' pre-loaded");

    console.log("\n✅ Seeding completed successfully!");
    console.log(`   Categories: ${categoryData.length}`);
    console.log(`   Halal Facilities: ${facilityData.length}`);
    console.log(`   Destinations: ${destinationData.length}`);
    console.log(`   Accommodations: ${accommodationData.length}`);
    console.log(`   UMKMs: ${umkmData.length}`);
    console.log(`   Readiness Scores: ${readinessData.length}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
