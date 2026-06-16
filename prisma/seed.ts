/**
 * seed.ts (generated)
 * --------------------
 * Dibuat otomatis oleh data-collector (collect:seed) dari hasil crawl.
 * destinationData, umkmData & accommodationData berasal dari cache; categoryData & facilityData tetap.
 * Drop ke hyperlocal/prisma/ lalu jalankan: npx tsx prisma/seed.ts (atau prisma db seed).
 */
import { PrismaClient } from "../lib/generated/prisma";
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

    console.log("Seeding from crawled cache...\n");

    const usersData = [
        {
            email: "Fast@unsil.ac.id",
            password: "hy.w!54ta.Halal",
            name: "Administrator",
            role: "admin",
        },
        {
            email: "user@gmail.com",
            password: "password",
            name: "Regular User",
            role: "user",
        },
    ];

    for (const data of usersData) {
        await auth.api.signUpEmail({ body: data });
    }
    console.log("  ✓ " + usersData.length + " users created");

    // ── Categories ──────────────────────────────────────────────────────
    const categoryData = [
        {
            name: "Wisata Alam",
            slug: "wisata-alam",
            description:
                "Destinasi wisata alam pegunungan, air terjun, dan pemandian alami.",
            type: "DESTINATION",
        },
        {
            name: "Wisata Religi",
            slug: "wisata-religi",
            description: "Destinasi religi, sejarah, dan budaya Islam.",
            type: "DESTINATION",
        },
        {
            name: "Taman & Rekreasi",
            slug: "taman-rekreasi",
            description: "Taman kota, alun-alun, dan area rekreasi keluarga.",
            type: "DESTINATION",
        },
        {
            name: "Pantai",
            slug: "pantai",
            description: "Wisata pantai dan pesisir yang indah.",
            type: "DESTINATION",
        },
        {
            name: "Kuliner Halal",
            slug: "kuliner-halal",
            description: "Makanan dan minuman halal khas daerah.",
            type: "UMKM",
        },
        {
            name: "Oleh-Oleh & Souvenir",
            slug: "oleh-oleh-souvenir",
            description: "Pusat oleh-oleh, batik, dan kerajinan tangan.",
            type: "UMKM",
        },
        {
            name: "Fashion Muslim",
            slug: "fashion-muslim",
            description: "Busana dan aksesoris muslim.",
            type: "UMKM",
        },
        {
            name: "Hotel Syariah",
            slug: "hotel-syariah",
            description: "Hotel dengan konsep dan fasilitas ramah muslim.",
            type: "ACCOMMODATION",
        },
        {
            name: "Villa & Homestay",
            slug: "villa-homestay",
            description: "Villa dan homestay keluarga dengan nuansa islami.",
            type: "ACCOMMODATION",
        },
        {
            name: "Penginapan Murah",
            slug: "penginapan-murah",
            description: "Penginapan budget ramah muslim.",
            type: "ACCOMMODATION",
        },
    ];

    const categories: Record<string, { id: string }> = {};
    for (const data of categoryData) {
        const cat = await prisma.category.create({ data: data as any });
        categories[cat.slug] = cat;
    }
    console.log("  ✓ " + categoryData.length + " categories created");

    // ── HalalFacility ───────────────────────────────────────────────────
    const facilityData = [
        {
            name: "Musala Terpisah (Pria/Wanita)",
            facilityType: "ibadah",
            weight: 25,
            maxDistance: 1.0,
        },
        {
            name: "Sajadah & Mukena Bersih",
            facilityType: "ibadah",
            weight: 15,
            maxDistance: 0.5,
        },
        {
            name: "Sertifikasi Halal MUI",
            facilityType: "sertifikasi",
            weight: 30,
            maxDistance: 0.0,
        },
        {
            name: "Toilet Bersih & Tempat Wudhu",
            facilityType: "sanitasi",
            weight: 20,
            maxDistance: 0.3,
        },
        {
            name: "Restoran / Kuliner Halal",
            facilityType: "kuliner",
            weight: 25,
            maxDistance: 2.0,
        },
        {
            name: "Mushola 24 Jam",
            facilityType: "ibadah",
            weight: 25,
            maxDistance: 1.0,
        },
        {
            name: "Kolam Renang Syar'i",
            facilityType: "rekreasi",
            weight: 10,
            maxDistance: 0.0,
        },
        {
            name: "WiFi Gratis",
            facilityType: "fasilitas",
            weight: 5,
            maxDistance: 0.0,
        },
        {
            name: "Parkir Luas & Aman",
            facilityType: "fasilitas",
            weight: 10,
            maxDistance: 0.0,
        },
        {
            name: "Area Bermain Anak",
            facilityType: "fasilitas",
            weight: 10,
            maxDistance: 0.0,
        },
        {
            name: "Air Minum Galon Gratis",
            facilityType: "fasilitas",
            weight: 5,
            maxDistance: 0.0,
        },
    ];

    const facilities: Record<string, { id: string }> = {};
    for (const data of facilityData) {
        const f = await prisma.halalFacility.create({ data });
        facilities[f.name] = f;
    }
    console.log("  ✓ " + facilityData.length + " halal facilities created");

    // ── Destinations (dari cache) ───────────────────────────────────────
    const destinationData: any[] = [
        {
            name: "Taman Wisata Alam Gunung Tangkuban Parahu",
            slug: "taman-wisata-alam-gunung-tangkuban-parahu",
            categorySlug: "taman-rekreasi",
            city: "Cikole",
            province: "Jawa Barat",
            lat: -6.7602966,
            lng: 107.6118978,
            address:
                "Taman Wisata Alam Gunung Tangkuban Parahu, Cikole, Bandung Barat, Jawa Barat, Jawa, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 10,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Taman Wisata Alam Gunung Tangkuban Parahu adalah destinasi wisata di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [
                {
                    facilityName: "Musala Terpisah (Pria/Wanita)",
                    placeName: "Mushola Tangkuban Parahu",
                    facilityLat: -6.7603,
                    facilityLng: 107.6121,
                },
                {
                    facilityName: "Toilet Bersih & Tempat Wudhu",
                    placeName: "Toilet Tangkuban Parahu",
                    facilityLat: -6.7605,
                    facilityLng: 107.6119,
                },
                {
                    facilityName: "Parkir Luas & Aman",
                    placeName: "Area Parkir Tangkuban Parahu",
                    facilityLat: -6.7601,
                    facilityLng: 107.6116,
                },
                {
                    facilityName: "Restoran / Kuliner Halal",
                    placeName: "Restoran Halal Tangkuban",
                    facilityLat: -6.7600,
                    facilityLng: 107.6122,
                },
            ],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPILga-QJinRXpNlVuiUTgz2AsLLFT3PPxXUpRhbZ-Lh2g2rrzhheDiCGN1LZzoIDZNX2uspPCHnnMxxjeWv9n74jhZO-yXzbDsNks8euZkwzL7A3JpFIhNHJcdD_9ZzfJFjgQA8s_sXdO9fW6-H7xirw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP_qNprKTq29Kn9tSBgJTBcJIqg8P0jLrHG7iU-Q0njIP22zvzj8ypXLFC3UswYA_gnedzKsqNRlkq1K4w8B9XTgxt6cSOOM64nd626MbHH4j2owim7r7qdUWXpCAsxUUaQf1w43LuWaXgIng=s1600-w1600",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMgw1DxhSyOa3baV6G_BMlfLZjZGLgMnNkvQ6BRZRR4LD-JjmRSCRaZzNPOY2VAH-8AL8ZVmho8wFUOinijT31Gmzi-vEWvenLBZbC6nfTOQ0EdBwfS1R06P3b9hipQKlS1I11rFUDLHGkGQHw=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP6koR9qtfCFB1b-tQxyPgmw50NDCV-5ZvlM1RSiNmBeUNDBmwBKx83_RNkj3doxvATPTFYhOxvbMHiz8xnldrtdv85SiTNGMh0dvKAL_ABLZZDlMrOS0KGgnjpvikwc3iPsQBlC-hmbIROnQ=s1600-w1600",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP1zC7IgUmi8OmXt0lCANKG7c4VKgrSNwMr8d2Q9Q0Ig4j-nteqhVZV47-fBdt9aHxxnBdhZ0oW4WlcgfLE8gG0kD15KtaKdudtTIwXNWJq1NBY6-Ukxs0KDnuAPfVzdJF5L6fLUGk_ko26DA=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOx3YlueUmMFcht8KnHIl2TV83dMwyD5bljciI_V2iuzEtKTHA4t-lxFBvfhEakHkqG0VUQwOX_Ny3yPq37IV8W2j6w5tZbr9LUKC_0EA1OYy-R6L2rZmXIVd7O9nbuLpvK9gNUnvQyQapF_dM=s1600-w1600",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNyFxb6TE30e50XTu56TK8iBXDnF0ssU-78JbOD7YPnbxN1Bx_Lrxt2igOydCiar6UUbwjrXKfKqW3kWJcckG7X6jOBBvi87cgaGPZEAUTfTog880DVQqkBbTboQOEx0vo0Kmvx8vH1ZOyPZA=s1600-w1600",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPTAhIzITqXEIeEjBD0Tk1_eFWIti-6oU0q9hOxRBuePXdopBPTf02WTj_hFLRRE4_Kdmwf9BPWifbLBWvY3vbQDNAisGw1Rh9Pk7Cw4tc-ydsluQcExDgGvr_GBd4_kT4PlBOmRYRBRhXGNg=s1600-w1600",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOqheEdFY5i4rKq4S4Xjv7F1ca7G0qJqcumSjrgrmy3h8aWKQtrPZNxsAEBnxDOFBpISbgkEKsAUEfJlaayrDK-WNDA_HI6LrV4AE-mHXAJchS4urt0VthoUfZwW8fCOdAXc8KTWNWVu2RmRAU=s1600-w1600",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOuMadTAjEmmpe-1dWRqGXsmEABTREIDDe_JHogZ7gofobjYTK49w2_1O5YFdBhMOjdeUcvB21AMitvfsMz2OeVWKYhqzDX5NHJan0oXcQ7QUrjoV65681MBwhuEXwGP21bRept3esqcfg0aHE=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Wisata Alam Sawah Agung",
            slug: "wisata-alam-sawah-agung",
            categorySlug: "wisata-alam",
            city: "Gunung Putri",
            province: "Jawa Barat",
            lat: -6.3811078,
            lng: 106.9503006,
            address:
                "Wisata Alam Sawah Agung, Nagrak, Gunung Putri, Bogor, Jawa Barat, Jawa, 16967, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 10,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Wisata Alam Sawah Agung adalah destinasi wisata di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO83bWcHxY8SOtTMQXo4pX8-BxP-47hP_8ZlUnEFJemncUNCS2rNU0b_blhAHRcMuW9lrd2tSK57QnH3cCgDWCXyZyLz1VbjO23QD0ue6rm6ZRvRcKvbKyXGzCaYQezuMIkignEEEZ2KRtKrSM=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
        },
        {
            name: "Taman Wisata Alam Cimanggu",
            slug: "taman-wisata-alam-cimanggu",
            categorySlug: "taman-rekreasi",
            city: "Rancabali",
            province: "Jawa Barat",
            lat: -7.1453684,
            lng: 107.3912258,
            address:
                "Taman Wisata Alam Cimanggu, Cimanggu, Rancabali, Kabupaten Bandung, Jawa Barat, Jawa, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 10,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Taman Wisata Alam Cimanggu adalah destinasi wisata di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [
                {
                    facilityName: "Musala Terpisah (Pria/Wanita)",
                    placeName: "Mushola Cimanggu",
                    facilityLat: -7.1454,
                    facilityLng: 107.3913,
                },
                {
                    facilityName: "Toilet Bersih & Tempat Wudhu",
                    placeName: "Toilet Cimanggu",
                    facilityLat: -7.1455,
                    facilityLng: 107.3911,
                },
                {
                    facilityName: "Parkir Luas & Aman",
                    placeName: "Area Parkir Cimanggu",
                    facilityLat: -7.1452,
                    facilityLng: 107.3914,
                },
            ],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNFnJIo27_mqN-xUmOlM2e5xPn5IBo6G4-ylflh_4YOosyhZIceLxZWQmwNWmbFfx7MRN8-brqIjy1Fg3eiXAfYQD7DIQLAcxJIYM4lUh_SYL0qo5dhZDXju6HU56N0C9F6I6mLSqn7XThxfxc=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNSEJ4GFITGiuEF5vBcmUnsUy04gsL7lYg7_QL1bEXOjDNH0dbD09itSJce65giBTHJnHvaqEyCioPuc8NNCIZ52WSoYA5ACrtx_5kCaLAshnwxpO7uQdXIhcorfQM1tdrMJGpQ9HVw5jlHbXM=s1600-w1600",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMc4p0w0Uzaw_TO2ZiJiOSL9SDs7_iRK3sjnBgSzrYcdtKFYvDB6PSWi-NDwIBwK9W1YRf-C-cXOYF8N19VaQcjW4QLOCLlr06KyRp-HslOyJ7xeb1dKd1DxQc5fV16XYNTsV8IIPwOMbNYBQ=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPTp0cBzzSs3Kbs39B3jAfzBPHaa3k4yOt9AkXBhMXWjk5zYxGVu7FYLI9qPyVrQmniVQsQLs9vYOF7Rc352Y7F0SAzAvj3UPWmKd19nffPLWzrSS_R8qoIcPsmJJrZv243WGB1K0zHFfZyBCM=s1600-w1280",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNNeomzT8PYl_VdQFdLSbWU72ivWQ7oV7D6Tbaui-lsHe7ou0xqmYmoRhQcUVF3G_rbLVfWcxDhKLKHP3Eu7cGyB-MlNVjHF27OwG5sPW3q5gQnwMuS3Usalrjm7htwqnbYjRif1QJVquXIRrw=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOmW3XSF7naUWbJ5IDqUteveI_T4BJRPMiq6Pc0Ze2CKu_oo9GXB211S4MYr7jEQfEySnhS2LBYE_fkRxindjN9bc25LAnFpgO6HtMwqCWpLrhhIvB9aobKXnVdaQet92zP-rfz0AYQaqcoFwEKmuGz4Q=s1600-w1600",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZObD9z7Vk_GB3X8szt_CDyUtOxW6B1zM_pqGhClAuSK5ukiuWpv-Q-xfYBa0TeHS9Q8Q0trmRNlbNLNmCn0gyXxwb5yXLLxn3ZqyEp9QYf4LCEDz7lTSh1d30MMRk7I6unM5iMW5JrVF5rRLA=s1600-w1600",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNh1eT50ICLRaQbcTH49h21d1FaOn5zHzJFnfXYCy-JVLiyvSy6e2T_-gIVqi8lM8LzHUuu1ZjwvMcPafraOHLv_Wl804Y4tqaVbhWTqm_xfOyP7m3DSX5Aw14pGyYYlEqYWtvQwq7z-mLXCw=s1600-w1280",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMrAbbObCOPzeUr-pzdk--1E6C7CLfz3IBVrNykYwfvkI3tYGTDFrewmLoQ1majrzfJwnqqqHXLB0Q-nIY_ImagNVTD2hDkr4RiynnnI3Zmap2zkyyrOhQ-NgFZxatKrFf8FgOHTkQ3C8Kmow=s1600-w1600",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPZ1MZiklB716WrYHds552wW6HMzcInC4bzETrWbkgFhQe0hk8QYSutsPpA1PHfJZnK5BFZUr6wq2Y0mHJXP3ZTlqSqFF_kI1t3pPrFbs4sxvZI1Z1e9PMubZMy-MsuFjT1vcXa8WstxpG5bIPD5EnKQA=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Objek Wisata Alam KUKUPU PANENJOAN",
            slug: "objek-wisata-alam-kukupu-panenjoan",
            categorySlug: "wisata-alam",
            city: "Kuningan",
            province: "Jawa Barat",
            lat: -7.0150257,
            lng: 108.3901047,
            address:
                "Objek Wisata Alam KUKUPU PANENJOAN, Kuningan, Jawa Barat, Jawa, 45562, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 10,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Objek Wisata Alam KUKUPU PANENJOAN adalah destinasi wisata di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNxpagMy0pigDSbUQE78gBKDOM5O1U7JOcriGtj9b-KGomWAjaqTXPA4qTNThbAFSrdGiyUzXX_iPlFrT0iCuflj3NJUvr9CpZYrswhW-HMJ_fQJD7UdbIeLC2a0wHU6_dM7MFsFM5iuehzjuY=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNQ0RzAAhLbo72CLol60HEbf_117ZC-wYUsNX0DjaSXkju7Njiq4jDkpepuIc9oNqgYFXInqj_eCuiVh9luvi7ynfLwizDZ31eHt74WcgBTpnMoY1JhD138AWIRqDSXaJwb2H06cecu0PRY4A=s1600-w1600",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMLCvu52EIDfaH-_Cq7cnbMILTacWXZTV7IBE467nsKtyyBnmAtY-kOaxx_liRvAIgiSuE_AChVL4fMqp_dYDDRuWqV1jEMOSS3-fXSLpE43_THLbst8aF0G_ut5B_eF2sVqDbpkvCMoGDqGg0=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNoyxGxf3lvN0sDaUaa8pShtTH_l5ps5K_9Ln7W0emjKopMWEnQzN1FUsjQxYQJ-8846dblwt-5cw3qt9raZsaf_pEkH1tPPnnVwFpHP3U5xznjB_77X-Vn2aBrim6keMouwoulHq_kGrEAuQ=s1600-w1538",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNhcbcE-hR1TrVsrC1RlG2mRX6hjb89WfIPBIvUxg5ukRUmq0D0RzS-k1dhWdRZ5XMpj3IQ2sqk2ME2u5jHsUu-sXuxk4DKh9Fcg8AwD4DvhwVn1ToCZTc_iRzBJETrLRf1Qd0lOYvXen2a1Q=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOrM24JZb_U0AwiygZjee5EfClC0ifyfhbD8TyAOfx_JVxHlMtb8hFSSDStCSkJAYaPPhsPxfd5ksJMbmoO-MQXCQHEbkzwf00m_bhvj5oPgghxyyqSsQUJYZIZx_9zj9hBw0IwBG62AMXc=s1600-w1536",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPCzd1Nui4Kt2FtM4-oppG5vBTisLCWOsWhccV7TEPNELzLLer8ssrC09506RsgY6l1C_DUgCRmMinXfgns2TIXsDvLMtlMTbH9DN2tordxTx6-aocG4OIGM9F_n3lUQQKC0p1TouVvl0w2JA=s1600-w1600",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOPzdXIFNJN-cIz6LKKx3PWIfqgqvpEfVeFKkkpi5MR5-Hz2AroQkPAjG515JiGsGpFGiL6YLOlEjJFj5T5BF1SP1N-MGGUAaatknI7N9QciL7aWSs-5z-0AcYi38ElUlNk-lwm1PTIkq509xI=s1600-w1538",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOWN3616e7hAyiIuiKMnNCDT78Q2zB7FSbK4aXbfJlWrPUla8H16g-dF4E33dVy0-HMXl7iXekQxmLBOm5JQBt7XxE4N4BSO5b3oPUQSBqVKG3V8KTAQN1JUMDYzHdElhxHy07C6SsfMuWAI7w=s1600-w1600",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN9w4rYit93ZNdfuLBIGCAKGVLmmDOcuM0ClzJtp4UENH9pGVWC24tI-Y7uIxYYwMAqtsT1DJgybU7rbqRLHOjEBvvpPLWFz6rbhPSKpJoEsM6rnlxklWgiGu1JIHREqy3ZFgHxUfHcalmlCQ=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Taman Wisata Alam Papandayan",
            slug: "taman-wisata-alam-papandayan",
            categorySlug: "taman-rekreasi",
            city: "Garut",
            province: "Jawa Barat",
            lat: -7.3076309,
            lng: 107.7382099,
            address:
                "Taman Wisata Alam Papandayan, Sirnajaya, Cisurupan, Garut, Jawa Barat, Jawa, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 27,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Taman Wisata Alam Papandayan adalah destinasi wisata di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [
                {
                    facilityName: "Restoran / Kuliner Halal",
                    placeName: "Warung Makan Papandayan",
                    facilityLat: -7.3075,
                    facilityLng: 107.7384,
                },
            ],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNbxT30MoxFp085TvDp1bUw1mBF7OMEvA_pFfIEJpbtfgcyef_mRiTC9BCHCeal1FiJBjKDXZh5rOSHw59AOdoKyhSUP59n8w_f8SdpVAwIe1S8MQ8KkwDGdJqHVcM28jzKPzVDNVQJHHQlRSw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNd5qIkCsK45ISiNC679rjzURdAEiV3KLoMDXIDTXlUXu5tAfjJCcQ4UjiZ6xNUZlWCxR3BnaBs8DjKCDAU2IQjkHw1OjmVWlETrWs1eouyDm8O2_Gn0F7lAmOOQluj8GVxx1kWcLQitbleBAo=s1600-w1600",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO7X9jB4cV1BxLXEB-O3BueEDBLIhBKf45JiPLNwI09g9LhtEFSOiAqeh9xFhdHvpaN18sNhwXehEhRlD0SZDBsN0WIhMyaNL9rM9QkwPk3aWGQg4YxumzC9wUhmU-lbaWWR9W8zydZMk8ea1o=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN_JDJBUZvjQP4xwQz_7-1lGzFm7GVr6ke_IIskW4llgeU2EsKHJCd3nFuCyfQfsD5FqjRK0u8zsNuduvKP6zC1-oBjES3QWGjJ9fD_yRUq3-aC6_JICUN_CA3s_djOe7PqFuHd7d9yN7wG=s1600-w1600",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMZRJlzhdBSPD0ui7n1WFG1e1Q1N0hpjOwOUzR192s-WRSUALs7vGEA-f2F21VxoSwwt0jdSOqcBiW1Sm4nzoK9BBKIcDERVZh6_htRu8dG6lmu7xqs3yyZtjZRPxbbVD84-rBj3fjQtY0BhQ=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZM3K4buJW5DMjCiVejGzYklgdeTrkAvkiOfOuAYznJYYE0ZmsKuc7mJdnNQdD4tCpTp_5oYFnMRZd8btZqb0IRYJpwP03Xny44nWUg6105IE2gEOVIiNtxOYhwWZhByEkSpxVrsMW6aHLB3SB0=s1600-w1600",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPQeEDDkKofSKtaPuZU6Uzw8pZPhtoS7tiDmbcbjc49CNl15gw49KdpPFttjVmQoohsrHRF5703vtUoU8OUAhIbTAwnBsT1wtrKvX7BW2Mw4LWmbMHAbcQTR7m4Gvse8IXU-fhjXdX8DhBBNw=s1600-w1600",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN8KCbd1yL6x1qFhNgaIo93SSN2h_uQoIXNLsgMG5vlTrh5KcHRuyanPAPYAJxJuWkraKdbLmuvE_LqmoFU-T7hRH1979Vlp7a5X4k81tERSQnlN4-eP094WJXPadpVRF7rlPYMNgj6wlRYS0o=s1600-w1600",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOOaCBSTVNgVMHWXzj9XcAFYaAfnw_9dHAnBYQbQMqDmg2SQJB6P_dgfviNvUQm-bBMIumXTQh-7nHHcACjq0F1PnU9PuhDzXyVUS-Gbp0neuXKtMiRAfhG1l9CdscVP0o91hH7_UiMRYCK2jo=s1600-w1600",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOtQvmsSQcCs4jZXH5AXD6Jj2uVbaA4Ezkxa5WUlDUJK1ztsPqYF5kR5Ol7y7Cd4fXoQgWViGgcb-94ROsVKQ2HFylTnmx_Ox82F2HcacZKyPay-GQLUNic7Z3--TbknZgJjAOmLDSxkOrCdeQ=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Taman Wisata Alam Gunung Tampomas",
            slug: "taman-wisata-alam-gunung-tampomas",
            categorySlug: "taman-rekreasi",
            city: "Cibitung",
            province: "Jawa Barat",
            lat: -6.7517676,
            lng: 107.9568019,
            address:
                "Taman Wisata Alam Gunung Tampomas, Cibitung, Sumedang, Jawa Barat, Jawa, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 10,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Taman Wisata Alam Gunung Tampomas adalah destinasi wisata di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPQXPFkCm3Ksa4LrjfPYDHKf1i1isTEZCCY7UV1CY18wiAK2FF-5Ffmhunu2XG6IhsHtjbeMYXHkDwSsulFJA5B7y4j9EwHYh5uKmxVrkm6N83boGKHo9X4WiWfGC4_YM-CM_ZEEs5m3QyyyrOETHZjQA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNFwjkWr1fBw3Cs_ckP_PHcGcGg_gOjk9d-nuM8gsl4c2u3k42__4Ng3Q_d3gKI50-Gq2hVuf54oP0NRCDJh6J0YXxSxNjg24fIyu8C2QXgnGZ68KaANTZjGLPIt9x6xeJ6KPaBnX4Xd7RVa4Pw6Xz_=s1600-w1600",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOdgh1MbOp0h6Hpvd7WMFLo-elHhd_e6OGneKw6iwHFWFHfDFiVC80P9Rbp0KX-VU-Jg0EKcI5t7DmAvYZmR6KHx_74C4CsfRQtlF2E-GhzPPj71rqpW9_aS-5yLjpvX-1bA_Mt-H4YGCi2r3vVHG3m=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP_Ez0yj7p51_hInFo5__ivtONMIfDABpgZaKIEr7N8dzOju1CLkuX8FHVeF9pExYsBbAj2rkUqB4FwO0PUZ9eBWKGkfk9PQsMRFYCI0JB0eZCZmIVvSQfTVP69mE4Z7nCiarxInL2--3mcYEo7OEl0zA=s1600-w1600",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOuIaK41Z1MUma4Bc1UUXlIKgPFo6advHGH235q_L1qH90NacbxRcb3fyctadZ3IC9GHbSrTd39irVCIivTNXhEFi__k9Rbp7nIL7Yti4SU0VYzcRqaR_HvvxNfEneNorJPxSvW0kKY_vvPLH_XjOjn=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPOtzXt9qlkqljs18rXdDR_dDrsWVqV718_JLpH8wz-_ksEx2mXw9aU4TYqXP4x6ets0zEXdzm4YLn-76j6iZerPel-Td9_40pKlD7p69mnllxaQ61nUd86LvGQmAPB-gRcIuR3BBCFF7n7wt841KQNnw=s1600-w1600",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNxZ8_jwyB2BzrW_HCU_6E_jQU8iVZ1a2WBtQlvnux9eLIznAr7lP28nCh2Uczt4FyDdyIzIsCxW_mD6x_yAKV9tDDdxonfWQVldmLJMfKdnr0TFWUZ1R-sIxfWPUZJarecVuQHk0gid0VovdQ0_zdAUQ=s1600-w1600",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPLZ-gh0KQEfQbAWpBW--K7bf-jbFzxh5aesANZ_rRbrr1Poqz0DRmOuSeEglxlIWIYb61k7HXb8eqkNcGGedfJ9LhFsx_NYpTSyTfZUCml0vUq2_Wx2v8kOry6WDtmu6Lw_m941wbx2fdTFrMUY_Tj=s1600-w1600",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOn14TrE6umBDvkWq9RvTu2jngvaplNp8n-tAY2-V6XUyDB3mMM-hPlkApjznz1nqPixmT30UOdpj4PB_phgDT4YmfXwGIodda6rboOG3U8M16Hzu_uzRxn0GM0jX5Pv2tJyZ58cCDPqtbvYBB-6NUM8A=s1600-w1600",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPtqdkeUJEfeOUK6MGcCO4W1rt-ndoWNGwMaMoUz13YxvXWeINC6S_ngkmxYoDx0H0l2ljDobc8A-Anu1a2MXKmFznDoIPXrciodzNj9eCfeW7fqi32IRU-Ac-KKd0RVyeylwOo8QyIDJc9g5Z8sAZM8w=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Taman Wisata Alam Sukawayana",
            slug: "taman-wisata-alam-sukawayana",
            categorySlug: "taman-rekreasi",
            city: "Cikakak",
            province: "Jawa Barat",
            lat: -6.9655784,
            lng: 106.5129071,
            address:
                "Taman Wisata Alam Sukawayana, Cikakak, Sukabumi, Jawa Barat, Jawa, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 10,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Taman Wisata Alam Sukawayana adalah destinasi wisata di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZM7yg00h9vz_jfNU9lcXdeTNrrrQhI-UoBtjXUzz2CjF594_x8CQYEfkP8VGlKx03pSkuGhKveV1TNi4Q9ERCFWUc9pmbbOGKpWihtYfy8_cWkILoaGZCszFXLMxN3Z4Bc3mL-QVODL406IN-w=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMrOHaTUKD37tOIGJHSu5d0OYqlT1k1lw9-6qWR4zE_TywCyX-h8pAy-MAu4exB19RZ6tU-pm0raVwsIsUUmwd4D1uobINaIvsrSDzPCbtikIv8Lhp7J7BVYRwbrUoe3LqiNQrA_haWzD_VOfo=s1600-w1600",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNwehGld24lIRUxoTq-hEv9lFnuByd9_kou1BdNEvPYf5_wBdW7GbVE3IN1w_5ks75cMFBONOJmw4fEyPUXWyouqciRvHgLJpi50K4BvlPNDfG-MLj9qF3s6AjBm5D4QGMqvu4BBdx8Gpf6Ug=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMuQjl0wzbDjNWvnrnEra-4pHrsPRP2br1J8PDNzGQZdVJryI0wHzxWZo5FgJIk3nIk92of-90hkCYZInLm7vqy7u0FHV2HppewaHZLLajQ42BFjDX9sF6Eu9UUDIWQqmMSoSPlaM9sYrJZNg=s1600-w1600",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPPGmRswmX9gCqcQqnI235havgyjKZBHQ8kJsiVvZqESdVhsipxxsl56H06OqU6rsgMiN0P_SY46xLQlMkGdlfe0Foo0iPK4LCUqL71F1SRETgLUuM_batI0PhWFR0RhECJSVCLt-_RobA4Fw=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOfIpIVcnvVDseTMqMgUuOH42E9ocNAe2W25np-aiFfc2sqS2m1P2ZRW8E2TRAcH4Mkko3OjJjx3mEBYmA6vms1xDbIPus6YeXfeuws3e1PpYWq06EBchnMq9A58exy7BQ2_xA-6MpQjONKlcQ=s1600-w960",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMaLB6YDk0539CuGyyJpRSehCG3gUoYMcOZ8H9gziusKEzre9VQbovfwmKu7omJwa4I877lkfKbIFiXuoy8ZNP0di-JhQ8lvbBVfqnL4ZRUKyCw8OzI0FUtigyn3AzE5DQeTKsh3tgzqC8-8eo=s1600-w1600",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNfJ7MEoU1R_g-7e35l0FnkBnCA-g00XIotPn1aIF9VGHpjadVhN99MkWlf2EGm7UrmJ-QpmvqOAkUdQTJe9MkGlvseyi1pp-aIvcIV38rKWHG7F90Yb1noS_lR3ukcVztDXrewXftwygA_gA=s1600-w1600",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNFcYKMl-3_IIvBXexdtbmjXEr4sxSGwj5pZ2C1MgNOnMZtO0c9_SPhyo8O5vS9EkkV4UpUH3iiQo7ZJ0_htKfOavxjuFOEKAot_uzEO4TJ3ddtA2ceBpPn60JQaSCnMiwlr8yom71bW3by=s1600-w1600",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNH2mwNwNy6MOeavCqgcY2aedVN-A85SGFeazvfH8iema21o2f2ZAUSKWL5C3xt0UUJRYYYzZz7uhAKrsp1QK5dhruNLeyPK_uq7aQu8MoMniaStAbIuAojN6p9jucMF56PuqScTejXurcrHQ=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Taman Wisata Alam Kawah Kamojang",
            slug: "taman-wisata-alam-kawah-kamojang",
            categorySlug: "taman-rekreasi",
            city: "Ibun",
            province: "Jawa Barat",
            lat: -7.1563158,
            lng: 107.7509287,
            address:
                "Taman Wisata Alam Kawah Kamojang, Ibun, Kabupaten Bandung, Jawa Barat, Jawa, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 0,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Taman Wisata Alam Kawah Kamojang adalah destinasi wisata di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMW0fgXfgpIhtdD2f_OcKfyy2WaBxabT37TfH2-wKJzU1RG-4j-8i6Q0EHylLVlJpShjf-U15zxIepyZojHRBjgwsQeBP8GWxk_cc_JCPnPz31K7Pw30s3Ddpf7NSF-LEWK1dreqKnwqEvP4w=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPUSKQLlqbKhGU7oTdPNB1DKwJe0F2PZwkZb2fF02gFXslc_68E0LOhyuDWOSihjJP2Je76Nhzi8NJT7aPXjMkWTnfjXr1OCUB35-60F0lJnHy-sTwruEWoXSJ23JcAPdrGFfg6C_pnZkQiPg=s1600-w1156",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMRRljhGpMxGZGU19w9H9ROoUzKx52J-8EYJNZiM-xgofVpCGiCY2dQ3AKE_Gac1L18Uq_33cWgnRj-FAiCbWZX9zaPbSoVp1KTnN6UW46cCKpnk4GJxrz5taul9gOe8GYAj2HBffo6RN-CXG8=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZODueLv6ms-y7f1O-nobcnaV5iv0QZwqtV5XNDsBMbyVu9lRiOWa7b-UV-y2IaDNoQ17p1O9OB2rF7ENjg96CTU6eom-VRShvrtf3C8yRpLUmD4fuNVh5QzqQsTzl7v6sTpZiMThlahZrK5kw=s1600-w1024",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPpg6Ffab0Zd1w6_0Q3HgQMmLG1EySA-z18CTOP3QCQLBXGWNhswctMQyQJj4gqBHBVrCfsSswGw2pb4fWYnJxcEtC1QHD4n3cWMK73z5KK6bgehvXvF4MSiEm9HMRFnUFo0Bqze2XdlwtAEA=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNlp3gs_eKMOxs51Ga_2r5iCOLr8m-H14p3GrJzXOejRdge0fQnDTelisDZCKzMYTqHtyrGd1ISMU_RElbT7DvVRdcGWhaFSyD9QISweBrw8k-TVyefNm0Y2TN1f4kJvI0s30gtKtzqYHVfKAo=s1600-w1600",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNwrzL5i-lHEXFs9IXYj9nrgrPJVg8Kiu8bCF-tlxL_H16humphgeyj9ln1XINdS-bne1JerQgPMeWpqKz3hBniANGAG3L8HKocUJW1N7J3D1tbjGUIlXylxVt5JMc3iXpQd_cG3aBT8qUGNsc=s1600-w1080",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMlwi65qc-J9t5DKUvEEK9uRHM-1NP52awc6eH5iUTYEU6DzY5EnyW-uFFVHsSaiw7uai8VhMq1XThEdLW_yF1NqN1oFXPuT4rZg-nJvDORKPNC6Lur3urGH0ULeK2P1bc1z9g7L0tjwBzV_Q=s1600-w1472",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO_7O6Tfl_-Y3rvK7QXh_HAJl3xStgKweq7Do-s6DA9BItRQ6abAGM6WjyR1tvj1nN-5QBHPXi_DL6oFArs-6tcr7e1ST5-b4YOYBNli3SaUlFhaLT518IejQFNFVvC60IHUARBznmlCKLy=s1600-w1600",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOMsGVAU_h15HCtUeLEWxuvAu9ZVPdG5TfciB7Ld3wlJmPbU7Gi4TDepGurPElbJeVt2ACufwM54SHZj9cUNF0E3H95luErsqa1eUxY58r3WflEh5Z2DG0WwbuKkwb2i2iP2EYAV9XokZ1Srw=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Taman Wisata Alam Telaga Warna",
            slug: "taman-wisata-alam-telaga-warna",
            categorySlug: "taman-rekreasi",
            city: "Tugu Utara",
            province: "Jawa Barat",
            lat: -6.6927181,
            lng: 107.0073044,
            address:
                "Taman Wisata Alam Telaga Warna, Tugu Utara, Ciloto, Cianjur, Jawa Barat, Jawa, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 10,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Taman Wisata Alam Telaga Warna adalah destinasi wisata di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMjgusRWy-Y0prbz9xioxIzkWh0Q4SLONYu7qnsOY33j6GRYPc8FurcDJi1J3RrRJfXBe3x5JptsMB16Ah8w3BeX9fi1pt-by3v-r3LVsrEeKQswQucdEB9MllH1DA3q-2ybkB3ow9FXO6uH3V3tD9HjA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOMbTIfdduDJRCT49jU5GHrpWB2umnfBU01douqmeoZ6EfBrzZrkjqezkEp7W04qHF0alW5G1Jh7TJl82oApBPVWeaUPavDzpxSBvLsZWMT-56ANl2oeqZpnjlO2JGDxyTLt6nrCwn5GEJPcoLzlkif=s1600-w1440",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPEcB-0eRdsfJfP2XVlFYDQMBw83Md7Mb1mhOAVv6vT1-dI-ASJIB8KUahHMnXGzfNtSF3ibyaKnSQf2iXedfQHx9JWGU2hSny_A0DEk9FAs8wT1rUyQNKPpYox0B5xlNIvm-gYHQPBveIHOnsTjLu4Ig=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOdXQL0X5fe6OzLdcy2Fy0C3lacFNMhLn0whgtC_SVIg30gJJ16-akoMktdBvO1ZzBz2WbV4DxSig7zsdLdyKJKepZrVOxRrnepYhuL0GhrmTqYhWLnmm1k0Rt-tjVE1dWlCLdHH8-upCHcq3ugX238Aw=s1600-w1600",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOXlsdanrCmRhT9wcR9d3egLjbk1_kAAAFAJ-tmeU04kRJbJq40VxMFFkR_eEs-Db2ptz3bZI02yqPDrlW4EW1HomBRw3BR5liPiAZuWIAuNy-XEVEUHjCfkTGvoi_AHDCdJ_XC1IDA1ao6P2abessvLQ=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO_SLnsYmNoALFp5gtNQeKvZae4PUhAm2EIcxKes5WeB1HX72N-sdxIbCAM74i4xVXM5x4-yLxu1F6dns55TKStr4dIZQzru0YTPIS8M_N0olABsD_NQmoE6nxjSleBWPHUsMw9IIxPznvkyw9vO-IcRg=s1600-w663",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMFkmo4kp5MwqLoroq3sUNnzyxkLT9oOf24d8sAN_jBursucopfDMUEqVDfXoLlJlpAEXwMD_f7Q8dcXYTAw4GyfGRxarL96AWbrrtrYO_GHSJ42AqW1Z5ak-a9Ku1m9xfe5FSVe9L6pFFSXDC9_Kmj=s1600-w900",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPZC7EL4Afp_uMkM4PlZmhwBIooQdlFpws5Dtm5S0c4dDbheIYRDQSe-m_EDrYqkmvqN2TZpJK7oNZFTowk5jUxzmVoHTVGu2PK1RvPh-zBaQvMlgFSSLeh-LeWvW2dpO8cDWvEZHG2pPTcQMI3flGEjw=s1600-w1600",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMQKtlHqZzEj5ogKKiz3DblBtCPYVuiuKz3o87ismLRK2U8-swuEcVXB6AaUTNSZNoCv4BHNX0_u1ijwwNyIRCAuUmOhSgX4ysprYMolm1frtHl59mE7U0dkcKNjY4PIVfuPtcKM5gsRlu6Ts3EjBsvtw=s1600-w1600",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMw5L-JQrjcyzOB280Dz4iQY7TnO2jkENVXrh01p-bx1ZnTGp3JrOtYnbyrr9qmY5BMnMZqMZpEI3rTwrjZu-CsLhTG_KZ5y1haBYcfXDxWcqOy8SWsV5R4hfUET-ZDmmrN4zIt4A5ltl8SorkLerzH4g=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Taman Wisata Alam Gunung Pancar",
            slug: "taman-wisata-alam-gunung-pancar",
            categorySlug: "taman-rekreasi",
            city: "Babakan Madang",
            province: "Jawa Barat",
            lat: -6.5880029,
            lng: 106.910858,
            address:
                "Taman Wisata Alam Gunung Pancar, Karangtengah, Babakan Madang, Bogor, Jawa Barat, Jawa, 16810, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 10,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Taman Wisata Alam Gunung Pancar adalah destinasi wisata di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOmcpPL6iCw749vPnC95wWbNGhAQqcTBIGbbYPMVZ0-gu7x4PqAECFnXrOYXTnazWeU6WNLalPlVap9FmKkTanaKdAxUyWoyfm0jx7JprGYUbS7qfjWAORhfwbXzLo4HtCEZFjBbG71vxoSuQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMNt--KMkU3Kv-EhLBgcH2qZfCVqqeYl0D_crez_067-9tMvzfNGWtBuSLBt9FR1o7qT6M9XuaXRfA48abI2Oapm1SsWq0n5tg2vlAWOmOwPLpQDPnX-8Zl017vUT_njq3Mvi8Jze-07KFt-dU=s1600-w1600",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZM2F25gUSsjVi0E8Z7v7vdwL9FZAds8J4KmfLRy8BWnmWlfQfFe1nHyiwor4j8Mxtk4x2ZvoTX2w8tvfmoRIrdltt2IA6OksHM-ANoucaIseIGS1gJhYK9DYXGR1k6W7Yr3XJUL5HrPHunXjCEirbi5=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNCzafM0EmTX1SIgsO2XkvguahOR-A6A1CfNcRdKJugFxT5WPJj0P9gNn_GGAjRSDBkTtGj_BcBj2f18eyAqSEcrW8aNiRrvh7cs1gPijAQ39clmyqgtL7b5octzz0mvAsA955PWmh0owW4jmk=s1600-w1600",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPKXDYioBaDBZQXmC4X1k3Y18OOwxqdEEzETv_qDOpM-vQGg0xjroh9tNFg21IaTaUH9WQrfjb4ullBrjO2R2RgNDqFMNGHFw_KOtlVrVsOD5TpMPPQZnqfN-PR21VgukUWoXKhLgVDe_zV=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPBWiz_dNn3IDCLG1Jn7xkVV2nH4tOnV3HrYVSs3U72U-mz_HWG2pZRwfs1T4kqmTARtmCK91phfcj7xnGsRfYMM9GhNtP-BG8vnSsA_RHM5buArlaWC_B4wyj7qKif18YJ7a-zVXv2hHYpJg=s1600-w1600",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOx5fqma-BqRrWq79CZxWg9WuexfwML5RZOBHF6_uc9_rMRSnIHH9WI2bqnmUp7fb7u8mLI2JAfRBDG12G3UwmGZwEO9wMRD4Gs_UKg4Gd6iwUqIK5NLC1zRFcos6S7jPjrd_kwaMZaVxaarQ=s1600-w1600",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPTNOK5Wx7QW0opDM8eRtp2HBe6EWDaX8emgSQqepYzusTnBLsvTk362C8sujABl26cvDI2Q_Nn9uUEilnSEQObzgubGpK8z0fhzdNFn_-FsJFVy4yVyWGn8Cd6MkAo9IXHiQnWvajzrZyuRg=s1600-w1600",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMAXkLJgtlK9UTsNeiXou3SIoGzV36DqJs5FHjnnBGJA59WMSyQPJD1YUfpQFo4Z2mGYW7r2Z3RyQlHXBCNFgW6gBre8438dFHCHabBDnXhPw3luZh2mYMfhhrgDcfxQ1NEzpyEk_V9LSXlECA=s1600-w1600",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNW_nPfzqw0JlSwdrLwCAp_Jusdf5tpeVPjr_aA288x1_hH9EpUWuqBC5cGmlq2MnNN83tXxELhTOi_AgyxR3ZWaHGKthXHkRxPFXJLfJ22bjwP-9ELFunmYcno9iVae8dJV1FoU8vG4QVOZDM=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Taman Wisata Alam Talaga Bodas",
            slug: "taman-wisata-alam-talaga-bodas",
            categorySlug: "taman-rekreasi",
            city: "Garut",
            province: "Jawa Barat",
            lat: -7.2081282,
            lng: 108.0651474,
            address:
                "Taman Wisata Alam Talaga Bodas, Sukamenak, Wanaraja, Garut, Tasikmalaya, Jawa Barat, Jawa, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 0,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Taman Wisata Alam Talaga Bodas adalah destinasi wisata di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPW7JxnXhdpnOlcUPp-xcQOh-mGY6z3JZCi9zx3L8N2zmL4VRugdsQemZoyadl2O4KjLFGAzWmXUFVPSkzHtzbl2p3AQWlnK4z_eSRcBolKvKqan0Uj-IpmTmxhZFmq5k1Dr7f4R0OnWVBwZLg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPpEcx10kagnUGkTPfkqNg-FFzvKAnMkXZRRq7Q0MXTdlwM1FA3wsu5_N-OSz9wxhwSYb37_gpZjmAH-YpUiEakdXIeOXWNxmySeAGy2o6ubIGYm2QL04GOMWUAN_QqP5cI53lelTtOyaADPf_rOOng=s1600-w1600",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOliQ9J_U0Pe94JwpusHKCj98tR2IEunmD1p64AtzOt-JoLpyQ7dtIc0oY9b1Fp-QlRpAX4UM6F3S_y4h27238qn7SdsmHJovGWsMFhWHslJpIw_SNvEH8pDixKgovHdS4h0iYoxWS63Qzn=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNqj_T4U6KubqaNDkNHjJWxwGfqDwkCscMX3dMxzCCszGtz8R5meVmZM2OKCMhDSPfOy_M5GOLpvQZ3QPx5Yy7vrcpEWhW7Zv5dki30-VQV0LilHD_sGtS1JRl7IFZ8ZiX0xsP5NtQKIx1Dhg=s1600-w1600",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPKdpRIf0YIJBUGutaMrHVVWwmpdjW10FIrZYy4a9RBeIVWi2EjBIrCHpuSKQrZBU0Rx4sX57WptwsJ4ZTHuscAJpIQQR42c4WoE7OuVE4qXCeL0nj7uQL0zo6zUN6AvSycL2xReh0--p2Jpro=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNBM73ILl_gIHmu4lACvtdIz4wAbiizy2fjx5VJ3UfXNgPXs2Tydi4pOhEXQmL8xJQVO2UFrpN97pbA1VkItWm99auBuP1uEEEJIQoVg2sCBVkF2ntjabvVYH2vvT75FwlOBDlH8_tEV3gPRm0=s1600-w1600",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOLnjY3ddbGhz6t7t9QvzQpPq2tvWYB6ydx1vzkcNKXfJfwsfuaEeDxmmab3c4PEvdBXCFY4RR5uNCU6g6uemkA8n29G-SoY0LzBeGPS3FA7ekfgoWBhqCxt07kUlgpo8866yMj_M1yuUpCoA=s1600-w1600",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNZTIQgqcgXRNktLoKE4IYSMdllmrMDOFXWqQTInSwRCMuac4V5i-EhGdtSSQmDwbdvVL0EP7HVLXjoJsSrbkvy-st8kj7owQesRGmsbx-KZEG9XgbeSvmB0UqfSCUfwi-lnRdpFHKCX5Yj6Q=s1600-w1600",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPhT4eL5N3BngFLGgb6JG1GYxkLaQU-aAf6-E3tgGovoU527TWocoyC5dBqCAYQRNRYqAb0zlT5IJ44_ugM3SSjqvshq6fXud3BT1lzVRTBIARHngoNpl_XVacORbFYEmbLaD9e4_haxAlgxQ=s1600-w1280",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZM8JRNZz7BgzT5haeI0R6HaB1VzT7g4ynua6JPx6ucCFVcCXfHbGlS5aQ40I3e60ZAX0aXZNuKISVKhwoJP6x3v6LR2YizPQxVLQNiZ5LT3Pp1HH0lDxkTuGasaOkGmfx-ShlNVt9gpFGav0A=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Taman Wisata Alam Linggarjati",
            slug: "taman-wisata-alam-linggarjati",
            categorySlug: "taman-rekreasi",
            city: "Linggajati",
            province: "Jawa Barat",
            lat: -6.8831092,
            lng: 108.4778438,
            address:
                "Taman Wisata Alam Linggarjati, Linggajati, Kuningan, Jawa Barat, Jawa, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 10,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Taman Wisata Alam Linggarjati adalah destinasi wisata di Linggajati, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMZkMA1Y8z7etcUAg2Z8BxD9Rzju2xxI3sQrYvQisRGFUHj0koqKm-j-YtU6ig6ObJ4YA_E5tl05ikBOBIed7V5trcQdyrf-4K52WCm7-ub4r_frm-rgd3ctvZcRPA-PGELXU-E4DYp7ibeFQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZM-f6O2Pjio5xH6NaxdFlvJFKYQith5D4N51wfwu3dvOry5LW-uAPxqxPx6UqLrdmQkKhnYbAZwEtUHBAfaFXkEj3VMjxmv_n7Fg2PTmlrx_h-2SJQAO_fYrkFowBvTg7XqJB4HlP6TMkBwrt0=s1600-w1600",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMfP14Iy6VKOzxtD9VmSVu24EIadg6ZfQksHPLvk9C9IuUT2IdZnmGd5-7MzYki47SFyqmfLXxt-uoyL3XGMiqk8Yh3AUIqJnN0rkDLkcka-15ynyznnTOFi0rt0rr9o_U8SKygy_GOOWNtQQ=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN9dwhnp-88dOGvpWviiS-EPlJH0frXeErdLTGw0_TzfOJn6oxzf0qJpM8ReNBqR2jR0CM5AakO6a1bqO1HY2aATVmYlvDIbbBBbUKP8NuRk3S91q3bMJJAYA3S966jTJPWRcF3KoICr3JQ5g=s1600-w1600",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNrfalWpUN1AP5EbxEl784vEoF8iDIw5x2fuKDworgDVqK5Fjd0CTNKWjJfYa58gAcyR3Vm3VesyfcHSiSgUOTOPwNFhWMjoh1zZ8V_GxAEWi8UNGMrmaHxmCCaPLMs9B7PQr4RzCj1Ik0LMX4=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPo97co_GuewNDfsRcCLdou111r-HQ8dqqUZa8wx1be8b2kGb_xjoUPY7Pu2M08joP4euGDifYHmRIeHGWKoOX_5o6G_sRZfBSBddL1ihq2NR6m4WkKPuFNVZGOp0pxRNoT3ydHIgI9v3y6Vg=s1600-w1600",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPy4iKILHYpvrBLVFhzC3gW4ujrneivEvsgpHn6u9TZAe49iWa2h8eMYjBDe-OlyCM0hyjz7_fdMdbR5nisbbKrBeSjnVmggJN1gpjr0MZlBJ1H5Lrd7CogRejzYrBlWZfGecybkZvSCSnf5w=s1600-w1570",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNYs1m9aDQWeyz4RYNdx6lQASkoI6jYkZaYWCSU4NqJPNmpnINsyZJULVFp6bRxniMnVe5hD9lEKuEnXGgBkFowI3VthV2T81ZjDLg44G7WBMk8wpShFnVg8ctIAp27ZlZTkhxO2cSOXU61og=s1600-w1600",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMC5Cx3uyRyQl7kbPRjFM4p90K0ERenonaUJMPAbKAVPQpZjqeXZZpnBk1ALtwmj-IM2raKbS3mOCl1bpyt01wzOKd0lcen8DDy3J7_6KW4DhGL8JKntbDgzDkDWmONYTrkQAMnMPRkPT5e6xoSeNM8=s1600-w720",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO_HQvgUS37HP7gFAzqm30CddmtlBocU-AdrM8ZY2WDPl2cMMl9mzPg6Bmqr9El4NA0eDUTIzD3dy8tdHahV3lX_3l8A1nGLI5Cl56pWC_6ZbLJaBsxfgoq14Q0dnRROKfOeqBjhdeZyRlcNQk=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Obyek Wisata Awit Sinar Alam Darajat Hotwaterpark & Cottage",
            slug: "obyek-wisata-awit-sinar-alam-darajat-hotwaterpark-cottage",
            categorySlug: "wisata-alam",
            city: "Garut",
            province: "Jawa Barat",
            lat: -7.2186323,
            lng: 107.7414712,
            address:
                "Obyek Wisata Awit Sinar Alam Darajat Hotwaterpark & Cottage, Jalan Garut - Kertasari, Padawaas, Pasirwangi, Garut, Jawa Barat, Jawa, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 5,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Obyek Wisata Awit Sinar Alam Darajat Hotwaterpark & Cottage adalah destinasi wisata di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [
                {
                    facilityName: "Parkir Luas & Aman",
                    placeName: "Area Parkir Darajat",
                    facilityLat: -7.2187,
                    facilityLng: 107.7416,
                },
            ],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMZSqHR4NB87htsrAneCOnY-IQzw_-EPyJh6gbv-EiHP3FH9h9hna7-UZvR7EVn8BdkhHKAO-AVsuLECR4iMJ2DE_Ez0EH-z8RcPAAXrSlEhKKDM6XR-RSa4c6-Tc2eBBRy28kvDDSTbZazGg=s1600-w1074",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMLYj5VNNEGq9xC5cT3O4PAz0u-0b4Ld1Nsf-UfKQUoNNygdBr4VRWIsFLAATjRAdu3q-npoi87TF7fUJQLgBTIoqufvgxG4uIZEnbzFkql9V7ENLG8pt31TAN3eGSE03Il9ZjaH50JMpT_=s1600-w1600",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPdYv1hp3VTkGtuGtfnbKPSrttou2CzZzLSoYasGjnGpI7KSfKjnh3eVf_9gJ54cRPuGXeuBcAV8W-NquCW8kTSqhHSWbwapVru8Igck9kK6YeZsEXTCXzQ6GUT1orHtMIow54S2176PQed-Q=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOtNHedRpA4gR8-m1Doj1w81KfhnY1d-TQyzhVzLBcrjyq2WKnOqInR6vi1eE_A4BdSch63TwCtV4NWxnaR0_Cx9cRjsLqF-7RwxrkZtlA9ftEDfXoIP0xkoeCIG6AnAsFtr51XZJ4MsekeBA=s1600-w1600",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMmcBmdFjSQNFxJEidFrQv6PYteMfByFvZdQ6HwrCYadWrmCIzvBHuomirXM0Cd4__P_tMrUCNse2s0QPp_3YvGXUlfATPGo0VlsQdSadXnAzSXL-Dbs4MPvjF4QgVfw0fF-tJ3_AqO5ztCeA=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOEF6Lz_WD_2VMRC1OmNS1-q5-5qw0nmvxEohqcoOv-zL-uoEg_2ZyWDVuGcLMmFB_O4kse5R1efSQ86yU4sDn9Sl7yv3uhHLxf15otrNfui7Cvs7KUM5Xx4z7zvvHbjjatz5rzt56k99-6=s1600-w1600",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMgAnjkeKGZn-aHh5UpN7qzSuE912p-efhPhBMmjpuFH1qtpPiLAEbUw0nbEvIS5o1g7FXITGRNDb9lTeNemIWeoSGouYlOEkyKwyZO0ScHNrj5y-zT8rSZ5hC0owd0h_l4kDWoQrYdytNvfw=s1600-w1600",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMUYFjkpRPF16Um5o53iZR-9pp1fZM3Ut8sJdjTx7Hx3GrvqhvkVjGhMwSMsCATWklvMGgjYHM4nohufjQSrgMvIbRbXcxnAouu0h2ycSDHmZtbfpKkMkQzvZZ_TbuYuql2UoxsuFi_nIcZNQ=s1600-w1600",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMSeM6eJNpGy9M9_eHfRvm83FmoJgtV7TwcIYQyYl7i-FeBIqQWXGcxdirInR2OMrgWVbq9Fjt4kmHzFsM03Lje24eVgmIEKw8euCkG_b_Vx3MUBogORnL6R0vEpJVd00-udhcvTArebx49=s1600-w743",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN462ARwbDkjmg2N_UzljjMwW7-6FQSxcZdoFZoqSoQe0Wt8bWrqAsvkje1zV3FhNZPqJMecwxA_Ehp2IJzJQG-CItXV7lkr8dlolkbpetgHMjDX4r06iQmkCJ2Lct_C23S3cwXtclHiakq1MY=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Mekarsari Amazing Tourism Park",
            slug: "mekarsari-amazing-tourism-park",
            categorySlug: "wisata-alam",
            city: "Cileungsi",
            province: "Jawa Barat",
            lat: -6.4116044,
            lng: 106.9879952,
            address:
                "Mekarsari Amazing Tourism Park, Jalan Raya Cileungsi-Jonggol, Mekarsari, Cileungsi, Bogor, Jawa Barat, Jawa, 16820, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 40,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Mekarsari Amazing Tourism Park adalah destinasi wisata di Cileungsi, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [
                {
                    facilityName: "Mushola 24 Jam",
                    placeName: "Mushola Mekarsari",
                    facilityLat: -6.4117,
                    facilityLng: 106.9881,
                },
            ],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO6LpWcG7pAwcp6AP1U4W3KPGsMfkI9lBSc3H1wTxvLgo8n89hQOBlPO35cQ5Ea9qI_LNxZaLCyR02YFYzGkIAUtaWEncAGrzDWRfZgc2OFehUjKrXMDJhoc71UubuS-jWYWehCQ9BQu3w7F_g=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO3PefgHJhyOfy7xKHPG9Q5btdDfXzEWsSmU-XWP4GitJEkefGgkS4B5lKs7tmCAbijApPfZqMob0P1-rlAFEKnrmJgn2pEBjdeRXckZq-oSDtMfxGQFQYV0favCkZaTBNh8oPBUa0ChfVdCh8=s1600-w1080",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPgTkumYOrxBOXBz4JpKtybo8zT86TdJ1S9i4gAQ0bq3-M_mUTSNtQ6ygVwIgO9Tn98VKKX2nEsangqzkw8M70fi_BeIRYCRN_lL5PGRhVILuaUhB9cyjJQS4bG4VypMY6n6SKNFNub-908eg=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNdLw7rJaQ24Rwx-fZKZwVwAwDLLTmKN4p-bTq5us8e0oFosTAdS0wz8Sy12IG86joTZ_X3V2sb4aKCtBqyi4dPTmjNGF_y_WuaP-d4zghBb-r5mpq4oxAuE4v85w3yUjy4MKqIGEGy78ykZw=s1600-w1600",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNgWGnRrFRY1SZG8aTFh4Ydoopux-Wgfj3XXc0UEMHupQvPzOpK8PwmXh4vKmEd8RqJkcVR1LrnTGSaQXdgGNKyqcQDaIdQqMsjHxqbiT-8e_9AoOayZNu1Ei4je7XsXNmRab5JskdcYyb0yA=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPNRPxlguMHEP2zf4ii99oc9asJfI6ZAtHPR5Wk-beCLN0RVb0D-aT4DRGKBJefdTfMLBF2Znmw1tjkrA9vwB8iwaRzem8kEF7J7FZN5Y4GkfMP3Djb5vtrL9uPqbZdvd0toXFhxnQ02UXXNow=s1600-w1600",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPqEscCwj-rNXOQblDW4ViFGjLTFGXyq0uMWdZYGfwTEFj4AIRnhXBaYvYBlDyJaT6Jb50vx6WHEis4fiBwhgN9mFUMmQQX89JMV0ieKspCR9huWZr_M-5BXFyukY6_iulV2rTL0TqtGxx1hg=s1600-w1600",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMRcm9u09lQHVeWI_-THRKNhgn5gTQftqB04JWyPIJ9mFDzMa2G7POeZk3WihxNbsZXR3yrBoBequqRRPJ0w9xl8ngYBdYK8CKSjqQbLfRZY8gxUDRtImiEqYE5y9MKJDyL0LBW7EBIdPiIPA=s1600-w774",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNnNn3rNF-_8iy6P2jEO2o7uPy7kJQleuv5QXOWLr_k4ibZmVbqMoW0hDPdJeFr2Ni6kIkhy8_SaYfVuXdAfmhIVDanI5GT-ddhxme-daPlRqb0ck_50yfQIqH9GOvQ22KE_G9xl4X7mxv0vQ=s1600-w715",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNn_0y9TTX9B5aaGXUdiYUWmZkz4DYh4NCa2BnhM_ZhkCxWYC271xjXj_dFI9cVaBAYlb8MlMICJ-lu9iE-M4amGuC2Qj1QAa44wwhSrFEjBuU2i8UuPqCJOhQtEOiWtieAymNUEngMko9q3Q=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Pantai Pangandaran",
            slug: "pantai-pangandaran",
            categorySlug: "pantai",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            lat: -7.7001927,
            lng: 108.6557911,
            address:
                "Pantai Pangandaran, Dusun Pangandaran Barat, Pangandaran, Desa Pagandaran, Pangandaran, Jawa Barat, Jawa, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 10,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Pantai Pangandaran adalah destinasi wisata di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNIPRclD2YntXuLzqmerWa2k9QnX_gsn3OGBSYA3QTNLyREU_g3pwIkGFWTBxZGFU16342viS0R0jUaR-NmFvMVN2YRsxaVS-luNfdzRa5arVpE_uAxR8DRvhym24fFZnRjIh9Z-aDdH0FUTQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNJJ6wJN2N77ocl6PZHEQH3cvri5EIa3V86H9CNprCG4NaCVXMUcCCADw7hnG3KEeU-BchoDNfeOXmfKwXwAwSteJxXOW88SK33-TIiVmckKEIzj6EQY6P95_ReuO_9Ohcb2mkeJmdj8rTMhg=s1600-w720",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMozs2_uhhUmcOdVFKfl1gMWrofvGlnjMqtVD81zVYBLX1z1R2qNJpO6Y0Y3pB6zBLPJefw-InjxrL3dvB9MNCIMihJvmuF9VMFGFefRIuUD3K6C1IXaIH1LXPcCm7BGJ1Ru4UStGBoPOcv-g=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO098cPAXB6GqPxJ5gvl-beqhq9623ixouwv-qdjfImeMBzL9mqRWxYUDcYcALl-d3PLXT7X9qjTUW2lBUmyWD73gPmTVWlO8wMYlUqhPpC3xLhwAl08NLYGy829SoNnwjTXMjJtHtyvcnUoA=s1600-w1600",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNtrHaH6mpoBUr5QKRV0PyPK_0A6K1k_JC3cXrLB61h6qJuNZARMWOM7TJ9c-NtFcSEXUCOWJpG8fAeZkFAkPppgHg9Vhgp7SF16-p7KOHoEhzwi6we44CkMx2xpiMTxfqAE3FVCE61SefJ-9s=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOdOgJd38OKIKOE39k_jtReOaT3nRAnN9KB9FKaoCBriAWiHCJ5TS_NnmRx8n4uh86VYo-NrbHrHyD5MMv84XpzCEzUbLWMRMXoa-Xp_5XIRWxmWDU1xKz67Uo_HXj7fJ3LPvoXvR-rigbSE3A=s1600-w1600",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOYeeJOWQwfkGF581RPKxCVW0Xp80oigmQZstTMJ5I518Z4RfulI_bDpVmIgv9irxVQVIVdlgx4Z1yXAdoVpL2bqzrrf14Q-K6tkmQZg4tmUzPHkfofm6u_JsQ4DN4Whx-XD0ePIOBiYKxfGw=s1600-w1600",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOtMplTUjqlMkLu3rJkVH8_rAZgqPsXLJMEyZYr6B-0IctR5PeOTQhO3PDAkubOtt3uWH-8A7yvZ_p0VGNRu-jqMcdJQclqVi0Z2owSrJRxb82uhS0DrxJ2B-lxRiJuPv_qPI358wM-FZ6eG0o=s1600-w1600",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN7DSagLVB1ppC8M5zhes7mCXlTTh-Rx7VzdqVCWEA4AiOzxlfVRfI7c57zS4Z5sR-61ZxR3GNirTTapkOhRVq-s_qOtyP7lDlOUp4Ca94eSO1ryAXkmWqic8rjwZdVEgfnuBFF566zynHCUxneff_bHA=s1600-w1600",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMvXO6OgXX_Mwub9YI1qQpcISsddpAedSF1Nsg9RnSQu7O3IlAPO-ADA4L6T4E99M5d3HNFZmgAttkeOOnU0daKDqLj5z7Es-3j-o9Bv7682WFazYFNAr9xLV4RnoTwA1Da-IuaXtbr8rWshA=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Pantai Timur Pangandaran",
            slug: "pantai-timur-pangandaran",
            categorySlug: "pantai",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            lat: -7.7031448,
            lng: 108.6586093,
            address:
                "Pantai Timur Pangandaran, Dusun Pangandaran Timur, Pangandaran, Desa Pagandaran, Pangandaran, Jawa Barat, Jawa, 49396, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 10,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Pantai Timur Pangandaran adalah destinasi wisata di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMV58jdFHtpZJvsrsUrjhNDmKSjO-bpJS1sOWg6bQXlSTtiOvpK-VejvwOPM-Vbob02cXUTZAUbt__AqnnEA-H2l2Z-0t5eFz0biD2ia9D2wJAhdHjPFQzhmGoHuueM0PtdqbxOEPtvcDQD=s1600-w1440",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOInq6C2F6xaPICxDgshdpstJ-xbhRmmw1GTbMU4AcW7D1sYgKgjq2D2_fazPrZs5FPZO6P3J_tkEav0ZAvIuSmM77QUW0XVXn6utF7neRiJm58RsycdYI9NUMmkE_SmZb-XF3uP6VEzQgFl74=s1600-w1600",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMB5LUthgbnWaAENjeYdgno0LUh4ovghG2y2YIOnOciiIp8CIoULbJ0o0fA0jBJsxG5uubmyWzg2vR4i846P2IHtu9BEvf3bXoCS3k0Bkc0PcWxsHUX635rgR3Aov2wWTQRdDgFh9Ber0uKJA=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMLsmIYz2JeJp5O7E1-zq9dS_zUzKE1fcpE6XiqeO61TTzRxNqQ2MGhfoPfJNHat7cj4KWdhqdPWfuVQYlw2hfWyMUc3ljKvmJLKd4NdjVsjcmL900m32VUyUOCRu7ODdBIWT4pXkhUH4fH=s1600-w1600",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMNmCPrLjTw0-phtslHQ4nR4-rlmWAqi3QyGEvrMnuX1zkjDDHlRzxCdayhPsc1sbmUh0l40Fl9ijzf0OCskoMEWL379v8B-do67pOomh7Y1M5Lj-WodbZi-4oiHIiws4I8Z55usTBFd-ixJw=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMT3OnY1JGHHxIs0_sAuT3acZzstUgI88VEEK8cN-gbBRSbd09058AoiZs2hI4nV8xPoB2XX919E61ClXw2ck_qxcQnBTe8MWdKlik30cpcM8D4FiG4_3qMU72hEQMmRBq7etEoE5Tzx2DrUQ=s1600-w1600",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOkCHtWLMMQ7ZyrsUAy2jQjIi0YFrD__w8hFlKpKpYbaEjFxT5b9uZy5YZnpQtx11X9HUOXgcoKORm74YNQ2YSYJcJXcCxVWSQI2QtUxxPuCbK4srftZCCIlDRitC0h48xN3VjgljJ56zkKjw=s1600-w1600",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNCn6R9-gKygE6Xu7xN8E8mMdBZvvQHPje0rZSc5WcgKBcKYRYwSDzS6WKQIcA57P5yb4toayitiahs7Hd9kd0j2bEPVpIPGDa7HHn1M--r6dJUOzQ8dzKy__GBVeGt50J01HpdBZTqT1UVlQ=s1600-w1600",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNAyVEtzxfXfR9njKFHf2S8Jiwqmp5ygvyVTqCaY9syGC3j-4nuY6gdPoPBvr4lbX36jpa_HaGTPS_nR3qMOTCi9rqES3zQyBmlg0-Cu3aW59N-gpkdOhWuMAlPSR8Tt0pFs8cBzfF_kKS6=s1600-w1600",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNZVsnznMz_YAkPLs3MwsALrOPlST2lNAYt5EpmPoLPImD7mZVMKqkLBgwj4gxuluACrl22_Fj5mNS2ds8V4ygNaP41Y5xMJepnMaakrq1pSwTowpAGkhQc5RPQDKGDpCBFEbkftm-CL5VF=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Pantai Keusik Urug",
            slug: "pantai-keusik-urug",
            categorySlug: "pantai",
            city: "Buniasih",
            province: "Jawa Barat",
            lat: -7.4285373,
            lng: 106.719932,
            address:
                "Pantai Keusik Urug, Buniasih, Sukabumi, Jawa Barat, Jawa, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 0,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Pantai Keusik Urug adalah destinasi wisata di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO6kWHCSTqdSfMIrXGYgkhp2PS55RmsMLNQTz1G7rI0LE-Yb3DyUlYuy-924sEcBGcxuWHfB69MQcTh6e35VvQp0-Qgkji6t3755H8wmcIW5qhyrsKeey1_ZlENEcow55pG3-EaahbRoGZaYA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPtKKnscwY2RRUjI_yeBn5grTMWUdHRBFVC1rM5zp4fE9FhU9f_HELV-KQc7E2ZhB2F_OOs0XE02Jo5Ua9CjaCGojhTtiCaV3oDL7-mfoeQew7FC4JgGyhx-2XhmfKPscyu_IR5v35C4-0sEDM=s1600-w470",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPIrcTFT6nGauHy4HaLEpsp1i2zgKebebGCrW8xxPwEiaByIwW0zb6j7cLM9lwntT_OxRgM8nPsDvvjzQbDjXl6bZwP09p0-hz0FlS-ta1BvTqL4wjHUXTvF5ilzRWADhzasYtREMtLwRpQRg=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOYygpMSJ3wwJgUijrDhe1CiWL-Ma8wu0GSXrpKUInAKITo8QYUVn6LArSxxhZWBbWnGEeCX17B0NTgqo5P_qlwJP1oPLOnlEC_V0HucCdDZiBz76X0R7gOuz3vRp2TgHJVfASPnX0W-JpZbq0=s1600-w1600",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZORQG__3PD2EzfwTk51uHzX7WHCVZETRrcv-XsRGQrohETt75aasXmleNN6EcfmxcvTt5RK5SLpe-56YjLEvMcXwxe5qvfnrSMIJ5uKmlAComYY5upLFU_JBEGfD9ebT3ioPu876O761Eh9YkI=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMj7SQCxzlYKV5T4CxEQWgh48v6YZuRJJUU_QU2iT1VomenrCmzw1vdj4IkrXfqasGMfJCYPqTiUCabCg1YjxVGbb_IicINFtS-4iDnY65NP_--YutAZgo0OkY8t-MX7C_yvzkFkDs_aW8=s1600-w1600",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMUi1QnfNgLJQ8GJKdCmZcObMp9BvF3yiiXMr2HnR4pJWn_79fgz2aLgmzTU3jFgVczk6zRNhM1sRz5CqOWCl0UhZEI2gz-3dSbozvJUpIMa8KhezO4zWXaUtRxcIrfabclCEIUOyRDJNnXGzw=s1600-w1600",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO7d9CLzuD0aTkZIMJUDKsSS-dbPk2ZbVOCgQzfxR1JgFpbxoMePXdvAlnAOkUQJjkTpSm0_buuqvvVaWuJEA9TCwvCpFWbGIdbSynGY7RCGEoX-OYv01gw0vUtNvgSCLFkMhJgSBeVmzlzuA=s1600-w1600",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMleSkUp70Z5JHm2ML3XZocHh_SQCcndsGVWzbdTHiI7k1xO4UyUuU3YhXFJtezC9UzLGXRoV4qR5ktVAYL3DISQ-Ms1R_bRDktSWJXdJrWrCt2WJZKDkUp9NShEqZVyQeHZbWqrvhyLiWxYA=s1600-w1600",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOmPwTlIwKq2rJG3Hk5S3Wsu8qoMBkZqKS-Ab6BBllcsUYHbpMQVij9qY7EC4h-Tn-byI099okfttyEA_-9DdW4f0DtqzvvKJtc94ECawuQjjjXnfAtSqdceFjXepA8I-9hBWhQPzLNImn2Kg=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Pantai Karangwahu",
            slug: "pantai-karangwahu",
            categorySlug: "pantai",
            city: "Karangpapak",
            province: "Jawa Barat",
            lat: -6.9565931,
            lng: 106.4639718,
            address:
                "Pantai Karangwahu, Karangpapak, Sukabumi, Jawa Barat, Jawa, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 10,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Pantai Karangwahu adalah destinasi wisata di Karangpapak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMpRMtKgrN5cIyrMxS8BC8XGyXKa-cUNT1MlsFCzBv7_oaWUMRI5IH90r_ntI61ygSj31r4BkIB0Wcr3NmB3YW51eCYUzYVC1Uje0dpBUhX9IhtSLu0PTjyNHub89AH8foo8CKtgeSgv9mJ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNdCILNJHUiAjb-XGoirnIk92JGg81F2qfY0F0s7cKiOlzG5DKmauFY8M4Y-YMnmQIXvfj5oKfREgQaL2cvHIxoJVSmGk20a0Ma0eRZbWMkLDia2I2z-Q6IOeL-I2oFQfRWTw7kCBc4nP0EAw=s1600-w1600",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOo8qwDIFUQe2QVnKHqId6EmfxL9D3o0pe3JiJox3P-DMjQvg7ZAI67v3C7xe1mFkdE--bZcXNAxe_ZYZ_1VvNIn9uc0xgQbeL_xnhHD3CvMmNuHBvo1ZPBh_rTPpejDOubJ_cw0o834-MN2Q=s1600-w550",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPcfeb2-10YA5_xIY2wVskV2IQVFcv8gLCtpho8zttBiOSaRLX4FruUdFUl_-iPNf_4WdhRRU306HPCHGmULk7s1gfLXE194WdlO6AAkRpVQxi--OpOgJf9lEvks9jY8PC0f3HPzhCtIpwKGQ=s1600-w1600",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNciRQEvDL_YPwvXifODMQYDfJR7y89bE5t0Bu_Ff01Z6ZRrzAQKk8DWJJjELVyQ8kFlAkA8YaTsBO-K4uqzpdaf6_ooW0a2KCfovaScKyh_waolVC82hKaRhQdyz_CnvsnkVHFTmbHN5MiuA=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOKSTD9boxFEzHw8C_7HHSiy3yRRON1MztIqxOVgRvmV_1gLEtCHog1bJ6-WnEPBmQ0zX5YkACEQXV3OD-ARuzqsAUblmYB6Pr7B1gMGN4xgQ1vTpmH9eOQ40LXJ_XxJI7z7mbbF98FRgjEMw=s1600-w1600",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPQJ8mzRpOcaeLL-BqW-iqSvDgBxTx5T_OjIDgbazmXZtE_e3DuvyVUgjwr_IzUNt9J1S-OaJcLJ92hGGAQ1fG3VElHSjAjdLyDY4uHAQlk-Oce-XpX_r5VJtdCUj4D3eP8ZOwSPr77s7ssWw=s1600-w1600",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNnstl9f4zYqFf-OR1RKjLR1gUBbhVxfJ2Okf7Iz2u5Kpr5JKMby6BuTp9x7rLwDqYG-K_ngnU4xXs3PsCYr_ceBAv5roZPDshSlWUlwkEa3BTNbuTcQ47-HCxccrfW-bYRd8EkmBKQmLCt5g=s1600-w1600",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNLxpePRvCW2-VJ1vVVjEM8sPucFmLDP0BSE80SBg0ysBG27UggegLagV0Gb4zRJRExs5k0N1E4-yhGrHwGiNyHOH3CBHzdCKUlGmXCGaJJ11kimAVHK3FYA0AnYwrA2y0U55xon-Tq2cWH2g=s1600-w1600",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN0rydAlgZIhymm3kXRfjcbrq2sVyu-axT_xMyh_r35j6nlCF1GCe3sT4-cUCM4-Sv7PbtiQJXb6QytCqvHDyTwJ3tezWAv2VRij0V3GjXqFBWg-rZLKyakxJdw2yEBQ9DkFRUhmfC2ylzrqMo=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Pantai Cemara Cipanglay",
            slug: "pantai-cemara-cipanglay",
            categorySlug: "pantai",
            city: "Cidamar",
            province: "Jawa Barat",
            lat: -7.4992418,
            lng: 107.3529598,
            address:
                "Pantai Cemara Cipanglay, Cidamar, Cidaun, Cianjur, Jawa Barat, Jawa, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 10,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Pantai Cemara Cipanglay adalah destinasi wisata di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOFokI1dAoR4Hp5efKamwJ_R6MOFAGFqzsFf1fHZd4PTJN9hQZgv8VMJtssoDrVvd_qD-33OzuSggND9GLQ58DmtjzFsGNLKNwoF9lv4K_pkIhs9mcGhLboFPuDeoov3aGDDDJgpGCRMRBQvaOozZrD=s1600-w1500",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPCQSUXWQSSfPDpCX3Bu0_b51tQopGSkLDAyiaRaL-Y0gKP7XJUW0I0aphed0PlFmkjYRgen0odwBEIrLJ5krnbn0VrfgvKRFuK5_E5rsH_Lub9nHWk6rcZvIq0IR-s7mqINzeIPKahNELBXAo=s1600-w1600",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPb9mL8UIHOX2O4HqEJHfBefkMch9xbbqdzsCO9rGVcn0kg86Z3-78EBUKJY9Ilc9-MYfyXsDB5lsDJFXZvuHZ9RXxqBUnVJ7RDE6vqD20Yeu-S6-hhRkAHzrCchLuVy3OVPecqiByie23jQ3P6Z4Xe=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP-n6oPn5XjhoaPKB8h28CYRQMUTGQB3MWgGoPDPqWzVN4yY5EQPU1QA9AF1HuU2OGDnSc89B2lrJntIY3Yjl8OB67VPn0Q2a7iX6SlTO88XOBqdpkYVJOznl6p5Xk9eQUy4SRbI2irwAurzA=s1600-w1600",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPJbAQL-URpmvdorLcN5xvdgcJ_Uf8PheHDkhws3gZlBA_w-hlCgmYlhtuzh4004Uv6G9maqpre5XQCk9q6WJLsreTW5tqRqEJaN4Bt1r0W5muKH-d7W3rcGMagM98RAuFq45uVQITnncKNGw=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPpiW9NIgFDhYHQIeTLwzMVu__PSWfzhX3f8Gatbk8bdgVwBsIb9Wrj0h1UvsWxHvdrwH6iVLbqowlIBoGOPDeoD5pbVHekn48GoLE62ZWyho-ayPcbPo9EtMdsoHBFz7GAg7nN55A2BFrcOVmykdXWww=s1600-w1600",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMIzdx7RmF1Z-ToOAsFOTOQBdxxBbVpM8gKfuaoV-U-3A9xaLbeS2lR8Lc6sqA39PmYINWIgrqN9dsg1x--WHjORalrnbIQJHRMwQfuhFB5rOn6SgngK2uhcn6tyvU1pcw8aFKwW0l-LPLUasUEd7uT=s1600-w1600",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOJY-_wTeL3wPERwncc3fygPiH-oHF5fB0Uu76w8cyz3mHZj5bOEsEQTJU4X0NebBR5CwlMeqFQwHsxJQeMhpoA9F5WBuzVqs0ULVPlAV1iHa8IjtVkyTqJDDzTodoiyXYVzHx13gds2TRCo_Q=s1600-w1600",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMGXPDirs1gMN6vTpJIk3o_97UvNq1whaDk5lx14BgplijGC25nvcerdW3CY2kLG2rgxG0AN0a4HRNqREy8-tyAWCNbjrigADDV0Pj-ZcXO0kVkAmKWnKPf9pTP31tDneXOlS7vusy7mL4roQ=s1600-w1600",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOjSW2NdzoA6f20DDnVDkaHUT718ZDIqVUW73eE4XyXoi_T78x99heGNB2ivDDUNsSBllteDVyBjR0ZzeSwhp2xYTPa6fFuJcVlCHOx59AzN9qvlGLNbssukOg3zCxn1avgBAsZLkwjaTpuoQ=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Taman Rekreasi Wiladatika",
            slug: "taman-rekreasi-wiladatika",
            categorySlug: "taman-rekreasi",
            city: "Depok",
            province: "Jawa Barat",
            lat: -6.3716936,
            lng: 106.8931148,
            address:
                "Taman Rekreasi Wiladatika, Harjamukti, Depok, Jawa Barat, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 10,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Taman Rekreasi Wiladatika adalah destinasi wisata di Depok, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNheubOxy0AYI-SlARHlz3dpa0FKEi8UXCVSOnp2U-XsenhEyPtUZJ4GzRF9aDIMpRULSSB6CaB6UlSus8DSyu821JY2qW9fYDn3KXNySfw5zHCa3PUBkW6LF4YlmwdZbc7-DFk7i2uT6ZyJA=s1600-w1080",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN6fqi_ESqgIzYe4d3RKHIpQAEJTUBdcA999MhBsg_NvdYj0DXY7SLeEVlPcCzMujea48uGxA6Y9emTGC3mVJuE7I9VwkPxUtEn-hcYkxWlwhQsWh3pGfnlh3GzmNVR22xUWEG0Tcv_FbyqvA=s1600-w1600",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNbQh1ivvHPP1_YdPNhxBmOXsBCYTmyoMseUCzV_wTOn7eZaKFhy-FhIK6FdKF7PiKeCCZOYPw8q8zoYJT-0TPqQgbpoAWuwMqpID9hOFQLwDnBNeo1OcRae8v7vC-CihTeuOuQaiMK-1l-0Q=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMU3tMKUOKQRnoGAPlH8_hammZaeBND4BRBmGcj3U_9bVR6eaqv9w8eXxuqtNB3GdxXxkRrumLHNwYRYKsTAcghfNb-lliOxzp2DPMT-WvZEI4xyrTS5f7mq7FAGrb0CHglFIZzlHDKGmXZAqs=s1600-w1600",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMp3LGHD3IeGZLC4RqkP0t46dAS4HHOlLAmdEPoGvljAsmWIHCNVyy8t1IZfJX0QSd9S-U3SPqgQtDegKRObco-mz8NV8r-KeXCtxC7yDwNx6ThmqNV_Yc12v67zXSwOlaWxkqnACmEzZjcqNc=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN5unBBKsQNTEI0fHg4zw-ilAH6Xr3j7NwTtHfl1SvCFsekMZU7Var4pL-FrxfQKyY5cQfb-sZEgldlVAVInj_A_0lPVMxLlIzl1ZtsnmNi9TNCw7DMODu1a7d_NPY-kKkld7mhPCoafysL=s1600-w1600",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNDpB6iEOD2EZDJz4LM0wr4S2HUQNbmGBo8H0Vz_MvITKlNjAGrSVyh0qEz7D6HT3vIoMmX095O9Y4L9Cw94fp2UtsE8fuQ0-ZEEZ-I28Lw0pidVXgaW5uYJwXbpRidL6useh_YKEpViMQAkQ=s1600-w1600",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOGdl-GBVUFsHfJyXBfHjSUO07qi27meHdXVdhw4ojdxoQJhGWvkpennz1d1k7gkGZI4xNVT2J5v18lr8e6DzFMvshjmUGJyKoq0l4KWMb_vNjaYgOeeLACYPBqgg_3-_IKpeY45VUJKOtPuQ=s1600-w1600",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPGsjQP4XLKyPkI76VHISUWHrsp2NGNOineXDRfaa2WCmbX9cj17I3cB60c196X8sfH6ooPtScME2am2667YyPc7FPZiFPXqnkJaya2BdwRiCv45qUM9wT53xOmPw5SsmvcmuFvnqwqgpECfg=s1600-w1080",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNlBHM6o_f1j48uUqeN3JIfgrwsKRa6GlK-8ZJAJG9baLPfFG4Snn6DUiBaj4Kx07gCSnwX8SDyvTzrHFXhgjJINvfdsRCFVJ1nXYH6tCNA04N-NclUTiVSLrQoWIMGvoCe6oxLmAeElEz5bQ=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Taman Rekreasi Air - Fun Park Grand Nusa Indah",
            slug: "taman-rekreasi-air-fun-park-grand-nusa-indah",
            categorySlug: "taman-rekreasi",
            city: "Cileungsi",
            province: "Jawa Barat",
            lat: -6.4277504,
            lng: 107.0100255,
            address:
                "Taman Rekreasi Air - Fun Park Grand Nusa Indah, Mampir, Cileungsi, Bogor, Jawa Barat, 16820, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 35,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Taman Rekreasi Air - Fun Park Grand Nusa Indah adalah destinasi wisata di Cileungsi, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [
                {
                    facilityName: "Restoran / Kuliner Halal",
                    placeName: "Food Court Grand Nusa",
                    facilityLat: -6.4278,
                    facilityLng: 107.0102,
                },
            ],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNjox46RitBSInSmchORRYAwaNEurXAoVACHGru-MGYxCkKMvy7kUyijPbNyKL-XUDAsWbU4px4aN3sTx5PLTB5pX_9hFZaCQpmAwnNH7Vf4pV0qFWmrKJPcPU8XxkhPMUC8WcP76_dTakx=s1600-w1040",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMdum2SRjN9zQNA9_bpB59WzosoB2SdkpHvPgaIpd6txTiYqNIbS3hLxJQ7llelSYeRUQvsEHkgdfJDgNhnc1Vo-rCNHIRaMpwaYzvOVQRLovskg8nofhdZRchpC85Gz0-NjRB8pIQybcObeA=s1600-w1600",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNdcAjyzAEo-iHCBtHuhCRaJqItJGFPF2MokBurtGM2VmW0jBc1ZCxzeW7ItSDmU47gSrmtTtGn7AezJeX_EFrtlyal3YMlUWOlBAes4lEdGEWtXQVMVmf3f8xYl_OKsBbZ2jPsNMGWOprukNE=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNiaUAn0e7NB6l82xnSghcz-dihI2NbZk_zMMqWXX5m1KBOUhB9h9RIeqX80ZQoZnQk-qZEiBv-UkocX0o3bcITqsLYdCOsnUSWXR5kaZ6LE42u3fWFFtwSp1cvIpAUlg2ARcyX49vJyKuwzw=s1600-w1600",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMkQdBl1-ArHhOOxuw0KyFI0qwqLkYkrNJ8UstzJp33e9-JtmlzZ95n8VsLLtGKYJZ-1A8u427VPSC_2aREQD1rVpMdfC1dsqh0pqtp7rOoX6T0HsRi6VlDR9sr5RzzG3mnAUHi80UWihLa6mA=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPS5KPqnqW_eLlknd9q9VrVpPynxqsxTQ6yaJFPx566ieJKCOpVbQ5Cn8D66YHoLh67Ms1tx56SrGOA4FrDnO9M5FovN7ovzGLp8glPA3LM1_b_pDioIYdLT5s_r_ULnOmlMvBoVZZFfP4_=s1600-w1600",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNSBupFlNiGTUfn_BsXcxWnyrY_QscUzV-Ijt5jN3oKKv3OELjHuPhCUMPRhh4DB40iThigKIMJ7oBBbu2ZFyoEsinhOL8TsTr8n5kWauiCwhezHNkmiJzsFtp80p-xZe03KoV-fvnUFKsUghI=s1600-w1600",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNtTbK6P63oB1vWk5t_fODN7htXKwa2A4BmlxaNa8UNGsc9-K9f5WQ3rHfqk0Z20RGmwmc2Cv0rui11ELrbpAnGmhjGwMKk30KWUbhXDc_7Zmy4lI1CitxjXra9lyGbJd9gBivyTI1cXuKUZbI=s1600-w1504",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPHnoWohL52JfeCcrQoufGZ399xGVhzOPgg1ITcjxsScp2N_iPbDBz-xJT4L5i6PbNP5XLZuW5got2RpDSAH04c1eQNdlOQJt4jGNM3jHegR49r02bHnU5vjXu8TkcFkpKr6PlCEGkpQP9YWMU=s1600-w1504",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO_GOn8Eknl4oXQIoQS3csCFAVGMWddqCONKRmML449H6ihA6luITs8VzbTCjcT28FJLc6SrFU-nL85BJXowGjg1g1UA4yDTtTqFn-DMupbYN_9E-RyxNd5dhqz2f7GJgQInrIZTFZzgmSgSA=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
            ],
        },
        {
            name: "Taman dan Rekreasi Kiara Artha Park",
            slug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "taman-rekreasi",
            city: "Kota Bandung",
            province: "Jawa Barat",
            lat: -6.9159086,
            lng: 107.6419538,
            address:
                "Taman dan Rekreasi Kiara Artha Park, Kebonwaru, Batununggal, Kota Bandung, Jawa Barat, Jawa, Indonesia",
            rating: 0,
            reviewCount: 0,
            halalScore: 40,
            status: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Taman dan Rekreasi Kiara Artha Park adalah destinasi wisata di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            facilities: [
                {
                    facilityName: "Toilet Bersih & Tempat Wudhu",
                    placeName: "Toilet & Tempat Wudhu Kiara Artha",
                    facilityLat: -6.9160,
                    facilityLng: 107.6420,
                },
                {
                    facilityName: "Parkir Luas & Aman",
                    placeName: "Area Parkir Kiara Artha",
                    facilityLat: -6.9158,
                    facilityLng: 107.6421,
                },
            ],
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO5Bg6TPyZE8cyrcsP7rr9kHJI4cSzt48QMs1uosorPRbvu7gcov2QVpJtOO5uSYxIRdcuriaVS32cTMjYXzoIbguYCtoKokezSC42pySUH0X0_tLfHeuRSSZGUmwmlXChI23W7prW7RAi0Ed4=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMArroF1XMbctNoD9jnhhEtbBJDQZyyUzKFbJjJ-Dzfg9j63J4oSpACLYbWtcPANkKVFIPF2Pq0VwPM3UfEn_W8pcM4h-jUwIC1Gq1P6fmZlu8LAzerbPEQN2Bj5NacG7R6ubIJMuoDUBIx=s1600-w1600",
                    caption: "Foto 2",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOt2KJ2V89V2DtJkEYsNcDz2CoeljeH7ER5II-vFad1b5mutRA3CJWUyFtkgX4DiSutRWajgXW2X9G1pvzxJ1RvL7TIi5xudqrsNWxTJgtRR9u06uO8riVz0u5tOUb-4OjX503jrskat9PpFw=s1600-w1600",
                    caption: "Foto 3",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOgPNiuoC4ATIWsQwd50tztphs8nLgJj8I1lHWIoc9jJE0s8jApsGxwahbESy8u8ePEkOXuBHVDDVBqV8aiUmV14ifrk--fcmMZ78UhLjVAgSV7-3LShhDeRo6MpCTomqzibBdS9yUisu0lofw=s1600-w1600",
                    caption: "Foto 4",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNmxGgIBzzKMp6Pq7_cjyhsHYx_Nkbfp2Epnh3B3EIQ-6okVMxOgnZiqkmN6uiXKbw-8-oi9iC3_-oEB3IPYkV65Iv5iRMTynwSaJqeSb1GEWchrfKb7dVWzm7J4pkDPbcc6XblA3Jb8HkFHg=s1600-w1600",
                    caption: "Foto 5",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNUVZko9oAGCCAVVPcJbNSX0yhTI7tW25KBsGJ7WV5l-xBOV_UOwUdsDYrTFov3kgVPEEb8GvL_cWdNJDZprhnS6kb8TgYdN1-ZilV6QxiAaNkVONjXXIAC_OncGp_ZOgN4-nxtHGG3BHkX=s1600-w1600",
                    caption: "Foto 6",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPo9P36qX70oDIkVJyXWnFqGaj5LAFp_sn5z74oBWv3jcGSDaqZ00G8sIYT8-5lJ3XZV6RcnXPFJfZ6ZTiPlqXAI7-YSR6_BsqU0BQkt2lEnjldCtO02utk3G8pnGYkNHAhQjBfOH9aSYczrw=s1600-w1600",
                    caption: "Foto 7",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPO4pIe3c2thSxmLr9vxtaSodIjnKdjpvEB6NfDy3sMUzFToIEfSagkLPSL0o5hmgRQdzHTk5gZk6gjbhfbc-tbI8-HZSACHYB6wTAyjNPR6_wZ7bIV_GJ3YUx6Z3Mh---pToNR3JVybY3zRA=s1600-w1600",
                    caption: "Foto 8",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO335718_dUvl9H1T21IZXC3HNFxbrXD51vvuhdIq9n7crJidGiFl0yCfbXzgEcoOlBovX0kXBzJD5ehWsPO9s7o-rpcm9fJXEBFl_5dUMon312ceFxOb9byK62jRCAJBHPirPJmWzaZVARBAE=s1600-w1600",
                    caption: "Foto 9",
                    isPrimary: false,
                },
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO2Y4wK5jtRrAnoueWDqqOrGA5E8CLt4GxpZqIWLf6egz3Vrle9JttWzzDnkncqlvqm_4K2G1jmuGTAzrVgrPasMGDElvARg5gJRaTyF_Kwi9rTdZvSYXDtduxuy_o2Xgn4YFW0gdgEZPjFpw=s1600-w1600",
                    caption: "Foto 10",
                    isPrimary: false,
                },
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
                    create: (d.facilities as any[]).map((f: any) => ({
                        facilityId: facilities[f.facilityName]!.id,
                        latitude:
                            "facilityLat" in f ? (f.facilityLat ?? null) : null,
                        longitude:
                            "facilityLng" in f ? (f.facilityLng ?? null) : null,
                        name: f.placeName,
                    })),
                },
            },
        });
        destinations[d.slug] = dest;
    }
    console.log(
        "  ✓ " +
            destinationData.length +
            " destinations with images & facilities created",
    );

    // ── UMKMs (dari cache) ──────────────────────────────────────────────
    const umkmData: any[] = [
        {
            name: "SENTRA OLEH OLEH LEMBANG SDL",
            slug: "sentra-oleh-oleh-lembang-sdl",
            owner: "-",
            destinationSlug: "taman-wisata-alam-gunung-tangkuban-parahu",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Tangkuban Parahu, Cikole, Kabupaten Bandung Barat",
            phone: null,
            rating: 5,
            reviewCount: 18,
            validationStatus: "PENDING",
            description:
                "UMKM di sekitar Taman Wisata Alam Gunung Tangkuban Parahu",
            latitude: -6.807240699999999,
            longitude: 107.6487065,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEVApPwWZemMLVLWn6u01IFwPOPP8M2UKSIJ4B6bAyn5Z_ha5Hjl0QXigMnS90BYMMhMx6VYLFv3oyROMfrAynIwwuuQMiMEvvmPNs8qZ1C3K5uxYiU1SG_zMLunAdMyPJToz0=s1600-w1496",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Oleh-Oleh Ma'mur Rasa",
            slug: "toko-oleh-oleh-ma-mur-rasa",
            owner: "-",
            destinationSlug: "taman-wisata-alam-gunung-tangkuban-parahu",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Tangkuban Parahu No.209, Cikole, Kabupaten Bandung Barat",
            phone: null,
            rating: 4.8,
            reviewCount: 13,
            validationStatus: "PENDING",
            description:
                "UMKM di sekitar Taman Wisata Alam Gunung Tangkuban Parahu",
            latitude: -6.7972861,
            longitude: 107.6533811,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFOdjGMrZhp80B1c42SBkL0itkTgf7ZvGwiGEWNfNlR0MW4RQp1sVpy3Ml1MNnzWpm2DDA6as54J5ItOxCAmKFVLVet0kz9f9iga3aB08CIZgEdc7a_quaGRBNRcbAIdy4FV5w1=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "PUSAT OLEH - OLEH VIRAL",
            slug: "pusat-oleh-oleh-viral",
            owner: "-",
            destinationSlug: "taman-wisata-alam-gunung-tangkuban-parahu",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Tangkuban Parahu, RT.5/RW.7, Cikole, Kabupaten Bandung Barat",
            phone: null,
            rating: 4.4,
            reviewCount: 8,
            validationStatus: "PENDING",
            description:
                "UMKM di sekitar Taman Wisata Alam Gunung Tangkuban Parahu",
            latitude: -6.7853644,
            longitude: 107.6522503,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEFF1X6wcgEyoqndxh0FbtH0pYgQs0uwO50-qlmnSie2fDSm6P0R5uYMycDjKSAOgVZBKoAcPNAmdShV0CNgkLZyzKr05Zinvmxv-kIrpBQiv7Cblxf2cA5vvGchpF117vNxKgfog=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh-oleh Lembang Olahan Jamur",
            slug: "oleh-oleh-lembang-olahan-jamur",
            owner: "-",
            destinationSlug: "taman-wisata-alam-gunung-tangkuban-parahu",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Jl. Kolonel Masturi No.286, Lembang, Kabupaten Bandung Barat",
            phone: null,
            rating: 3.9,
            reviewCount: 16,
            validationStatus: "PENDING",
            description:
                "UMKM di sekitar Taman Wisata Alam Gunung Tangkuban Parahu",
            latitude: -6.804062399999999,
            longitude: 107.57007,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGo6Ye2KxwhdPaBzd1VdTGT03eCX1zuzdRYV90wWPxyjKRLjfDjgTjZ_auHuFbfAUVes6yOIYAyRbEs0lpAw8jAx1zbqB3gj9trFpc8jmf50gAKrz68z03NW9jNTooZgXzDCx-B=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Pusat oleholeh BOLU SUSU LEMBANG USMANBO",
            slug: "pusat-oleholeh-bolu-susu-lembang-usmanbo",
            owner: "-",
            destinationSlug: "taman-wisata-alam-gunung-tangkuban-parahu",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "6J9W+9RX, Jl. Raya Tangkuban Parahu, RT.05/RW.06, Cikole, Kabupaten Bandung Barat",
            phone: null,
            rating: 5,
            reviewCount: 3,
            validationStatus: "PENDING",
            description:
                "UMKM di sekitar Taman Wisata Alam Gunung Tangkuban Parahu",
            latitude: -6.781509199999999,
            longitude: 107.6470979,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAE4oPJMVnfqnKytvcQO2OSLnCduv4mzFJrwkDW6wNXnn86Gu_pqjxnHQAYdT7hItPd_U6ZoIKS2o9lKjuahB2Y6_boTj53yHRsX1grG5PTjqA0EqtLfa01CjF8f97rbnC2ZB6REaw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Jakarta Oleh Oleh Cipayung",
            slug: "jakarta-oleh-oleh-cipayung",
            owner: "-",
            destinationSlug: "wisata-alam-sawah-agung",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Cilangkap No.1, RT.8/RW.2, Cilangkap, Kota Jakarta Timur",
            phone: null,
            rating: 4.9,
            reviewCount: 49,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Wisata Alam Sawah Agung",
            latitude: -6.340356099999999,
            longitude: 106.9028968,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFYi71iPK3y1nYapDkX5Jb3UGtTrsbFr4sSiRXvWhsXZfMgZp94UcMuiHREi8jG12E_b0sSS0jjHymrKK_OTu4Ba8S06UPL9BGhMdVvYcWAGW5IQq8H7uIdRPOUppT0AamKFGc6F6OxFoxb=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "LARIS Lapis Talas Dan Pusat Oleh - Oleh Mekarsari",
            slug: "laris-lapis-talas-dan-pusat-oleh-oleh-mekarsari",
            owner: "-",
            destinationSlug: "wisata-alam-sawah-agung",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Raya Cileungsi - Jonggol, Mekarsari, Kabupaten Bogor",
            phone: null,
            rating: 5,
            reviewCount: 617,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Wisata Alam Sawah Agung",
            latitude: -6.4096606,
            longitude: 106.9850801,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHoKyQul2u_Bu0Ioh0cmgcipLV85qy4cioejU_9_RkczXBQ1q8ina6ZmQgpWc1-QugSltBUiFXAX1B3u-vURwsMJMcAAGbWKUFBnDW25Bn60b4d9yBVv7dRcmBdpEshR_Mi4-n0gnZeU-oc=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Lunar Cake And Cookies",
            slug: "lunar-cake-and-cookies",
            owner: "-",
            destinationSlug: "wisata-alam-sawah-agung",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Perumahan The Address Cluster Deluxe, Blk. H No.12, Leuwinanggung, Depok City",
            phone: null,
            rating: 5,
            reviewCount: 53,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Wisata Alam Sawah Agung",
            latitude: -6.3990914,
            longitude: 106.9118795,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHwZElGkaeJEGZ3511S3ZfEpDcNaCEiDSEroEv3OKQ_SnoY3WOo4zN4LdOjoTFtSiKOSZu3eRrnpaj6M6VhF9ylCs4ll8RB2NW96cXzmIvWE576b9msUOOrzCIeONuWE_s2SOM=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko kue alinda (oleh oleh bogor)",
            slug: "toko-kue-alinda-oleh-oleh-bogor",
            owner: "-",
            destinationSlug: "wisata-alam-sawah-agung",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "samping pom bensin, Jl. Mercedes Benz taman putri ) kp tlajung No.4, Wanaherang, Kabupaten Bogor",
            phone: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Wisata Alam Sawah Agung",
            latitude: -6.418624899999999,
            longitude: 106.9349581,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGKyV4nqsA75nr26JagJPT--uKile56v7kgNnQEm8JtHsV37uL9B51iZplmaPTu1FjFjA4aevDdt6G-1KHzp1zfaqKuD6VyvSjo4zRccVDFmO2dYxg4TMnVy3HMsurSmFOIS9dTevEOU5LJ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Raja Oleh-Oleh Daerah Kota Wisata",
            slug: "raja-oleh-oleh-daerah-kota-wisata",
            owner: "-",
            destinationSlug: "wisata-alam-sawah-agung",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Florida Utara No.7 Blok 01, Ciangsana, Kabupaten Bogor",
            phone: null,
            rating: 3.7,
            reviewCount: 14,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Wisata Alam Sawah Agung",
            latitude: -6.360771799999999,
            longitude: 106.9635698,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGeZ11b26xLLub1wSMz-hLAssY2sA6YEqanj4drfuZ9Rj-eHqsp3hoMq2KsRJeWxAAEJTdBvaWj9NpUUnxqTbJYnFXss5-0zx14ZViKWdkl-7ISKO4kh50oBNgwmkRV2CRxfqmW=s1600-w960",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Kopi Fatherscoffee1 And Roastery Jati Sari Bekasi Jual Kopi Oleh-oleh Terlengkap Robusta Arabika liberika Grosirn",
            slug: "toko-kopi-fatherscoffee1-and-roastery-jati-sari-bekasi-jual-kopi-oleh-oleh-terlengkap-robusta-arabika-liberika-grosirn",
            owner: "-",
            destinationSlug: "wisata-alam-sawah-agung",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Komplek Grenhill, Jl. Primadana Raya No.7 Blok D2, RT.11/RW.010, Jatisari, Kota Bks",
            phone: null,
            rating: 4.8,
            reviewCount: 27,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Wisata Alam Sawah Agung",
            latitude: -6.3344749,
            longitude: 106.9476993,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAE1yKUFeqq4kKFfObwUG6J1TdM0HMp5pp0uyGzVe9f6bSABy_Mnde1j7VRLxA0Eg40XhkbnruyQExYD6VLk0nV_zA1djsjxeW8wwjgzfVkI9VUmKXCVxNzNzDaWORRZs6rdSYBn=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Al-fira Cibubur",
            slug: "al-fira-cibubur",
            owner: "-",
            destinationSlug: "wisata-alam-sawah-agung",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Alternatif Cibubur No.12, RT.003/RW.018, Jatisampurna, Kota Bks",
            phone: null,
            rating: 5,
            reviewCount: 58,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Wisata Alam Sawah Agung",
            latitude: -6.375242000000001,
            longitude: 106.9096453,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAH60Y-8RkNeSAcSdv4tp73VDFa0DAMvOwyroxb7UMYBQir0FpNFj8INQ6HkzyKK9ye7fEa04kO5ss-6Yh9MiKr7ZKShnjUcB7-Gykwm-YhV1HGU86-QnvLcmOUEg2D6Wv3ERNfsyEuAFT22=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Lapis Talas Bogor (Cileungsi)",
            slug: "lapis-talas-bogor-cileungsi",
            owner: "-",
            destinationSlug: "wisata-alam-sawah-agung",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Cileungsi - Jonggol No.1, Cileungsi Kidul, Kabupaten Bogor",
            phone: null,
            rating: 4.4,
            reviewCount: 143,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Wisata Alam Sawah Agung",
            latitude: -6.4072314,
            longitude: 106.9712458,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFd3AKLth9k-QgHbz_7WrVV-Y8wQW8ymOPPmbc43Ii7ijhtZ2QVKHyYvuRvYpZZkzGlROWaTBmvn9nIRTezR6ITo8BhI6Z8t09S5l3cKgVgN3a9VMOsU5baF50CV_Gx6wae518jqw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Michelle Bakery",
            slug: "michelle-bakery",
            owner: "-",
            destinationSlug: "wisata-alam-sawah-agung",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Wisata Utama Boulevard Kyoto Blok D1 No.3 Kota Wisata Cibubur, Ciangsana, Kabupaten Bogor",
            phone: null,
            rating: 4.7,
            reviewCount: 510,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Wisata Alam Sawah Agung",
            latitude: -6.376647699999999,
            longitude: 106.9589394,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAExoZhVy7CyNin-9yU4E0OGKulWLeonWIh96DKWaHy5MtJw3EcPxHCYeI7YOlOQWkdM2J2MwQXu7d2L9QPkFQ5IkqbsQTiVLg7oj3aGJZaCP9LoT_AhzTs_FmkK9pJjt0cDcumWOQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Langgeng Jaya putra",
            slug: "langgeng-jaya-putra",
            owner: "-",
            destinationSlug: "wisata-alam-sawah-agung",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jalan Rawa Hingkik Pintu Masuk KTM No.Samping, Cileungsi, Kabupaten Bogor",
            phone: null,
            rating: 4.5,
            reviewCount: 57,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Wisata Alam Sawah Agung",
            latitude: -6.397570399999999,
            longitude: 106.9714678,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEacXczHZxDJYJiuj_jv1krduTo4cwciPktlwr5euNbD6wUoYoZix8gPd4SuVz7YUosQ5aQdjK9c_t1LQgGiEnOKicFCeS4wkTzD-CkYBtm2UyWHOscSdBBlF0cAf8DZ5G8yo9r=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Abon Gulung Jakarta Kota Wisata",
            slug: "abon-gulung-jakarta-kota-wisata",
            owner: "-",
            destinationSlug: "wisata-alam-sawah-agung",
            categorySlug: "oleh-oleh-souvenir",
            address: "JXF5+F73, Jl. Wisata Utama, Ciangsana, Kabupaten Bogor",
            phone: null,
            rating: 4.5,
            reviewCount: 22,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Wisata Alam Sawah Agung",
            latitude: -6.376427899999999,
            longitude: 106.958133,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGO_WLsglVX9R_VY9sv1qqAPfOT38p6ibIdw6xlMstHb8d30dLLJXCsfLMD_GWoqqbFaQ7ck8d3K2tvFER-Ya7z_jc8RIhSzCQ_TY1gOd7vYczOuh1bKtE2VKeccoiDJTtwzeXBURFF6wkC=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Juer Lapis Talas Sangkuriang",
            slug: "toko-juer-lapis-talas-sangkuriang",
            owner: "-",
            destinationSlug: "wisata-alam-sawah-agung",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "ruko ptm, metland cileungsi 1 no.17 a, Kp. Parung Jambu, Cileungsi, Kabupaten Bogor",
            phone: null,
            rating: 4.6,
            reviewCount: 177,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Wisata Alam Sawah Agung",
            latitude: -6.3977662,
            longitude: 106.9728816,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFjA3cJTUv2WI_fSUPk4aZ0ktalmBvX_gincG3JEr3pkNWq0H9Kk-nZg-5IrSEU428Wsuewx0q0pE_P59xFfPVzS7o4tVSCRYeL-jFJmzVOQWa1y3K3rk22DjKziXxlVfVVzumzIQ=s1600-w960",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Sangkuriang Lapis Bogor Oleh - Oleh Khas Bogor Yang Selalu Di Hati",
            slug: "sangkuriang-lapis-bogor-oleh-oleh-khas-bogor-yang-selalu-di-hati",
            owner: "-",
            destinationSlug: "wisata-alam-sawah-agung",
            categorySlug: "oleh-oleh-souvenir",
            address: "Wanaherang, Bogor Regency",
            phone: null,
            rating: 4.7,
            reviewCount: 7,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Wisata Alam Sawah Agung",
            latitude: -6.4181281,
            longitude: 106.9355606,
            images: [],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Garden Berry Petik Strawberry Sendiri & Pusat Oleh-oleh Ciwidey",
            slug: "garden-berry-petik-strawberry-sendiri-pusat-oleh-oleh-ciwidey",
            owner: "-",
            destinationSlug: "taman-wisata-alam-cimanggu",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Terusan Patenggang No.801, Alamendah, Kabupaten Bandung",
            phone: null,
            rating: 4.8,
            reviewCount: 507,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Cimanggu",
            latitude: -7.1218018,
            longitude: 107.4269834,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHo1SlLIPuQagp2hsbnJW0UOaMI-nWB5BRRo_P6bvHeOh7RBzTghd0fXiIGbCNwdM8pgPSoAgw6moUrMvYp-C--ASzIQc1qu9RE1FYv7LczSNg4ez6vgq7r0KLdnt-_Iass8bW9=s1600-w1080",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Cake Shop Pia Kawitan",
            slug: "cake-shop-pia-kawitan",
            owner: "-",
            destinationSlug: "taman-wisata-alam-cimanggu",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Ciwidey - Patengan KM.9, Alamendah, Kabupaten Bandung",
            phone: null,
            rating: 4.5,
            reviewCount: 449,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Cimanggu",
            latitude: -7.134983999999999,
            longitude: 107.414531,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFmFAeIKNJ48A03dWH89g0AgnntCzyY9Luy9ybjUmSQDL3rq1noWNoHau0DpdUaq7W0g5AQrgRkgKv27KaU-EvALaFOOKtpskIy_LsszktnX1rKqjsCHw_1-7e94ItLxVfGt-CE=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh Oleh Happy Farm",
            slug: "oleh-oleh-happy-farm",
            owner: "-",
            destinationSlug: "taman-wisata-alam-cimanggu",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Ciwidey - Rancabali No.28, Panundaan, Kabupaten Bandung",
            phone: null,
            rating: 5,
            reviewCount: 3,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Cimanggu",
            latitude: -7.1148411,
            longitude: 107.43815,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHhmPa7FQJlpDfeEjQr9eCTKa5oWsUT8kM5NpnZuKxcKzU5DdeCRXSaRyTd8pOd_l15KrdbM1mtiBu9xVIIctLudH4K30w9tlq1qT1aBnFWaxjuFd210Ihw8pf2z47xyQdAb_eU=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Warung Kopi Gunung",
            slug: "warung-kopi-gunung",
            owner: "-",
            destinationSlug: "taman-wisata-alam-cimanggu",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Terusan patengan No.km. 11, Patengan, Kabupaten Bandung",
            phone: null,
            rating: 4.6,
            reviewCount: 4742,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Cimanggu",
            latitude: -7.141124199999999,
            longitude: 107.3955966,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHNenjwCVtcDDku7I-54lYm5w1cUoAjKBNonVeLNBl1rZ2Qe5pDPTdHg7fj6zRcMh1jfgraqwf81kJWLOOGMfF10ImptyaRggfTjodGd-wSiwfsKpKkiSBAhuXkjFNyc_4wF_xHCCB8Mw0=s1600-w1280",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Ecopark Curugtilu",
            slug: "ecopark-curugtilu",
            owner: "-",
            destinationSlug: "taman-wisata-alam-cimanggu",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Ciwidey - Rancabali No.KM.01, Patengan, Kabupaten Bandung",
            phone: null,
            rating: 4.5,
            reviewCount: 2851,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Cimanggu",
            latitude: -7.1499028,
            longitude: 107.3757828,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEaUT2KPWX8CLW-DPVxA5lnx1RMTQ8KcoIgdZsDiaH9wUgESOvd8NOKJpM65gXw5zigmiL8PcDPoQtr3dR8rJlEyOPnDLlqLpf65WBCIpcHQxUjqOXu1JCLPxDBhNmZ23bCViLW=s1600-w960",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Waduk Darma Souvenirs | Pusat oleh-oleh kuningan",
            slug: "waduk-darma-souvenirs-pusat-oleh-oleh-kuningan",
            owner: "-",
            destinationSlug: "objek-wisata-alam-kukupu-panenjoan",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Jagara, Waduk Darma, Kabupaten Kuningan",
            phone: null,
            rating: 5,
            reviewCount: 2,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Objek Wisata Alam KUKUPU PANENJOAN",
            latitude: -7.0075207,
            longitude: 108.4137043,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHp4wJMdXUQRB4Dw2aZMEbX0VgxVu3cmSum_fGssyOjF8nEtMymdRRhNRF8awo9CGbQhte8yQDOUoty4dbefovFVorg8LBom2geYrMcgPkcqMUGrGIZEbhi5aQzocpJd1Z6CO2C_g=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Berkah Oleh Oleh",
            slug: "toko-berkah-oleh-oleh",
            owner: "-",
            destinationSlug: "objek-wisata-alam-kukupu-panenjoan",
            categorySlug: "oleh-oleh-souvenir",
            address: "XCWM+GWW, Cikadu, Kuningan Regency",
            phone: null,
            rating: 4.4,
            reviewCount: 30,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Objek Wisata Alam KUKUPU PANENJOAN",
            latitude: -7.0036359,
            longitude: 108.4348142,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEETuhrH6CBH80MzpJyH0Kp0o9Nw-xlwObS1dGuIJ_2V87df_bF3rVsvk0zzoK699iSUaHfgLS6x662PiLcwOYS47mm9PzZuOYYiIie58jrG1hNAAoXdyX2Pf-IFamjh_PRcZt8=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Oleh-oleh Cikijing",
            slug: "toko-oleh-oleh-cikijing",
            owner: "-",
            destinationSlug: "objek-wisata-alam-kukupu-panenjoan",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "X9M9+42P, Jl. KH Abdul Fatah, Cikijing, Kabupaten Majalengka",
            phone: null,
            rating: 4.3,
            reviewCount: 3,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Objek Wisata Alam KUKUPU PANENJOAN",
            latitude: -7.017166199999999,
            longitude: 108.3675736,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAERVYIsd_It1HYqY_WV4iASuT1t98PBXal506w5fDQFeW52sbhwg37rzQkE0AX66dWdxRUpe8s-54QwmBP7ngwBHTssveZFqUGlItayht-VoQWRVUg5cZxNKNO9xpDw5d1TrDye=s1600-w1440",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Pusat Oleh Oleh AL BAROKAH2",
            slug: "pusat-oleh-oleh-al-barokah2",
            owner: "-",
            destinationSlug: "taman-wisata-alam-gunung-tampomas",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jambu Kidul No.27, Jambu, Kabupaten Sumedang",
            phone: null,
            rating: 3.5,
            reviewCount: 27,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Gunung Tampomas",
            latitude: -6.779493,
            longitude: 107.9981244,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFkVHxY4gtsH2yOOxg-XvL9gQ7v4_QH8ahlF1yK3CFXgSL7AiLrL1SXkDxcXgWe5g_MmxZZv1AN5HB2NFSzsttQSNo6wZozY8g3mxcnLd9QUl5lQwfAYabPjwyP3w3IVsZMfzDPBz79iD0=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Top Sari Emping",
            slug: "top-sari-emping",
            owner: "-",
            destinationSlug: "taman-wisata-alam-gunung-tampomas",
            categorySlug: "oleh-oleh-souvenir",
            address: "Unnamed Road, Narimbang, Kabupaten Sumedang",
            phone: null,
            rating: 4.7,
            reviewCount: 56,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Gunung Tampomas",
            latitude: -6.7571815,
            longitude: 108.0012236,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAG68h7iKzDFUVIsHuN4G10uahkC7U1M_a38XwuPFxcbBw_kBYZZWt1F00HDqD2RV9cM1tfL1BqQXqUtNW84YR_I6yGBHirg6RV6BLw-iMIvsHykd1iupiEY0k-NvjObCOaHL2ccP6zr1yFf=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Gerai Oleh-oleh Ratu Jambal",
            slug: "gerai-oleh-oleh-ratu-jambal",
            owner: "-",
            destinationSlug: "taman-wisata-alam-sukawayana",
            categorySlug: "oleh-oleh-souvenir",
            address: "2G7V+699 Resto, Palabuhanratu, Kabupaten Sukabumi",
            phone: null,
            rating: 5,
            reviewCount: 2,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Sukawayana",
            latitude: -6.986953300000001,
            longitude: 106.5434715,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAH3_WUjiTalhuTg2BArn9b6-YtR1q55B5WpJQHaJFezeC0Tg5GVVh8Hy2z82IgfF0LA85HuMOqJiZWZAO_0YOaAiJDtQQPkIkqBYNORGcx-RWQyTEO0tp5jBrHk5e7g0PadXgaz=s1600-w1080",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Bukit Durian Sagara",
            slug: "bukit-durian-sagara",
            owner: "-",
            destinationSlug: "taman-wisata-alam-sukawayana",
            categorySlug: "oleh-oleh-souvenir",
            address: "Sukamaju Pelabuhan Ratu, Sukamaju, Sukabumi Regency",
            phone: null,
            rating: 4.4,
            reviewCount: 994,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Sukawayana",
            latitude: -6.9501743,
            longitude: 106.5175403,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEoLP7ZHv5faGvug0jLoA7kw73fxtBM28-t3OEGFOzQLIgpfYi8jlRcCWOdkuanqdvGWntoGM0UEM465nz4b5Qh-RkqCNuD81MW6_AoG4xx2CMepHQLmpuL0qfSbJYZ7DaczSt_qQ=s1600-w1280",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "OXO Warehouse Pelabuhanratu (Modern Electronic)",
            slug: "oxo-warehouse-pelabuhanratu-modern-electronic",
            owner: "-",
            destinationSlug: "taman-wisata-alam-sukawayana",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Siliwangi Palabuhanratu No.66, Palabuhanratu, Kabupaten Sukabumi",
            phone: null,
            rating: 4.9,
            reviewCount: 490,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Sukawayana",
            latitude: -6.9879298,
            longitude: 106.5465011,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAE-4kdcQDyrLEQyxP5osPoWR2ZANwl1y5uK4QQlOssjgm-ivUecy4RZGf4Jhpu5NqdpEhaDIZw6RtIXRsjWw0APhVyBIp92abVIkZRFEeKGMDMYfjsIerk3t4kA7pXB0KRY1PL2UQ=s1600-w780",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Bolu Aneka Rasa",
            slug: "bolu-aneka-rasa",
            owner: "-",
            destinationSlug: "taman-wisata-alam-sukawayana",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Bhayangkara, Palabuhanratu, Kabupaten Sukabumi",
            phone: null,
            rating: 4.9,
            reviewCount: 34,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Sukawayana",
            latitude: -6.9882208,
            longitude: 106.5542761,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAH-Ch8Pv1LO-SRHqqVq5lW48ucjdusCgLFfa5hg4ckMJ7Z8puyIxQTHLaieRaOC1FxTBeQq3ePn35dCfpBhsVzk_ExsIw4AiFUoJZIAADGetz_3lgn0eoX9XPK9-DXBpAnkAwQz=s1600-w720",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Ratu Mochi",
            slug: "ratu-mochi",
            owner: "-",
            destinationSlug: "taman-wisata-alam-sukawayana",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Siliwangi Palabuhanratu No.19, Palabuhanratu, Kabupaten Sukabumi",
            phone: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Sukawayana",
            latitude: -6.9888125,
            longitude: 106.550174,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHJJCUf0iQ_LzABW_iDIAZAxwnPK4sI0ID3VfsxMw5TLNfZIewOU5rZzNJNTnZUXYdIM4roxqkQx1jOEf5J_zd_upisfQ1Q1bEBo3wwJttqr0XVjfqzNA4_bw8AnKC46Hd5wUA=s1600-w1200",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toserba Yogya Pelabuhan Ratu",
            slug: "toserba-yogya-pelabuhan-ratu",
            owner: "-",
            destinationSlug: "taman-wisata-alam-sukawayana",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Siliwangi Palabuhanratu, Palabuhanratu, Kabupaten Sukabumi",
            phone: null,
            rating: 4.3,
            reviewCount: 1732,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Sukawayana",
            latitude: -6.9884987,
            longitude: 106.5475453,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGb_dyM6TglCAmux6sv803oen0NAfA7__9B3RX0AycLLxoKv8dfVpLHKGPxAtrBVsCzofiZYd0d5GB3Yq0jt9j9GAqq-VPPlR2rdPK0acJuFq1aJyhfctB8Im8hSqmF_1ctdV0=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Indomaret Waterpark Citepus",
            slug: "indomaret-waterpark-citepus",
            owner: "-",
            destinationSlug: "taman-wisata-alam-sukawayana",
            categorySlug: "oleh-oleh-souvenir",
            address: "2GFJ+648, Citepus, Sukabumi Regency",
            phone: null,
            rating: 4.5,
            reviewCount: 291,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Sukawayana",
            latitude: -6.9769521,
            longitude: 106.5303394,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEVlbbSZdbx5L_V5uKZlWOmmeIg2SdigetdSjZv2InkYavZ0pJQxj7Gqe9_gtLjqAd89Ys_EBx6HN4YtJUK0asDbSvUj9rf8Ol69lnajVe8ZPpa-yEM2Yy9n19IDt1OgtRsgD8K=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "RAJA FO Cimacan",
            slug: "raja-fo-cimacan",
            owner: "-",
            destinationSlug: "taman-wisata-alam-telaga-warna",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Cimacan Jl. Raya Puncak, Palasari, Kabupaten Cianjur",
            phone: null,
            rating: 4.4,
            reviewCount: 3557,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Telaga Warna",
            latitude: -6.7153773,
            longitude: 107.0262298,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAH9_svrzSwtdMoiDEeLs4AG2FfeGZUSft78jMTE2TwffJxMWphHXI-WeyI0-BfJjcaWvXbcalb3BdaarHUOVzpemKLy5GGyGr21jJ29c7Jq8pbV7Oh-68mZb2VZsn4UVP6CsrQaYw=s1600-w1152",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Arasari Lapis Talas - Cipanas",
            slug: "arasari-lapis-talas-cipanas",
            owner: "-",
            destinationSlug: "taman-wisata-alam-telaga-warna",
            categorySlug: "oleh-oleh-souvenir",
            address: "72CR+G8C, Sindanglaya, Cianjur Regency",
            phone: null,
            rating: 4.8,
            reviewCount: 76,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Telaga Warna",
            latitude: -6.728666899999999,
            longitude: 107.0408131,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHGFO-XvNYbRQwINHDlnhaLPLIfEmet66BlUAILSlqgykH9A2e1lscb7nNc9bBgnAj0t4Ld8JVVKIV6A6gr4ORiipZcyGPjfIXbJ8SIGcNNioQUX1iF1hQS2wHX1eSYU9b_j_Qo=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Lapis Talas Bogor ARASARI Gerai Cimacan Cipanas",
            slug: "lapis-talas-bogor-arasari-gerai-cimacan-cipanas",
            owner: "-",
            destinationSlug: "taman-wisata-alam-telaga-warna",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Cipanas No. 80 Kp. Cimacan RT 002/001, Palasari, Kabupaten Cianjur",
            phone: null,
            rating: 4.9,
            reviewCount: 144,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Telaga Warna",
            latitude: -6.7163814,
            longitude: 107.0293014,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEdqeAKDm2huk-mtqE4gbvBGjUI3rqn452n5lTwuUbEckFwcloz_ehN6MYxObEktIe8rkglaWd4e8b38UEq810V76fySbiEP7iU9Sr9Pjh78pALUFv3PEti_Gado7u4gL7CCCINK02sKqj1=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Roti Okawe cabang cipanas, toko roti, roti kopi, roti unyil, roti gembong, roti manis, pesan antar, toko oleh-oleh",
            slug: "roti-okawe-cabang-cipanas-toko-roti-roti-kopi-roti-unyil-roti-gembong-roti-manis-pesan-antar-toko-oleh-oleh",
            owner: "-",
            destinationSlug: "taman-wisata-alam-telaga-warna",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Raya Cipanas, Sindanglaya, Kabupaten Cianjur",
            phone: null,
            rating: 5,
            reviewCount: 5,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Telaga Warna",
            latitude: -6.729119799999999,
            longitude: 107.0408478,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHE598fsYaMJ6xQPnIJg2nnkViKHxtsPlgJyRRzRbKaxuXrIcwLWFBcQ9I_WDmcbw01ogvUpCQJzD9C4oKbUxm8Qo8li2Jy9EDEKGu7meHLS1TceRYv_QW58XZth9W4LeD2esvl=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Nicole's Chocolaterie",
            slug: "nicole-s-chocolaterie",
            owner: "-",
            destinationSlug: "taman-wisata-alam-telaga-warna",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Raya Hanjawar No.1b, Palasari, Kabupaten Cianjur",
            phone: null,
            rating: 4.6,
            reviewCount: 587,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Telaga Warna",
            latitude: -6.7139808,
            longitude: 107.0238224,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEHlWYmjojXo_hEaZQ_JNODxdCND_5ormKKyXsTdiGQ7siQdn6ggDsEJ8593dS8hrit_igPgFiNWabxMGs63TBf4hwUjIQR-nHFbbtvV_NVicN9oiqgwtfzHYM5Mq0oLgH0po8cLPYM6Hg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "CITRA JAYA",
            slug: "citra-jaya",
            owner: "-",
            destinationSlug: "taman-wisata-alam-gunung-pancar",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "C4-A No.28, Jl. Raya Jungle Land Avenue No.C4-A, RW.No.28, Karang Tengah, Kabupaten Bogor",
            phone: null,
            rating: 4.4,
            reviewCount: 93,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Gunung Pancar",
            latitude: -6.579850299999999,
            longitude: 106.8921052,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGQwuuazVPRuy1W3p6H9g5Oa8AwPZVTJb_GllQumpWbOcblhDbpkp3rxKSvPVeh_dnW1b_37Bq8DfeGlRlQ3l0iu8H5ZWu9VHcrKRy1vllz-EFUWwp6t-sUPKFJg95T-MgB5-DKSg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Pusat Oleh-Oleh Teh Diah Kuningan",
            slug: "pusat-oleh-oleh-teh-diah-kuningan",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Raya Bojong No.90, Bojong, Kabupaten Kuningan",
            phone: null,
            rating: 4.2,
            reviewCount: 1740,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.8797199,
            longitude: 108.4953843,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHcj14HfgX59rqR5LFxtEYU_TzogjZqX9tAUKxzKdj2K5RBnS-B3-5rzIXEWrPOVoYhNvn3VWRdN4tp_U92H9GxD1Co74IDDRQ6i7byfXAtAaRCUyHEd0lgfDkXJR5_kbj-IU0XDCBFaK4=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Pusat Oleh-Oleh dan Tahu Susu Kuningan Bu Sepuh",
            slug: "pusat-oleh-oleh-dan-tahu-susu-kuningan-bu-sepuh",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Raya Bojong No.146, Bojong, Kabupaten Kuningan",
            phone: null,
            rating: 4.5,
            reviewCount: 804,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.876369,
            longitude: 108.4960409,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHvkH-tRtamofQqQTCGMAtpWMiw3X7bhFhJayvj3HdXktvHoLVi2wCz3b1VCuj3QwzFOTwF8CgV1DK0_SVip8ce3G5wIE8RLjp0JggqAq8-dQeQIuuUHH98YV2nabv16-9yQAp-EQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh Oleh Kharisma Bandorasa Kuningan",
            slug: "oleh-oleh-kharisma-bandorasa-kuningan",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "4F6V+FFV oleh oleh kharisma, Bandorasa Wetan, Kabupaten Kuningan",
            phone: null,
            rating: 4.3,
            reviewCount: 119,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.8887202,
            longitude: 108.4936633,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEC_j70l5NAa0zT_-yE-9ixbGKD9Z7LOiicBtNLUNC2I-0RykLLic-OO2FYr-1m9SoNBrtCRfURldIiVDpcQPNCCC9wxKI7ebe9cH27Wh3PPU4BaL7hIWdhVAmMSDXMqFRiD6j-eA=s1600-w1080",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Oleh-Oleh Tahu Susu Tamiang Sari",
            slug: "toko-oleh-oleh-tahu-susu-tamiang-sari",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Bandorasa No.16, Bandorasa Wetan, Kabupaten Kuningan",
            phone: null,
            rating: 4.5,
            reviewCount: 545,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.8818701,
            longitude: 108.4948441,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFpj7VW1P5xORYDZoKfihHhCO8m50e5_e-rtJbMsQayemcTTxHhS81XmTFZ2K7swalmSHeTGUC5q7JL3_lb9QPnOCf5Qc2eoupfZhjrUard6jvp34wQdBCk0xgip4rv2QfhbXw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: 'Roti Alit "By Mama Noyi" & Oleh-Oleh Khas Kuningan',
            slug: "roti-alit-by-mama-noyi-oleh-oleh-khas-kuningan",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address: "Caracas, Kuningan Regency",
            phone: null,
            rating: 4.7,
            reviewCount: 128,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.858515799999999,
            longitude: 108.5011932,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGZZ2wDW1rfnwrUl6u7XsBB1Q1ggUgKi9KcS4yecZ-IZfiqD_VAp-fGSy1ihzr8O71MhgzNDAZUQ9rb2aNvH0PQr4_3YQPERP7An3F1L2FXFO1l3KJ1Lw1rlEpfxmuxcdWQHs8=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Kedai & Oleh-Oleh Sangkanmulya",
            slug: "kedai-oleh-oleh-sangkanmulya",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Lkr. Cilimus, Sangkanmulya, Kabupaten Kuningan",
            phone: null,
            rating: 4.6,
            reviewCount: 28,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.902397,
            longitude: 108.5076774,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFCrn27-2gB1RM9dLoTKyrg32R1ht_n8CQIiQnx-62a_SDCyoq_m_eX7B8TR_pL3PVCYZByfXNQfOKdEKuvHyRvLO8-fwQwNa4XPir8xwERcpKKDsHfgr515GxqaJms6SVzmmE=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Oleh Oleh HARUM MANIS super",
            slug: "toko-oleh-oleh-harum-manis-super",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address: "Manislor, Kuningan Regency",
            phone: null,
            rating: 4.5,
            reviewCount: 64,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.9001188,
            longitude: 108.490807,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEVuAZV73ismLHwZIMVOHJQQ9yOo_Tce-Ns9l9h7AsNRuaavkJ0Enw3DIgt6ps266vZQwx2-7xpJ9Eiy0MnysxjRzrktrPTD5NsWsgG1hydwYwc4Zu09S7AwBNuVnLoDeNBk7Y=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Kaos Kuningan | Pusat Oleh Oleh Kaos Kuningan Terbaik",
            slug: "kaos-kuningan-pusat-oleh-oleh-kaos-kuningan-terbaik",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address: "Sadamantra, Kuningan Regency",
            phone: null,
            rating: 4.8,
            reviewCount: 59,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.917762199999999,
            longitude: 108.4871798,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEKa73jNnrS6e3_qFQNtwSZu8QVQxHn5lH0oPfkdr2jfyQmnbMUt-ZDIqpymX5lK9x1eo1FXSKpvbSqSFgcFhBORtv2gS_NYLYfMEOQJcSni29CVTGmcvAnWjk_ttnxdKRcXiWR=s1600-w1040",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Pusat Oleh - Oleh Nabila",
            slug: "pusat-oleh-oleh-nabila",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "4FCF+9WP, Bojong-Pakembangan, Linggamekar, Kabupaten Kuningan",
            phone: null,
            rating: 5,
            reviewCount: 6,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.8790752,
            longitude: 108.4747767,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGgHDypyHWOWxcluFPiE50hv-U38BYcznPkrpjKF_c_c_SC6Vh9dwaZn8kyKC6J7pNhtfXBfaZ9tIJ-FCC69z6IXh7RkMaPT6ZJIvOCuedzRyC_Nq2YxuZ6h29f_CTYzvrC58jX=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Al-Fitri Oleh Oleh Kuningan",
            slug: "al-fitri-oleh-oleh-kuningan",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address: "Desa No.21, RT.21/RW.5, Maniskidul, Kabupaten Kuningan",
            phone: null,
            rating: 4.9,
            reviewCount: 8,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.908801,
            longitude: 108.4893355,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAES3e-cfeDMXZOCLWslK5cdEUiXMqjHt5vM9al_Mynek1vRtfSBdYDPOoQtN7WTibhwZf30nFyoWMRTZkP1XRPqmTWppX_MocxBL4nxCpnL6LyQvG38CNvZQ3lB_gg5fAbDXLdZ=s1600-w780",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Oleh-oleh larissa bandorasa wetan",
            slug: "toko-oleh-oleh-larissa-bandorasa-wetan",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Bandorasa wetan No.23, Bandorasa Wetan, Kabupaten Kuningan",
            phone: null,
            rating: 5,
            reviewCount: 2,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.887176299999999,
            longitude: 108.4938604,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGc0AgMhfvckTGrWHQM3cj9R8op9oG2NzszEEcKRyq2Aen_lurqDqrJzZMC99HEz57RCdjJgknHKoL-5iLrMxWw_2zNWJB-kX2C4yPOtfllXV0eadGYl02VuGCic706SmFB8Ijb=s1600-w717",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Hasan - Oleh-oleh Khas Kuningan Dengan Harga Grosir",
            slug: "toko-hasan-oleh-oleh-khas-kuningan-dengan-harga-grosir",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Raya Cilimus No.15, Cilimus, Kabupaten Kuningan",
            phone: null,
            rating: 4.2,
            reviewCount: 13,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.8724924,
            longitude: 108.4968435,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHxuPiiR3VPmqHujAP73WfM_7qQdMap8LwqrNmH2LAoyWTyAXTdvGxka0ZvoNoRB4FODQvxaLIhccu6FnubKXI4-rOxF8CIloEJU3H8zyjvude17N7kHmkKXXPIWyhEDwLVx_A-=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Pusat Oleh-Oleh Kuningan | ibu Hj. Neneng",
            slug: "pusat-oleh-oleh-kuningan-ibu-hj-neneng",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Jalaksana, RT.04/RW.01, Jalaksana, Kabupaten Kuningan",
            phone: null,
            rating: 4.7,
            reviewCount: 6,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.922282699999999,
            longitude: 108.4871855,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHSQrg--jGjHpswpIGi1KZBH8wMJPux4sytoOpHbAWDaYMAROxEMUyGTDIVRIizq-cLvmq4Zw-8kmGlNTmUgPyx0ViXbg_N-as3wM5PWgZ1Tst6Uaosr2wmbXm3XwL9OJx9YZfTXw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Oleh Oleh Barokah",
            slug: "toko-oleh-oleh-barokah",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address: "4GR2+343, Jalan Raya, Caracas, Kuningan Regency",
            phone: null,
            rating: 4.5,
            reviewCount: 2,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.8598721,
            longitude: 108.5003256,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFVNn90Z0cAB5tbPZx5DDZ6t_LKkWFia_o_HbotE3FNSbeVIv6BeclvHlhsoSH-YaVMwDY1Pjiepze3QVrFQENez-P1gQ1fqcZkIp7UF4KwvIo0i-4fH9uv89erORNTUWhA6TQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko oleh oleh teh vina",
            slug: "toko-oleh-oleh-teh-vina",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address: "depan alfamart, Jalan baru, Panawuan, Kabupaten Kuningan",
            phone: null,
            rating: 5,
            reviewCount: 2,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.878706299999999,
            longitude: 108.5062389,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGsACSUR6KjqUvYs5xypI2uO_Kh2WpZU9eKQQmyzhSTU_zjCrwTNSFKeSNJom81CcTClX_tgf1rVYFP_f8VNU7q9_IEDmpmC77v2Se-zEIEBPpHGYUCA9QP9J99TVjJlSP2w18=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Fajar Toserba Jalaksana",
            slug: "fajar-toserba-jalaksana",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address: "3FJQ+WMC, Padamenak, Kuningan Regency",
            phone: null,
            rating: 4.4,
            reviewCount: 3181,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.916419299999999,
            longitude: 108.4877556,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAF2lbAT1bgJHesNMPHpMcJeMwbr6_8Ccbi8wbMUVCMjz0_V1yA9bZAhpxgx6E2Yw2wJF9_4Xm8SVdcy4soEIoO0UcL5TD84K_z7Z2iFS5fqPfkNttb0y8ZJf-SZrKUdXMWOUv68=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh Oleh Ceu Nani",
            slug: "oleh-oleh-ceu-nani",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Jawarsita RT.09 RW.04 Dusun Sawah Rangru, Linggamekar, Kabupaten Kuningan",
            phone: null,
            rating: 5,
            reviewCount: 4,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.8788939,
            longitude: 108.4799699,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHge_g0v4bGx8K3Tl2KK0WS6nQqxfNjG2N09J63Ok6mDadf40JUYf7SykW7wBEyqbHNeGQ61NAhhS27dQ-0tXQuoox-u9azl75rYFSqB76nHVbF1qlskxOAvEEOBpLeZYb6adZR=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Makaya Coffee",
            slug: "makaya-coffee",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Simpang Tiga, Jl. Raya Cilimus, Caracas, Kabupaten Kuningan",
            phone: null,
            rating: 4.5,
            reviewCount: 535,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.858464400000001,
            longitude: 108.5012689,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAH76FNjo7eDGcy1QWMjPJP5syLkyyjR0qKmv7dxfbpRh1sw5deQ9SsNuw4kmhJI0MgqYQenIWwOC9VM2bYrFLXnhYB38eNr0MtX8ee6dfULw_yZeupdqtGOFY5cezIZv0I5iT44=s1600-w1280",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Dedurenan",
            slug: "dedurenan",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address: "5G47+49H, Jalan Cirebon Kuningan, Wanayasa, Cirebon",
            phone: null,
            rating: 4.6,
            reviewCount: 49,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.8446912,
            longitude: 108.5134763,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHiBCHT5Md1rNI98sVX4zhz4FR85o4ia8S_Av7t3Rf3-Ivli-kze3YFm8z-rWlXO4cqnnpsET1zcOS0X9vSNdfxkhUIzNY0vTcuuxKnTnV8I5KBQPMbnkESiYrtbHwxciucjvdo9Bez9EB8=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Annisa Oleh-oleh",
            slug: "toko-annisa-oleh-oleh",
            owner: "-",
            destinationSlug: "taman-wisata-alam-linggarjati",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jalan, Sadamantra, Kabupaten Kuningan",
            phone: null,
            rating: 4.3,
            reviewCount: 6,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Wisata Alam Linggarjati",
            latitude: -6.914705499999999,
            longitude: 108.4879175,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAH58JKCVNWU5QbMFXY1kprdNvhbqOF_s0bXlS2bCyLs2OgfXXWy2acq7wVkJY9RzW9HN2I1zXcgGabqMJHdY3WglZYgP9BRGD_j1tLtXWdglch7qK-1YX--uBYGireTJHuE1-w=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Titik Desa, Kota Wisata",
            slug: "titik-desa-kota-wisata",
            owner: "-",
            destinationSlug: "mekarsari-amazing-tourism-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Boulevard Kota Wisata, Jl. Pesona Florence J2 No.10, Ciangsana, Kabupaten Bogor",
            phone: null,
            rating: 4.9,
            reviewCount: 471,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Mekarsari Amazing Tourism Park",
            latitude: -6.3732558,
            longitude: 106.9542107,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHUYXw_XKGNCUUUBEFmzjvKpvhxc2NBA0L3XoPI04NOvXv7HWYdD12rQE7fUPxSPRjLC6OqVRyHKMBPD-7LUG2A9QC013lwwwQOeXYu_kOubcDopvVGzDQ8s-ImsQgh_hpLxW9U9BJSxK4=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "LARIS Lapis Talas Dan Pusat Oleh - Oleh Mekarsari",
            slug: "laris-lapis-talas-dan-pusat-oleh-oleh-mekarsari-2",
            owner: "-",
            destinationSlug: "mekarsari-amazing-tourism-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Raya Cileungsi - Jonggol, Mekarsari, Kabupaten Bogor",
            phone: null,
            rating: 5,
            reviewCount: 617,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Mekarsari Amazing Tourism Park",
            latitude: -6.4096606,
            longitude: 106.9850801,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHoKyQul2u_Bu0Ioh0cmgcipLV85qy4cioejU_9_RkczXBQ1q8ina6ZmQgpWc1-QugSltBUiFXAX1B3u-vURwsMJMcAAGbWKUFBnDW25Bn60b4d9yBVv7dRcmBdpEshR_Mi4-n0gnZeU-oc=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh-Oleh A.F Khas PASIGALA",
            slug: "oleh-oleh-a-f-khas-pasigala",
            owner: "-",
            destinationSlug: "mekarsari-amazing-tourism-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Prumahan, Blok M9 No.11, Jl. Utama Persona Kahuripan, Cikahuripan, Kabupaten Bogor",
            phone: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Mekarsari Amazing Tourism Park",
            latitude: -6.4542195,
            longitude: 106.9820771,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEoMRfjP2zbEFJJMrrkbIS8xJTgkweUaCJQ-zVuBb6EQ2oTNogaFFG7AX-p6kf3XRjAbbCfCmp_eMkquTUR2J8eosMkLw336MbU-h3bauXo9KBzPi9E5LVBwWKImIeJu34OW1sfKWJGXvms=s1600-w720",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "TRAVEL UMROH AMANAH TERPERCAYA SAMIRA TRAVEL & OLEH OLEH HAJI, UMROH",
            slug: "travel-umroh-amanah-terpercaya-samira-travel-oleh-oleh-haji-umroh",
            owner: "-",
            destinationSlug: "mekarsari-amazing-tourism-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Pesona Kahuripan 4, Bojong, Kabupaten Bogor",
            phone: null,
            rating: 4.9,
            reviewCount: 17,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Mekarsari Amazing Tourism Park",
            latitude: -6.4466408,
            longitude: 107.0114119,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHRjJ5tDzwmL-vFO9ZYRSLkjku2bfvgMtuA7nBVT7uqG3uwLmZPuMs3dj521eupkwdzInyq5q1BtbHR0kfvfGOlgpPJSi8vZA942dSheMM_ZmzcQ1uCEO0qZskkX1Bsb7YvA5ZDhXnkdI2d=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Lapis Talas Bogor (Cileungsi)",
            slug: "lapis-talas-bogor-cileungsi-2",
            owner: "-",
            destinationSlug: "mekarsari-amazing-tourism-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Cileungsi - Jonggol No.1, Cileungsi Kidul, Kabupaten Bogor",
            phone: null,
            rating: 4.4,
            reviewCount: 143,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Mekarsari Amazing Tourism Park",
            latitude: -6.4072314,
            longitude: 106.9712458,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFd3AKLth9k-QgHbz_7WrVV-Y8wQW8ymOPPmbc43Ii7ijhtZ2QVKHyYvuRvYpZZkzGlROWaTBmvn9nIRTezR6ITo8BhI6Z8t09S5l3cKgVgN3a9VMOsU5baF50CV_Gx6wae518jqw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Michelle Bakery",
            slug: "michelle-bakery-2",
            owner: "-",
            destinationSlug: "mekarsari-amazing-tourism-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Wisata Utama Boulevard Kyoto Blok D1 No.3 Kota Wisata Cibubur, Ciangsana, Kabupaten Bogor",
            phone: null,
            rating: 4.7,
            reviewCount: 510,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Mekarsari Amazing Tourism Park",
            latitude: -6.376647699999999,
            longitude: 106.9589394,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAExoZhVy7CyNin-9yU4E0OGKulWLeonWIh96DKWaHy5MtJw3EcPxHCYeI7YOlOQWkdM2J2MwQXu7d2L9QPkFQ5IkqbsQTiVLg7oj3aGJZaCP9LoT_AhzTs_FmkK9pJjt0cDcumWOQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Abon Gulung Jakarta Kota Wisata",
            slug: "abon-gulung-jakarta-kota-wisata-2",
            owner: "-",
            destinationSlug: "mekarsari-amazing-tourism-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "JXF5+F73, Jl. Wisata Utama, Ciangsana, Kabupaten Bogor",
            phone: null,
            rating: 4.5,
            reviewCount: 22,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Mekarsari Amazing Tourism Park",
            latitude: -6.376427899999999,
            longitude: 106.958133,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGO_WLsglVX9R_VY9sv1qqAPfOT38p6ibIdw6xlMstHb8d30dLLJXCsfLMD_GWoqqbFaQ7ck8d3K2tvFER-Ya7z_jc8RIhSzCQ_TY1gOd7vYczOuh1bKtE2VKeccoiDJTtwzeXBURFF6wkC=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Juer Lapis Talas Sangkuriang",
            slug: "toko-juer-lapis-talas-sangkuriang-2",
            owner: "-",
            destinationSlug: "mekarsari-amazing-tourism-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "ruko ptm, metland cileungsi 1 no.17 a, Kp. Parung Jambu, Cileungsi, Kabupaten Bogor",
            phone: null,
            rating: 4.6,
            reviewCount: 177,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Mekarsari Amazing Tourism Park",
            latitude: -6.3977662,
            longitude: 106.9728816,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFjA3cJTUv2WI_fSUPk4aZ0ktalmBvX_gincG3JEr3pkNWq0H9Kk-nZg-5IrSEU428Wsuewx0q0pE_P59xFfPVzS7o4tVSCRYeL-jFJmzVOQWa1y3K3rk22DjKziXxlVfVVzumzIQ=s1600-w960",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Langgeng Jaya putra",
            slug: "langgeng-jaya-putra-2",
            owner: "-",
            destinationSlug: "mekarsari-amazing-tourism-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jalan Rawa Hingkik Pintu Masuk KTM No.Samping, Cileungsi, Kabupaten Bogor",
            phone: null,
            rating: 4.5,
            reviewCount: 57,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Mekarsari Amazing Tourism Park",
            latitude: -6.397570399999999,
            longitude: 106.9714678,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEacXczHZxDJYJiuj_jv1krduTo4cwciPktlwr5euNbD6wUoYoZix8gPd4SuVz7YUosQ5aQdjK9c_t1LQgGiEnOKicFCeS4wkTzD-CkYBtm2UyWHOscSdBBlF0cAf8DZ5G8yo9r=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Owen Pusat Oleh-oleh & Resto",
            slug: "owen-pusat-oleh-oleh-resto",
            owner: "-",
            destinationSlug: "pantai-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address: "Raya Pangandaran, Babakan, Kab. Pangandaran",
            phone: null,
            rating: 4.4,
            reviewCount: 2061,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Pangandaran",
            latitude: -7.674205300000001,
            longitude: 108.679098,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGCupO-8YenPSGdI9EWgYCnzvpXVLpUYoIqjKbu4vd9YDhrtzMdQx5qNdBNozXG6_Dl8RwFhEFhD8NqC2oEfCxQjykGgmSGdFrTeVWPdnUvqD2KhFnJ2Ma6LvXvCXCayCri2SAtIQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Pusat Oleh-Oleh Nanjung Endah",
            slug: "pusat-oleh-oleh-nanjung-endah",
            owner: "-",
            destinationSlug: "pantai-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address: "7MX5+76C, Pangandaran, Kabupaten Ciamis",
            phone: null,
            rating: 4.4,
            reviewCount: 9,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Pangandaran",
            latitude: -7.701864599999999,
            longitude: 108.6579358,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHSpy2H3ALiPGIb9JvTl3JyVzwxh_D_7g_e4yibWlPXXFhdllGEv78wrnTq2phgT1IU_9VaiMkBK7Vl7Q_P-TsxquSB1aoLGkrLp0aBkqnV_LAT93sN6KU3r62md4FZJjT1yYgqrg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "TONY CCTV",
            slug: "tony-cctv",
            owner: "-",
            destinationSlug: "pantai-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Pasar wisata, Jl. Bulak Laut No.2 blok E, Pananjung, Kab. Pangandaran",
            phone: null,
            rating: 4.9,
            reviewCount: 21,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Pangandaran",
            latitude: -7.692518100000001,
            longitude: 108.6540098,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGjnXG2SkL2i28GTecVjB_zyY_hwPBfA6to3cspWR-Pa3TDzUs9e7Mmo1p8ejWBgvg7_MvFQXS0x1_boXffG53hA-f3A0qbMz5pkwfFcdpUFh3HJS6mCqJSZ6WpHTVU3UZtnek=s1600-w585",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Mamah Jambal",
            slug: "mamah-jambal",
            owner: "-",
            destinationSlug: "pantai-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Jangilus No.101, Pangandaran, Kab. Pangandaran",
            phone: null,
            rating: 4.6,
            reviewCount: 481,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Pangandaran",
            latitude: -7.694504999999999,
            longitude: 108.6563707,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHYgasnjaSe8fuj3y6TGpyi1LyTE8wT2sKfnbCCUNCMuoBIKW4K6W-2wZqMZQyD2tm3jI9tEdZp2HQ70MNPAHqi-L0zi_dcEFLwEUDl5bMTwSWWIlJOjC7blhkwKxTOEBIO52De=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Jambal Roti Lizakha",
            slug: "jambal-roti-lizakha",
            owner: "-",
            destinationSlug: "pantai-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Pantai Barat, Pangandaran, Kab. Pangandaran",
            phone: null,
            rating: 5,
            reviewCount: 29,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Pangandaran",
            latitude: -7.6956862,
            longitude: 108.6537668,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAH3hUZaw1C7t7VvfU8C2BlosoZVxElUl3MA2G3mRy0BrTKw5q3RWsIVyMow-KLWHyPBD8XUc1swcrvr5dDzsqOqqHdNZHvJppWuCbBfpfKisxiVyDGhUUw2C45bIRkfI0o2oC0=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Perahu Terbalik Ikan Jambal Oleh-Oleh Khas Pangandaran",
            slug: "perahu-terbalik-ikan-jambal-oleh-oleh-khas-pangandaran",
            owner: "-",
            destinationSlug: "pantai-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Banjar - Pangandaran, RT.1/RW.5, Babakan, Kab. Pangandaran",
            phone: null,
            rating: 5,
            reviewCount: 4,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Pangandaran",
            latitude: -7.682522000000001,
            longitude: 108.6625484,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEStq0B0v8B7LQxF9_v13TSV8mDjw1oEjG2rp-ok_ZIS6qkLLvXOfZ2WFy08XmZk_-yt-6F4OnOfWdUqB5WYZLGU2d5RCDaAgU84om_asdI_8BiSlAfehXONT01NNQ94MW7Niig_c6abmRF=s1600-w1024",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "KIOS JAMBAL ROTI KUKUN KENTUNG",
            slug: "kios-jambal-roti-kukun-kentung",
            owner: "-",
            destinationSlug: "pantai-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. E. Jaga Lautan Jl. Pantai Timur No.9, Pangandaran, Kab. Pangandaran",
            phone: null,
            rating: 4.2,
            reviewCount: 714,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Pangandaran",
            latitude: -7.702568099999999,
            longitude: 108.6578353,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEU8rKv9DI7NGL1zj8jWN0rFXeGLqOiA5b2-x89Uvs1j-NJfZHGWJn-_5xHMprxAyPx3Jd3IkVgVDhghGgPwxLUwcXW1Mye9nn-TrEHynDSws8uT1efsvaoSrmPruvxsbhtx9OJ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh-oleh khas Pangandaran ibu Ros",
            slug: "oleh-oleh-khas-pangandaran-ibu-ros",
            owner: "-",
            destinationSlug: "pantai-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Kidang Pananjung No.133, Pangandaran, Kab. Pangandaran",
            phone: null,
            rating: 4.8,
            reviewCount: 10,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Pangandaran",
            latitude: -7.6962304,
            longitude: 108.6583263,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFUkI4z6t4pv6mcBP5toX5Jzu8pCx89ydjzbFBPfPBQB_HXuZpyasMrqnDsFnTC2OGul9BKSl1DYXAMuzzx62i3vc7YyYDZwOztaNg6v5EZ7IdOyo5O0tihY0eSpn6eKSjAZhAosw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Pasar Pananjung",
            slug: "pasar-pananjung",
            owner: "-",
            destinationSlug: "pantai-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address: "8M82+95X, Jl. Cijulang, Pananjung, Kab. Pangandaran",
            phone: null,
            rating: 4.1,
            reviewCount: 1025,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Pangandaran",
            latitude: -7.684014899999999,
            longitude: 108.6504893,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFAPlZM7qzlGR_a3hha4qL08GPQHHGIig01cetQqbsSR5ieD-6EMOOcJLGnghmtX0Fde4eK5koxVc023PkDxhFeD0mImbMhGGCrk4F0v3pQAApbqWhRC7qnq3N2c3JqI-xdzkr7=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Pusat Belanja Nanjung Sari",
            slug: "pusat-belanja-nanjung-sari",
            owner: "-",
            destinationSlug: "pantai-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address: "7MX4+PGH, Pangandaran, Ciamis Regency",
            phone: null,
            rating: 4.2,
            reviewCount: 61,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Pangandaran",
            latitude: -7.7004763,
            longitude: 108.6567623,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGljH-PvFHUMaNXM_r7MoAAAR9DUC3GQnJ36O7QZJeyZBW0l7l6j8G-pFOvHTfdRZtlIXJOhBjqu_cgqIakVrGJGGTOyc5tqhvzItQI52vwD3PhJjUr6Y6GNt0bU6jKFrD10P3hnA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "DAMAR JAMBAL (PUSAT OLEH-OLEH IKAN ASIN)",
            slug: "damar-jambal-pusat-oleh-oleh-ikan-asin",
            owner: "-",
            destinationSlug: "pantai-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Depan Pangandaran Sunrice, Lapang Katapang Doyong Jl. Pantai Timur, Pangandaran, Kab. Pangandaran",
            phone: null,
            rating: 4.8,
            reviewCount: 4,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Pangandaran",
            latitude: -7.6904443,
            longitude: 108.662957,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFSeCsMW1KfKl25HbMK5q9O7w_c_nWw306aeRH_B__M8P3VMJFQyEmZiCMgv5yhb4BlzBn7uKvpeufw4FTe727np1GflThwHRH1rSdoD9e31zcoDhwDBk6S8JZFTbWEoNlWDgkq=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Tuti Jambal Roti Asli",
            slug: "tuti-jambal-roti-asli",
            owner: "-",
            destinationSlug: "pantai-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Pantai Timur Jl. Ps. Ikan No.Komplek, RT.04/RW.03, Pantai, Kab. Pangandaran",
            phone: null,
            rating: 5,
            reviewCount: 11,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Pangandaran",
            latitude: -7.694362099999999,
            longitude: 108.66013,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAF848zIoVo4HMDRA6nF7sYNUxaqaWhMuoMe7htIxq3olG8ft-LT_LYpmlKwuYjQ4OfTglmjp0_QB9GFgJyC0qk_b1BEbEncYxzfWS4Bgrrc8ZFPGzAuosigYLJcCJ4tKYROwlR7=s1600-w1200",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Kios Jambal Roti Elly",
            slug: "kios-jambal-roti-elly",
            owner: "-",
            destinationSlug: "pantai-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "7MW5+V4G, Jl. E. Jaga Lautan blok pelelangan pantai timur, Pangandaran, Kab. Pangandaran",
            phone: null,
            rating: 4.4,
            reviewCount: 597,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Pangandaran",
            latitude: -7.7028135,
            longitude: 108.6578034,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEDEhbz35IwF7ZQNywAAXUGmYXIlgf1AHCH08Ypgb1LyQ3aOj_YZyf27eS1oPdNDykD9ROQLLtfiKmbjBBggfWwlr2qbAClkfR9U2TPp-MxMCxDasGMhJxezAi7BWhF9Eb96sTf3g=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Exaq Accessories",
            slug: "toko-exaq-accessories",
            owner: "-",
            destinationSlug: "pantai-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "7MX5+G3F, Jl. Kidang Pananjung No.206, Pangandaran, Kab. Pangandaran",
            phone: null,
            rating: 4.3,
            reviewCount: 11,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Pangandaran",
            latitude: -7.7011435,
            longitude: 108.6576521,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFX-uXfKRBRNN_A4sn1oA-WpR_X6e21_UBDUCwE5hpSqL86Ekt4xRoQiOsVpA4H3YcEgGoV_2d-hD6acJn-gmux9Nq6y3ShG7dsGuH4PGmCHbrG3XmtfYRRSegbn1gf6wzflN2wcg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oasis Pangandaran",
            slug: "oasis-pangandaran",
            owner: "-",
            destinationSlug: "pantai-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address: "8M25+C38, Pangandaran, Pangandaran, Kabupaten Ciamis",
            phone: null,
            rating: 4.3,
            reviewCount: 25,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Pangandaran",
            latitude: -7.6989547,
            longitude: 108.6576456,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFDPmbcaN8lV_eDywp1FNx6a1P88pacJdJNhe5J-Z19k9AJV9HbDJwFFRFzHkeVm2UVkdn9StytpYRNf8sNtAdDuNjJtXSYFILSBBBE_l4cwvUkuDtgrXgpel2uAz_mvV-j3p-dlQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Hello Beach Coffee And Bakery",
            slug: "hello-beach-coffee-and-bakery",
            owner: "-",
            destinationSlug: "pantai-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Pantai Barat No.1, Pangandaran, Kab. Pangandaran",
            phone: null,
            rating: 4.4,
            reviewCount: 57,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Pangandaran",
            latitude: -7.7011857,
            longitude: 108.6576213,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEiz4zFxCgN_d2e7jTRK6NljFzcF1xNHctz56omxsb9Pd98qnipJvVvOL9Cd92ihRzzRBfgF1PquzApJuA9DIo1bGjWhI7uVo78QpzZoMW3Ce_d319PNmC_0bqbpVED209wE-Au=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "MAY WAY ( Yusiro ) Beach T-shirt",
            slug: "may-way-yusiro-beach-t-shirt",
            owner: "-",
            destinationSlug: "pantai-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Pramuka, Pangandaran, Kab. Pangandaran",
            phone: null,
            rating: 4.8,
            reviewCount: 57,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Pangandaran",
            latitude: -7.6958484,
            longitude: 108.6543121,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEZj_3gUYPcjAOWaxIaFN1OYr3z7OWh1RMhDd_SUN-GqTJ-dHMXNoqG-bPpA0Q6PMyLaDAkZyV7NOpdZ1HaxKFoXLTQYh263yegeASgH69gvYbNBPb5JB2sVCUn-Lpo-9igAyOU=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Travel Market Pangandaran",
            slug: "travel-market-pangandaran",
            owner: "-",
            destinationSlug: "pantai-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address: "Pasar wisata, Pananjung, Kab. Pangandaran",
            phone: null,
            rating: 4.4,
            reviewCount: 242,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Pangandaran",
            latitude: -7.6913434,
            longitude: 108.651677,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHlrAjsE3R6WHVnQ_y8Rx6Vy_qZGsZ57ifjUYELXrrPO8FDHojQB5OtNaEHiKzcvT1EuOzCxaOvFjIHwjnJmqJiVvZvNovzFjTpOtZnMdfwyugyOCIZYYnYczeDO32h02nJF3VX=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Owen Pusat Oleh-oleh & Resto",
            slug: "owen-pusat-oleh-oleh-resto-2",
            owner: "-",
            destinationSlug: "pantai-timur-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address: "Raya Pangandaran, Babakan, Kab. Pangandaran",
            phone: null,
            rating: 4.4,
            reviewCount: 2061,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Timur Pangandaran",
            latitude: -7.674205300000001,
            longitude: 108.679098,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGCupO-8YenPSGdI9EWgYCnzvpXVLpUYoIqjKbu4vd9YDhrtzMdQx5qNdBNozXG6_Dl8RwFhEFhD8NqC2oEfCxQjykGgmSGdFrTeVWPdnUvqD2KhFnJ2Ma6LvXvCXCayCri2SAtIQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Pusat Oleh-Oleh Nanjung Endah",
            slug: "pusat-oleh-oleh-nanjung-endah-2",
            owner: "-",
            destinationSlug: "pantai-timur-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address: "7MX5+76C, Pangandaran, Kabupaten Ciamis",
            phone: null,
            rating: 4.4,
            reviewCount: 9,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Timur Pangandaran",
            latitude: -7.701864599999999,
            longitude: 108.6579358,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHSpy2H3ALiPGIb9JvTl3JyVzwxh_D_7g_e4yibWlPXXFhdllGEv78wrnTq2phgT1IU_9VaiMkBK7Vl7Q_P-TsxquSB1aoLGkrLp0aBkqnV_LAT93sN6KU3r62md4FZJjT1yYgqrg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "TONY CCTV",
            slug: "tony-cctv-2",
            owner: "-",
            destinationSlug: "pantai-timur-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Pasar wisata, Jl. Bulak Laut No.2 blok E, Pananjung, Kab. Pangandaran",
            phone: null,
            rating: 4.9,
            reviewCount: 21,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Timur Pangandaran",
            latitude: -7.692518100000001,
            longitude: 108.6540098,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGjnXG2SkL2i28GTecVjB_zyY_hwPBfA6to3cspWR-Pa3TDzUs9e7Mmo1p8ejWBgvg7_MvFQXS0x1_boXffG53hA-f3A0qbMz5pkwfFcdpUFh3HJS6mCqJSZ6WpHTVU3UZtnek=s1600-w585",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Mamah Jambal",
            slug: "mamah-jambal-2",
            owner: "-",
            destinationSlug: "pantai-timur-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Jangilus No.101, Pangandaran, Kab. Pangandaran",
            phone: null,
            rating: 4.6,
            reviewCount: 481,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Timur Pangandaran",
            latitude: -7.694504999999999,
            longitude: 108.6563707,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHYgasnjaSe8fuj3y6TGpyi1LyTE8wT2sKfnbCCUNCMuoBIKW4K6W-2wZqMZQyD2tm3jI9tEdZp2HQ70MNPAHqi-L0zi_dcEFLwEUDl5bMTwSWWIlJOjC7blhkwKxTOEBIO52De=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Jambal Roti Lizakha",
            slug: "jambal-roti-lizakha-2",
            owner: "-",
            destinationSlug: "pantai-timur-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Pantai Barat, Pangandaran, Kab. Pangandaran",
            phone: null,
            rating: 5,
            reviewCount: 29,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Timur Pangandaran",
            latitude: -7.6956862,
            longitude: 108.6537668,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAH3hUZaw1C7t7VvfU8C2BlosoZVxElUl3MA2G3mRy0BrTKw5q3RWsIVyMow-KLWHyPBD8XUc1swcrvr5dDzsqOqqHdNZHvJppWuCbBfpfKisxiVyDGhUUw2C45bIRkfI0o2oC0=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Perahu Terbalik Ikan Jambal Oleh-Oleh Khas Pangandaran",
            slug: "perahu-terbalik-ikan-jambal-oleh-oleh-khas-pangandaran-2",
            owner: "-",
            destinationSlug: "pantai-timur-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Banjar - Pangandaran, RT.1/RW.5, Babakan, Kab. Pangandaran",
            phone: null,
            rating: 5,
            reviewCount: 4,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Timur Pangandaran",
            latitude: -7.682522000000001,
            longitude: 108.6625484,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEStq0B0v8B7LQxF9_v13TSV8mDjw1oEjG2rp-ok_ZIS6qkLLvXOfZ2WFy08XmZk_-yt-6F4OnOfWdUqB5WYZLGU2d5RCDaAgU84om_asdI_8BiSlAfehXONT01NNQ94MW7Niig_c6abmRF=s1600-w1024",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "KIOS JAMBAL ROTI KUKUN KENTUNG",
            slug: "kios-jambal-roti-kukun-kentung-2",
            owner: "-",
            destinationSlug: "pantai-timur-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. E. Jaga Lautan Jl. Pantai Timur No.9, Pangandaran, Kab. Pangandaran",
            phone: null,
            rating: 4.2,
            reviewCount: 714,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Timur Pangandaran",
            latitude: -7.702568099999999,
            longitude: 108.6578353,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEU8rKv9DI7NGL1zj8jWN0rFXeGLqOiA5b2-x89Uvs1j-NJfZHGWJn-_5xHMprxAyPx3Jd3IkVgVDhghGgPwxLUwcXW1Mye9nn-TrEHynDSws8uT1efsvaoSrmPruvxsbhtx9OJ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh-oleh khas Pangandaran ibu Ros",
            slug: "oleh-oleh-khas-pangandaran-ibu-ros-2",
            owner: "-",
            destinationSlug: "pantai-timur-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Kidang Pananjung No.133, Pangandaran, Kab. Pangandaran",
            phone: null,
            rating: 4.8,
            reviewCount: 10,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Timur Pangandaran",
            latitude: -7.6962304,
            longitude: 108.6583263,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFUkI4z6t4pv6mcBP5toX5Jzu8pCx89ydjzbFBPfPBQB_HXuZpyasMrqnDsFnTC2OGul9BKSl1DYXAMuzzx62i3vc7YyYDZwOztaNg6v5EZ7IdOyo5O0tihY0eSpn6eKSjAZhAosw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Pasar Pananjung",
            slug: "pasar-pananjung-2",
            owner: "-",
            destinationSlug: "pantai-timur-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address: "8M82+95X, Jl. Cijulang, Pananjung, Kab. Pangandaran",
            phone: null,
            rating: 4.1,
            reviewCount: 1025,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Timur Pangandaran",
            latitude: -7.684014899999999,
            longitude: 108.6504893,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFAPlZM7qzlGR_a3hha4qL08GPQHHGIig01cetQqbsSR5ieD-6EMOOcJLGnghmtX0Fde4eK5koxVc023PkDxhFeD0mImbMhGGCrk4F0v3pQAApbqWhRC7qnq3N2c3JqI-xdzkr7=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Pusat Belanja Nanjung Sari",
            slug: "pusat-belanja-nanjung-sari-2",
            owner: "-",
            destinationSlug: "pantai-timur-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address: "7MX4+PGH, Pangandaran, Ciamis Regency",
            phone: null,
            rating: 4.2,
            reviewCount: 61,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Timur Pangandaran",
            latitude: -7.7004763,
            longitude: 108.6567623,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGljH-PvFHUMaNXM_r7MoAAAR9DUC3GQnJ36O7QZJeyZBW0l7l6j8G-pFOvHTfdRZtlIXJOhBjqu_cgqIakVrGJGGTOyc5tqhvzItQI52vwD3PhJjUr6Y6GNt0bU6jKFrD10P3hnA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "DAMAR JAMBAL (PUSAT OLEH-OLEH IKAN ASIN)",
            slug: "damar-jambal-pusat-oleh-oleh-ikan-asin-2",
            owner: "-",
            destinationSlug: "pantai-timur-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Depan Pangandaran Sunrice, Lapang Katapang Doyong Jl. Pantai Timur, Pangandaran, Kab. Pangandaran",
            phone: null,
            rating: 4.8,
            reviewCount: 4,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Timur Pangandaran",
            latitude: -7.6904443,
            longitude: 108.662957,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFSeCsMW1KfKl25HbMK5q9O7w_c_nWw306aeRH_B__M8P3VMJFQyEmZiCMgv5yhb4BlzBn7uKvpeufw4FTe727np1GflThwHRH1rSdoD9e31zcoDhwDBk6S8JZFTbWEoNlWDgkq=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Tuti Jambal Roti Asli",
            slug: "tuti-jambal-roti-asli-2",
            owner: "-",
            destinationSlug: "pantai-timur-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Pantai Timur Jl. Ps. Ikan No.Komplek, RT.04/RW.03, Pantai, Kab. Pangandaran",
            phone: null,
            rating: 5,
            reviewCount: 11,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Timur Pangandaran",
            latitude: -7.694362099999999,
            longitude: 108.66013,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAF848zIoVo4HMDRA6nF7sYNUxaqaWhMuoMe7htIxq3olG8ft-LT_LYpmlKwuYjQ4OfTglmjp0_QB9GFgJyC0qk_b1BEbEncYxzfWS4Bgrrc8ZFPGzAuosigYLJcCJ4tKYROwlR7=s1600-w1200",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Kios Jambal Roti Elly",
            slug: "kios-jambal-roti-elly-2",
            owner: "-",
            destinationSlug: "pantai-timur-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "7MW5+V4G, Jl. E. Jaga Lautan blok pelelangan pantai timur, Pangandaran, Kab. Pangandaran",
            phone: null,
            rating: 4.4,
            reviewCount: 597,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Timur Pangandaran",
            latitude: -7.7028135,
            longitude: 108.6578034,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEDEhbz35IwF7ZQNywAAXUGmYXIlgf1AHCH08Ypgb1LyQ3aOj_YZyf27eS1oPdNDykD9ROQLLtfiKmbjBBggfWwlr2qbAClkfR9U2TPp-MxMCxDasGMhJxezAi7BWhF9Eb96sTf3g=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Exaq Accessories",
            slug: "toko-exaq-accessories-2",
            owner: "-",
            destinationSlug: "pantai-timur-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "7MX5+G3F, Jl. Kidang Pananjung No.206, Pangandaran, Kab. Pangandaran",
            phone: null,
            rating: 4.3,
            reviewCount: 11,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Timur Pangandaran",
            latitude: -7.7011435,
            longitude: 108.6576521,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFX-uXfKRBRNN_A4sn1oA-WpR_X6e21_UBDUCwE5hpSqL86Ekt4xRoQiOsVpA4H3YcEgGoV_2d-hD6acJn-gmux9Nq6y3ShG7dsGuH4PGmCHbrG3XmtfYRRSegbn1gf6wzflN2wcg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oasis Pangandaran",
            slug: "oasis-pangandaran-2",
            owner: "-",
            destinationSlug: "pantai-timur-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address: "8M25+C38, Pangandaran, Pangandaran, Kabupaten Ciamis",
            phone: null,
            rating: 4.3,
            reviewCount: 25,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Timur Pangandaran",
            latitude: -7.6989547,
            longitude: 108.6576456,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFDPmbcaN8lV_eDywp1FNx6a1P88pacJdJNhe5J-Z19k9AJV9HbDJwFFRFzHkeVm2UVkdn9StytpYRNf8sNtAdDuNjJtXSYFILSBBBE_l4cwvUkuDtgrXgpel2uAz_mvV-j3p-dlQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Hello Beach Coffee And Bakery",
            slug: "hello-beach-coffee-and-bakery-2",
            owner: "-",
            destinationSlug: "pantai-timur-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Pantai Barat No.1, Pangandaran, Kab. Pangandaran",
            phone: null,
            rating: 4.4,
            reviewCount: 57,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Timur Pangandaran",
            latitude: -7.7011857,
            longitude: 108.6576213,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEiz4zFxCgN_d2e7jTRK6NljFzcF1xNHctz56omxsb9Pd98qnipJvVvOL9Cd92ihRzzRBfgF1PquzApJuA9DIo1bGjWhI7uVo78QpzZoMW3Ce_d319PNmC_0bqbpVED209wE-Au=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "MAY WAY ( Yusiro ) Beach T-shirt",
            slug: "may-way-yusiro-beach-t-shirt-2",
            owner: "-",
            destinationSlug: "pantai-timur-pangandaran",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Pramuka, Pangandaran, Kab. Pangandaran",
            phone: null,
            rating: 4.8,
            reviewCount: 57,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Timur Pangandaran",
            latitude: -7.6958484,
            longitude: 108.6543121,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEZj_3gUYPcjAOWaxIaFN1OYr3z7OWh1RMhDd_SUN-GqTJ-dHMXNoqG-bPpA0Q6PMyLaDAkZyV7NOpdZ1HaxKFoXLTQYh263yegeASgH69gvYbNBPb5JB2sVCUn-Lpo-9igAyOU=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Gerai Oleh-oleh Geo Park Cileutuh-palabuhan Ratu",
            slug: "gerai-oleh-oleh-geo-park-cileutuh-palabuhan-ratu",
            owner: "-",
            destinationSlug: "pantai-karangwahu",
            categorySlug: "oleh-oleh-souvenir",
            address: "2FV5+X6F, Cisolok, Sukabumi Regency",
            phone: null,
            rating: 4.5,
            reviewCount: 2,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Karangwahu",
            latitude: -6.9550636,
            longitude: 106.45806,
            images: [],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh-Oleh Cidaun R&L",
            slug: "oleh-oleh-cidaun-r-l",
            owner: "-",
            destinationSlug: "pantai-cemara-cipanglay",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Kp Babakan Garut RT.05 RW.06 Desa Cidamar Kecamatan Cidaun, Cidamar, Cianjur Selatan",
            phone: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Cemara Cipanglay",
            latitude: -7.492000599999999,
            longitude: 107.3625757,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHBAdiq8lz9tBHMRY4NrsP_HHU6dGvAiBBTId6BRPleKMg01C80JElHNhqBfxArtJllkZyQt9b49cYAZP_OYVwm1DYYknk0TlknKbJ5inloqpO1E_6TU0r5W1U41kykTvTIIwk=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "RM Ponyo Rasa 2",
            slug: "rm-ponyo-rasa-2",
            owner: "-",
            destinationSlug: "pantai-cemara-cipanglay",
            categorySlug: "oleh-oleh-souvenir",
            address: "G965+M79, Cidamar, Cianjur Regency",
            phone: null,
            rating: 4.5,
            reviewCount: 391,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Pantai Cemara Cipanglay",
            latitude: -7.4883402,
            longitude: 107.3582424,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEFuJ9_fm-NaneqnVimF5RigOohJ7BFTlOABg49lOfOr72-DIXmkBmQjB1qNLy0EuSlVW9NhEsuXU64qtrkcrxX4WuW-z5zl992ZaoTat4ge6SXN8ZIxNPk5HnLP6ogRHUDzVe9=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Jakarta Oleh Oleh Cipayung",
            slug: "jakarta-oleh-oleh-cipayung-2",
            owner: "-",
            destinationSlug: "taman-rekreasi-wiladatika",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Cilangkap No.1, RT.8/RW.2, Cilangkap, Kota Jakarta Timur",
            phone: null,
            rating: 4.9,
            reviewCount: 49,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Rekreasi Wiladatika",
            latitude: -6.340356099999999,
            longitude: 106.9028968,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFYi71iPK3y1nYapDkX5Jb3UGtTrsbFr4sSiRXvWhsXZfMgZp94UcMuiHREi8jG12E_b0sSS0jjHymrKK_OTu4Ba8S06UPL9BGhMdVvYcWAGW5IQq8H7uIdRPOUppT0AamKFGc6F6OxFoxb=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "BINUMART Toko Kurma, Air Zamzam Dan Oleh-oleh Haji / Umroh",
            slug: "binumart-toko-kurma-air-zamzam-dan-oleh-oleh-haji-umroh",
            owner: "-",
            destinationSlug: "taman-rekreasi-wiladatika",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Ciracas No.5, RT.4/RW.2, Ciracas, Kota Jakarta Timur",
            phone: null,
            rating: 4.5,
            reviewCount: 55,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Rekreasi Wiladatika",
            latitude: -6.329904099999999,
            longitude: 106.8737094,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGGPEx4n1gWGm_8AI0XnivC_dMOETGfFa12l4OcIO8JX9NfVOxC0yLpSK6-cg_irQuoifvcSHbI83ea6gMKdp7GjbsNU0j7lsrtQ8Cvk51R1gHeeNi32Om82MUyXiVaKEQyj-wRZ4dNRY8=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko kue alinda (oleh oleh bogor)",
            slug: "toko-kue-alinda-oleh-oleh-bogor-2",
            owner: "-",
            destinationSlug: "taman-rekreasi-wiladatika",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "samping pom bensin, Jl. Mercedes Benz taman putri ) kp tlajung No.4, Wanaherang, Kabupaten Bogor",
            phone: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Rekreasi Wiladatika",
            latitude: -6.418624899999999,
            longitude: 106.9349581,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGKyV4nqsA75nr26JagJPT--uKile56v7kgNnQEm8JtHsV37uL9B51iZplmaPTu1FjFjA4aevDdt6G-1KHzp1zfaqKuD6VyvSjo4zRccVDFmO2dYxg4TMnVy3HMsurSmFOIS9dTevEOU5LJ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Lunar Cake And Cookies",
            slug: "lunar-cake-and-cookies-2",
            owner: "-",
            destinationSlug: "taman-rekreasi-wiladatika",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Perumahan The Address Cluster Deluxe, Blk. H No.12, Leuwinanggung, Depok City",
            phone: null,
            rating: 5,
            reviewCount: 53,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Rekreasi Wiladatika",
            latitude: -6.3990914,
            longitude: 106.9118795,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHwZElGkaeJEGZ3511S3ZfEpDcNaCEiDSEroEv3OKQ_SnoY3WOo4zN4LdOjoTFtSiKOSZu3eRrnpaj6M6VhF9ylCs4ll8RB2NW96cXzmIvWE576b9msUOOrzCIeONuWE_s2SOM=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Al-fira Cibubur",
            slug: "al-fira-cibubur-2",
            owner: "-",
            destinationSlug: "taman-rekreasi-wiladatika",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Alternatif Cibubur No.12, RT.003/RW.018, Jatisampurna, Kota Bks",
            phone: null,
            rating: 5,
            reviewCount: 58,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Rekreasi Wiladatika",
            latitude: -6.375242000000001,
            longitude: 106.9096453,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAH60Y-8RkNeSAcSdv4tp73VDFa0DAMvOwyroxb7UMYBQir0FpNFj8INQ6HkzyKK9ye7fEa04kO5ss-6Yh9MiKr7ZKShnjUcB7-Gykwm-YhV1HGU86-QnvLcmOUEg2D6Wv3ERNfsyEuAFT22=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "LAPIS BOGOR SANGKURIANG, KEADILAN RAYA DEPOK",
            slug: "lapis-bogor-sangkuriang-keadilan-raya-depok",
            owner: "-",
            destinationSlug: "taman-rekreasi-wiladatika",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Keadilan Raya No.11C, Abadijaya, Kota Depok",
            phone: null,
            rating: 4.7,
            reviewCount: 25,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Rekreasi Wiladatika",
            latitude: -6.390304599999999,
            longitude: 106.8521058,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFgqjAG6pXFtZ6oUkDq9ND5emem7FxXjywSq5FEAaif1BwZKku1gwrYyor6VhtqlDzbT4SoKJZQhCUXGnuTPq6NeEvsGQPPI5lcJe_3Nrx_2_fVi2Sfr8EA0v2l9fuczbKmVWvjOVSnD1Wu=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Warung Asinan mamah kembar",
            slug: "warung-asinan-mamah-kembar",
            owner: "-",
            destinationSlug: "taman-rekreasi-wiladatika",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Gg. H. Syawal No.8, RT.8/RW.7, Pekayon, Kota Jakarta Timur",
            phone: null,
            rating: 4.4,
            reviewCount: 16,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Rekreasi Wiladatika",
            latitude: -6.3511302,
            longitude: 106.8647853,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHbVYvIw3tvQ8Pa2OPguJ0oVwybNxdednUxnlFYGAp52Mr5KGixZF8nR02jYp96ZoqU-9xNNLX01x63s4LDB7ga5eRHmDTO7PAULQvl6k4XTWwqL91dTNygEDejV069NqEqBvCj=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Pusat Kurma dan Oleh oleh Haji",
            slug: "pusat-kurma-dan-oleh-oleh-haji",
            owner: "-",
            destinationSlug: "taman-rekreasi-wiladatika",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "samping indomart, Jl.Dongkal No.C54, RT.04/RW.08, tugu taniSukatani, Kota Depok",
            phone: null,
            rating: 4.9,
            reviewCount: 13,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Rekreasi Wiladatika",
            latitude: -6.3966638,
            longitude: 106.8804573,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHUMoqyl47RvqGSl11PUpTO-vrYvVz_O6J0pzLpdglCayhzKriY68c09fyYAC8lSjJ2llYu3iLfcSc5q6ahtVR2FWQO5wJhM35xIZ066kZHahI8x0uaqrErx6bQERp-lZUT-CwH=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Kue Dwi",
            slug: "toko-kue-dwi",
            owner: "-",
            destinationSlug: "taman-rekreasi-wiladatika",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Bogor KM. 26 No. 2, RT.01/RW.08, RT.1/RW.8, Ciracas, Kota Jakarta Timur",
            phone: null,
            rating: 4.6,
            reviewCount: 401,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Rekreasi Wiladatika",
            latitude: -6.331086399999999,
            longitude: 106.8672514,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAF2jVAaqag_awqt5B0MS_BZ62zKGqmb8Oo0iproFM0GF0V7MzPHRq1Dj5hXZan8jnqLMCRgiaEDkqmrSXh_gjDEM5btJ8gDECVkixWwpoUgXM1xYZGrOOeoYG9W7XXzQq5SiocGSQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Roti Unyil Venus Jl. Alternative Cibubur",
            slug: "roti-unyil-venus-jl-alternative-cibubur",
            owner: "-",
            destinationSlug: "taman-rekreasi-wiladatika",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Alternatif Cibubur No.9A, Harjamukti, Kota Depok",
            phone: null,
            rating: 4.5,
            reviewCount: 278,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman Rekreasi Wiladatika",
            latitude: -6.3763939,
            longitude: 106.8986982,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFC1VhhCIglIbp9xlAex6-zFK8LzQCbwK1yzzhIPOGMYHwfxGjVfo8G0rUzPn4EcGVmPg6tW5dPUDEYki0uWBTNLVj-5s7D20x9-WFSDEGwpbGwZV42aN1PpiDzE8b2K0neRJMN=s1600-w400",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "LARIS Lapis Talas Dan Pusat Oleh - Oleh Cipeucang",
            slug: "laris-lapis-talas-dan-pusat-oleh-oleh-cipeucang",
            owner: "-",
            destinationSlug: "taman-rekreasi-air-fun-park-grand-nusa-indah",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Raya Cileungsi - Jonggol, Cipeucang, Kabupaten Bogor",
            phone: null,
            rating: 5,
            reviewCount: 661,
            validationStatus: "PENDING",
            description:
                "UMKM di sekitar Taman Rekreasi Air - Fun Park Grand Nusa Indah",
            latitude: -6.4246588,
            longitude: 107.0355682,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEJW_5NgEoh0d1kl-0DgsAdJqapidw8gMMqrp8yDtnh6Nxq3WoNbqMuOhg7JqoOLvx6e1TFrx61lUWNu3dnQbVaAt2ZPdsm2gN0LFx3nFwEkvfTAnqPJGtsHjrKP-B5yMu4iDA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "LARIS Lapis Talas Dan Pusat Oleh - Oleh Cibucil",
            slug: "laris-lapis-talas-dan-pusat-oleh-oleh-cibucil",
            owner: "-",
            destinationSlug: "taman-rekreasi-air-fun-park-grand-nusa-indah",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Cileungsi - Jonggol Kp. Cibucil No.Rt. 05 / 02, Gandoang, Kabupaten Bogor",
            phone: null,
            rating: 5,
            reviewCount: 509,
            validationStatus: "PENDING",
            description:
                "UMKM di sekitar Taman Rekreasi Air - Fun Park Grand Nusa Indah",
            latitude: -6.4421729,
            longitude: 107.0563465,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFzctevlAvfIV-eZyBb8xRPmbeJhj2XB9Kpnc40EtfzenqB3QIbDnuMtH3mXSa6lLnpQ4cv3yiofFleoa3bMN07pDzbHG3PKpd0OwZpryaLVoxT_oVllRjEmikIiuXcH6AuN-wlzvIySTp3=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "LARIS Lapis Talas Dan Pusat Oleh - Oleh Mekarsari",
            slug: "laris-lapis-talas-dan-pusat-oleh-oleh-mekarsari-3",
            owner: "-",
            destinationSlug: "taman-rekreasi-air-fun-park-grand-nusa-indah",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Raya Cileungsi - Jonggol, Mekarsari, Kabupaten Bogor",
            phone: null,
            rating: 5,
            reviewCount: 617,
            validationStatus: "PENDING",
            description:
                "UMKM di sekitar Taman Rekreasi Air - Fun Park Grand Nusa Indah",
            latitude: -6.4096606,
            longitude: 106.9850801,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHoKyQul2u_Bu0Ioh0cmgcipLV85qy4cioejU_9_RkczXBQ1q8ina6ZmQgpWc1-QugSltBUiFXAX1B3u-vURwsMJMcAAGbWKUFBnDW25Bn60b4d9yBVv7dRcmBdpEshR_Mi4-n0gnZeU-oc=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh-Oleh A.F Khas PASIGALA",
            slug: "oleh-oleh-a-f-khas-pasigala-2",
            owner: "-",
            destinationSlug: "taman-rekreasi-air-fun-park-grand-nusa-indah",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Prumahan, Blok M9 No.11, Jl. Utama Persona Kahuripan, Cikahuripan, Kabupaten Bogor",
            phone: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description:
                "UMKM di sekitar Taman Rekreasi Air - Fun Park Grand Nusa Indah",
            latitude: -6.4542195,
            longitude: 106.9820771,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEoMRfjP2zbEFJJMrrkbIS8xJTgkweUaCJQ-zVuBb6EQ2oTNogaFFG7AX-p6kf3XRjAbbCfCmp_eMkquTUR2J8eosMkLw336MbU-h3bauXo9KBzPi9E5LVBwWKImIeJu34OW1sfKWJGXvms=s1600-w720",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "TRAVEL UMROH AMANAH TERPERCAYA SAMIRA TRAVEL & OLEH OLEH HAJI, UMROH",
            slug: "travel-umroh-amanah-terpercaya-samira-travel-oleh-oleh-haji-umroh-2",
            owner: "-",
            destinationSlug: "taman-rekreasi-air-fun-park-grand-nusa-indah",
            categorySlug: "oleh-oleh-souvenir",
            address: "Pesona Kahuripan 4, Bojong, Kabupaten Bogor",
            phone: null,
            rating: 4.9,
            reviewCount: 17,
            validationStatus: "PENDING",
            description:
                "UMKM di sekitar Taman Rekreasi Air - Fun Park Grand Nusa Indah",
            latitude: -6.4466408,
            longitude: 107.0114119,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHRjJ5tDzwmL-vFO9ZYRSLkjku2bfvgMtuA7nBVT7uqG3uwLmZPuMs3dj521eupkwdzInyq5q1BtbHR0kfvfGOlgpPJSi8vZA942dSheMM_ZmzcQ1uCEO0qZskkX1Bsb7YvA5ZDhXnkdI2d=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Lapis Talas Bogor (Cileungsi)",
            slug: "lapis-talas-bogor-cileungsi-3",
            owner: "-",
            destinationSlug: "taman-rekreasi-air-fun-park-grand-nusa-indah",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Raya Cileungsi - Jonggol No.1, Cileungsi Kidul, Kabupaten Bogor",
            phone: null,
            rating: 4.4,
            reviewCount: 143,
            validationStatus: "PENDING",
            description:
                "UMKM di sekitar Taman Rekreasi Air - Fun Park Grand Nusa Indah",
            latitude: -6.4072314,
            longitude: 106.9712458,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFd3AKLth9k-QgHbz_7WrVV-Y8wQW8ymOPPmbc43Ii7ijhtZ2QVKHyYvuRvYpZZkzGlROWaTBmvn9nIRTezR6ITo8BhI6Z8t09S5l3cKgVgN3a9VMOsU5baF50CV_Gx6wae518jqw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Langgeng Jaya putra",
            slug: "langgeng-jaya-putra-3",
            owner: "-",
            destinationSlug: "taman-rekreasi-air-fun-park-grand-nusa-indah",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jalan Rawa Hingkik Pintu Masuk KTM No.Samping, Cileungsi, Kabupaten Bogor",
            phone: null,
            rating: 4.5,
            reviewCount: 57,
            validationStatus: "PENDING",
            description:
                "UMKM di sekitar Taman Rekreasi Air - Fun Park Grand Nusa Indah",
            latitude: -6.397570399999999,
            longitude: 106.9714678,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEacXczHZxDJYJiuj_jv1krduTo4cwciPktlwr5euNbD6wUoYoZix8gPd4SuVz7YUosQ5aQdjK9c_t1LQgGiEnOKicFCeS4wkTzD-CkYBtm2UyWHOscSdBBlF0cAf8DZ5G8yo9r=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Juer Lapis Talas Sangkuriang",
            slug: "toko-juer-lapis-talas-sangkuriang-3",
            owner: "-",
            destinationSlug: "taman-rekreasi-air-fun-park-grand-nusa-indah",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "ruko ptm, metland cileungsi 1 no.17 a, Kp. Parung Jambu, Cileungsi, Kabupaten Bogor",
            phone: null,
            rating: 4.6,
            reviewCount: 177,
            validationStatus: "PENDING",
            description:
                "UMKM di sekitar Taman Rekreasi Air - Fun Park Grand Nusa Indah",
            latitude: -6.3977662,
            longitude: 106.9728816,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFjA3cJTUv2WI_fSUPk4aZ0ktalmBvX_gincG3JEr3pkNWq0H9Kk-nZg-5IrSEU428Wsuewx0q0pE_P59xFfPVzS7o4tVSCRYeL-jFJmzVOQWa1y3K3rk22DjKziXxlVfVVzumzIQ=s1600-w960",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Mayasari Siliwangi - Bakery Oleh Oleh Khas Bandung",
            slug: "mayasari-siliwangi-bakery-oleh-oleh-khas-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Siliwangi No.1, RT.003/RW.003, Lb. Siliwangi, Kota Bandung",
            phone: null,
            rating: 5,
            reviewCount: 1091,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.8857174,
            longitude: 107.6125005,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAE0tB-NqggF5K4j65WZPPlBsASALaqPvAZgE1an6voyG3vPIl937bl7P2RNmtuDnxgypB0ORUccxRTU9Tht9GBbHynybLg_isziXhfBLg3kAPVoi--9IxfNTecgkcyMdCWSHOD7qg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Mayasari Stasiun Bandung - Bakery Oleh Oleh Khas Bandung",
            slug: "mayasari-stasiun-bandung-bakery-oleh-oleh-khas-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Pasirkaliki, Bandung City",
            phone: null,
            rating: 5,
            reviewCount: 811,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9138008,
            longitude: 107.6025968,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHJUlri5hdaj54JzYw2dTy6xrJfSN4S-FBlrKLJSKpvLsd0E7ZHrKuSaHZWuVcRZrFIKJfmWv8OaKim4WXPxmOKC_VCv1hqm5DPiFOP9AiGNkRLaSPs16hNn1s01zSbX1UqdLKw30crksgu=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Chiffon De Bandung Official Store – Oleh-Oleh Khas Bandung",
            slug: "chiffon-de-bandung-official-store-oleh-oleh-khas-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Ruko Kiara Artha, Blok B-16, Kebonwaru, Kota Bandung",
            phone: null,
            rating: 5,
            reviewCount: 48,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.916214699999999,
            longitude: 107.64344,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAH2q1jDCBU0ZPV_tGv-Gdi179YLadjHGzY9oETVW_B7IRxWa02kvrQLoL0Kne26A0m9HhCOzw0eN_BVIj1fEwFETA3HRC8g2Q-T9POR5_V_YClzg4177sbYNCPGNo-xiMk_YLr9Gn72cErl=s1600-w900",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Bolu Susu Lembang Dago - Oleh oleh khas Bandung",
            slug: "bolu-susu-lembang-dago-oleh-oleh-khas-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Ir. H. Juanda No.81, Lebakgede, Kota Bandung",
            phone: null,
            rating: 4.9,
            reviewCount: 979,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.897862000000001,
            longitude: 107.6125362,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFSRhx7LibUC9H_K_I9vhZ0o1LcUroxihI7tLAHtTi8KEvaRCF2sTpDXb9EtQNzFj5ST-qTxJ9RgHzqAbhh9Widy8HGzzHVpPEeqHURPqyAqu0GdLOae4daFEkC7nd-dkTLo2iKploJdwXQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Bolu Susu Lembang Jalan Riau - Oleh oleh khas Bandung",
            slug: "bolu-susu-lembang-jalan-riau-oleh-oleh-khas-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "LLRE Martadinata St No.57, Citarum, Bandung City",
            phone: null,
            rating: 4.8,
            reviewCount: 2619,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.906114499999999,
            longitude: 107.6158489,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFdsMoleAO78xpZtmMCQFjhjmownVcd9tKyDGYotoZ9BIsUrK6wA-AxePM_-nxPaWnti-W6ymqnc9F9-KQK8S0onJ_eh11EC0tk4mLeM-bgJ5xlfo2YpZVetNLmZBs7J59lJMb1=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Mayasari",
            slug: "mayasari",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "LLRE Martadinata St No.87, Citarum, Bandung City",
            phone: null,
            rating: 5,
            reviewCount: 796,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9057442,
            longitude: 107.6192697,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFkoaYtb8s_74-_yUlc39SV-CrJg0L5FBn8AQE2CIG16V2S3nmsVK1hqnLm_54mkxf7TUs7bVeqWF5ha15tUSxSGAoqUlqmx3mFBHaRJKIitUb0MYxYUY_Xiz1RU73ef5BjrQlIsyeZO40=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "WARISAN Kue Oleh Oleh",
            slug: "warisan-kue-oleh-oleh",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Purnawarman No.40, Tamansari, Kota Bandung",
            phone: null,
            rating: 4.8,
            reviewCount: 987,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9060093,
            longitude: 107.6094414,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHQqWnRNIFb5esY-hGaQ6yZxtltAKbhKiMM6vuOiz-5inBPdSrYHpOojjSP2flPVEY_0AYOJ8xJT8oIwoQU2eZANuZAZaiSskHCoWAip4kGPFkC2euWYh2ylQ3AzH8KCTBJClfVDt_xfAfS=s1600-w1080",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Prima Rasa • Bakery & Pastry",
            slug: "prima-rasa-bakery-pastry",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Kemuning No.20, Merdeka, Kota Bandung",
            phone: null,
            rating: 4.6,
            reviewCount: 5401,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9157642,
            longitude: 107.6278733,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHaEbbgWeIND1tLpTPaiHyswsrWxW1tD92hv-zHZUzd1_rJ1WeraHhjHcb9ul7QycFmiFIRMo7Q7Whn9HpF7RsF49V_xYHsY5UW-6z_knoTpg0xkUD7jT6tobsEEz37ehb4jHs=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Bolu Susu Lembang Cihampelas - Oleh oleh khas Bandung",
            slug: "bolu-susu-lembang-cihampelas-oleh-oleh-khas-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Cihampelas No.153-159, Cipaganti, Kota Bandung",
            phone: null,
            rating: 4.9,
            reviewCount: 993,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.8931279,
            longitude: 107.6043033,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAG5WmDRaoR4GRo8vgGpiE4q2JMJXwC0ndykKUM-QAK1v6uOenBHoPMsv-EGis87dePAF0Nd9VUca3jeBN-vAZfQrqmulq5ijKUYX-ixiQ3J4OdT-9-Ub7hqOGSIDQT5xA6aYqZD=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Kartika Sari Pusat",
            slug: "kartika-sari-pusat",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. H. Akbar No.4, Pasir Kaliki, Kota Bandung",
            phone: null,
            rating: 4.5,
            reviewCount: 4538,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9119648,
            longitude: 107.5998354,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAF-kAJSq1h_V6BiNFHmSeft7jZcirBnh4J7VTebercXJzVWSUHZWFrdj_0K5xDaH2mMhb0F-pPo53VSQcOzxwK6iAK7h6c0Y-oxnR_4I-jUqfXwDuJqr3refKMd3DKJ13o0mfYO=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Saya Suka, Oleh-oleh Bandung",
            slug: "saya-suka-oleh-oleh-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Sukamukti Jl. Pasteur No.10, Sukabungah, Kota Bandung",
            phone: null,
            rating: 4.8,
            reviewCount: 127,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.8994658,
            longitude: 107.5967981,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHh9hO7PaVUSSGKHr6eRp-Gv_2SUowwudooOWWRohWNCds64dKcBTQCYdVveDQIqq_MMkEZi4mxI9FGZonm0kmGfvl-EpLIbCtBJD189aYlHxdyvyy_EYUng0hDA67z5cPcc_Zjmg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Bolu Susu Lembang Stasiun Kiaracondong - Oleh oleh khas Bandung",
            slug: "bolu-susu-lembang-stasiun-kiaracondong-oleh-oleh-khas-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. St. Lama, Kebun Jayanti, Kota Bandung",
            phone: null,
            rating: 4.9,
            reviewCount: 661,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9250529,
            longitude: 107.6463011,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFenlaLr96qrBqf1_7TAkAgde4xThbtFh2TGpc2FJ_eaUCHG-ij9B3ZS1ce9fw3i0pbf8Wt_sGJV0ZcGFFYxxoNxq84lXP3G5wnuYOpW_9-VRsBhmwMCJpM3Q0KR1w6olheTxxa5KnAcv8=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh-oleh Kabayan Cisokan",
            slug: "oleh-oleh-kabayan-cisokan",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Cisokan No.54, Cicadas, Kota Bandung",
            phone: null,
            rating: 5,
            reviewCount: 19,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9032429,
            longitude: 107.6331848,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAE8xPyd5mDzFSqg-8234vSvGsHM3mWPTzPU0htxZ8F5woP1Hjdobp0nijgHgEzpI1ueSqUqzDjYiiDYPa2H39-o4awUbc8ZnxlK4UoLSnUQAxgVicz-i_-pmHenY_temraSoYNm_ka1XbbA=s1600-w1080",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Oleh Oleh Khas Bandung Genah Rasa",
            slug: "toko-oleh-oleh-khas-bandung-genah-rasa",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Leuwi Panjang Kelurahan No.139, Kb. Lega, Kota Bandung",
            phone: null,
            rating: 4.8,
            reviewCount: 253,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9454458,
            longitude: 107.5954832,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGhnUn-4DaCDptuuIIcnymMEdEmovxu_3d_d9Ksd6GKUzjBvJ89HllgsK4fj1ZF-phObe14vKOHhvKwIDCgv-Z6HyssA5hSssXwA8gctr95Ip9QC4cpNJtiCUT1UwN_K9dOEWGr=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "TOKO OLEH-OLEH BANDUNG SARI INTAN",
            slug: "toko-oleh-oleh-bandung-sari-intan",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Ps. Kosambi, Jl. A. Yani No.158, Kb. Pisang, Kota Bandung",
            phone: null,
            rating: 4.6,
            reviewCount: 67,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.919661499999999,
            longitude: 107.6218715,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFX7t1E-djtbwFBzlsPbfM4ot_YQt4Y6v2qBAYjlv4PPxJbgCfotptDAHzW0cxRwXJ3tgllxoM1604yrNCeSZaHLg1yTGbA23wminzikJ3WSFMbB1a6MuenjtCi4ktOK3RD2EpK=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: 'Oleh - oleh Bandung "Haji Heri"',
            slug: "oleh-oleh-bandung-haji-heri",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Suniaraja No.129, Kb. Jeruk, Kota Bandung",
            phone: null,
            rating: 4.8,
            reviewCount: 16,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.916205199999999,
            longitude: 107.6028753,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAER__hu7ixh68wBhVoEhhgZsLc5fYzZx0nL8IOVJdpVjE1ZD7q1h4vsaHtCPHEFSV5n097glHNbHtrAGzX3neiRoKs5LKrbymhfyl_pyNVZrzv6y3MtKAEXN76uE7KxvQwtmr0=s1600-w1280",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "OLEH-OLEH BANDUNG SIMANALAGI",
            slug: "oleh-oleh-bandung-simanalagi",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Ps. Kosambi, Jl. A. Yani, Kb. Pisang, Kota Bandung",
            phone: null,
            rating: 4.7,
            reviewCount: 219,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.919258600000001,
            longitude: 107.6220706,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAH9617Y3AOhV8sAXMbuA-jur3CRB0Fz3LLHSkS4t78UIfWubZD0yplD2Q5CIfvXWbBEiRBcgHck5jidMY1bzm7pnY918q6keYWO0xsty_gim0SW-kLwplIBFJiAzbRTFhg9lto=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Chiffon De Bandung - Oleh Oleh Bandung",
            slug: "chiffon-de-bandung-oleh-oleh-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Komp. Griya Caraka Raya Jl. Blk. B No.10, Cisaranten Endah, Kota Bandung",
            phone: null,
            rating: 5,
            reviewCount: 152,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9314398,
            longitude: 107.6734025,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAH4KDjdKt68qduRYWM0V5kIy_eC6kujq7YSBL_5IWWckty8aLC-e-YbRBiGiYlolK89ML35-DjQn3QxGEyY09mjUBcBgVBe25bXy_kRgn9mxP19LrFDmxddvBivBDBzOO5zEjJNmQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Bursa Sajadah - Perlengkapan & Oleh-Oleh Haji Umroh",
            slug: "bursa-sajadah-perlengkapan-oleh-oleh-haji-umroh",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Inhoftank, Pelindung Hewan, Kota Bandung",
            phone: null,
            rating: 4.7,
            reviewCount: 813,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.940563399999999,
            longitude: 107.6036131,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFeNssfy63z4lQyyczf--eZsw6zbMLK2MrVyjIIFhlm22XipS3qdL8tHt86avLIMIU359ltpwMKTD-SYtgJ6bFNuHvJLo7PLHXFD00GEHA6kvmc0XQG3exRQPSYJZPWn33LCDgM=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh-oleh Bandung Jatirasa",
            slug: "oleh-oleh-bandung-jatirasa",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "pasar baru bandung, Jl otista Blok D1-M1-B32, Braga, Kota Bandung",
            phone: null,
            rating: 5,
            reviewCount: 32,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9175342,
            longitude: 107.6045391,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFZI5DBc7MN8R8VPTtxT4r-oeGMCCOCTZjEb1-TF9BrET1bMOmZvqJRI5S0EX8x07YLOOFdJ4O-TWjdd_B0BW8fTtlYmVFzLUVkFwpbPJ1UgBl89uTU4uMGJDThz5j68oBsl2Ky=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "RAOS PAK SIROD (oleh oleh khas Bandung) pasar kosambi",
            slug: "raos-pak-sirod-oleh-oleh-khas-bandung-pasar-kosambi",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Ps. Kosambi, lantai semi basement, Kb. Pisang, Kota Bandung",
            phone: null,
            rating: 4.9,
            reviewCount: 34,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9195211,
            longitude: 107.6220544,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHcNPVg1wF2_V4pUKA-c4FcMuLKOqOC2uaOKlMekNQXxcCR3dXqdcg8-F_GFrjzRV7nQmNSDIjWJ8CihdiAgnoxa8_jc4zNYAhALilnqvtt-1QZBCRf2TTBrZgbIeC1msm5HvmQjA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Prima Rasa",
            slug: "prima-rasa",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Pasir Kaliki No.163, Pamoyanan, Kota Bandung",
            phone: null,
            rating: 4.6,
            reviewCount: 4098,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9029099,
            longitude: 107.5972795,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAErCR6SlIMOHtRdVbFt-V4bz3xemjFXRwuaxJrOq3lVJjdSjAfDSY6Vbm4XNGZ6qb7xbTcReTe58hErgevvv4PHje_95xeXvGW06V4FqPsi3LaCfv2iMRAt-ut3khcE_lO96uHobBy-6J0Q=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Mayasari Kebon Kawung - Bakery Oleh Oleh Khas Bandung",
            slug: "mayasari-kebon-kawung-bakery-oleh-oleh-khas-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Kebon Kawung No.22 B-D, Pasir Kaliki, Kota Bandung",
            phone: null,
            rating: 4.7,
            reviewCount: 2421,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9124064,
            longitude: 107.6021726,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHF_NAO4qa8dVXRKnGoGM5dVaGlNbkKoXV9srjKqUApgCFbOFBF-0NxS289ugxjxmL86_TznN5vWE6LnKUP7xTDBAl1o-KxSwiIcJJ9jWDpDIwdsbB3P69ojjH_Kbn9Q3GDm6gt_hNVk3ys=s1600-w1080",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh-oleh bandung TIGA RASA 2",
            slug: "oleh-oleh-bandung-tiga-rasa-2",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Pasir Kaliki No.107, Arjuna, Kota Bandung",
            phone: null,
            rating: 4.2,
            reviewCount: 87,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.907610200000001,
            longitude: 107.5974648,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEvsrxqfe3cqDKVFyo6zSkgs0om-E8wNtJzzNnzeZEgay0X-ig5PiDDiwagqZt3UxO9WxyVqJnO77RFfBlHGaXvOJxzelzZVNrNciXHOqEkToGkHqQFgsFOpbstrxtTPAAbbR_n=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Madinah oleh-oleh Bandung",
            slug: "madinah-oleh-oleh-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jln taman sari Baltos (Balubur town square) Lt D2 blok M01, Tamansari, Kota Bandung",
            phone: null,
            rating: 4.6,
            reviewCount: 49,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.8984785,
            longitude: 107.6086947,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFMPuxR6P70j1PksZ1af3uxEMCoVc7ahmW4lnbOZ1jmviDYad9hC_SO4mobcH-5B3QZwIPgdNBL0YpOYpBlfUq9JNV6wSy_3pVWEL6XIcR9IaGytzs6JGqJumwjHiIYHbuDvZ7arA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Kurnia Rasa Oleh Oleh Bandung",
            slug: "kurnia-rasa-oleh-oleh-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Balubur Town Square Lt.D2 Q-12, Jl. Tamansari No.3, Tamansari, Kota Bandung",
            phone: null,
            rating: 4.9,
            reviewCount: 15,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.898952599999999,
            longitude: 107.6088301,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFe7OiFDzrgYuwxs6jLhB9wuOSDYokNv1WdQm-AQbU6eflmaSI7GxrcHrwW-GKcFtfqA5iSwbdYboLGn9ATlQ38pJrnEJiBfQeVhvkXlF1i4cLOXAOL6LgvqCOUAQ6uhm4IqcQS=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Aroma Bandung Oleh - Oleh",
            slug: "aroma-bandung-oleh-oleh",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Sukajadi No.246A, Gegerkalong, Kota Bandung",
            phone: null,
            rating: 4.4,
            reviewCount: 12,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.8764834,
            longitude: 107.5964244,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGZljGkLKV9KqovGWzM9R464zVe3HxbpqlSfVm0DsekJfMLTzCVXhn9v0Sc12M6RbNvkfKYkw9U-tlVq36ewk06TQzto-uq8Gofps-qA6Ydx2UOyqhN7tvKGcf5w8tpjlzUZ49Qig=s1600-w1001",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Pempek & Batagor Jeol (Oleh-Oleh Bandung)",
            slug: "pempek-batagor-jeol-oleh-oleh-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Rereng Wulung No.23, Sukaluyu, Kota Bandung",
            phone: null,
            rating: 4.7,
            reviewCount: 151,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.8962675,
            longitude: 107.6311182,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAF7mfWArfJlynJkRFPCiS0Q5XftlD9DdEmpPCjK-oKbPBl3IcjbqoB4jgjGCRvWdcVK2YNpaCbhKvBCWsF4E74zsV6dPTEgXnmXJIJHUUSw_mqH_y3p_wWCyYNc7erGkVsCIfew=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Kurma Pahlawan - Grosir Kurma dan Oleh Oleh Haji Umroh",
            slug: "toko-kurma-pahlawan-grosir-kurma-dan-oleh-oleh-haji-umroh",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Pahlawan No.46, Neglasari, Kota Bandung",
            phone: null,
            rating: 5,
            reviewCount: 1384,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.8974356,
            longitude: 107.6345252,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGYrqrX-igsDyGtqvuojYL2UIM1qW6-MhNsRUMEtw-4Bhq1NfYQRJLBd-ZbpkTdCRC3SPZrgSBwHj4kMDLZLD9hZCjqChAG40ucjAa0-B-LDtyGRiST3POEJfKltF41hSyFf0O4=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "AMARO cake - bandung Toko kue & oleh oleh bandung",
            slug: "amaro-cake-bandung-toko-kue-oleh-oleh-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Veteran No.35, Kb. Pisang, Kota Bandung",
            phone: null,
            rating: 4.8,
            reviewCount: 540,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9192798,
            longitude: 107.6158035,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHhS3QkhRrw6lKBYFTeWPuhGy6XDYBTT2m8Fnze35HjnZEm9buiOMl61PzVrW52Ho9l3_L3pP1_GpYBUOunPJLdwq-Z5x7vzst8tx5y3Kk7i_WlbHcjBRv3RwPKRN78kx_416rA_g=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh Oleh Bandung Sami Rasa Milo Hj Tuti",
            slug: "oleh-oleh-bandung-sami-rasa-milo-hj-tuti",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Belakang Ps. Kosambi, Kb. Pisang, Kota Bandung",
            phone: null,
            rating: 4.6,
            reviewCount: 26,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9191628,
            longitude: 107.6215074,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEGn3mvdvbNWJlnx1IWEyduWCBRCMy4LJZtvlZHCMWBb8L8swtJZAiLWnoTinBWO7mLGgGeErVhr49b882I4OgP8I5rMMTHdGcKhq4-v0ha2JXx2w9J226nK2mIgq2VEHk4j6I=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Oleh-Oleh Bandung Barokah 1",
            slug: "toko-oleh-oleh-bandung-barokah-1",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Surapati No.52, Cihaur Geulis, Kota Bandung",
            phone: null,
            rating: 4.8,
            reviewCount: 25,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.899691199999999,
            longitude: 107.6276411,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEJvPGA6_zE6Bbhgrxkhk8KmvW2bNLA4DtN5LTPBSYTulNOEQ9TYYNatxigBa_YI1cRAHiLC9CNYfgR4dmwmTlWNkjOBgNkP9CmOnI3E6Y_YRFLcqUfAIMpf3tC3gWUdcwfwsUl=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh Oleh Bandung | Batagor Coy | Kuliner Bandung Paling Dicari",
            slug: "oleh-oleh-bandung-batagor-coy-kuliner-bandung-paling-dicari",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Ir. H. Juanda No.91, Dago, Kota Bandung",
            phone: null,
            rating: 4.5,
            reviewCount: 626,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.896933499999999,
            longitude: 107.6126378,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHWAuu91p2zdvI66abPpvWkE_cFY5piVmHlpyOY1KuZNLgw5zLBquFpI_0RBHyQcSKa7lBFYFXyunUdStUGV7n2iMmNUqaizDqlquiXAOwtuQUMBAmmjJFhnUzCAuDPyfJkM-FHVw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Tiga Rasa Bandung Food",
            slug: "tiga-rasa-bandung-food",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Leuwi Panjang No.123, Kb. Lega, Kota Bandung",
            phone: null,
            rating: 4.1,
            reviewCount: 78,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9445719,
            longitude: 107.5957723,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHx77RjK5V1mtP4q5q-vRg2LB3RyPTRIIMtvAp0FSwA9ENLd6vlLTM4VDSpddzasZyD4VcuxKeyyx_tC2dIpddReKTMs8OopHfMcs9b7T25sPznIZJcUMvTpm07Ysfrh74Hawkx=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "RKB GROSIR / GUDANG KURMA DAN OLEH OLEH HAJI UMROH",
            slug: "rkb-grosir-gudang-kurma-dan-oleh-oleh-haji-umroh",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Cikutra Barat No.101, Sadang Serang, Kota Bandung",
            phone: null,
            rating: 4.7,
            reviewCount: 13,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.8923047,
            longitude: 107.6287443,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHl0uYNWcV3I6pFJvJTeEuNA78lLzzZ9SM85yIRhFY1cEpU75nEkN3hmMa2lxjPruY39HDK8XKKFLiHtuqF9RSG3ewaawu1KxoXzPAvkg0eD00YUJP9ThDi6VmgHpEgq91ond1AIdUM_8jL=s1600-w1280",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh-oleh Nusantara",
            slug: "oleh-oleh-nusantara",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Cihampelas No.175, Cipaganti, Kota Bandung",
            phone: null,
            rating: 5,
            reviewCount: 4,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.8941009,
            longitude: 107.6043617,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGTTotiLwa5RJshNPn0qknkG_osm9bqitZMM46LHwk8aL9shPmFdmB85edVPOWC3I7ksu9ACprhwzitr78fdO6xqTDgIJKLmtigEOJfe4F69EeYMxHLEc7xBGNxGBEkLfVroso=s1600-w960",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh-oleh Sari Rizki",
            slug: "oleh-oleh-sari-rizki",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Leuwi Panjang No.125, Kb. Lega, Kota Bandung",
            phone: null,
            rating: 4.7,
            reviewCount: 31,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.944630399999999,
            longitude: 107.5957509,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHGJQt2-Xe2To3mRT0qzFC7f2vDRk8HB3zL7LyVcPfFAcvP1hX48xfZc7ofh8MuyJGdzMPmmvtQ8sp9Xj28GU8AWC0a2IFUpoTpnOd5LRlr-tVDxFZZD-6GsusOkM0xjJJJb81d6w=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Bursa Sajadah citarum, Bandung | Toko Perlengkapan & Oleh-oleh Haji/Umroh Terlengkap",
            slug: "bursa-sajadah-citarum-bandung-toko-perlengkapan-oleh-oleh-haji-umroh-terlengkap",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Gedung Aisyah, Jl. Taman Citarum No.9, Citarum, Kota Bandung",
            phone: null,
            rating: 4.7,
            reviewCount: 643,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.904786,
            longitude: 107.6209373,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEJyq5wy3k12ZZ9eC56gYj_JIIlJdSd2DiWVbYB3Yyxa8ZpRnJ4hGUolf3l7s8QdeepXmJtzA3pTHXwmTPKMNjV8DO0Lx-X9NeZQGYR-GZw7jBT-4yu4cqLKpecsF279zgUYVL2og=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Raos Pak Sirod (oleh oleh Bandung) palasari",
            slug: "raos-pak-sirod-oleh-oleh-bandung-palasari",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jalan palasari no 45 lodaya (sektor 45, Turangga, Kota Bandung",
            phone: null,
            rating: 5,
            reviewCount: 24,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9324879,
            longitude: 107.6220818,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEgArs2lvIJa0xSkXgo1hVex0P2jtpODwmrvjk7dxLH_r82VLbbBbt9Yk2w9o17s-Lcg9f2o4jUv5f8648s9aQcml30JCekXEqmOgXlX27_OJ6yK4976QUqOrQ85U3i0xDLHsd-HA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh oleh/cemilan SADULUR",
            slug: "oleh-oleh-cemilan-sadulur",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Cipamokolan No.55, Cipamokolan, Kota Bandung",
            phone: null,
            rating: 4.7,
            reviewCount: 6,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.942702700000001,
            longitude: 107.6773393,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFNNf0A4PvTtu6SupZ10fykdKrxeNWmqT5wJepSToQGChsoGFa6UY4LhxFGNXsvmJHlT0Nm1fgg36xxxRUvxAIicR_MEhY0ZWF3MyDvyweqsIM-yUTOH94swxEsdDHdCuFYUm5q=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh-oleh Khas Bandung Aku dan Kamu Sukamanis",
            slug: "oleh-oleh-khas-bandung-aku-dan-kamu-sukamanis",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Kebon Kawung, Pasir Kaliki, Kota Bandung",
            phone: null,
            rating: 4.8,
            reviewCount: 20,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.913696499999999,
            longitude: 107.602659,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGHvlhHh4BUtl6Pm3ug5gr3GxHGbdIGm1zEKT4Uv5x_QNuxbSMsDJhfR6jEyp42BMamTO3d6UJxNds5P47vZVJ9JLhp-IioDrDpyuuRLdbYWAJ98sRN9zDVLhfudVRFFhC6_NbZ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh-oleh Priangan",
            slug: "oleh-oleh-priangan",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. PSM No.61, Kebun Jayanti, Kota Bandung",
            phone: null,
            rating: 4.4,
            reviewCount: 21,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.929699299999999,
            longitude: 107.6475589,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAG1lRE7NqGe5i0hYtYZlmNnnfFOwso64D2LzAIbXK3ekds5mMJmtxBXCcBZ0isVRZ4zDhnhgRwkn9uleThyH3pNG8QpCloUomkzYwf7JXEBf-w9xONkcB_aTmgHiyRvkmbVkUvF=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh Oleh Bandung",
            slug: "oleh-oleh-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "CicendoKota, Jl. Kebon Kawung No.23 24Pasir, RW.KalikiKec, Pasir Kaliki, Kota Bandung",
            phone: null,
            rating: 3.4,
            reviewCount: 5,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9125428,
            longitude: 107.5989361,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFPezJPmnZxrUnLCdGF6SFQ4E4OSxMDYEQSmcyN0x4yizC85D2LDDSNjUeCmGZOPBrJZEgKpP6LfV1k51jFca7yDYb-dREcefNaEhfD6LT_4v_Wf1pBeImvnialJ5hF3bMDCouP=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "oleh oleh haji dan umroh (Berkah Mekkah), oleh oleh haji umroh paket lengkap, oleh oleh umroh lengkap",
            slug: "oleh-oleh-haji-dan-umroh-berkah-mekkah-oleh-oleh-haji-umroh-paket-lengkap-oleh-oleh-umroh-lengkap",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Karees Sapuran Kecamatan No.Timur, RT.03/RW.09, Samoja, Kota Bandung",
            phone: null,
            rating: 5,
            reviewCount: 2,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.922346999999999,
            longitude: 107.6248546,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGmZdCG4ZK3LTSiUpCH95t9d6_QjHox652xlf6WiPu14avH-X7hTDLwaKEqlH2_BDVXN6oT__FzoKy-TdPFwpJqVEi2Mi2vIKDarY7ncp--D5LcCgcrqy6fwcr6mmpklIww4Gcgivdvpj4=s1600-w1024",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Gudang Oleh Oleh Bandung",
            slug: "gudang-oleh-oleh-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jalan Kopo Imanuel 167, Situsaeur, Kota Bandung",
            phone: null,
            rating: 3.5,
            reviewCount: 16,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.936725399999999,
            longitude: 107.595253,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFBN90AslAnc0YKw9GCvZss_hvHnm484D4na0Rtz00kgZXcqeLNk9Ii49edZORb0QC_s3qvcSAxVbSUlUFmaJji7u2D92_HHld0Wg3YxFzYgGfi5cMBtv9AC4B2U5rv6kzW5HY6=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Karasa Noesantara Snack & Oleh-oleh Bandung",
            slug: "karasa-noesantara-snack-oleh-oleh-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Balubur Town Square Lantai Dasar 2 Blok N No. 1, Tamansari, Kota Bandung",
            phone: null,
            rating: 5,
            reviewCount: 18,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.898847,
            longitude: 107.6084782,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAErNLaaOSO34jDcvQcie9udnthbTi1nFxdFRx9La1Na6X1BhkpmMe0YIe2o2zMLoFiBwJByZK5wDusifBp_a1FzbHOPyPKtTmIWFlSZJCw3N6cBdqqd82Y5jNY8t2p2FrS9q9Cm=s1600-w994",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Bolu Susu Lembang ITC Kebon Kelapa dan sentra Oleh-oleh Bandung",
            slug: "bolu-susu-lembang-itc-kebon-kelapa-dan-sentra-oleh-oleh-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Pungkur No.44d, Pungkur, Kota Bandung",
            phone: null,
            rating: 4.9,
            reviewCount: 62,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.927536399999999,
            longitude: 107.6060232,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEoEbSyEU-Del7k4poo3k8mObyy1JKjE8IreI4tNTnguXFGFbsv1xE4GpZYjOKkeD8jzKTObHi556HblKkD4MNifSd4oXkQFwUmc0nstEPl5moiCt3PQLvw9LZWQN1yYE7NDgm6=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "D'nafta keripik pare cemilan oleh oleh bandung pedas gurih murah",
            slug: "d-nafta-keripik-pare-cemilan-oleh-oleh-bandung-pedas-gurih-murah",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Gang Dahlia No.100, Cigadung, Kota Bandung",
            phone: null,
            rating: 4.7,
            reviewCount: 27,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.8860527,
            longitude: 107.6325383,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHMVuz8wGzBsxpTl_WAbxNTkDE_p5ttNU8MWzxCaxaeLDLk71OMz7Ug2BqYlIHZ7OwS1SjTl9QzXs6-nGDgJCHdyoQTup_3tUUJDZ1prw81lPtFooDdiAc8vHWZg0wtbCy-XiWg=s1600-w1280",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh Oleh Haji Umroh Bandung - Nabawi",
            slug: "oleh-oleh-haji-umroh-bandung-nabawi",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl. Setra Dago Utara III No.6, Antapani Wetan, Kota Bandung",
            phone: null,
            rating: 4.7,
            reviewCount: 30,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.907471399999999,
            longitude: 107.6631644,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAH9zqr_7F1at4oHJFxLoklTgwRtaFynsrTUty5yNmOdhEh4eVHb8q0p8cPt4b1ssXCIYBXDQoCGhdGhA8UG1v4clNDxB-ZwO_GLkoEbkF81RBSiDhwF1Nv1gJ0uhW7H4HvitP0p=s1600-w1080",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Aksara Oleh-Oleh Bandung",
            slug: "aksara-oleh-oleh-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Perumahan Kavling 75, Z Jl. Bojong Koneng Atas No.69, Cibeunying, Kabupaten Bandung",
            phone: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.8842336,
            longitude: 107.6476421,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAESX5QEXNgRFVp8DeNChpTVLhv8Q6ONeSr7cMyEXdw8oV3lBrCx-mdEF4jaEHPqg8UsraSiDo29RzQCRIPhAdjWo-yymycu1NgwucoZvv6d9IhlmBb0yBgR36gZ2HBtT6IcgL2F=s1600-w1080",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh-Oleh Rasa Milo Ibu Yani",
            slug: "oleh-oleh-rasa-milo-ibu-yani",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. A. Yani No.143, Kb. Pisang, Kota Bandung",
            phone: null,
            rating: 5,
            reviewCount: 3,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9194387,
            longitude: 107.6225875,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFlLePExzqUFLW45AJ9SFTIvhmg1XeoGLszUT3w8dLt33hqptmY3s7EUBBsiafhyeYwusT5vKp7brxkpOPLr0S2_p5B95DPZfYnWjUt_UTp966Pdx4bT3FSgPIM5XiVmuqmXmrGDw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Bursa Sajadah MTC, Bandung | Toko Perlengkapan & Oleh-oleh Haji/Umroh Terlengkap",
            slug: "bursa-sajadah-mtc-bandung-toko-perlengkapan-oleh-oleh-haji-umroh-terlengkap",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Metro Trade Center, E-9, Sekejati, Kota Bandung",
            phone: null,
            rating: 4.8,
            reviewCount: 155,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.941267499999999,
            longitude: 107.658481,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAH_bBOoKtM_sBf-whuq02eX0xXg1WZpC-rJ-ZjzzGR_VPCu8i7t_7uM9LpNVQK0HsbalnUOJ5SBocP5EdaqdYzdb05_MzxVzjr-2YV8ST4DrU8p5dXSF5w_tJk53Cz-BFNQ1B4Dep4QkvC3=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Arbani Oleh Oleh Haji & Umroh",
            slug: "toko-arbani-oleh-oleh-haji-umroh",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Ps. Baru Trade Centre Lantai Basement 1 Blok F No 49 Kebon Jeruk Kecamatan Andir Lantai Basement 1 Blok F No 49, Kb. Jeruk, Kota Bandung",
            phone: null,
            rating: 4.9,
            reviewCount: 32,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.917614899999999,
            longitude: 107.6041986,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAE9m_4984UzA6htTzYIdY0jW_rfBFzQ8DWVkuykWXbo2TaEb9s6VKAMn4cqmYTRSXkoYElSe9pbLySrFP37karqexIskxIwmdW-u7rLrGXQaoZJENs7WtLficJ2NFtlG_meALJV=s1600-w720",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh oleh Bandung",
            slug: "oleh-oleh-bandung-2",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "Jl.sindangsari lll, Blk. D No.46, RT.03/RW.09, Antapani Wetan, Kota Bandung",
            phone: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.910385,
            longitude: 107.6627323,
            images: [],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko UNGGUL RASA CEMILAN DAN OLEH OLEH KOTA BANDUNG",
            slug: "toko-unggul-rasa-cemilan-dan-oleh-oleh-kota-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address:
                "3JJJ+39M Perlintasan Kereta 40273, Jl. Laswi, Samoja, Kota Bandung",
            phone: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9197862,
            longitude: 107.6309119,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEp2Ug68kYkYDufwmrvzE14X9ogU5569h4H0Atad8KiSapVncKAi5F6e_06tqDFIQQE5qOCrlEC9Ummupyoa4rwE_Z2vNTetGMvelRYer-0_bisZ1U0FPydI8jQf9vxbFO5afC6=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Oleh oleh Khas Bandung Saung Laksana",
            slug: "oleh-oleh-khas-bandung-saung-laksana",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Kebon Kawung No.36, Pasir Kaliki, Kota Bandung",
            phone: null,
            rating: 4.5,
            reviewCount: 22,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9122264,
            longitude: 107.6007221,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFeQsYa9iTSuGPeuewTXKOIblW8UDnzL17opLuvwoBI0kjffrLQ8Fp2ukeEZKR_gfEfcdj0tG0iVb5cUu5pnV11l0dg-7YeM7zlA9kfmTGbVh8PM66aJA6eU2IwEE-8K8To34DE=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Toko Madu & Kurma import Oleh-Oleh Haji Umrah Nuby",
            slug: "toko-madu-kurma-import-oleh-oleh-haji-umrah-nuby",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. A. Yani No.398, Cicadas, Kota Bandung",
            phone: null,
            rating: 5,
            reviewCount: 15,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.9106109,
            longitude: 107.6398793,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHH_jvcJszf3l1UsOASI48oNgRZ72ODsQxi3N0WpUT-GlCJvYGuxRvKMepm3UlANTPKNalsfzHRIf0jlOfOGDKam6B8GGqr7xe9ftdMPu8-9M0sgWhR1zs1v_CXg0s7Smy00ZOU=s1600-w900",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Pusat Oleh Oleh Khas Bandung",
            slug: "pusat-oleh-oleh-khas-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Cipaganti, Bandung City",
            phone: null,
            rating: 5,
            reviewCount: 5,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.8948975,
            longitude: 107.6039583,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGLOJc87a4PBxcIleS1zNqxQ4ke_u4Pl45Sucs9N71s5acII001lWY2ZcuLPlLjDkC8nHtj4Zf8bpd2KEjcsMNM9Qm-jFcMaQJHiT0lWQ5neV6BJqKg8kinxwS-DS0m_cswFu0UTXwmNoI=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Seusajen (Dessert Oleh-Oleh Bandung)",
            slug: "seusajen-dessert-oleh-oleh-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Sarijati II No.27, Margasari, Kota Bandung",
            phone: null,
            rating: 5,
            reviewCount: 4,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.952846999999999,
            longitude: 107.6494726,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFLy1NnKup5Rx9XyTPtkyYgDTao6WtVWa_SAttT3uVjebTnFLIJQv508fwEdvOsAicpZy4OnPi-krd_eCdGjZTxjirEyHXGGfcSn7y4WAbCJ1Lcf17pPJ8TdHIgng_Ys_wGJyda=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
        {
            name: "Mayasari Rumah Mode - Bakery Oleh Oleh Khas Bandung",
            slug: "mayasari-rumah-mode-bakery-oleh-oleh-khas-bandung",
            owner: "-",
            destinationSlug: "taman-dan-rekreasi-kiara-artha-park",
            categorySlug: "oleh-oleh-souvenir",
            address: "Jl. Dr. Setiabudi No.41m, Pasteur, Kota Bandung",
            phone: null,
            rating: 4.9,
            reviewCount: 7,
            validationStatus: "PENDING",
            description: "UMKM di sekitar Taman dan Rekreasi Kiara Artha Park",
            latitude: -6.8826355,
            longitude: 107.599651,
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGEbe1qy3St1OcrLOjbZe9TSlHRAZ6hREKtAqvbCsE89BAoWyganagecEFwaWwqRfCReKPE4qU3qvmFGGCm6BSmICjl7XhG4f18jsjIIrcTcbtq2LAjPliZASP3Faf9Qaf22PsuXRjLkcXY=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
            hasCert: false,
        },
    ];

    for (const u of umkmData) {
        const connectData: Record<string, any> = {};
        if (u.destinationSlug && destinations[u.destinationSlug]) {
            connectData.destination = {
                connect: { id: destinations[u.destinationSlug]!.id },
            };
        }
        if (u.categorySlug && categories[u.categorySlug]) {
            connectData.category = {
                connect: { id: categories[u.categorySlug]!.id },
            };
        }

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
                latitude: u.latitude,
                longitude: u.longitude,
                images:
                    u.images && u.images.length
                        ? { create: u.images }
                        : undefined,
                umkmHalalFacilities: {
                    create: (u.facilityNames as string[]).map((fn: string) => ({
                        facilityId: facilities[fn]!.id,
                    })),
                },
                ...connectData,
            },
        });
    }
    console.log("  ✓ " + umkmData.length + " UMKMs with images created");

    // ── Accommodations / Penginapan (dari cache) ────────────────────────
    const accommodationData: any[] = [
        {
            name: "Imah Seniman",
            slug: "imah-seniman",
            city: "Cikole",
            province: "Jawa Barat",
            address: "Jalan Kolonel Masturi No. VIII, Gudangkahuripan",
            lat: -6.821889299999999,
            lng: 107.6063488,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 5029,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Imah Seniman adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPI2Lub-gvaFSMTvrHqb3eahsLlpoH3g52vX92w6ssUjLyIQpRtoAwX8lSvac83t82FwyVkR4w5c82CW-D_uEkyx7_DGvVwqjeOOFMTulufk7BZovKaEtNkBMcPMjhp3FKzkaY3H2WQK7HMuNyFjjPnTg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Sari Ater Hot Springs Ciater",
            slug: "sari-ater-hot-springs-ciater",
            city: "Cikole",
            province: "Jawa Barat",
            address: "Jalan Sariater, Ciater",
            lat: -6.7376548,
            lng: 107.6534167,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 18247,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Sari Ater Hot Springs Ciater adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO7JT92lI6WwqCNbDprFSKAJ5xY3aHeZjeZhHyb9OnEEpCyIDfK4q4qaEJjYlMIVtDehL_2wYelVOkeWsKp91LlujM9xryvfo4G1I2VQrQPc8vKz-EW0wq_rCtWGZh0Ib8WdD6uKn3mt2DzDk0=s1600-w784",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Green Forest Resort & Wedding",
            slug: "green-forest-resort-wedding",
            city: "Cikole",
            province: "Jawa Barat",
            address: "Jalan Sersan Bajuri No.102, Cihideung",
            lat: -6.8222128,
            lng: 107.5981431,
            phone: null,
            website: null,
            rating: 4.6,
            reviewCount: 9142,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Green Forest Resort & Wedding adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPvWTxghG-D9bl_O6WiyG5OdWYhAZUSzsjOjWJO6KktMXQrof6E3bCXVbVvR2dF9HXwjxAtuxJSA1Me1xC80Tsnbc7SI8NXLcoj6SMXXiYoWPs5f77Ll_n998rXCyZCjB_NECRyvd-hcZW0oA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Lembang Asri Resort",
            slug: "lembang-asri-resort",
            city: "Cikole",
            province: "Jawa Barat",
            address: "Jalan Kolonel Masturi No.km 04, Sukajaya",
            lat: -6.797743899999999,
            lng: 107.5984519,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 3818,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Lembang Asri Resort adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP1HTf-DcLmVL7ku-hUV1eiyJhPu6KD_pH65lCY3iz3Ed1DQgClocMFUhkVV3zYTOQVM4DLh9CR-gvAdpD0Jl991k7JwnpsWH07vXJG1HFvXPnj6cyiCvlQu1eKYuBjYSIxQW1l6QCAvqDQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Hotel Puspa Sari",
            slug: "hotel-puspa-sari",
            city: "Cikole",
            province: "Jawa Barat",
            address: "Jalan Raya Ciater No.49, Ciater",
            lat: -6.7344349,
            lng: 107.6495063,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 653,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hotel Puspa Sari adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP4zg_LuuXFiAj7ss7weM0CW5BybtWPzlRcXbQkihq10vfDOss1MKZheddVbOWxZlh9jqR2freDC8opQJSz9eMUC154LgumNTIHwwIncn2A5nXSnNsu5rLuQx_WtuUJMa2cy9mf3hbuJdXaeTU=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Nur Alam Hotel Lembang",
            slug: "nur-alam-hotel-lembang",
            city: "Cikole",
            province: "Jawa Barat",
            address: "5JRG+HQR, Jalan Raya Tangkuban Parahu No.67 A, Cibogo",
            lat: -6.8084824,
            lng: 107.6267873,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 738,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Nur Alam Hotel Lembang adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPjoMYVVekltv71AEoYpi542GIsLhYauE942DgpUQkfJL1iigNxG1UMvUl63tCwfANpsXBFAX3d3UURhgI8duRDnpix18-SRGU-U4NPj9hf9qmvrtYzTerhEKMCrYDdChR02nF8BpB_iW040XTAuDyA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Tea Garden Resort",
            slug: "tea-garden-resort",
            city: "Cikole",
            province: "Jawa Barat",
            address: "Dusun Cigereng, Cicadas",
            lat: -6.713162,
            lng: 107.6443863,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 1706,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Tea Garden Resort adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOVqqr_AdTgvinv8GtGqHquHFc3_xwiiFDGmIgIuYypF49RHCK_HuWJgpfAkTrwqRUE8vh0ImMntoqLC2z-nDYqHpxGvjLhppAmrIsIy5Qk5ZtvR6LzAYS_WP7Qkju_tbfl2vOWjXBqbYzIPw=s1600-w1000",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Rumah Stroberi",
            slug: "rumah-stroberi",
            city: "Cikole",
            province: "Jawa Barat",
            address: "Jalan Cigugur Girang No.145, Cigugur Girang",
            lat: -6.8201103,
            lng: 107.5863232,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 3082,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rumah Stroberi adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNFQiXxuN7OSt_B9h-raSqLVOewCjmGXpwM0RmIjJrppFS-gfoFWgR6v3EFp6zXW0wBP9irUAqSYthqVI0zhHOXM4xX7qH5LvgXm205C45t7A99IUK53tnBl9i1P3YZpwQ-e5GfE7cdjcA54w=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Grand Hani Hotel",
            slug: "grand-hani-hotel",
            city: "Cikole",
            province: "Jawa Barat",
            address: "Jalan Raya Lembang No.15, Gudangkahuripan",
            lat: -6.836031999999999,
            lng: 107.6013718,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 2025,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Grand Hani Hotel adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMN9OHO0V5D6eLAI6u9ImjVSUwQkrvxEQQG1c8FfzrB_aU9_aFCbNEZlX9jBcv-tbhn70PUYWGPF2_gcwWwbh8BUkvblBpQC-aZj8yIW6PvnHXxkMyWZUxEtq_MUTi-UXE70a4M6hoHGCuD=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "SanGria Resort & Spa",
            slug: "sangria-resort-spa",
            city: "Cikole",
            province: "Jawa Barat",
            address: "Jalan Hortikultura No.88, Jayagiri",
            lat: -6.8176882,
            lng: 107.6092736,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 2281,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "SanGria Resort & Spa adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMdd9_dzJaIyNYZeUn4HYnfQkJcDS5BVEpEzWRqcovijlJraIcx3BWy4IyOJZ7_gK5EleltrygZ8-tXUKMs3l7Gsak_OhPGE0lRg9euKyuv5hj4cg1RtwA0-ZCqJQXfA_pgMNKmDRPTBCfSkK73znfbtQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "The Haven House",
            slug: "the-haven-house",
            city: "Cikole",
            province: "Jawa Barat",
            address: "Komplek Villa Istana Bunga, Jalan Anggrek, Karyawangi",
            lat: -6.797569699999999,
            lng: 107.582207,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 447,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "The Haven House adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPUNMgbZWtXu9DGGvSssTYnDwAFqBddXNAx0YZPAr7OhIOPsyVzJ1-4EOzDYul0WxTerVSt8ow-zph5OSIvQmgdmGusVhQVZ-_0BsDSucnKtZcbg3aNCHy0QLfGGCWMEKHX7mcoectvz0BhNw=s1600-w1069",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Grand Paradise Hotel Lembang",
            slug: "grand-paradise-hotel-lembang",
            city: "Cikole",
            province: "Jawa Barat",
            address: "Jalan Raya Tangkuban Parahu No.50, Kayuambon",
            lat: -6.810853499999999,
            lng: 107.6249562,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 2727,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Grand Paradise Hotel Lembang adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNBgClXjbYro7YQu7OfL8erQ-qa3XSvP-02zIR9SsJsAI4JgDS5MQxo8KUojKqK8zzXliahxMSAFO6YMo-5GqJ2zt-dB03FCII1ix1C0E-5MwKEeAFtiSQNdkxdTxvpZZL81nj5ZfH45gJALw=s1600-w720",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Gumilang Regency Hotel",
            slug: "gumilang-regency-hotel",
            city: "Cikole",
            province: "Jawa Barat",
            address: "Jalan Doktor Setiabudi No.323-325, Isola",
            lat: -6.8459106,
            lng: 107.5993217,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 6217,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Gumilang Regency Hotel adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNSubWd5EH3sIudH9Cu7J4iRLhjwoRKH-Xk-7JtMcrAkNCaWk8NZqEwwNu_SL9icYY-Ofx5QA1CJeMVypnSwSUbcwfTPFwLKACBU-z9r8gX5Olmwe5JRkHqXDP1ZzW-tTDWZsoRKcN8djzipg=s1600-w1024",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Gracia Spa",
            slug: "gracia-spa",
            city: "Cikole",
            province: "Jawa Barat",
            address: "Jalan Blok Dawuan No.Desa, Cikondang, Nagrak",
            lat: -6.740733499999997,
            lng: 107.6557867,
            phone: null,
            website: null,
            rating: 4.6,
            reviewCount: 8521,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Gracia Spa adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNT2spYYHpDy6vEYDWdA5OIxDsmCnQNtd3uzn1dmo39xuNMwqpfXHqDB8lHJp65jB8JLb_nlwn1w--_C_SlVS0RSu2pfnQvZ2JiUvkHb9xdT_dsdjUlrhur4VT1P3OUywUSsPOXzgTF2Kfc_kTkWlGg9w=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Villa Puri Teras",
            slug: "villa-puri-teras",
            city: "Cikole",
            province: "Jawa Barat",
            address: "5HMX+P8V, Cihideung",
            lat: -6.815640899999999,
            lng: 107.5982894,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 298,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Villa Puri Teras adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP0JIY-dhaLOtaZZf-TgjFBtYl93HeBEEXxRxtK1DdYvdvIAs8z_NPvh7Rbo6d_PpuQDuUjNtu33_KuE2em8qXnGz25zjRQm1WN5sT9tg31jaGQwd0OYcfq-x0F9zGT0gYRyMsc87TJu3GDGw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Narima Resort Hotel",
            slug: "narima-resort-hotel",
            city: "Cikole",
            province: "Jawa Barat",
            address: "Jalan Nyampay No.48, Cibogo",
            lat: -6.8114274,
            lng: 107.6453351,
            phone: null,
            website: null,
            rating: 3.9,
            reviewCount: 1526,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Narima Resort Hotel adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOuejpmKQC4MC8AMoUNnrT_GXaS3819yamlMo_WGfA6CCF4h-3uvs4N6aYraGXP-fp8ErOBBzBotevEtMeAgQnfAnQIgciEUQhgtLT9Ca17ZgT4s-4fYZPF-ynIV9hXJiyCJvvjpaoJ_rgg5Yo=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Sapulidi Resto, Resort, & Gallery",
            slug: "sapulidi-resto-resort-gallery",
            city: "Cikole",
            province: "Jawa Barat",
            address: "Jalan Puspa Kenanga Barat 1, Cihideung",
            lat: -6.8125581,
            lng: 107.5982988,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 5671,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Sapulidi Resto, Resort, & Gallery adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPQwer_MFGFul9so-HyInvJW4krepuNKPXPxCB0mEVu09cqfBiedYS227Rkb6ZgCGrBVGowBAGM1RRUgQSsVEqS2C2yHiPGcsXQMn4zi1fTp8JejS0nquDikHV9Qt2vX6HdUIfJnDalNKXlb3k=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Homestay Triniti",
            slug: "homestay-triniti",
            city: "Cikole",
            province: "Jawa Barat",
            address:
                "Komplex Villa Triniti I.37, Jalan Sersan Bajuri No.KM 4, RW.7, Cigugur Girang",
            lat: -6.8186997,
            lng: 107.5902447,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 36,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Homestay Triniti adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOQf1faaWcyhKoePs1vH8CZFrVWzZBC3QKtxqmscch8fjZE3urRxWt1aDwdUdrDg-FAddanHmPuCOtW0svA0eRt65uxFy8BTDXr5obIrMMC2nq-CRIWgMLiIkT1xMbswUa_BtzV9goY79XMfQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Stevie G Hotel",
            slug: "stevie-g-hotel",
            city: "Cikole",
            province: "Jawa Barat",
            address: "Jalan Sersan Bajuri No.72, Cihideung",
            lat: -6.831883899999999,
            lng: 107.5947748,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 471,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Stevie G Hotel adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMLDNRuCXMHy9juGoFu-loG5oOrkh4JmwKQtR-msd-zyFtfdVpkXgU4Aw6rCIAg3my-yPuOYORvqpbLO0xjmZN2KiI6L_4RQQIoKmzqWSth9Tl7D-0iTVLX5k5GjVMb9dgVT_w7f515Ur9E=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "RedDoorz Plus near Floating Market",
            slug: "reddoorz-plus-near-floating-market",
            city: "Cikole",
            province: "Jawa Barat",
            address: "Jalan Grand Hotel No.35, Lembang",
            lat: -6.816059399999999,
            lng: 107.6190774,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 39,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "RedDoorz Plus near Floating Market adalah penginapan di Cikole, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOupdU7ikBpHQRglYYDo0HU4bxAwZGzdNZVeK_UcjwuK_iSvFqnqoxG1s90HVo4poKxNeBpIx3or1pFXH6pLVpXSNeTjIL0z2caRgafXWL6bg4KYhX5PcLeciTYmAQJveADGazXAVuDnP0NYw=s1600-w900",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Elvis Guest House E-Vertical Living Cikarang",
            slug: "elvis-guest-house-e-vertical-living-cikarang",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address: "MW5Q+MQG, RT.005/RW.005, Jatisari",
            lat: -6.340805700000001,
            lng: 106.9394406,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Elvis Guest House E-Vertical Living Cikarang adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "OYO 90241 SIROOMS Apartmen Gunung Putri",
            slug: "oyo-90241-sirooms-apartmen-gunung-putri",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address: "Jalan Mercedes Benz No.257, Cicadas",
            lat: -6.4274174,
            lng: 106.9290804,
            phone: null,
            website: null,
            rating: 3.9,
            reviewCount: 44,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "OYO 90241 SIROOMS Apartmen Gunung Putri adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPpSUDimhNI5gilDAsHuMnAnrtO681sSCLTdlHZMXEccj0Md6Rk97sQQvlf4X5PKPOibSUAEfzsVACburVySN7FtjEppiDXCuJCwmgUmglEj-7PEkeNN8DYh39l67MroepKoEXDG5gQ0HgN=s1600-w640",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "OYO 1645 Lot56",
            slug: "oyo-1645-lot56",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address:
                "Jalan Perumahan Citra Gran No.56, RT.005/RW.011, Jatikarya",
            lat: -6.3821981,
            lng: 106.9237341,
            phone: null,
            website: null,
            rating: 3.6,
            reviewCount: 33,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "OYO 1645 Lot56 adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPIktF3mwz_2Jufg6_xcgz1dpFcBuTpxTatgPAdMNgAVGvOnxVUvTK75bWHJKRYMkGh8bHgk1X_2kEQKESfEPRu9_APlPEaNP9U-eVA2RVWJDl-J7dYPkSv-VVquNBTieIHwnn1O29yCCq_Tw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Mahayun Guest House Syariah Bekasi (Affordable Stay)",
            slug: "mahayun-guest-house-syariah-bekasi-affordable-stay",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address:
                "Samping Mahayun Resto, Jalan Ciketing Benda RT.003/RW.010, Padurenan",
            lat: -6.3244093,
            lng: 106.9923743,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 195,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Mahayun Guest House Syariah Bekasi (Affordable Stay) adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMxD8Qwh1fDzfBZaYkGGiiIVxfeZTOTpY7UNCUrZVAJI9hDmgkP4FdnbaNy0aVXrWiELF1NZaWtKNDt3nS0kCRuBiMwF-ep4VF90pBPk4-OSGt0f-vYNysEtfOmbwBgAlFv2fwy_glehC2KheI=s1600-w1376",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Avenzel Hotel and Convention Cibubur",
            slug: "avenzel-hotel-and-convention-cibubur",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address: "Jalan Raya Kranggan No.69, RT.002/RW.016, Cibubur",
            lat: -6.3744501,
            lng: 106.9174901,
            phone: null,
            website: null,
            rating: 4.7,
            reviewCount: 6223,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Avenzel Hotel and Convention Cibubur adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZM_g4oD6QxwJRp4qjb-DfY7pm8jJaD5Q2Ep-wxoHIBb2kBp_zK36mfuDRI5lNVWg6hrEAP56QjGQi3lWX0i8wgG5DiD3AA1Ue9oMoZy55RpJOm33xqaIQF7mtwgYTWAyPD_dJxLqnk1BmMFUGU=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "villa berbagi indah",
            slug: "villa-berbagi-indah",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address:
                "Jalan Raya Cileungsi - Jonggol No.Cikarang 3, Cileungsi Kidul",
            lat: -6.4064507,
            lng: 106.9748659,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 7,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "villa berbagi indah adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMQ7n3XsV4Luyc2Mux8B4WKGHfxb7AztdJSDGd8nfPjZY9hNpniSYVeP0AuJpR7KCFAHwGQr0hQGuRVa5wfz9eg3dpnM3poK_1nPOPZwi0m--QXW1QUT4JWz-lkiXpSoLNgnIWH7h7GvNWY9A=s1600-w1080",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Sky Residence Cibubur 1 Jakarta",
            slug: "sky-residence-cibubur-1-jakarta",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address:
                "Jalan SMP 147 No. 112, RT/RW 006/013, RT.3/RW.13, Cibubur",
            lat: -6.3619099,
            lng: 106.8860524,
            phone: null,
            website: null,
            rating: 4,
            reviewCount: 20,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Sky Residence Cibubur 1 Jakarta adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPi1LmT9599jPr020VzCKm1Wpb9idwMCaoQZq6dJ0O5S1AkAgtoMnwEdXNHHpMBIvQ7xMow2lgsCZX1BblljAY-oI9-3-SnOPhjMqOi2hRHzqZA5cocyNH3No25fDfqDovFiNjjIRDUZyEv5qY=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Gubug Udang Restaurant",
            slug: "gubug-udang-restaurant",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address: "5, Jalan Alternatif Cibubur No.4, RW.5, Harjamukti",
            lat: -6.369668799999999,
            lng: 106.8968995,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 11610,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Gubug Udang Restaurant adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN97MdNqVRauOBAgZc3ikNw46DPmMAlh5TxKYn612PN88ARXwh35hw-4v4cuZsUV-LNEkN_reUSXKZBmRPp0gkGN04Dz7RhhzFW0d8JNtOxhbnj92AR47i7YzlUI2dl19Qf66tqR-68atcXFA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Kost BSPRO Cibubur",
            slug: "kost-bspro-cibubur",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address:
                "Perumahan Taman Kenari Nusantara Cluster Pasundan Jl. Pasundan 2 No 10/11, Nagrak",
            lat: -6.394003000000001,
            lng: 106.941433,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 41,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Kost BSPRO Cibubur adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPF_HiSMZt31PfPe_W07Ih2aEOM0UWoPk2VSxN1ADpN1EDgE0TxCRC1vsfg2-XmleeJ52CJUhfDhxuhEAhJOxl3UEJPf8JW1HfVDSRzkZzzgPy7sANo2etWQqt19saY07YQsjG_z6ErD_JXpE0=s1600-w1024",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Razha Guesthouse Cibubur",
            slug: "razha-guesthouse-cibubur",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address:
                "Jalan Washington Boulevard D18 No.11 Legenda Wisata, Cibubur, Nagrak",
            lat: -6.396858,
            lng: 106.943835,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 177,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Razha Guesthouse Cibubur adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN30O_WG3Ld4WbpUs4pCnHIRTGHbFsl3eD7VEofUhEA9EdGokxBUTaHckYlSBy0OV9ZxNxZr1uwAQDpmQ4-5luRdX4C509YOaUpNJtb0ySY4jnjuheqeeV4dOy-6XXB5DrdK_l7l9CoNQotV6k=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "King Stone Resort Hotel",
            slug: "king-stone-resort-hotel",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address: "Jalan Mendu No.9, RT.002/RW.003, Jatirangga",
            lat: -6.37138,
            lng: 106.9360821,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 652,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "King Stone Resort Hotel adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMf8srNoeqzLE_2SMmlLo0iG1Awb_PPCM8GwDZRtPNCXnN_34oxTqX1B8jSnwuSyBiYrxRDVpt6iv7btT47DUuJFd0jgkC-vk9rwF-ouwLZ6nh6XkSPE7v8XhofYuyLSHiLOs6wpk4fNuHN=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Umil Handmade",
            slug: "umil-handmade",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address: "Graha Yala Yudha Blok D29 no 4, RT.8/RW.20, Ciangsana",
            lat: -6.3640837,
            lng: 106.9473397,
            phone: null,
            website: null,
            rating: 4,
            reviewCount: 11,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Umil Handmade adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMAOOjPxqqivzSQGqcXliki0x5p-of2OvHxVFk99m23sNdKNVn0_14oIdA8H1SsTvKLwxQA1Jev87QtwyxHYoFu6jfQA07hFvzNPmuvjbcJrS6dCd2-KA2tQ9IsTmz1vvGJBcmoOQPwcYq89Q=s1600-w711",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Darussalam Koposari Islamic Schools",
            slug: "darussalam-koposari-islamic-schools",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address: "JX24+VC5, Jalan Koposari, Cileungsi",
            lat: -6.3978572,
            lng: 106.9560958,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Darussalam Koposari Islamic Schools adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP6eynXdf6pHIgSyDSeIB2ZcEq-pi34ru0gs-kOC23j_1f-1q5xSCVTAEnDqFvsbVMIXgvFVhaZphfEkOqIEJtQbrG_LcdcLl7u3bLB79wy38eYswCjB69TBVC2CnHadbKu17hWGOim6xU4qg=s1600-w721",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Hotel Ciputra Cibubur managed by Swiss-Belhotel International",
            slug: "hotel-ciputra-cibubur-managed-by-swiss-belhotel-international",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address: "Jalan Alternatif Cibubur No.4, RT.005/RW.011, Jatikarya",
            lat: -6.382989900000001,
            lng: 106.9257284,
            phone: null,
            website: null,
            rating: 4.8,
            reviewCount: 7085,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hotel Ciputra Cibubur managed by Swiss-Belhotel International adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNJ1mLQ5q4z8gDutypnh7UMjqKpjpYibVbCkTyzsVu85DhQLjUf6NtOWS3k7ARnds2jdtwgCcHfNIsd2_jMx4jesf0arvFRFeSeaQvY2ztXngQziSHsZ7tbVDqIAinoGT0eitY-biqqcjpKMg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "IPTV, Fire Alarm",
            slug: "iptv-fire-alarm",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address:
                "Citra Grand, Jl. Raya Alternative Cibubur Ruko Blok CW07-10, RT.005/RW.011, Jatikarya",
            lat: -6.383589499999999,
            lng: 106.9250279,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "IPTV, Fire Alarm adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOfDypcpKSFbZHOJyTPRnGCPM3OSkTGweekJE9g_p1gfGyDOJlwXzb2KSqaKhVP5Rfq8BOCnoHq6q2zXZnObPi7MON6ZIqrlb5j0AEckt8f_NlqMrCk1EEPpqNCTiD9vKRxbAfAMn5v5aE66g=s1600-w1440",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Panorama",
            slug: "panorama",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address:
                "JWV6+648, Jalan Raya Pondok Ranggon RT.2/RW.2, Pondok Ranggon",
            lat: -6.356953000000001,
            lng: 106.9103433,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Panorama adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Puri Setya Jatisari I",
            slug: "puri-setya-jatisari-i",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address: "Jalan Kampung Cakung Payangan RT.001/RW.005, Jatisari",
            lat: -6.3341523,
            lng: 106.9425206,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 89,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Puri Setya Jatisari I adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN_YDfqdk0mY5K282lUEdera33Gm3xoX0ho71U9eGGiApFfjY9OyLDe2ageq457gXeWcbEeJryNkvlYwLD3i8cyDzjxMTQW63GADf6p5St_at1gcDCHezSfGA95eQsVJYlqo6eeKdPSvUrubw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Keluargaku",
            slug: "keluargaku",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address: "J292+93C, Cipenjo",
            lat: -6.3815556,
            lng: 107.0001477,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 18,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Keluargaku adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNJSA-ECUWpLSTEvJXZS1spQpCgvVaE873KK9iPlr8kCPZg0nE_7OhA9DCKgYQgmEI24gsImWAw5fiD9XN3heg16BCBSzys0UkDEkShiq35FmBfBYGYcw_DmLXFNq3bSUo2lnzS-pH4wKv3u7Y=s1600-w720",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Baby & Axelle",
            slug: "baby-axelle",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address: "Jalan Raya Ciangsana Blok Kf-14 No.2, Bojong Kulur",
            lat: -6.3313959,
            lng: 106.9625045,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 13,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Baby & Axelle adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Elite Guest House Cibubur",
            slug: "elite-guest-house-cibubur",
            city: "Gunung Putri",
            province: "Jawa Barat",
            address: "Jalan Danau Cibubur Asri No.Kav. 106, Harjamukti",
            lat: -6.374725199999999,
            lng: 106.8992174,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 113,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Elite Guest House Cibubur adalah penginapan di Gunung Putri, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMd0FYHYApydRXOtrtOqq0pG4pyG1pOzS_mCiF8lv1uya9LBSYC5xL_hQYZq8sIvCvh49S4w_SsY_xx8K_crZlHLKs57CyPxkz0GyRnXYmMLf-WimdeMKxoR2LUnvlFHdDt43IbuPE3oYsDRQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "OYO 2369 Cempaka Homestay",
            slug: "oyo-2369-cempaka-homestay",
            city: "Rancabali",
            province: "Jawa Barat",
            address:
                "6 Jl. Raya Ciwidey Patengan No.6, Alamendah, Kec. Rancabali, Jawa",
            lat: -7.132339699999999,
            lng: 107.4187643,
            phone: null,
            website: null,
            rating: 2.6,
            reviewCount: 67,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "OYO 2369 Cempaka Homestay adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNrmOKiXT9HYdlR_pItp39qt4HpYm9f-nYrbYdnEudvQrIzVLY70lOVdLd5La2C4rW5eVFH_7X_PQultcwiEcBALCPmWyGQosAemrLTx89NHeZg0RyKmuV-owfFtGE7BQAvMCMMvgPikmB6PEU=s1600-w640",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Ciwidey Hills Radhina",
            slug: "ciwidey-hills-radhina",
            city: "Rancabali",
            province: "Jawa Barat",
            address:
                "VCQR+F5W, Panundaan-Margamulya No.33, Margamulya, Panundaan",
            lat: -7.111195400000001,
            lng: 107.440508,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 350,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Ciwidey Hills Radhina adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNcrOnTo2h7D-YvADU0t2L_B-f-o7z42vDt7Zetgu-h7Q97nbFhZukp5CBtrQ7tPN6zf7V0HT7BGg5MMVReSiYxuTQpKCC-ChN_fQ2NtXdARCv2kULsftpSZcmQXcvjtbOShTbFtHkoZfdP3f8=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "OYO 428 Pondok Winagung Hotel",
            slug: "oyo-428-pondok-winagung-hotel",
            city: "Rancabali",
            province: "Jawa Barat",
            address: "Jalan Raya Ciwidey - Rancabali No.18, Panundaan",
            lat: -7.113094299999998,
            lng: 107.4391098,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 329,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "OYO 428 Pondok Winagung Hotel adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNWwbaL9LOHWzgQTII3hARLuCaV1IJ6tazRsdudhZRSYGmKJqM-kjDMX9dzb28xadMIVjQ-ohMU_vQjafwE6_nSu3ziat5zTQ-f4tEaQPLiXdQh0r_DzltcpyQr9cG65X89OEjHpumOQW1hcw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Hejo Forest",
            slug: "hejo-forest",
            city: "Rancabali",
            province: "Jawa Barat",
            address: "Patengan",
            lat: -7.143118999999998,
            lng: 107.3912496,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 715,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hejo Forest adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOLiRpcJCzPEws38tVIN5d3cjYTMwvNck2dn4jI2F4y1yLToQeg9n--_IbuS6pi-G8qxA6AgvUZkLi64Qbc7b0H7B9aiP-cQ7bkCm0ZsVAM6KNTExMnX6hRibBrzsJqDNdy5LRmHPEnzeOu2A=s1600-w1280",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Flying Fox Emte Highland Resort",
            slug: "flying-fox-emte-highland-resort",
            city: "Rancabali",
            province: "Jawa Barat",
            address: "V96W+4QF, Jalan Ciwidey, Patengan",
            lat: -7.139690000000001,
            lng: 107.396909,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 4,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Flying Fox Emte Highland Resort adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO2MOgNWq9uxOiIZAPWAa1pRRaY32_vsBeIwOlO-oPFOBfqrjg_YVPLFz5F4FsefXA2RLFHGVRWRFYMur3Vh1LWENiBpXkwyL93HJFh91cJfHZfus0BdlgBBmi-VtIGpg9oWSZ_A95RRllVWCg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "eMTe Highland Resort",
            slug: "emte-highland-resort",
            city: "Rancabali",
            province: "Jawa Barat",
            address: "V95X+V2R Patengan, Alamendah",
            lat: -7.140312499999999,
            lng: 107.3975625,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 5973,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "eMTe Highland Resort adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP3DlsfW0G532EFUUA8Thjtf-B19oy3K2cx9rQDqAPdUBQ0hAUV9SN7tmjgHbOlIawMHUsasHUOcSn3GJtvp-963PuEfzE6rb3wrQ-VnFmvqDCQ30qx3NO0j-S3hD76uIGJswsAezU77I7J=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Patuha Resort",
            slug: "patuha-resort",
            city: "Rancabali",
            province: "Jawa Barat",
            address: "Jl. Situ Patengan No.Km.8, Lebakmuncang",
            lat: -7.131066799999999,
            lng: 107.4115569,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 1617,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Patuha Resort adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZM-gTnf2ne9qGk8PVh-zVudXgdTJj2qXIyj28KJhdGtIZfsc4pM1m-SEBhI_Xfj6zlIXM7XvuVP1BFZf_sxC65QdUWSsCtEjXlebDUBjhJ4OPzoKf_tlK27fyHMTAG0Xj_ceqUM7T3Ggpth_2o=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Ciwidey Valley Resort",
            slug: "ciwidey-valley-resort",
            city: "Rancabali",
            province: "Jawa Barat",
            address:
                "Ciwidey Valley Resort, Jl. Barutunggul No.KM. 17, Alamendah",
            lat: -7.134999700000001,
            lng: 107.4159497,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 10166,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Ciwidey Valley Resort adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPSFCQ8-CkhXW2GIcpoqeBGAC058oO8CzeVfa2Y0zvySd3Isp1XCZ9GqcmrRYRFqKyyHGxHqdgmvh7TIiOdlCthRt1cjYucuEfv8ipwACFi_El60u7NQG1brSSIKTItbbk5IwUSI2nK8tgMAO0=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Kampung Strawberry Bungalow and Restaurant",
            slug: "kampung-strawberry-bungalow-and-restaurant",
            city: "Rancabali",
            province: "Jawa Barat",
            address:
                "Jalan Raya Ciwidey – Rancabali KM. 7 Panyocokan Ciwidey, Alamendah",
            lat: -7.132757100000001,
            lng: 107.4183296,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 1215,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Kampung Strawberry Bungalow and Restaurant adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMmBDy02vESxDUggpUPSy5bMLJNgA5g1lXcLpSQi2kxnH7grSwqPWiIxfV75rWcXLb32hsSbAoMgpddX4yyWIhrDpbjCa7Uxqtd44D0xDDDBxS5XdH357ELjwuJSx2c7wDjahRrN6A05-ooXhg=s1600-w768",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "MS Hotel Ciwidey - Rancabali",
            slug: "ms-hotel-ciwidey-rancabali",
            city: "Rancabali",
            province: "Jawa Barat",
            address:
                "Jalan Raya Ciwidey - Rancabali Jalan Raya Ciwidey - Patengan, Alamendah",
            lat: -7.130499599999999,
            lng: 107.4191852,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 635,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "MS Hotel Ciwidey - Rancabali adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO4WoQYfL-NHmdKJS0P-hA8M30p8kxiprITyCg1gUWxRyps-Nu08mnX_5l4SSIL7LqdiQDUgMMNNMDu4Xn7VP7yoisqMAf_rOJHnNqrOOzprYB3v4ZuDYALqIj-E7RpHd-2Y8KTyp9jcGl_XBA=s1600-w1280",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Glamping Legok Kondang Lodge",
            slug: "glamping-legok-kondang-lodge",
            city: "Rancabali",
            province: "Jawa Barat",
            address: "Jalan Kurunangan, Lebakmuncang",
            lat: -7.117276899999999,
            lng: 107.4178011,
            phone: null,
            website: null,
            rating: 4.6,
            reviewCount: 2273,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Glamping Legok Kondang Lodge adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZONpoXXBtEoD9BHKwU3zDUTyQ0W8AtwkD7hMgkjrj9BJk7RqqBe8pGC8eZOU20ZTIkNdHpi3Jvz_09hrczyaARYfnuzk9Q83WF6PMk-34iV8fYkDV0tu1zWPp8zAgtXA3sOS0mY3VeILWVt3A=s1600-w1280",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Villa Patengan (Villa Sasaka)",
            slug: "villa-patengan-villa-sasaka",
            city: "Rancabali",
            province: "Jawa Barat",
            address: "R9P4+HQR, Jalan Raja, Situ, Patengan",
            lat: -7.163509400000001,
            lng: 107.3568938,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 61,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Villa Patengan (Villa Sasaka) adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPhvcFu6bv5G5QaptIDHey9oIwxeD_39IOIG6W-UdHX6EEvYYU7C_eRZ-CeZoHRTz0dCKophrKvT3I_zOysep5Ada-qQuSsXoh-I4H3yPtpkxj6ewHv64CsuzRrKDQyATr-R2h7ri0_uZ6p-A=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "VR Game / Toko Rafi",
            slug: "vr-game-toko-rafi",
            city: "Rancabali",
            province: "Jawa Barat",
            address: "Jalan Raya Ciwidey - Patengan No.14, Alamendah",
            lat: -7.1230612,
            lng: 107.4238841,
            phone: null,
            website: null,
            rating: 3.8,
            reviewCount: 4,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "VR Game / Toko Rafi adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNw2a2AuAiMaGOAKLqKS0PrcD_cg04pBlvaLwydBsH0_gXq71BmcnmbjUG8ANtw0f_Xt6OMzxaxJyqJGfceXpg9AfGba32tVqMTwTwlyALoaLKKh3XZ7mTDDE1S4PxAtEA4SG67_mWgRRBweQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Glamping Lakeside Rancabali",
            slug: "glamping-lakeside-rancabali",
            city: "Rancabali",
            province: "Jawa Barat",
            address: "Jalan Raya Ciwidey No.Km, RW.39, Situ, Patengan",
            lat: -7.167054900000001,
            lng: 107.3540784,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 18636,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Glamping Lakeside Rancabali adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO44U0jcJsVerp4d1DqSGst_kj6WiCI26S9ekdbaZ4Fxm6M-a5lJTH5XOm3IvBlwTcprbPCVLwCjy1WqHO_pZ5e_RFaixXZDD15bqVJx6v10SEBv5TUckohZOslKQ_K5reVD_3w5_aPqTfMxQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Vila Adrin Ciwidey",
            slug: "vila-adrin-ciwidey",
            city: "Rancabali",
            province: "Jawa Barat",
            address: "Panundaan-Margamulya No.59, Panundaan",
            lat: -7.109022599999999,
            lng: 107.438224,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 119,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Vila Adrin Ciwidey adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN5mQ5R6uaY_fdhG5yVq9XjgpvXkTbE7E_oHWryjSELD8TSQXWMbrisbhNKWPn7M5MhyDi-BmneLVxw_-trVQCvTlV4kTAWjdkot3ArULy6gX_vfrxXf1nXnAOaWgT-_ThfDNMmO6BXJru_Ug2y44LONg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Penginapan Ciwidey",
            slug: "penginapan-ciwidey",
            city: "Rancabali",
            province: "Jawa Barat",
            address: "Jalan Raya Ciwidey - Rancabali No.31, Panundaan",
            lat: -7.1133399,
            lng: 107.443016,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 50,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Penginapan Ciwidey adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOCKlYSmQf4AbQg3KQaWTMDsMacgprpFSa4e3a2OWNQTLc49Ur37cf7VFcyRYC_FggJi_LBkGIF3LObF_PHX7ERuKmsJjrmH7YkGJgwDS-JWU3mh-iSHHGQ3v6ghqpBZCxXhD-1xpLSA70N=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Abang Hotel Ciwidey",
            slug: "abang-hotel-ciwidey",
            city: "Rancabali",
            province: "Jawa Barat",
            address: "Jalan Raya Ciwidey Patenggang No.500, Panundaan",
            lat: -7.1125036,
            lng: 107.4484549,
            phone: null,
            website: null,
            rating: 4,
            reviewCount: 619,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Abang Hotel Ciwidey adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPYAQBFvmW7B4Juu3o6dq4ymBJSx1t7oyjkQyDD6-pn8OFScHD6tKfbCZasSN_PxLSrSFiMq_V_EVc6SAnnXM3RkBGAGQ_q4vw6dXpXQTlmqK6UEFyOBu8s6IWlPd7E0NjIS0JiTQrypnWEO29ixQCw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Albis Hotel Ciwidey",
            slug: "albis-hotel-ciwidey",
            city: "Rancabali",
            province: "Jawa Barat",
            address: "Jalan Raya Ciwidey - Rancabali No.KM. 01 No. 17, Ciwidey",
            lat: -7.106728200000001,
            lng: 107.456353,
            phone: null,
            website: null,
            rating: 3.9,
            reviewCount: 732,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Albis Hotel Ciwidey adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPulczagc7T1tWNAdMxbXg-y_oFRBGQ5VFOYKKvjNs-pvVRG5kE2unS9OZ1eVUtgvbQ22urd_WqsVw_FZo2zjIq5s56dXaoEF7LN6-P8y9icJzWVlgrG98iQP2zDE6enyTbq9qX14Z6LnkSZQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Sindang Reret Hotel & Restaurant Ciwidey",
            slug: "sindang-reret-hotel-restaurant-ciwidey",
            city: "Rancabali",
            province: "Jawa Barat",
            address: "Jl. Raya Provinsi Ciwidey, Tenjolaya",
            lat: -7.1016089,
            lng: 107.4698344,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 3828,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Sindang Reret Hotel & Restaurant Ciwidey adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMiMS_Ni1KxSQOwZog3R6WC-dwEDopenmCFbDWxoXRVBWAd1uJHaO4rktLqg515_RH1Np_l8gd6ouo9B6aSV_fskqLSkxh0PpKYmuYnat5sJgt9j_fXilimi6QpJatA5VNui9AYNiqIc7PwvQ=s1600-w1170",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Alfi Homestay",
            slug: "alfi-homestay",
            city: "Rancabali",
            province: "Jawa Barat",
            address: "V93R+RGJ, RT.2/RW.1, Patengan",
            lat: -7.1454099,
            lng: 107.3912765,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Alfi Homestay adalah penginapan di Rancabali, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Kos kebumen mas Helmi",
            slug: "kos-kebumen-mas-helmi",
            city: "Kuningan",
            province: "Jawa Barat",
            address: "X965+4M3, Jalan Desa Muktisari, Muktisari",
            lat: -7.039745699999999,
            lng: 108.3591789,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 5,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Kos kebumen mas Helmi adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMKSg1ArRPwXwsvTRz7200fkVMTF2cvqNI-GNlghFbxBeOMjJQy9HwvuD3KcSCBK5VQOR3qytpP_vSWY2Ukk2_G3TimdWH6VsH7UIeDE27KSCJk9WtNcHRE-AtEkKeWIDyTxVp0_rXACDUy=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Bumi Perkemahan (Buper) Palutungan",
            slug: "bumi-perkemahan-buper-palutungan",
            city: "Kuningan",
            province: "Jawa Barat",
            address: "3C3M+C5H, Cisantana",
            lat: -6.9464424,
            lng: 108.4329825,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 528,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Bumi Perkemahan (Buper) Palutungan adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNR_Q7KoF2P8aJy90jPcWzdTLOkOG_V7qzuaK82ZaWi3NYh65rMeDYWWZqLMnaLl-7HAP7rsVhqt61rgUDeIt2AVRcyhd8z6bAanPt0pjn7taChw6zgzDpRCRzeFzp5LRMuNaB1S-4hZHGElw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Hotel Purnama Mulia",
            slug: "hotel-purnama-mulia",
            city: "Kuningan",
            province: "Jawa Barat",
            address: "Jalan Raya Cigugur No.KM. 1 5, RW.5, Cigugur",
            lat: -6.973636300000001,
            lng: 108.4660727,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 1354,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hotel Purnama Mulia adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP6CvPMoK3NtpBgAXGuz0Q0Gs7vT10GgQXbeyHPjBP916OpLVQCgxiIHL4rPK133RHsjuD2MZgwbplfikvePCNnfhF90O19i_8Sla7aRMmB-uKPjnWWMIfG7Bsv-T0wmV2MJtHXfPc-JwFfOKc=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Villa radio kuningan buyayahya",
            slug: "villa-radio-kuningan-buyayahya",
            city: "Kuningan",
            province: "Jawa Barat",
            address: "3C3W+3C4, Cisantana",
            lat: -6.947353199999999,
            lng: 108.4460729,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 38,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Villa radio kuningan buyayahya adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNUDJES2RukcnrUwFKZYf_Lhd1g4W2CRhvja35Bv1uXiytb0l1B2X2RdiXBtakeHaKHrI7-CdjnrEDOKrAk4ut8W6McSBP5LeZzp3-3vA0nBe3m1F_JWXtxd6vYOWwGKSkulJj3EAmzo2uQ7Q=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "RedDoorz Syariah near Taman Kota Kuningan",
            slug: "reddoorz-syariah-near-taman-kota-kuningan",
            city: "Kuningan",
            province: "Jawa Barat",
            address: "Jalan Otista No.106 - 108, Kuningan",
            lat: -6.983907899999999,
            lng: 108.475001,
            phone: null,
            website: null,
            rating: 3.6,
            reviewCount: 334,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "RedDoorz Syariah near Taman Kota Kuningan adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPD0ou8Tw1goeK2-mp8dLYt-1AnAQdhLKaRcaFP4mpPAYz9CQNIBPYfGpPlk5gONznIlsUuUt-KDFnNWwiKWUtM1UxmmsVBLni-OCnogi_qBnXdalGyVT60YpHValLdzrCFN5plDGRZcLCWLOE=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Indonesia",
            slug: "indonesia",
            city: "Kuningan",
            province: "Jawa Barat",
            address: "X9JR+82G, Jalan Cipadung, Sindangpanji",
            lat: -7.019198599999999,
            lng: 108.3900767,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 4,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Indonesia adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Rumah my Emak",
            slug: "rumah-my-emak",
            city: "Kuningan",
            province: "Jawa Barat",
            address: "X9QR+GRC, Kawahmanuk",
            lat: -7.0111352,
            lng: 108.3922757,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rumah my Emak adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Rumah Tahfidz Al - Azhar Cipasung",
            slug: "rumah-tahfidz-al-azhar-cipasung",
            city: "Kuningan",
            province: "Jawa Barat",
            address: "X9MV+5J9, Cipasung",
            lat: -7.0170822,
            lng: 108.3941051,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rumah Tahfidz Al - Azhar Cipasung adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Kosan Cipasung perbulan",
            slug: "kosan-cipasung-perbulan",
            city: "Kuningan",
            province: "Jawa Barat",
            address: "Cipasung",
            lat: -7.01762,
            lng: 108.3984258,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 5,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Kosan Cipasung perbulan adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Ika Home Stay",
            slug: "ika-home-stay",
            city: "Kuningan",
            province: "Jawa Barat",
            address: "X9MX+6P7, Jalan Cipasung Desa, Cipasung",
            lat: -7.017155,
            lng: 108.3992974,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 3,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Ika Home Stay adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOcjYxSqqR8FkImfWkskCxnLJXc6FmVn1ygY6uvixZByxNPVM2vvgwKAhWBSuY8GjI8w-ttgpYhmIRL5YtySsenVxMcSjk-3TrWds0ixCEMJlA7orteEkqqpzPkugMt3TJTTIy7AhTrJb9h8A=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "The Lake House Mount Cereme",
            slug: "the-lake-house-mount-cereme",
            city: "Kuningan",
            province: "Jawa Barat",
            address: "Indonesia",
            lat: -7.017867099999997,
            lng: 108.4002304,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "The Lake House Mount Cereme adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Pondok Pesantren Wahdatul Fataa",
            slug: "pondok-pesantren-wahdatul-fataa",
            city: "Kuningan",
            province: "Jawa Barat",
            address: "X9VX+J5W, Jalan Desa Cikupa, Parung",
            lat: -7.005886800000002,
            lng: 108.3979573,
            phone: null,
            website: null,
            rating: 4,
            reviewCount: 5,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Pondok Pesantren Wahdatul Fataa adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPcjqjtkY7Jrl4MkzUUHv3U1KovSzRUnUarypdtqDAMHwP2jW2q_UG14WmfG002sZVypPqujlq6XRhMxJKqXenhJzEinNWJR6_6CrXeVxGM3nCya_4bOMAzAmAWf894iIdHwGIT_AIMjTKcxA=s1600-w774",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "RKhouse",
            slug: "rkhouse",
            city: "Kuningan",
            province: "Jawa Barat",
            address: "Jalan KH Abdul Fatah No.66, Cidulang",
            lat: -7.019626499999999,
            lng: 108.3773268,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "RKhouse adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Rumah ibu",
            slug: "rumah-ibu",
            city: "Kuningan",
            province: "Jawa Barat",
            address: "Jalan Cikijing - Darma No.58, Cidulang",
            lat: -7.019869000000001,
            lng: 108.3763296,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rumah ibu adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Posko Kelompok 34 KKN Uniku",
            slug: "posko-kelompok-34-kkn-uniku",
            city: "Kuningan",
            province: "Jawa Barat",
            address: "XCH3+93Q, Paninggaran",
            lat: -7.0222549,
            lng: 108.4028389,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 2,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Posko Kelompok 34 KKN Uniku adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Apecco Meok",
            slug: "apecco-meok",
            city: "Kuningan",
            province: "Jawa Barat",
            address:
                "Darma Jl.darma utama blok pakuwon barat rt 07 rw01 apecco meox, Darma",
            lat: -7.0046171,
            lng: 108.4022767,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 21,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Apecco Meok adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPass3a87xFnPXLwvXRBJhFDPqoPIv2Fy4tOl7QgihitasgAJ0BJK84eInkq7XdwXPrc-DL5AbgGbyqIEg9LjWs9Srcb0Gp6EWXEZ-WPmxzd0iTF3U_oUlcoMlc5p8C8nEVKe4eRwntTBBYHxE=s1600-w713",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Eddy's House",
            slug: "eddy-s-house",
            city: "Kuningan",
            province: "Jawa Barat",
            address: "XCG3+35Q, Paninggaran",
            lat: -7.024778299999999,
            lng: 108.402995,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Eddy's House adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "jihan",
            slug: "jihan",
            city: "Kuningan",
            province: "Jawa Barat",
            address: "X9JF+GJG, Cidulang",
            lat: -7.0186977,
            lng: 108.3740933,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "jihan adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Penginapan",
            slug: "penginapan",
            city: "Kuningan",
            province: "Jawa Barat",
            address: "XCP4+WP8, Waduk Darma",
            lat: -7.0127182,
            lng: 108.4068343,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Penginapan adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Rumah Keluarga Siti Khadijah",
            slug: "rumah-keluarga-siti-khadijah",
            city: "Kuningan",
            province: "Jawa Barat",
            address:
                "Jl.Desa Paninggaran Dusun keliwon RT/RW 08/02 Blok Pasir Hu'ut, Waduk Darma",
            lat: -7.025288400000001,
            lng: 108.4036098,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rumah Keluarga Siti Khadijah adalah penginapan di Kuningan, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO0tcdxoKSV0rkpFCWsnOVERI-6qKko4Cw6P1BvCgeyTHP7ytU2SUS8ERq1vEM1lV6IbpS1HRUel6N2TvA2IIJwoQqpe7AsvTyXhwMQAL_9w2KlNes8OUQmSmJlhJ9-hYmNrbJ57c9PIRnU=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Puncak Darajat Highland 2",
            slug: "puncak-darajat-highland-2",
            city: "Garut",
            province: "Jawa Barat",
            address: "Jl. Raya Darajat No.KM, RW.25, Karyamekar",
            lat: -7.2206024,
            lng: 107.7416475,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 1824,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Puncak Darajat Highland 2 adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNQicRfMKAJ9E6bZ_OMLy2GuIw5o_lqmfWcF0DzBXXgKdd2rPosGB3IxldLaU-v64npFkcKEAamSr5ZtzDs9TbVIdoMgfkIpXyoLrD7aNNDgKXJuyfWryMsdmOOAS4JwK8554Qxp_9WO31fGA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Sari Papandayan Resort",
            slug: "sari-papandayan-resort",
            city: "Garut",
            province: "Jawa Barat",
            address:
                "Jl. Raya Cisurupan KM 17, No. 18 Desa Tambakbaya, Kecamatan Cisurupan, Tambakbaya",
            lat: -7.300309699999999,
            lng: 107.8005861,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 800,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Sari Papandayan Resort adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNRd6p2H5DdMXzhFa7I7JXPosHuexheCo2EYkmqrYrvGOlahZym1RKvp1b_q1R26QSFGHQerCV33bKAZY5_S2mR3-dSUpWqHj-yNefUQm8iL95vC31B-QfDHzMuSGhzUtoC-gdHT6IKnMgF5wc=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Mount Papandayan",
            slug: "mount-papandayan",
            city: "Garut",
            province: "Jawa Barat",
            address: "Karamat Wangi",
            lat: -7.308285699999999,
            lng: 107.7380517,
            phone: null,
            website: null,
            rating: 4.7,
            reviewCount: 3724,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Mount Papandayan adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPyqKvnZNrAj2Je1_7qoSMJwtzx5RvviVFUkq_UdnRq7mag_BJVPfC1QF6serBAJFpF2EtSq1mLUrcCZxniU8KHtZhRqDBQUD2V3BXww_6XqsMHFWYxb_psEx3a02YJ-mrKPd8KswfMXSxFPzk=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Taman Wisata Alam Gn Papandayan",
            slug: "taman-wisata-alam-gn-papandayan",
            city: "Garut",
            province: "Jawa Barat",
            address: "Sirnajaya",
            lat: -7.3065285,
            lng: 107.7380383,
            phone: null,
            website: null,
            rating: 4.8,
            reviewCount: 2068,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Taman Wisata Alam Gn Papandayan adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMTc_w25Y9NMRqkS_Hip2G8Yqiwc0vJm_fvEdU_9kHtOU3OvOie8CNRP0mfKxIqEH4-i68-KZPt_2ZS-KbPEniMok-XdSjp0tjj7KrACOrAofxt_eBxm2zptoSQnC-_mPnDLod8OR7tdzjYJak=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Bumi Perkemahan Papandayan",
            slug: "bumi-perkemahan-papandayan",
            city: "Garut",
            province: "Jawa Barat",
            address: "MPVR+97, Sirnajaya",
            lat: -7.3074946,
            lng: 107.7394314,
            phone: null,
            website: null,
            rating: 4.8,
            reviewCount: 12,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Bumi Perkemahan Papandayan adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPbU1RST9N3hffOZJimOfc8_RP9x78EZpmEX3tLOflAcDHw38EBMitVpfR_aW-lP8rpSN4PpahQRSksApTPB_VhgetfyYeeV9HDDemoqYzGX0vF0RCC8xM3M9f8Jk9jptxqQBNlyqvfLOpsHQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Papandayan homestay",
            slug: "papandayan-homestay",
            city: "Garut",
            province: "Jawa Barat",
            address:
                "MPWV+59G, Jalan Kawah Papandayan Kp.ciseupan RT.3/RW.7, Sirnajaya",
            lat: -7.304556900000001,
            lng: 107.7434511,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Papandayan homestay adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Hotel",
            slug: "hotel",
            city: "Garut",
            province: "Jawa Barat",
            address: "MPJJ+7C7, Gn. Papandayan, Karamat Wangi",
            lat: -7.319325300000001,
            lng: 107.7310494,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 2,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hotel adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Pondok Saladah",
            slug: "pondok-saladah",
            city: "Garut",
            province: "Jawa Barat",
            address: "MPMF+R55, Jalan Kawah Papandayan, Sirnajaya",
            lat: -7.315489400000001,
            lng: 107.7229707,
            phone: null,
            website: null,
            rating: 4.7,
            reviewCount: 573,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Pondok Saladah adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOQZFYY8Ll3vB7fj7sX6-5tLCX135J7Vr8ITKOjFbVxWCnDpUur199K9Jon6Z-DdmyyfPMMoCIh8xGC4Bhsy_T9CLmEG3S6SUpbmZBNl9TWszMbNwyyOegwSDFpTa2Sp0Kq1ZwxEJ2WU7TDsw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Hutan Mati Gunung PAPANDAYAN",
            slug: "hutan-mati-gunung-papandayan",
            city: "Garut",
            province: "Jawa Barat",
            address: "MPHF+WX3, Karamat Wangi",
            lat: -7.320236499999999,
            lng: 107.7249223,
            phone: null,
            website: null,
            rating: 4.8,
            reviewCount: 220,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hutan Mati Gunung PAPANDAYAN adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP_Wn-CJHuwZipVyp2GU56r4ptTnXXHzS3JdIHdcPT_9-lIbQJi5QT3YYEqaCLPVVKGJo3Ua6ruVa8cYlrOdRCEMICEze6dSEsGhxOmLvfGTV4Wz-awcI-dn7f6G_6ok15pVkFwqosWnIwWkA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Nangklak Campsite",
            slug: "nangklak-campsite",
            city: "Garut",
            province: "Jawa Barat",
            address: "MQX4+H77, Sirnajaya",
            lat: -7.301093599999998,
            lng: 107.7556671,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 23,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Nangklak Campsite adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMTQiCnH66QuhgwbQv9QGp9JAWabQPDJz9Pbu1byezWFJxviNxKNp7CdAyCN10LJ8pT-YPhz34-3MFMppXe3aFGVrX1nBeP5mFms5B_Jo05HvnZO_FvUhwBI5UkYb0zptpIN2YTNaoIj2VuWUE=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Papandayan Camping Ground (PCG)",
            slug: "papandayan-camping-ground-pcg",
            city: "Garut",
            province: "Jawa Barat",
            address: "Nangklak Jalan Kawah Papandayan, Sirnajaya",
            lat: -7.3023699,
            lng: 107.7576615,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 935,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Papandayan Camping Ground (PCG) adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPXFMjGUMWdppxRRJvDluWMv4YfbUoLsqknevB8lDyEX583IPw2RAsLI3xCJr-u5g-JIlIv9dcUjqzVtkvKx0PsVQThfI6ThAEi6kFGzLXMituzdrRuvh7PWr_qySmlNLhE3xYN21x3-ReCew=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Fryan riadi",
            slug: "fryan-riadi",
            city: "Garut",
            province: "Jawa Barat",
            address: "PQ25+73P, Sirnajaya",
            lat: -7.299296099999999,
            lng: 107.7576992,
            phone: null,
            website: null,
            rating: 1,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Fryan riadi adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Khalisa Homestay",
            slug: "khalisa-homestay",
            city: "Garut",
            province: "Jawa Barat",
            address: "MQV8+JWG, Jalan Kawah Papandayan, Karamat Wangi",
            lat: -7.305949900000001,
            lng: 107.7673416,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Khalisa Homestay adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPWOzC8lek1u7Mh-lZL7C9tZIJreQwW2ixN-xPW4vPercwGzNiWDXebdY4mpPmkopleVcnwmlrIwvd-3RK-hLIc-YkWOZLvqibqQ2o_rIZM7Q-7tRTH9M5W63j1P7dOTDZgRo-9w56WaKYG2_ajghg6RA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Homestay Orstudiophoto",
            slug: "homestay-orstudiophoto",
            city: "Garut",
            province: "Jawa Barat",
            address: "Kp Ciseupan RT.03/RW.07, Karamat Wangi",
            lat: -7.305960999999999,
            lng: 107.7674401,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 19,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Homestay Orstudiophoto adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO0lhPU7jMrp3bFkhyRWC1EwQn18GVREJ1fGLHiXBYp2fsbbUF8Zfi-dRbkERZpyBPxHBzPqrx1D8lH8DKI_96VY-oRrSre3ZkIukkA3hJeKVz2VxDR2YVcWP8FpnORvTrtSTd0iH0JmnqG9WHimGq5_g=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Rumah singgah Info Papandayan",
            slug: "rumah-singgah-info-papandayan",
            city: "Garut",
            province: "Jawa Barat",
            address: "MQV9+9V5, Jalan Kawah Papandayan, Karamat Wangi",
            lat: -7.3066502,
            lng: 107.7695928,
            phone: null,
            website: null,
            rating: 4.9,
            reviewCount: 58,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rumah singgah Info Papandayan adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOLBNAJYG7gwPHC2y07IHL6Mgf-zr7dWCalAP6PcVc9H9prQHs-ofEWt45FoyLaNZI4nie55LQ7hhLkLcw7gdY2m8etaupCpz7LKwUKC1rY1KVMtafvvjbkDwi_OMom5H9IghagzOuLX-nKEpNaqmtf=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Fatimah Guest House",
            slug: "fatimah-guest-house",
            city: "Garut",
            province: "Jawa Barat",
            address: "Cisurupan",
            lat: -7.3134597,
            lng: 107.7690715,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 34,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Fatimah Guest House adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPG3Wqwa8cIv3xgGSbPz5oyZeaou8UdQi73tscue8Mf3eqjGB3hWpGETeZ_2xTxUfUk9065jg3PdZVICRBqyH3j3K6y6oCfQXn6fHXnZedCxk81_Lj2XkkoCHrjb_4WonCY4w_idNOBbAHFHg=s1600-w1069",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "HOMESTAY PAPANDAYAN ADVENTURE",
            slug: "homestay-papandayan-adventure",
            city: "Garut",
            province: "Jawa Barat",
            address:
                "MQV9+9V5, Jalan Kawah Papandayan kp.ciseupan RT.3/RW.7, Karamat Wangi",
            lat: -7.3063939,
            lng: 107.7700351,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 4,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "HOMESTAY PAPANDAYAN ADVENTURE adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNpk_C5-NnvLX8UdgsI0TnzcZ2YYD6s5c6uSs1r5cyL6oRkFpqUbxXyOfHrOh_M49aSyZQbWNNn7l99jquLVRSAdGLUxGAmjgfvkcXvppLtNTEucINRMicSAcPb5H5mwhiWnV3HOC7w6IN3WWR_5sx-tQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Homestay mang japra",
            slug: "homestay-mang-japra",
            city: "Garut",
            province: "Jawa Barat",
            address:
                "MQRC+GCV, Jalan twa papandayan RT.05 rw05/RW.kp barukacang, Karamat Wangi",
            lat: -7.308642299999999,
            lng: 107.7710335,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Homestay mang japra adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Bascamp Papandayan pak hadid",
            slug: "bascamp-papandayan-pak-hadid",
            city: "Garut",
            province: "Jawa Barat",
            address: "Kp.Barukacang, RT./Rw/RW.03, 05, Karamat Wangi",
            lat: -7.307915899999999,
            lng: 107.7716692,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 2,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Bascamp Papandayan pak hadid adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO1uJGfrmpi4R_oKckPevYMzyc84hHP7YnzibKuIK23ms8o1uzbNuytHK1NU2KbO9e75YMMk7DaSnNHNpfL-NxB3E744EXVyZ5V3ahuFIKkM-uihP-RSJDTsKv334KECfKUIn9dMD9WHJvR_46rT361=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "OYO 2922 Wisma Kampoeng Ciherang Syariah",
            slug: "oyo-2922-wisma-kampoeng-ciherang-syariah",
            city: "Cibitung",
            province: "Jawa Barat",
            address:
                "11, Jalan Lintas Subang - Indramayu KM. 11, Dusun Nagrok, RT. 2 RW. 8, Desa Sukahayu, Kec. Rancakalong, Cijambu",
            lat: -6.813618200000001,
            lng: 107.9213787,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 20,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "OYO 2922 Wisma Kampoeng Ciherang Syariah adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP9JKcvFjP1F-qot3mWrGz-IngJijwvI6bsB-S1xSeNoeAh6lhVRD0Iy-xel0HfCviHrKSbyL7y8jx-YixYXhGendVtE5YXCZHKTQjA0xONnRLKDcYEiFEZtHPXsJj7ZK2TYP8FFt7ZQH4Jtos=s1600-w1280",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Handayani Hotel",
            slug: "handayani-hotel",
            city: "Cibitung",
            province: "Jawa Barat",
            address: "Jalan Prabu Gajah Agung No.10, Jatimulya",
            lat: -6.8280319,
            lng: 107.9188422,
            phone: null,
            website: null,
            rating: 3.7,
            reviewCount: 838,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Handayani Hotel adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNFDyxAP36FVJF3NIIckvHsDqP_3lD3pDsqLtYTpZ6tWa6fyfPrf196PwtPp2z-3p2305h1Z6xxezIxlVmMtPx9Oh_VTjwp1g22etpKsTkH9kftlcRuvkLr7t8di4MFKHhasI_84Q1dViKcQA=s1600-w1477",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "SPOT ON 2891 999 Guest House",
            slug: "spot-on-2891-999-guest-house",
            city: "Cibitung",
            province: "Jawa Barat",
            address: "Jalan Prabu Gajah Agung No.14, Kotakaler",
            lat: -6.8303508,
            lng: 107.9251236,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 72,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "SPOT ON 2891 999 Guest House adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO1bxAH9kzHa-Nv5Z_L_vznBJeXW5FiKJ778n7KFtnmvylFFMdk5qbRn6Ur1y6PBCw7Pmv3cQl20HA49658AwQQj2OG4-GzKt-slVXBU260IszYmVzmRe7gM87LthEy-yPiaszn-yKK_SGX2Q=s1600-w640",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Hotel Asri Sumedang",
            slug: "hotel-asri-sumedang",
            city: "Cibitung",
            province: "Jawa Barat",
            address: "Jalan Mayor Abdurahman No.225, Kotakaler",
            lat: -6.8350782,
            lng: 107.9282503,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 2069,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hotel Asri Sumedang adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZM_lvfgf5bR3uELdZsjBVZMxqehvOfCVdKopsrkXWoWvuy0Kwk1lEK4VcWSsJQklAz_JmWZvO9mG11CDw9Nmf6HYRNyHmO9A7X48UL2qxeKak1CIQjJEDMDRFV017p-WIz_vHnxOQJR9OV3mxHHmgH2=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Camp Area Puncak Gunung Tampomas",
            slug: "camp-area-puncak-gunung-tampomas",
            city: "Cibitung",
            province: "Jawa Barat",
            address: "6XP5+4RP, Cibeureum Kulon",
            lat: -6.764666200000001,
            lng: 107.9595842,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 72,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Camp Area Puncak Gunung Tampomas adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMTyE4aJAygMeMZ2uuO4LvZtrVAx8oYcDkpUbtQQIac9kSAigAPBhTMG8DjaVx7mcBBXkFoa6Tqq2cFPnMecN_79-qs3Dwt9B_mBZe_DTxVvT2KrJHkB_dGPH_wJ57z-q3Zvy8efzS-JOjeY24=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Lembah Durian Tampomas",
            slug: "lembah-durian-tampomas",
            city: "Cibitung",
            province: "Jawa Barat",
            address: "7XFC+P84, Jl. Raya Dsn. Cigalah Girang, Cilangkap",
            lat: -6.7261923,
            lng: 107.9717905,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 6,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Lembah Durian Tampomas adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMVW3sm4CpKFFL9Qxt7icqhMXkQ-sHpWHWxmv4-vTttLPf90cXbyCSCDPszTE6r20GfvjEy2jJiZ74vOpbxoGM2w1l3q33FeEX5Yt_ekyfFwAGKT2YMSwClaMLlLn-qIFlMT8b5TK5YQuVCSzcbmpr4=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Saung Nini Aah",
            slug: "saung-nini-aah",
            city: "Cibitung",
            province: "Jawa Barat",
            address: "6X97+GVX, Cibeureum Wetan",
            lat: -6.7811371,
            lng: 107.9647362,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Saung Nini Aah adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMdF60WkqbtZumNhswouyYQnyqi5-Ed_zf4JuvMopHJkCB79BnEKSKGXGrZne0neUmIQ39GRpdHJLcMajNhALaVKqwZhYtak3OBr2IT-U1A7_Z4bflQzjTZxWYaMzhAqo5s8we6ts38g8Y=s1600-w720",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Curug Cipadayungan",
            slug: "curug-cipadayungan",
            city: "Cibitung",
            province: "Jawa Barat",
            address: "6WMH+5X7, Bangbayang, Padasari",
            lat: -6.767088800000001,
            lng: 107.9299359,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 145,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Curug Cipadayungan adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO_yrhXLOW45Ym6B5c4eyZUN9z9zDPibwaKkjxBJ94OUrp-muprdLy1WNDeKfcFpUPQuZS18hI9f0sXzL3nAjGv8H4lULwqy3iFHido7lfPQC7B24PGjN6EhGOLrCGK_cl7_v6O5rmzrA_3Ro0=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Rumah Keluarga Abah Olot",
            slug: "rumah-keluarga-abah-olot",
            city: "Cibitung",
            province: "Jawa Barat",
            address: "Dusun Cilumping RT.002/RW.006, Cikurubuk",
            lat: -6.728577899999999,
            lng: 107.9362897,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 3,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rumah Keluarga Abah Olot adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNCc_y-FTAsYucau-ljix0891AHXptYbEs4BfUkOHKpOj4jBKMfB_Adnf52avKFvEBS9m8rDo-h-OSsVLnfU6E_M2KsbR7x1BFrn7CoEi3GfcCnnfYDnVp_0KvSi-OwUY1m_lOgJQ0i568W=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "House OF Iyay",
            slug: "house-of-iyay",
            city: "Cibitung",
            province: "Jawa Barat",
            address:
                "Jln Pendidikan Tampomas Indah, Dusun Cilumping RT.01/RW.06, Cikurubuk",
            lat: -6.728620599999999,
            lng: 107.9360844,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "House OF Iyay adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Pa olot",
            slug: "pa-olot",
            city: "Cibitung",
            province: "Jawa Barat",
            address: "7WCP+F8G, Cilumping, Cikurubuk",
            lat: -6.728820700000001,
            lng: 107.9358352,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Pa olot adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Ema wiwi",
            slug: "ema-wiwi",
            city: "Cibitung",
            province: "Jawa Barat",
            address: "Dusun, Cilumping, Cikurubuk",
            lat: -6.7289107,
            lng: 107.9356732,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Ema wiwi adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPxleXK4RrjdpRbhYTtXchM75o8AZPBVJoAWv_pdatG5h1TDinUhUm3P1jki1XFaGu-yQ0J-mLNic8uoiQ7pLFnpbsKAfeFqh1ftJx8YfYwV0viuq6q0jj5ukWe9Xnl0utobIcKXqqMWukKRAI=s1600-w1040",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Pondok Pesantren Almubarokah",
            slug: "pondok-pesantren-almubarokah",
            city: "Cibitung",
            province: "Jawa Barat",
            address: "7X3Q+84, Narimbang",
            lat: -6.7467397,
            lng: 107.9878163,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Pondok Pesantren Almubarokah adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZM5Yt0-d4Wresl9nyckjYjmCRv1jaECxHFEk9Ht4tnrUfo5s2D419BYcaErdRz_NAfL01ki8W5jTcdga7NWZhTGdgxb8ykEgKEGQwdnm49YoPHckSE1BRWI6I489VojIAn3EsNhT3Tbicgr=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Rumah kita pulang",
            slug: "rumah-kita-pulang",
            city: "Cibitung",
            province: "Jawa Barat",
            address: "7XH2+QM9, Jalan Bentar, Cibitung",
            lat: -6.7205954,
            lng: 107.9517421,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 3,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rumah kita pulang adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMsZFEaAMVlWWKxeiNjROsGank3sxEcW-tS92suO4s-QnfavgfwEqSIEC-KHzC5PhvvjHDG4atM45r6WtvrJCKZy3dNTwYojGotfa8vVSY2TZU1xX6t_zdmHj6FgrC7wMa6l4geYnjtTyrBoQ=s1600-w576",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "CAMP CIPADAYUNGAN",
            slug: "camp-cipadayungan",
            city: "Cibitung",
            province: "Jawa Barat",
            address: "6WMH+5X7 Curug, Cipadayungan Bangbayang, Padasari",
            lat: -6.768093599999999,
            lng: 107.9292295,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 5,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "CAMP CIPADAYUNGAN adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNg2XQaw8JT0L8ZHGPYxOGhtNGP6pAE6zi8Pst06ZTc2f5MfBhGwLxX1f5VRMulyDPu8RU6OHMldf0-0lURrk_HBOMJL71swpTXqROofFSK91vNwN502EcZ77_T4K0U91JH1dlG8sssoa-rmn_Tb6ANhA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Saung Buhun",
            slug: "saung-buhun",
            city: "Cibitung",
            province: "Jawa Barat",
            address: "Jalan, Narimbang",
            lat: -6.7542537,
            lng: 107.9912541,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 5,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Saung Buhun adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMkDI_UWqppKsJV22n7Qtobo--EUlYKRy3NCeSkvOB82xW5Z9tDIQB4lDxXKfh2Ob4bYW4vHfoAstl-0kFwoip6eT0xuO1SQeUx0z_LwdtrQtB9kHkDFXpIMjEqpjbDYJZVKTF2ujW8wSJnLA=s1600-w868",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Bentar desa Cibitung",
            slug: "bentar-desa-cibitung",
            city: "Cibitung",
            province: "Jawa Barat",
            address: "7XM6+42H, Jalan Nagrak - Cibitung, Nagrak",
            lat: -6.7171801,
            lng: 107.9601219,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 2,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Bentar desa Cibitung adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMRtj_EiHQvyvDNXgo86dZeOWO9ck4fMsUItohDk1HubXbMzbnV48QyRCVvqtf26IFGiSoE0VwP8gBDh6mH6fVoQDQ3zrZEuenA5sKI-efdv_cLqHtRQISnhRRMOHcmFX1JDAvoQSYmjNvY8g=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Rumah nenek",
            slug: "rumah-nenek",
            city: "Cibitung",
            province: "Jawa Barat",
            address: "6WJG+GGR, Bangbayang, Padasari",
            lat: -6.768625800000001,
            lng: 107.9262506,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rumah nenek adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNRqiyVGM9nzk2XYIpPdNXGFbkjJ370AP-_XYZzDjqrrhIngrJZEi3PcXxLY2VAOqGD0nEaB1IFcC7gpUCEdkEJoLYpJoFisyfmC0bXQ9IOGC7dD1sUA_qeHIT5cX7AtJdgz54Oy42kKw5Hsoh3Fe3t=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "base camp tyo ganteng",
            slug: "base-camp-tyo-ganteng",
            city: "Cibitung",
            province: "Jawa Barat",
            address: "6X89+8W, Cibeureum Wetan",
            lat: -6.7842436,
            lng: 107.9698177,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "base camp tyo ganteng adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Saung paninengan jang goler",
            slug: "saung-paninengan-jang-goler",
            city: "Cibitung",
            province: "Jawa Barat",
            address: "7WCH+652, Baros",
            lat: -6.729495699999999,
            lng: 107.9278941,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Saung paninengan jang goler adalah penginapan di Cibitung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Augusta Hotel dan Glamping Palabuhanratu",
            slug: "augusta-hotel-dan-glamping-palabuhanratu",
            city: "Cikakak",
            province: "Jawa Barat",
            address: "Citepus",
            lat: -6.968445999999999,
            lng: 106.5194843,
            phone: null,
            website: null,
            rating: 4,
            reviewCount: 2466,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Augusta Hotel dan Glamping Palabuhanratu adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMntFOSjzY5FgXUs-2G8nrWelEOAsL7rPulT74ePnktI06t2qRaNqqNGwJXEMKznaLcK3fXSdJz68QLbW4ziR6t41CRU1S4i267BuNNFCB-51Dcw-JFh1HJB7j034FLKDHHh9zYBcHTN4ly=s1600-w1040",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "My Lagusa",
            slug: "my-lagusa",
            city: "Cikakak",
            province: "Jawa Barat",
            address: "2FRG+V23, Jalan Lagusa, Karangpapak",
            lat: -6.957852799999999,
            lng: 106.4750518,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 370,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "My Lagusa adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNvN3cwKnwFUfVgJximFrYJea9BtOWgzEAkgxsup-ezm4OudK3Z8udL26DeFjJEuVtcjB5Xe5a8XHHVm0yHBs4FQ4lX9YzkK8grPxVJKOSvk0y1Xinvw17x_7E2JjbXnzaoV4h9GSs2RXH2hA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Grand Desa Resort",
            slug: "grand-desa-resort",
            city: "Cikakak",
            province: "Jawa Barat",
            address: "Jalan Raya Cisolok No.KM. 8 No.23, Cimaja",
            lat: -6.958441699999999,
            lng: 106.4868527,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 937,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Grand Desa Resort adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOuucQ-DPkxh451loECIaJvEwbct5PYG6c98LRescUT_rgocjLlWF3bYe5SsYYNR6bzNfnMcH7gws6dP9QFv75htIx95aGbCJ8TY50Rft9tVagvun2FbzHFK7nLPzuh4H074__OkE5_BUXkLwp8dDvzcA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Bunga Ayu Seaside Resort",
            slug: "bunga-ayu-seaside-resort",
            city: "Cikakak",
            province: "Jawa Barat",
            address:
                "Jl. Kidang Kencana No. 43, Karang Pamulang, Pelabuhan Ratu, Pelabuhanratu, Pelabuhan Ratu, Palabuhanratu",
            lat: -6.981383,
            lng: 106.53973,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 702,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Bunga Ayu Seaside Resort adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMyAcU_tFhyHlUgz9imx4laeS0BIV4S_SPTxf2n12t_g2ZBz6EWCkT-y0ulEEbA0EPDQDmZQD4W3-RANTA96mj4uND97nqqEUzJ7YyLPqh6SHXRf3eJss2Slzg_nPz893tO5lGgrfvb_Rd2=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Desa Kemah",
            slug: "desa-kemah",
            city: "Cikakak",
            province: "Jawa Barat",
            address: "Jalan Raya Cisolok No.km. 8 No. 23 Cimaja%2C, Cikakak",
            lat: -6.9611825,
            lng: 106.4953602,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Desa Kemah adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOlW3ubUEdjxUKSjJI3KZ-gQ6dZhtMgqsxUn0paywqwCtPd484gwwS6H2Dbk88Icjj-8b2gSjZHGooqy-QhcOQFSJ9wum9U_D1Kx8RZrSavAtS3-vvlIDVCvFacXmZu8MSl0Yo7Lo1Kn19VVoo=s1600-w540",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Hotel Cleopatra",
            slug: "hotel-cleopatra",
            city: "Cikakak",
            province: "Jawa Barat",
            address: "Jalan Raya Citepus No.114, Citepus",
            lat: -6.968194,
            lng: 106.5185171,
            phone: null,
            website: null,
            rating: 3.4,
            reviewCount: 272,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hotel Cleopatra adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMB3nrmTR4JG7_EsjoOTiQI6B-CHyDxPybUjD6ikezcJl0yLMKAjYMlU-ckVB8XAubpnTqorRR90sezJFaKA0Cx7JXfu65_iEYQEBrQGTKv-NSoOYwT2NcTTKrpjUlPXM2MKQT5PjcPNQQ5KxA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Grand Inna Samudra Beach",
            slug: "grand-inna-samudra-beach",
            city: "Cikakak",
            province: "Jawa Barat",
            address: "Jalan Raya Cisolok - Pelabuhanratu, Cikakak",
            lat: -6.9630639,
            lng: 106.5068825,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 4853,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Grand Inna Samudra Beach adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNsdUPDCCmiYSvPZmLC-fGp20FTxYamHdGzTmIgxmJBP-UCFQmxQRtbHYPK60dJ1LugTB3lEoEx0GgDD0ocs1MgRQTi24WLB8fi4VKsYuKop8ndV05sd1aOLHGIK6wgQHErL4Znwh-WpRMsT3OYQb-XPA=s1600-w1280",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "OYO 951 Cempaka Ratu Beach Resort",
            slug: "oyo-951-cempaka-ratu-beach-resort",
            city: "Cikakak",
            province: "Jawa Barat",
            address: "Cikakak",
            lat: -6.962834300000001,
            lng: 106.498048,
            phone: null,
            website: null,
            rating: 4,
            reviewCount: 586,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "OYO 951 Cempaka Ratu Beach Resort adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNLVz4DEp3qWlh7C52H0TMI4ylqbHvU2Dkz0FAXka9DGrKOhm_CVybmgohz-jufeR3sIrWtkXA8m1XAqnh-gu2dhb3BGW6VO_0ocWnkPn2F3m3Jlf8Nyl1DgMlCQOgFUASBFSvZiBb1jMvodh8=s1600-w640",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "OYO 867 Bettah Coba Homestay",
            slug: "oyo-867-bettah-coba-homestay",
            city: "Cikakak",
            province: "Jawa Barat",
            address: "Jalan Raya Karang Papak, Cikakak",
            lat: -6.959941199999999,
            lng: 106.4927738,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 374,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "OYO 867 Bettah Coba Homestay adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNAuSrLIfudLH6KGSgtWaqH_hk9Xe51tvzS5S-Hn3dPc6IKf4paP2keBNCT5z5N0xPFCxHv5edw1E915ngiX3G_oxK_7q0Eze3Lj7q9SHQKevF9PVfLvh5KFf9dVk0gApU3gzkh7DczS1dXig=s1600-w640",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Dede Suryana's Place",
            slug: "dede-suryana-s-place",
            city: "Cikakak",
            province: "Jawa Barat",
            address: "Jalan Raya Cisolok No.Km No.8, Cikakak",
            lat: -6.958582799999999,
            lng: 106.4888745,
            phone: null,
            website: null,
            rating: 4.6,
            reviewCount: 126,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Dede Suryana's Place adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPPl0tShS-5FtRW_m8lyqbFyZsEEQiqQw4vq033y7YQnytTF5PiQitwfTuZ3pZTIsOzqlCWMfSG2uR5o1NbX-uUOInk_x_Qedde2VWP6mVir73-zNCXtYgqw2ZLhehI7SAsGgjMXtkPuOykhXU=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Cimaja Square Hotel & Restaurant",
            slug: "cimaja-square-hotel-restaurant",
            city: "Cikakak",
            province: "Jawa Barat",
            address: "Jalan Raya Cisolok No.Km.5, Cimaja",
            lat: -6.957734399999999,
            lng: 106.4861491,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 457,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Cimaja Square Hotel & Restaurant adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMH3S1mRMVgHsh3K1RD2ahNUeDfTtCzykLE-P11jhsgwWI5vhr0dO_QlexcjQAZfGBwX_-7u3UZiSlKOW4ryB27_Lp6lz3vSOv6Ae89tViqcd1ZfCG1Wc4fL4uiqr5SL6RxhNo_TZ7tlXEf=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Hotel Bayu Amrta",
            slug: "hotel-bayu-amrta",
            city: "Cikakak",
            province: "Jawa Barat",
            address: "Jalan Karang Pamulang No.31, Citepus",
            lat: -6.981788,
            lng: 106.5384844,
            phone: null,
            website: null,
            rating: 3.9,
            reviewCount: 854,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hotel Bayu Amrta adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMW0-SSZHTMBpgWaWCSMqTiFZa6NUMWku37RuD913YamFNt8NmmUO6IQE4zGzb7cWgHwoTMT1JQZQeW69tu8EVw5_M1Air3aaD0kD7UUXO0I5-qp2amoPj0wsFMSaZQD5zKoTlHTwBCfUNEyLw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Saung 5 - Cimaja Square",
            slug: "saung-5-cimaja-square",
            city: "Cikakak",
            province: "Jawa Barat",
            address: "Pelabuhan Ratu, Jalan Cimaja Girang, Cimaja",
            lat: -6.9489981,
            lng: 106.4850383,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 16,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Saung 5 - Cimaja Square adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO1Y2HJDe4T481xeH436ckSkfQONAsuCWnpxwyTyxcfKj2nnG9P-NZFXniOsx0ZF65coPy34aBUKlnQvImhpsn6X96Bp5lzhoJzxkvlC6zKps_JjUx9AV0dKBGNPrF1UxM6xuQC_BUfqXjv9w=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Bikers Waroeng",
            slug: "bikers-waroeng",
            city: "Cikakak",
            province: "Jawa Barat",
            address: "Pantai Karang Papak Jl. Cisolok Raya Km. 11, Karangpapak",
            lat: -6.9612588,
            lng: 106.4729766,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 275,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Bikers Waroeng adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOzelxODEvg5FNnXy1rYjSpzz3L2T3r65NCr5_AlFUpSM42L52a-slwkcXT9kwouJ8fHhXieg5wZBEHND_AMXnE5z-qc3CZx-ZUbhxJ6zxaD8nQGpLzKA26aGQL6KrVArzISefpTRHxWkRePA=s1600-w960",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "HOME STAY KAHURIPAN",
            slug: "home-stay-kahuripan",
            city: "Cikakak",
            province: "Jawa Barat",
            address: "karang hawu, Cisolok",
            lat: -6.952338999999999,
            lng: 106.4655423,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 13,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "HOME STAY KAHURIPAN adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO4xYhwSKHlNWgfMcn47WF8vQG-lfLHfwbv42PEutsblTivMbYvfFumcl2L2IfBBmuq0NlrYw7cIPvz1y1XlMOU2JWsRVGQm4mtPSpCW7zIgUIp_-eusgckVHD6mQA_P5hSnCnoSBFre4GJtKkbE-ylMw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Villa Az Reynold",
            slug: "villa-az-reynold",
            city: "Cikakak",
            province: "Jawa Barat",
            address: "Cisolok",
            lat: -6.9543064,
            lng: 106.4524562,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 95,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Villa Az Reynold adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPVW54YsgaYzJ8YiHlDzBxD6Hx1gr8sNJUAgte7R9clqUKKR8qw_sME3R7yvKwS8T6C06qWoW6BeTb_O8xt8cXqZ_dxuXkYUNqjcn2o9mb1gl0MluE-hCEGaX_QM5YMn7Cfrl_ILMItis2mqtc=s1600-w720",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Andrey Super Resort",
            slug: "andrey-super-resort",
            city: "Cikakak",
            province: "Jawa Barat",
            address: "3C2V+J86, Cikahuripan",
            lat: -6.9484559,
            lng: 106.4432656,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 10,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Andrey Super Resort adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZM598810fAVu8BwsCb9J2JRYcpVbpwlfCsdzEmdwwwWLe1KeQu-W5d_JQ5Kj9_uAvLHgFVubAST8gU1y0nE5IUYS0N4E4Kd5ZzVI9oWLN_4fP_XFqNwSgJi5VLDlW1aRiUkM6-azjJzUQPNTQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Villa Karang Aji",
            slug: "villa-karang-aji",
            city: "Cikakak",
            province: "Jawa Barat",
            address: "Jalan Raya Cisolok No.KM 24, Cikahuripan",
            lat: -6.954138600000001,
            lng: 106.4344412,
            phone: null,
            website: null,
            rating: 3.5,
            reviewCount: 249,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Villa Karang Aji adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMP-namgjGAbIkb9oyyIW_mKrfxBDMBh2eEIrWoyAf4c8CnBd6ByGxel62nhIYw5cFWn9SAeeLi6iyf9OawxrLt8B-SET9kqcuKPDHXWQPZdTOZ7sIcJAFksjiCjm70J1xlavthrBacYvCGZw=s1600-w1200",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Rumah Iwah",
            slug: "rumah-iwah",
            city: "Cikakak",
            province: "Jawa Barat",
            address: "Jalan Raya Cikelat km No.10, Cikelat",
            lat: -6.895962999999999,
            lng: 106.4637996,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 7,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rumah Iwah adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPM99mpak-tb2Ykz5tmq6H64IAYK4sU2flSzh5kadXEIxpMHuMEDzif3BOIAYYpI2ZzjEcQ2fJa1gSyF5SE9DqBkwACKbi-TFbCQt_AL0pwc2a6hyHQW28C9jCve7Z1vUpq5z55ilZrHObo5QubBSWdtg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Kuda Laut Resort",
            slug: "kuda-laut-resort",
            city: "Cikakak",
            province: "Jawa Barat",
            address: "2CRF+78F, Jl. Raya Cibangban, Pasir Baru",
            lat: -6.959319199999999,
            lng: 106.4233058,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 309,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Kuda Laut Resort adalah penginapan di Cikakak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOD2znhJQ3C_1J_NL5XU8cHPlO1kFtjeLkjPi1A7hLQ_M3czkvF_yOWXEKk6vxxzH14nTNvyW_phY_s9jMpEzBzFduIWw0dB0zuiWXCmaf4b5MI2bodA2_QN-dGJio6v8b88lJAVOOBtD7OGg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Kampung Sampireun Resort & Spa",
            slug: "kampung-sampireun-resort-spa",
            city: "Ibun",
            province: "Jawa Barat",
            address: "Jalan Raya Kamojang No.4, Sukakarya",
            lat: -7.2023587,
            lng: 107.8163618,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 4873,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Kampung Sampireun Resort & Spa adalah penginapan di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP-mFnEMLsKHI47GcU3-A-yntLGr2LpyPup54m32dowT0P_XjQEPKkEKZgP0ax8vZn3trxS6tm837CPEewfSmLI5m6ldQ-L59GRIhJmwnVmmVKayRkHCIZ-UN4TbHVwJNfdEu8c5VRxHicW=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Hotel Green Hero Darajat",
            slug: "hotel-green-hero-darajat",
            city: "Ibun",
            province: "Jawa Barat",
            address:
                "Jalan Raya Darajat Jalan Pasirwangi No.Km. 13, Karyamekar",
            lat: -7.2177765,
            lng: 107.7477861,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 927,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hotel Green Hero Darajat adalah penginapan di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNNpM4vvgwinPXUzJPiYDeAawpP04e1-JmG8XGsMmeopr9rmGf2paDo6T6yeOMYzK0PkP9FpaFio5828eXuxEloC6qVAx6Nh_WxgqUqSsTXavHu83NHr_3612JS8v1UiAN1m0Dc0We67B5Rvnh3UWEIgg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "OYO 862 Derajat 4r Cottage Syariah",
            slug: "oyo-862-derajat-4r-cottage-syariah",
            city: "Ibun",
            province: "Jawa Barat",
            address: "QQJ2+PGG, Karyamekar",
            lat: -7.218190199999998,
            lng: 107.751341,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 326,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "OYO 862 Derajat 4r Cottage Syariah adalah penginapan di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMi0NGDXOzRrxGdpnyBfyS3xpzjmqjkvtkBXPfjq0mlCB3-u5g8J__1gjmjUJMy5MVlRNq8t_1EaiMAUql8BYJb95AgIm1Fs4vgLeJufphN9yjpwBGZxP9COy_Sw7Z_RYlEIPekT2mDwfOn7A=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Kayarra Resort",
            slug: "kayarra-resort",
            city: "Ibun",
            province: "Jawa Barat",
            address: "QRWF+6RP, Jalan Raya Kamojang No.KM.3, Samarang",
            lat: -7.2046204,
            lng: 107.8257326,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 3860,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Kayarra Resort adalah penginapan di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMcUR2ZoDck0COk0XY6D6YQTpi5ZjmhovjdE-lImas_kYLqMcY4wpB009i_dMR32NbOwl9yeIA0kNdxlNNjuLPNUr1HHQWETjo27yOlGwbcx6Pnf2KXoxV2U45L8D7KzWgv69Hj6n3ZF4KP5w=s1600-w1280",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Awit Sinar Alam Darajat Garut",
            slug: "awit-sinar-alam-darajat-garut",
            city: "Ibun",
            province: "Jawa Barat",
            address:
                "Kp. Awit Darajat, Jl. Darajat No.Km 24, RT.006/RW.005, Padaawas",
            lat: -7.2186179,
            lng: 107.7414247,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 2802,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Awit Sinar Alam Darajat Garut adalah penginapan di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOgUFPjrxb-ecJLU_rqVKC079kRGG8AOteZeivbchmQvJoCdDhFWXyRTWzilaudYqfmJ5xv21f2Aiz1qtfjE64JsYmOfX5VYxbg_-eoDfux5TKtSis3nnK84XMH8o48uVxKx4kNMiY94ADIbw=s1600-w1074",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Pas Jang niis",
            slug: "pas-jang-niis",
            city: "Ibun",
            province: "Jawa Barat",
            address: "VP7R+68C, Cikawao",
            lat: -7.1369341,
            lng: 107.7407762,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Pas Jang niis adalah penginapan di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "SARANA WISATA ALAM TIRTA ANYAR",
            slug: "sarana-wisata-alam-tirta-anyar",
            city: "Ibun",
            province: "Jawa Barat",
            address: "VQ3P+J26, Unnamed Road, Laksana",
            lat: -7.1459717,
            lng: 107.7850009,
            phone: null,
            website: null,
            rating: 4.7,
            reviewCount: 3,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "SARANA WISATA ALAM TIRTA ANYAR adalah penginapan di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPoJqsWdLWtyID7jpk5gV65ygdxZywm43f229bCst6LjaEx7YIPeeA92hogilgyQhxWdOIN3itp-O0N0-VBQ4QBTbGHSNGM3XlcwLlHcQu6AI9rPUfYgM8AlNAUoUZAtoYGOBRHwV9lOOIaNw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Kp dukuh",
            slug: "kp-dukuh",
            city: "Ibun",
            province: "Jawa Barat",
            address: "Kp dukuh RT.03/RW.13, Neglasari",
            lat: -7.122593999999999,
            lng: 107.739166,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 2,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Kp dukuh adalah penginapan di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "PonPes Hidayatul Falah",
            slug: "ponpes-hidayatul-falah",
            city: "Ibun",
            province: "Jawa Barat",
            address: "VPHV+JPQ, Gantungan, Neglasari",
            lat: -7.120908699999998,
            lng: 107.7443519,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "PonPes Hidayatul Falah adalah penginapan di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPmTt8-oG2N40ft8ILCeNAdbHPOAG8h5pgPgP7XAR0fhpR78IWKLvVfojf-rHsWUDWFVDXhbBPd3w6JMCSzp6jIkeOrQCfJSyjIEH02CLZKj24Rc_YzUvqW0jmXy1zU8qrEdSo5lshgIv0byZzJEoFpcA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Rumah Kost KMJ",
            slug: "rumah-kost-kmj",
            city: "Ibun",
            province: "Jawa Barat",
            address: "Kamojang desa, Laksana",
            lat: -7.153899999999999,
            lng: 107.7885474,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 3,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rumah Kost KMJ adalah penginapan di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOjTu8wImjng_GGAeSfI3r175dXyXIb01zupbGU23SifHpnYGi47d_8CoY87LmNMlFAFGIxNHXwdJP8DpAbEyOtcX9rwo7r5O1iFboICUNSga93iNTRc5vctW8b60LgWEXiixwRPMCLYnvQuQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Homestay Yanti",
            slug: "homestay-yanti",
            city: "Ibun",
            province: "Jawa Barat",
            address: "RQWQ+VFR, kamojang desa, Laksana",
            lat: -7.152766999999999,
            lng: 107.7886422,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 6,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Homestay Yanti adalah penginapan di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPKhrXjclF5tjuTnQxNrHVF6NSeAmV7e6mXK9a4pp-5weMmVrlfZ0q4SSe4GbI7cR9lKFVvigjFGD1K1TNU42Yeip8VRZPCWAarPieI1ab1YoCoR_GypcttFun4CRiXpiBvLVK-6HBqFatZ4A=s1600-w960",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Wanaka Kost",
            slug: "wanaka-kost",
            city: "Ibun",
            province: "Jawa Barat",
            address:
                "Nama titi sutiah, alamat kp kamojang RT.01/RW.07, Laksana",
            lat: -7.1518238,
            lng: 107.7887708,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 5,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Wanaka Kost adalah penginapan di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Home arnesha",
            slug: "home-arnesha",
            city: "Ibun",
            province: "Jawa Barat",
            address: "RQWQ+5V2, Laksana",
            lat: -7.1546034,
            lng: 107.7896473,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Home arnesha adalah penginapan di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Pontren Miftahul Ulum Al-Musri 1",
            slug: "pontren-miftahul-ulum-al-musri-1",
            city: "Ibun",
            province: "Jawa Barat",
            address: "VQJ4+P7V, Jl.Babakan Simpang, Dukuh",
            lat: -7.118146100000001,
            lng: 107.7556846,
            phone: null,
            website: null,
            rating: 4.9,
            reviewCount: 27,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Pontren Miftahul Ulum Al-Musri 1 adalah penginapan di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMlbizvm0dsy4-yMPTxyb9yqYUyZ7Lz5346h-Wn4_mr-Qf7owbGiuN9Y2i-Qcf85wxNo0IgaqGIykWgvkkuJaoYBqzYsM2qHRMkr_w-KDLatzOSBwL5ExLlc9KJrYiOk4W05lHW-UsSV3IZiy0=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Homestay Umaran",
            slug: "homestay-umaran",
            city: "Ibun",
            province: "Jawa Barat",
            address: "Jalan Raya Kamojang No.17 RT. 02/07, Laksana",
            lat: -7.1524024,
            lng: 107.7899592,
            phone: null,
            website: null,
            rating: 4.9,
            reviewCount: 8,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Homestay Umaran adalah penginapan di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNLt9FWrJjvSbyB05EmxM1LUewChZ3jojjWTDrer-5ExV2SmQGBIV75DgwXEmTzHsJbe31mGzxstD-LWH0DT5HdK48QQOqATNuTS2OtkOblqWmanBgM375ghooFEcl82s_nigbqR_jkK1aLeQ=s1600-w1004",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Penginapan Wisma Kosan Kontrakan Toko Kamojang Pangkalan Pateungteung",
            slug: "penginapan-wisma-kosan-kontrakan-toko-kamojang-pangkalan-pateungteung",
            city: "Ibun",
            province: "Jawa Barat",
            address: "RQWR+62X, Unnamed Road, Laksana",
            lat: -7.154398,
            lng: 107.790122,
            phone: null,
            website: null,
            rating: 4.6,
            reviewCount: 30,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Penginapan Wisma Kosan Kontrakan Toko Kamojang Pangkalan Pateungteung adalah penginapan di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOg768N_IznWfbtsYWZkk_2kxUcMAX0TISUt4ukNfVTwGCZTnLjLPEKFaUl-fYSVivizAYjRmHtvDM5bjzhPh_mxVexn9bROIFxIBIAGLWN-velWu5ErnZJcVm87x25ywoceCQf2c7zxDV8q8SCga1wFg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "The Obet Kost - Kosan Pak Suhendan",
            slug: "the-obet-kost-kosan-pak-suhendan",
            city: "Ibun",
            province: "Jawa Barat",
            address: "Laksana",
            lat: -7.151627699999999,
            lng: 107.7899049,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "The Obet Kost - Kosan Pak Suhendan adalah penginapan di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMazqwTATIj0AFJtMGOwI8wHGhfJvkDVmzy2QUmqOSSWKBMrWb9mZx7iBP2d4svW82tK3Lavyx0AF9qxjHYlFmVxbN2F4oQYZBo5LXztodkBootH2FHx_Z79z2dFGAdQAxjlpVZsEOPrYlFBas=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Kost an Ibu Nenti",
            slug: "kost-an-ibu-nenti",
            city: "Ibun",
            province: "Jawa Barat",
            address: "Jalan Raya Kamojang No.;72, Laksana",
            lat: -7.153143099999999,
            lng: 107.7901523,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 5,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Kost an Ibu Nenti adalah penginapan di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNK6cK2A0nP1vibON5GAL08X_vvGFXf-1Ok3GiP0ttOk-vcimnl3ArNaFPNkjEZ1Hd9zOj7hpgbrlnWpMwe0bqEA-NlFgYF0ds5RDSVTQh27drYY4V4-oXzCzzw2pb_12TLvohRoLGVlJq6oostU0ZfTA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Villa egi",
            slug: "villa-egi",
            city: "Ibun",
            province: "Jawa Barat",
            address: "VQ4Q+49X, Jalan Raya Kamojang, Laksana",
            lat: -7.144631500000001,
            lng: 107.7884943,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Villa egi adalah penginapan di Ibun, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZM9IXsrd3XDN3NWmXjAyyR0TpFJgNaHCFHfq0OAyQCnfTKSd2dndGeOXokEh6erYyX0ItbdiK-4-4VTDEsLqxwr0QRT_kC_DBZNt8WX73Ih9f2fOXfdL7bmnOaXSe8i97dDTNebpiZWIOnwISw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Palace Hotel Cipanas",
            slug: "palace-hotel-cipanas",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address: "Jalan Raya Cipanas No.KM 81, RW.2, Cipanas",
            lat: -6.7361635,
            lng: 107.0421125,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 4840,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Palace Hotel Cipanas adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO74hwrt3-j5UcyCJaiZfwMZ7uv63PoxRLkROhtQXMadKOX5-ffIJi1Ki6xMv6uvPttBZBx0NlzfS5WjjfWUKPEB3urVtBkAg9Z-0ML8ch2D_nG7wCHkhsshGRQhUt9CAVzklK3LV0Vab15=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Novus Giri Puncak Resort & Spa",
            slug: "novus-giri-puncak-resort-spa",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address: "Jalan Sindanglaya Raya No.180, Sindangjaya",
            lat: -6.723331900000001,
            lng: 107.0379618,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 5249,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Novus Giri Puncak Resort & Spa adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNfl-0JZG558bkYfPJBN-TXsX34ECti2_CHaT1dYnWc4VhUySQuyHCi4oz7ylB6b07zN3pgESO4xI1nn-5t-UNg6xd12Qad0HL0Rb9pxLtWcQHkqOMOhBb1pcMcLrQ9IeMTRzJJxpoHTklSj2QMvyR5=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "RedDoorz Premium @ Grand Prioritas Hotel Puncak",
            slug: "reddoorz-premium-grand-prioritas-hotel-puncak",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address: "Jalan Raya Puncak - Gadog No.Km, RW.83, Cisarua",
            lat: -6.687219499999999,
            lng: 106.94043,
            phone: null,
            website: null,
            rating: 3.7,
            reviewCount: 1177,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "RedDoorz Premium @ Grand Prioritas Hotel Puncak adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNRV4Wm8ed6wWKfjoM2yvHT6Wc519GOYibq209cKetsRXhIE56i2wZdOvkEx_H2FxirMsxqpwZm-BUqnJWPvzqLHa0qjSH_ApvZ_C9vXHz57gD0EK14FoJ33YdOu5Vtwum-5_1MFILa2p8C=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "The Rizen",
            slug: "the-rizen",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address: "Jalan Raya Puncak - Gadog No.Km 83, Cisarua",
            lat: -6.6871854,
            lng: 106.9410588,
            phone: null,
            website: null,
            rating: 3.9,
            reviewCount: 1658,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "The Rizen adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOIMUNgzAPH_zJfLjD_VZVSpRUdfScjSsXRQNicAkG43O4I-e1nod2o0oKwcYJv76JKiNSet-WfoefAURn2X4W2pWdM_f6f1zznWTLCInXBXfwDKtEw6xsAez-ffjFTUqkkBFVGfkwK-DmD6A=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Tangko Resort - Puncak | Cipanas",
            slug: "tangko-resort-puncak-cipanas",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address: "Jalan Kemang Puncak No.Km 4, RT.01/RW.06, Sindangjaya",
            lat: -6.7401958,
            lng: 107.0215733,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 471,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Tangko Resort - Puncak | Cipanas adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNq7EqFL2RCdKuRsPjsfssDWVTGRsV3N8udQWirrXBsrpALRvRuho23g0tFVzD--C8gIDcCkiSJKKd9bC_9Y0-vYsdS1ssszsOJLZ22hX1n7nM2GJKMtRyf2FEezK3i75VMD_XHggPqPDZS=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Buena Vista Boutique Hotel",
            slug: "buena-vista-boutique-hotel",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address: "Jalan Raya Puncak - Cianjur No.11, Tugu Utara",
            lat: -6.680712199999999,
            lng: 106.9484503,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 301,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Buena Vista Boutique Hotel adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMotyY7UfQWZtBK0QVi2DSsXO3zsMHLEKgegQfxF0BU8Iqyg6i9idR0wekCSkNCPaicb8rMOekl-izMB4MRUil_KWq4tiSxMBbcE5f1j1YDAO1HsgC6K-cEENzv6DW6-wvaS8jhQbmGroy5DKA=s1600-w1280",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Casa Monte Rosa Hotel",
            slug: "casa-monte-rosa-hotel",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address:
                "Puncak Mountain Resort, Jl. Raya Puncak Km. 90, Ciloto Kampung Parabon No. 100, Ciloto",
            lat: -6.7174539,
            lng: 107.0088743,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 1322,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Casa Monte Rosa Hotel adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNrGiRGaag3p1BGi-qyU57HIXnEk_dcXbOHlMIlAlYtXEZtR1aTdIHzUf82UwsEWMppgEZ6RM7twlhU3V8VOZELiPZzMgcCPy445KjEtDWp6nNhSaOBlcHBy5afDSCSdTyh3z-nE_DaKiO9Aw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "OYO 3925 Yasmin Rinai",
            slug: "oyo-3925-yasmin-rinai",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address:
                "Near Alfamart, Jalan Jeprah No.77 Palasari Kecamatan Cipanas, Cimacan",
            lat: -6.717878,
            lng: 107.0365883,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 3923,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "OYO 3925 Yasmin Rinai adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMxyARgj9mme_GBKCBZ5znSR5q3nIXK0pB_SRCI_XaojrKH_u4JiDLKKHrHlW1E0dcSwz2FuXMNWy0DICxzzSWBzetpFa-UbLhGdyeZ2Lx5mrYY-PCQk-kiy2yz_PTHiV85GMco7VzrNkzu=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "The Jayakarta Inn & Villas Cisarua",
            slug: "the-jayakarta-inn-villas-cisarua",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address: "8X63+H3P, Jalan Raya Puncak No.km.84, Tugu Selatan",
            lat: -6.6887792,
            lng: 106.9530356,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 2050,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "The Jayakarta Inn & Villas Cisarua adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOGmETxN_rDJvKfuO9071aCbm-06l9uJzcsw84M-IOyyFJOIjdW6icgJw3lC1qMrEdlBxbA0-lUF7ZAhsXkJIgUK2f0yeLm-qgR6NHKTM7fHjz0Rs9WO903weRxZUVQ9uPLVkLtzQVXF8zzVw=s1600-w1280",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Royal Safari Garden Resort & Convention",
            slug: "royal-safari-garden-resort-convention",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address: "Jalan Raya Puncak - Gadog No.601, Cisarua",
            lat: -6.6791143,
            lng: 106.9313867,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 16557,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Royal Safari Garden Resort & Convention adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPI13NObU1IEZDSrYd2OijbWoAOtbc_nGGHGs8gqjFb6SBxokB-SGaYVsAm4-rQEyPby2POtWFi83jcNTT4jUbT0FOgvkKidSR6_3TZKHmDUrxD5GPYg39MGRFohJLz5yL3a_GBREnNrM0wxTE=s1600-w1360",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Puncak Pass Resort",
            slug: "puncak-pass-resort",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address: "Jalan Raya Puncak No.90, Sindanglaya",
            lat: -6.707199600000001,
            lng: 106.9935139,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 13599,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Puncak Pass Resort adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNdn2PN9vWIj9VqWoGoBjjBjQG0ZkcqoM0d2G1ioLFJbsfrP8-CYtJkqL5kYfQBX9rw0xkjRCbKNvketDlC0bKI2mH_1moKKN1qzdNSn7AberV_007hhgmuXLBnwGWseLbKfn6rxRpHGO6vKA=s1600-w900",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Urbanview My Grand Hotel Bogor",
            slug: "urbanview-my-grand-hotel-bogor",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address: "Jalan Raya Puncak No.Km.80, Cisarua",
            lat: -6.6795002,
            lng: 106.9323854,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 274,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Urbanview My Grand Hotel Bogor adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNsZ9PgKolO5EDRtfXoebRx7XIQumN9TcuvOwUXvXEp_rYvF80USpDJXkbrMqFUySzZ8PrBhvsyXaH8bMhsmgu9Pfn0zAkaeeyfA8bw7BbkFaiSPw20ImXp-_fO6oR9d6l7zGkprQXeCJ6vrBgnbbNU0Q=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Le Eminence Puncak Hotel Convention & Resort",
            slug: "le-eminence-puncak-hotel-convention-resort",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address:
                "Jalan Raya Hanjawar No.19 Ciloto, Jalan Raya Palasari, Palasari",
            lat: -6.7081562,
            lng: 107.0232955,
            phone: null,
            website: null,
            rating: 4.7,
            reviewCount: 23925,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Le Eminence Puncak Hotel Convention & Resort adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOXAww5ooHryLbGXtuxibq_OlYgWPTytrRCW5xdBELHOJHwk4ehHW5BYStlpdDA6V4e377-76Pys6tvGFQ1jbhzipuyIin0C6DygevvjP3s6y59zm8PtEO4kQqQndu710x71v1LV-A5mbLbFnbKkbVKug=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Alfa Resort Hotel and Conference Puncak Bogor",
            slug: "alfa-resort-hotel-and-conference-puncak-bogor",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address: "Jalan Ciburial Kp. Baru Jeruk, Tugu Utara",
            lat: -6.675572200000001,
            lng: 106.9583156,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 1628,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Alfa Resort Hotel and Conference Puncak Bogor adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNq1R870PWc7Ibm5_fO14wrOqHSzzKr7QCtFCzG_HEmFmlI_EQdp-H-FhIU3yYVnroPTQwj5K2vNXFCwdREtfNbL1XsG4GBNl5uo1DL2VtP26fx2BtmO4eMe3ChLqPKXaeiH3TkDECFWBHe=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "OYO 2773 Villa Sm",
            slug: "oyo-2773-villa-sm",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address: "Jalan Raya Puncak - Cianjur No.9, Cibeureum",
            lat: -6.683946699999999,
            lng: 106.9514916,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 26,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "OYO 2773 Villa Sm adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMuVJNADZYJjBeSbbf3Cz9UJtmhAhoFaxZCJcuhUprjwDNTnNXaM-iDP8wnYBJJZEQHb26aeaD2J8DJp8iQqfjQmANkG187T6A5mg5K7QO5cEkREBZyJx-AUBRjy1Zd_06VxB8Wu4otR0A6WA=s1600-w640",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "SPOT ON 2950 Grand Suites Palace Syariah",
            slug: "spot-on-2950-grand-suites-palace-syariah",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address: "Green Apple Villa Puncak, Sindanglaya",
            lat: -6.727088800000001,
            lng: 107.0478002,
            phone: null,
            website: null,
            rating: 2.8,
            reviewCount: 89,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "SPOT ON 2950 Grand Suites Palace Syariah adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNXk4QkK8MsKFKhtA6qr-1NHM_dHaHik-jf4QeU8JVFTxPAY8Z4dpb2pi6WMZbitONKq2BqcQZBPnuyB3Amfai_VvshQHS-K5PxP_8ZOk6bCNlbKG9n6bn6VyeZfP2-0YnCyFXcR-8iz4Rqsg=s1600-w640",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "OYO 1667 Edotel Smkn 1 Pacet Syariah",
            slug: "oyo-1667-edotel-smkn-1-pacet-syariah",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address:
                "Hotel near Situs, 25 Jalan Hanjawar No.25, Jalan Gunung Kasur No.1,5 km, Cibodas",
            lat: -6.722213699999999,
            lng: 107.0656279,
            phone: null,
            website: null,
            rating: 3.9,
            reviewCount: 189,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "OYO 1667 Edotel Smkn 1 Pacet Syariah adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMiYjvwhh9L0wKsuFDYakKks3p5WpI2LnJV9DISpuZyObMJEbvdtrjB9EjZPPzEeDYWFRnTh4sfNAmX5sTzLBowOZUCIIZm7Po4Sig1EGWewUw3Cfd0rf6jkb9iobmksbeUR8kewhVVwGpG2g=s1600-w640",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "ZEN Rooms Basic Cipanas Km.78",
            slug: "zen-rooms-basic-cipanas-km-78",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address: "Bumi Ciherang Hotel, Ciherang",
            lat: -6.757141999999999,
            lng: 107.04534,
            phone: null,
            website: null,
            rating: 4,
            reviewCount: 4,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "ZEN Rooms Basic Cipanas Km.78 adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOjAZQfNDgUP7XrSw2_TF54xOrXbs9_fhTTA9Dw1CKhL6gieD0LTgOjAC-w_UeDycGzcP5F5M7qUGQWa3EVxmgNF3ZNE3OQf_Cx7ftRm5k5_Gs8PkPmbKeZYutb_EO8iP8QFUcBU_J7vzUR5Es=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Vil",
            slug: "vil",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address: "puncak Pass bogor, Ciloto",
            lat: -6.701498899999999,
            lng: 106.9930973,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 6,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Vil adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNzGxQ7q0N4DADrMMEu_QumXULG5dTWkERPz6EhJef32oTQlkTHDJot9-KtEY2klPQX90eYgInqNSl9Cb0taQ5e4x0NBWFdeSZz5kXLSZNRhU7PZVb4KgWrYkJ7ujyD7zS4B9u3LEH_A2vFYw=s1600-w1080",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Wadi Doan",
            slug: "wadi-doan",
            city: "Tugu Utara",
            province: "Jawa Barat",
            address: "مجمع Kota Bunga Blok N 11, Batulawang",
            lat: -6.697845,
            lng: 107.035663,
            phone: null,
            website: null,
            rating: 3.8,
            reviewCount: 12,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Wadi Doan adalah penginapan di Tugu Utara, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNqdmpgtps3AKs1UNUuXdnn_z6P2P5u2ZfX0cpUPrPAqM_c_X0djga91eaYr1uWWtrlm5RCix7CcAMQbtwujhwtYNTbeGpg7Mm8nYEvYq7zomWlDpBIMHxBe8BU5564tlU3uo0faLXDe-NM=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Novotel Bogor Golf Resort and Convention Center",
            slug: "novotel-bogor-golf-resort-and-convention-center",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address: "Golf Estate Bogor Raya",
            lat: -6.6044585,
            lng: 106.8385092,
            phone: null,
            website: null,
            rating: 4.6,
            reviewCount: 11140,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Novotel Bogor Golf Resort and Convention Center adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNXJhIAi2Qat5_7HQ-XQRJG3ULUitO0BbrsztWyggqqyX3d7mJb96lbymYE_ZjAaJYxgtanPB3NLXOHXu6xziivrB2In8IyQXdLyyfzAjDxVObS91LL_L_QrjAW7uClONubX2-8xhJuDHpBtLc=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Nawana by Alana",
            slug: "nawana-by-alana",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address: "Jalan Siliwangi No.1, Sumur Batu",
            lat: -6.585329199999999,
            lng: 106.8833725,
            phone: null,
            website: null,
            rating: 4.9,
            reviewCount: 17258,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Nawana by Alana adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNFCkEMiL53i4gmJhhV473202eXKA_DLImVs634QewAKzfcyL3ii9tjUQ-utBnIXDRlF9p93gdx55M7SLO5svH11Ji8EadxRCyKnR2DqZyuOOgy5_y9HhS9lWoYG4QpP-we1SzHXbnQ_msak_Eowb5_1g=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Harris Sentul City Bogor",
            slug: "harris-sentul-city-bogor",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address: "Jalan Jendral Sudirman No.1, Citaringgul",
            lat: -6.559609,
            lng: 106.8505427,
            phone: null,
            website: null,
            rating: 4.6,
            reviewCount: 8515,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Harris Sentul City Bogor adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOtPBRpZ1tjScpyRfE-uKRXTUihSZOXeIGLEky7cN6o2IACLpFgP81HNaPbrb_5LduVl2yn7BxJQPjAl-OrpWyl9JAsPcfW49PA8PJvxZybQCxkbhJnCRe5qVQXHW0nY67FND1ETld9zB29eZU=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "GUMILANG HOTEL PUNCAK",
            slug: "gumilang-hotel-puncak",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address: "Jalan Raya Puncak No.KM 75, RW.5, Cipayung Datar",
            lat: -6.651985499999999,
            lng: 106.8965386,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 751,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "GUMILANG HOTEL PUNCAK adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMx-44DCWpoxPw2mhnYwh9ct4uk9Ik8odohSwF1htbkFD8ALBfFs8z-TBSVlsspnYO6KpG1rh-lPwf6Uknx4xM5g889dJaq3ib_Ewd5kGR4r8CUxTGqrIhmHXqoib8sZe-mu4sw2RrGr923UA=s1600-w1448",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Rizen Premiere Hotel || Hotel Meeting || Hotel Family Gathering || Hotel Liburan Keluarga",
            slug: "rizen-premiere-hotel-hotel-meeting-hotel-family-gathering-hotel-liburan-keluarga",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address: "Jalan Raya Puncak - Cianjur No.KM 77, Leuwimalang",
            lat: -6.6602722,
            lng: 106.9163002,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 2509,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rizen Premiere Hotel || Hotel Meeting || Hotel Family Gathering || Hotel Liburan Keluarga adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPrC3VpPBtjAklHaN4yZOikiwvB6HNXZjHaHrcpWsXHktD_FlLy4RSdnU_QSL_O_YmHQFI16CrR3_qtXOmvSIe0oCTNGUZplbkqqaHKpgNl66xnBfxaL2eq31TA7NqmPLOj6fvx3kv8D0fwdCo=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Megamendung Permai Hotel & Resort",
            slug: "megamendung-permai-hotel-resort",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address: "Jalan Megamendung No.77, Batu Layang",
            lat: -6.647938099999999,
            lng: 106.9135276,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 1060,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Megamendung Permai Hotel & Resort adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO3i3iKVtBkyoJpMOegcnE0wKJrVvlov3NDsELaLECeG0IQQUkfQTeLmmLmzo7R5sM32x32rbkbmQwvxzwLmn0RaPZ6Ht5mxpsosAqYTykXFupahLc-bk6MduWKk7zIAND62_MiuAqdvzlYPOY=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Naratas Hotel Cisarua Puncak Mitra RedDoorz",
            slug: "naratas-hotel-cisarua-puncak-mitra-reddoorz",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address: "Jalan Raya Puncak No.KM.79, Cisarua",
            lat: -6.6638664,
            lng: 106.9207427,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 395,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Naratas Hotel Cisarua Puncak Mitra RedDoorz adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP6mPThiyqe9CAFoZDhcKIerrrKRYSq4KnB2HyfWYwzbKh6yvGaq-JagKFnV1tEiF7tgabzJfn50PHpqXr_PTp33fFwXh5Eu9nMqDv-EL9CKoU0SggRlHyJu6Qu7DhYvEO_qWuuVrrzxisH7Q=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Bumi Gumati Convention Resort",
            slug: "bumi-gumati-convention-resort",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address: "Jalan Babakan Tumas No.16 Desa Cikeas, Cadas Ngampar",
            lat: -6.583937999999999,
            lng: 106.8431213,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 4289,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Bumi Gumati Convention Resort adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOz3vmTStuOZQfldjle4aYTCICFge3fBBWP-a7nnApB5VN8EY-bSdGUsZjxjQspN071T8fudLQ_FcDEiIleAGlcHCZLLjl_uKtSkbR9O8jXNkQKlhVC1A81uAqsXTONGcvsr8LhhR5Ji-G1=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "RedDoorz Resort @ Cimahpar Bogor",
            slug: "reddoorz-resort-cimahpar-bogor",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address:
                "Jalan Tumenggung Wiradireja No.216, RT.06/RW.09, Cimahpar",
            lat: -6.591069099999999,
            lng: 106.8333515,
            phone: null,
            website: null,
            rating: 4.8,
            reviewCount: 11,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "RedDoorz Resort @ Cimahpar Bogor adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMWVvbz1XRzJ-YkERpQ_srXT3W7P97nXISo2gSS8yZrOr_qIHIQI4J-AMvVgXOvWk-On1av5hylQKAghXprAZo9N5VYJ7CFYlBc2rp1rHzK1KBK08sHrvmcvl4NxAwtIsvVlXcNikEZwTsJKrg=s1600-w900",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Hotel & Wisma Bintang Jadayat",
            slug: "hotel-wisma-bintang-jadayat",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address: "70, Jalan Raya Puncak - Gadog No.Km 70, Cipayung Girang",
            lat: -6.6497104,
            lng: 106.9010155,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 965,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hotel & Wisma Bintang Jadayat adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNzfOaANNPCabP_DGC3OALAFgu8Zi76J-GuIFMfRq7xpBZqK7CXtV7X-jfFSr9x97aI6DVDBwBzV53Yga-olZJkbAbPQjjVVcYWjWwBAZxK2n8slJjlSF3sV5FKow8hHw9x6gF10QmztkAZOGvoIMRN7g=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "OYO 3432 Taman Aer Hotel",
            slug: "oyo-3432-taman-aer-hotel",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address: "Jalan Raya Puncak No.31, Cipayung Datar",
            lat: -6.6491433,
            lng: 106.9070004,
            phone: null,
            website: null,
            rating: 4,
            reviewCount: 209,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "OYO 3432 Taman Aer Hotel adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNY6mkLnrbws2kGLSapfJlAardx-wfT1VDsOLHIqV6q9svE6HfDQ3rNl1O0rrABbgWNHjXOcJ7EL7n0UJys62zyW4ByWw0HcixyUOKKmj4q_gb4by9v8iC9XgQJyKVYc-D042VxGTF1ixbt458=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Hotel Gerbera",
            slug: "hotel-gerbera",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address: "Jalan Raya Puncak No.17, Cipayung Girang",
            lat: -6.6506324,
            lng: 106.9044907,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 1392,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hotel Gerbera adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOm3CEbpY7NzV_rqOZymUFhpX4bQwtWufCfDMJxGckizAleESQFBv_RhwokQJvCVCh6jA6c5U-49BMYCWUhsg25uGPbamDFN1cQygvjlV6oZXorBUUZIzne_-aVOw3FZWQ7IftbtKYotDJJjDG02nA2iA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Beth Kasegaran Theresia Senior Living & Resort",
            slug: "beth-kasegaran-theresia-senior-living-resort",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address: "Jalan Raya Golf Gunung Geulis No.103, Gadog",
            lat: -6.638171799999999,
            lng: 106.8676883,
            phone: null,
            website: null,
            rating: 4.6,
            reviewCount: 1760,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Beth Kasegaran Theresia Senior Living & Resort adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN2yJ80P_x0AoBc4-tKDTsz_w_aZbuJKVYN3IVs375CsTo0F-2788ZNYcVDxy0s12sTejSDSq8pOfGoBRPGSp00ZjOMrB-4yLTRuzeHvK1fzUzH1SLDlltfB-vd204MprdrH2Og1FQ7k87FqA=s1600-w1080",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "PAVO RESORT",
            slug: "pavo-resort",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address:
                "Jl. MH Thamrin No. 1 ( belakang plaza niaga 1 ) Babakan Madang Sentul City, Citaringgul",
            lat: -6.5723009,
            lng: 106.8606518,
            phone: null,
            website: null,
            rating: 4,
            reviewCount: 466,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "PAVO RESORT adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNTN1iXLyzIEsFIRZTkQ8DLWqQoZn2rp3W0ONh-EPP6p2adSz3OVWzaIPb4KBDK_j0-vx8eHnbb8OvBobd-sT16DaWVazyUVKv2-NkBfo5hHEf0KHVTAirOerGvEtV2HfRrIRuclhifxSKq4w=s1600-w1125",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Villa Fossil Tiga",
            slug: "villa-fossil-tiga",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address: "Jalan Cilember No.87, Cilember",
            lat: -6.6529139,
            lng: 106.9172194,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 208,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Villa Fossil Tiga adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMFl2nRRLJfLFxOHMZn-hpIKzriU2cJGBAXDklkVy-a1XnrOmVeW_oY1JuxbLKWGk3wlAC9u5tTp9lkXjKfdOj_kBCVAJJN2Yx_GlKP-DT647ebmcnnzNxUedpGABDMg-Xee7dVNpFk4eQdDg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Aqilakost Rooms",
            slug: "aqilakost-rooms",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address:
                "Jalan Cibalok RT 05, Jalan Raya Gadog No.89 03, Pandansari",
            lat: -6.6513912,
            lng: 106.8618308,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 275,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Aqilakost Rooms adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP4OB1n6c32ppXzk0Ois2c-_3oeauy-apHsn6_WreiWNyNKpY_PIYJK_hygDMPoOBoW-puNzUaUOCgnqAQ7zTzwIQ_SfSfdiyr1GOLsKrDofs4TopBR58oqbW8vkurYsDGqWgoVeO3iyX8x=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "LITE ROOMS MINIJACK MEGAMENDUNG",
            slug: "lite-rooms-minijack-megamendung",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address: "Jalan Raya Puncak - Gadog No.48, Cipayung Datar",
            lat: -6.653665999999999,
            lng: 106.8755645,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 396,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "LITE ROOMS MINIJACK MEGAMENDUNG adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMcN8uuH_4IqJqgmanMr1YpGE-VbxHffJ4kye0FTycngys9YrTOHu2s4sDlNDvtkkWM5IAXWjIGo3KdRPcypBmqPMmQegxJLqsh-_AjiHY9mGhPJoiwJ387qboOxfNgN9W5WLaRtzjJpIRnsjI=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Olè! Suites Hotel & Cottage Sentul Bogor",
            slug: "ol-suites-hotel-cottage-sentul-bogor",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address: "Jalan Babakan Madang No.99, Citaringgul",
            lat: -6.567372,
            lng: 106.8682118,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 2196,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Olè! Suites Hotel & Cottage Sentul Bogor adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMIcy5pa51V197QRd7EbajJggJoHL2cPLmqkj8KdNlLIJimTKguzNlS3JMwgKEz1DwNYlKfOGGF3S7e31i8ZdedbfdaDOKa6-TyygEbX3COfiAuyeubFowDeQ96Wi_fNCIGOvqNB6SWxE7C2s6KgfNXzg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "LORIN Sentul Hotel",
            slug: "lorin-sentul-hotel",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address:
                "Lorin Sentul, Kawasan Sirkuit Sentul Internasional Exit Toll Sirkuit Sentul, Jalan Tol Jagorawi No.32, Sentul",
            lat: -6.5316243,
            lng: 106.8562225,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 12607,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "LORIN Sentul Hotel adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPqzwqYTdAdl1kcGT7XX0upf4XfLLaG7LqbAF4ZZkLavkSrgXm0r0Gg1Ix9aKOV18nxl6ddyEHR0FxgltxAMDKP7TgCoRLntjP0zeH5ayeVIbp01URhYpk8mgkXIB8Nd7uUiU7nWjDneRRUnQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Puri Avia Hotel & Athalia Conference Resort",
            slug: "puri-avia-hotel-athalia-conference-resort",
            city: "Babakan Madang",
            province: "Jawa Barat",
            address: "Jalan Raya Puncak No.KM. 65, RW.No. 179, Cipayung Datar",
            lat: -6.651172799999998,
            lng: 106.8889911,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 1523,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Puri Avia Hotel & Athalia Conference Resort adalah penginapan di Babakan Madang, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZM7RY3sG0B0k63mZHFp4haWI9QNk3rAF1p6FKlcf3KAozjrJjggWziiHM9IjzWMxx5HVKSm0B2m7J_FQYTnl7rHTePtMEZdZvfH-gEfpssKhoIAEAiEbA17lxDuYFtMfDoZhYh7uz0FoVfRGOM=s1600-w720",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Camp Puncak Sagara",
            slug: "camp-puncak-sagara",
            city: "Garut",
            province: "Jawa Barat",
            address: "Q3H5+635, Tenjonagara",
            lat: -7.221999099999999,
            lng: 108.0577335,
            phone: null,
            website: null,
            rating: 4.8,
            reviewCount: 51,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Camp Puncak Sagara adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPWKpVzTEihVKOJvR6SRYVyVI111wiAMvovylNiki5C2usXhY1c6ZJeDEo9rOJE1ChjRrnR_eVkn3Zemgt3OoqD-ccxX55c2Re1HLo0rZY0oT76MZnb762xk0A0Hy-axEWWa4XX3QWMTLyGkQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Abah wahyu tasik",
            slug: "abah-wahyu-tasik",
            city: "Garut",
            province: "Jawa Barat",
            address: "Q3MP+GJF, Sundakerta",
            lat: -7.216194799999999,
            lng: 108.0865424,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Abah wahyu tasik adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "POS 1 PUNCAK SAGARA",
            slug: "pos-1-puncak-sagara",
            city: "Garut",
            province: "Jawa Barat",
            address: "Unnamed Road, Tenjonagara",
            lat: -7.221200199999999,
            lng: 108.0415292,
            phone: null,
            website: null,
            rating: 4.6,
            reviewCount: 21,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "POS 1 PUNCAK SAGARA adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNPIgB1SL18j33yiqupRrUJ7ZN_IOKyvj-8i76PY5shc2qDV-V2RNpKfAdqqglhFHHyjvsk-J79l7eP3zX5iRIeWQYHZEAPO3rsTGvom21_JHYOMUZnN0xqTH9ftc75nfp7HksUcJW52EuaQVU=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Saung kiara",
            slug: "saung-kiara",
            city: "Garut",
            province: "Jawa Barat",
            address: "Q2RM+W2V, Sukamenak",
            lat: -7.2076335,
            lng: 108.0325418,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 3,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Saung kiara adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Patrol cinta karangtengah garut",
            slug: "patrol-cinta-karangtengah-garut",
            city: "Garut",
            province: "Jawa Barat",
            address: "R3H9+2GP, Patrol, Cinta",
            lat: -7.1724077,
            lng: 108.0688385,
            phone: null,
            website: null,
            rating: 2.8,
            reviewCount: 6,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Patrol cinta karangtengah garut adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMw4Dxs5CfPQtjhtz9pzwCLavBLYRnxd54-5GCzuW4OonF_n94h0_YQI2_jeT8-s028rllXpGf3kBs2BLGkP8PnFE0bySQSmSgFX4T_OO0gxOfzi6g7oVcc38R3hX0KneCmIb57P24yl02VdUzGM92R=s1600-w480",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Arga Camping Ground",
            slug: "arga-camping-ground",
            city: "Garut",
            province: "Jawa Barat",
            address: "Q4M3+VG6, Jl.Curug Badak, Sukaratu, Sundakerta",
            lat: -7.2145764,
            lng: 108.1040489,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 11,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Arga Camping Ground adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPqls3uJJvucvOS93dLMKhoulqQy2rxpnwZkM95YklBqlx4i91ukcajnlXjuhAthDI-fNImEZAojZOlNKo3iR0i2FLrNTSZuGsySznr9gHXNs0ww-irzFnxdRZC4psFP5Q6CLZQbwZs4igNhvcrfXts=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Cipasundaan Bukit Abah",
            slug: "cipasundaan-bukit-abah",
            city: "Garut",
            province: "Jawa Barat",
            address: "Kawasan wisata curug badak, desa, Sundakerta",
            lat: -7.216513699999998,
            lng: 108.1046366,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 9,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Cipasundaan Bukit Abah adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZM2enGmRpnHydASRzW_lvGlQPWdrk7zKqNqEPgtOKQiaH8chjDVEqMJbPl_ir5uPZhppr2ROKefl46pdraSR84HHqfhfzHCcBrt7_lZdoacYz0iAz9DvvXK-evLIH2dzI8YKUIf2FldtiVjIQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Mountain Break Family",
            slug: "mountain-break-family",
            city: "Garut",
            province: "Jawa Barat",
            address: "Jalan Talaga Bodas No.213, Sukamenak",
            lat: -7.194168299999999,
            lng: 108.0234791,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Mountain Break Family adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Rumah ROY",
            slug: "rumah-roy",
            city: "Garut",
            province: "Jawa Barat",
            address: "R2JG+QV5,kampung Ancol, RT.01/RW.07, Sindanggalih",
            lat: -7.1716788,
            lng: 108.0391192,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rumah ROY adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Villa Papandak",
            slug: "villa-papandak",
            city: "Garut",
            province: "Jawa Barat",
            address: "R26F+JQQ, Sukamenak",
            lat: -7.1884109,
            lng: 108.0244979,
            phone: null,
            website: null,
            rating: 4,
            reviewCount: 13,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Villa Papandak adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMq8EUdEm7seqE2iC-M-SLq29zcl0flG9Yew_19OGx8ee6dyEkfa5-H-HB6nida98DWSO4zSA4dDuLLOhNk7Zeway_54WRi9QsiZBWFxPPkWCzWokqCtbF4JzJ864REvFuNT8-3c10CE7cGxQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Rorompok Endud",
            slug: "rorompok-endud",
            city: "Garut",
            province: "Jawa Barat",
            address: "R26F+G99, Sukamenak",
            lat: -7.188754099999997,
            lng: 108.0234577,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rorompok Endud adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "kp. Cituak",
            slug: "kp-cituak",
            city: "Garut",
            province: "Jawa Barat",
            address: "R3Q9+FG, Cinta",
            lat: -7.161305599999999,
            lng: 108.0687802,
            phone: null,
            website: null,
            rating: 4.8,
            reviewCount: 17,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "kp. Cituak adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNryViYNIbo8bfrxu8wfNcGnYlHvNgGCqB04Mwy-scywMtVCoCr708DL9Cde4rJuvB_-WNXloUJ7NrRBzWg_EibNsKOiVF7NSMqTjeCGrrzjxY1BQheH1EyVJgkjpqtOr-6iO28ytxMd45KAew=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Dimas",
            slug: "dimas",
            city: "Garut",
            province: "Jawa Barat",
            address: "R2PW+JR, Cinta",
            lat: -7.163402599999998,
            lng: 108.0470549,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Dimas adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "KAMPUNG PANANYUNG",
            slug: "kampung-pananyung",
            city: "Garut",
            province: "Jawa Barat",
            address: "R456+6H8, Kertamukti",
            lat: -7.191970999999999,
            lng: 108.1114566,
            phone: null,
            website: null,
            rating: 4.6,
            reviewCount: 5,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "KAMPUNG PANANYUNG adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNIPY9IHdw6eP-t6LfxGqYHKuRZEUV1KysyIK0WefgKvm5-tf8-QpT4lNNxBkgI-HW-7tAa8sqygmOPf-Geu3FO08V3F1SgzN5z3OPT0Q5m3gqt0ot2F1f3NXQlLpMXH-K-xWeYxKOa6mWsmQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Widia's Home",
            slug: "widia-s-home",
            city: "Garut",
            province: "Jawa Barat",
            address: "R456+6RJ, Pananyung",
            lat: -7.191909300000001,
            lng: 108.1120083,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Widia's Home adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Curug Cikulawing Sagara Wanaraja Garut",
            slug: "curug-cikulawing-sagara-wanaraja-garut",
            city: "Garut",
            province: "Jawa Barat",
            address: "Q2H8+7J3, Cigadog",
            lat: -7.221871300000003,
            lng: 108.0165428,
            phone: null,
            website: null,
            rating: 4.7,
            reviewCount: 3,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Curug Cikulawing Sagara Wanaraja Garut adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMUTlsLZs2QZo-LBgY3lFwt5g5v9Btb9IsV0HqUE3RNEZZTLR1JW-g1iSP5S8qBqQuRXmO2Fm0Z_vZVChio5k2uS2Gd1aliEBmP0Ok3nJbGL2I6XmfaQlFiWROkykWM4HwzBxHtn_7juK31n2w=s1600-w1280",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "MOELYADI",
            slug: "moelyadi",
            city: "Garut",
            province: "Jawa Barat",
            address: "R428+R44, Kertamukti",
            lat: -7.198200600000002,
            lng: 108.1147972,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "MOELYADI adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Dikdik Mulyadi",
            slug: "dikdik-mulyadi",
            city: "Garut",
            province: "Jawa Barat",
            address: "R428+R44, Kertamukti",
            lat: -7.1982003,
            lng: 108.1147972,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Dikdik Mulyadi adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOW6cbflWsSZvR6pmJwOi4cimytL9ZBkumIuF__Yqiv0-n3Bd54IETWGG2Dw5gXpQ4-ynnlxIwcbd6mV3ZC-Vva5fMUqt5OybR1tO01o5uifPJx4EaTPD7lprpvTSB1jBi5cTFnS1K63m4BB0A=s1600-w1080",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Shelter 3",
            slug: "shelter-3",
            city: "Garut",
            province: "Jawa Barat",
            address: "P3VJ+33Q, Jalan Ke Kawah, Linggajati",
            lat: -7.257466499999998,
            lng: 108.0806402,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Shelter 3 adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPkUOUStA-n2CHUP8qz9O8yU2Fi5tkcrxSDdAoNpTE7vc1sYkxtHk6kJrdRi86NOd5Sq3v8xhAdazpM4AQ8scSQdmhycSYhNIitgwygC3qtGbgKy6EJD2L3a2hSfEcIfTfc8b7OHWnSSySFuOsAquDAZQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "KAMPUNG CIMULYA",
            slug: "kampung-cimulya",
            city: "Garut",
            province: "Jawa Barat",
            address: "Q4W8+PW2, kampung cimulya, Kiarajangkung",
            lat: -7.2032281,
            lng: 108.1172579,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 4,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "KAMPUNG CIMULYA adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOu4PtUu7EGhgQ16ZqOU0zeN41tKToMBbtNpsfuec6bsxp0FnXvcIhAsE7ghM1LJ6NRGpuv3ak5s9B26GOV2NhyHXM_6ER0l2Hyk_GZmGYzi1WGV02HwwTORv-0TbDfxoi-zN-8K78I87e7M2I=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Resort Prima Sangkanhurip",
            slug: "resort-prima-sangkanhurip",
            city: "Linggajati",
            province: "Jawa Barat",
            address: "Jalan Panawuan-Sangkanurip No.121, Panawuan",
            lat: -6.8816764,
            lng: 108.4999756,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 2181,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Resort Prima Sangkanhurip adalah penginapan di Linggajati, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNew8RE1btI4B7swsTGQoA21fEV0qdjl5Dl74nBulA_7GkgzRiyOYZFkJvMdTgEK0P_qi0EhzeepAIv-QLjaGOndKJJ46f84lAvzsrSH8hBJL7mR_YUbmuJpPrhhly1C6TfBLMZKcdJ7SR8rg=s1600-w1000",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Tirta Sanita Resort",
            slug: "tirta-sanita-resort",
            city: "Linggajati",
            province: "Jawa Barat",
            address: "JL Raya Panawuan- Sangkanhurip No. 98, Panawuan",
            lat: -6.883515200000001,
            lng: 108.4994741,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 4822,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Tirta Sanita Resort adalah penginapan di Linggajati, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPjJCGX1pMJxpH_YODGqyKyIyUIqbPjrGo_9mCkYqSwAqgShtN28NmrBkp_dbBjxG2WQyFC3dva5QCE7DwqjtCxYRxYEcn3fNfKiFdrDX--dvvuWs7RrAmUmQsUnohtK2TCUSk8X2U2W7aDZgaCqboFKA=s1600-w1280",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "RedDoorz Syariah @ Flamboyan Indah Kuningan",
            slug: "reddoorz-syariah-flamboyan-indah-kuningan",
            city: "Linggajati",
            province: "Jawa Barat",
            address: "Jalan Raya Jalaksana No.21-22, Bandorasa Wetan",
            lat: -6.887732199999999,
            lng: 108.4937349,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 164,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "RedDoorz Syariah @ Flamboyan Indah Kuningan adalah penginapan di Linggajati, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPQv5ucoh3aLZcYNF7t9qyZ4DLtua-HH2GaEcX35SeckuUeTdGy_jmLhaf5HBZorFx5CzPGAkkpKCZ6tvMj_tmNUgTuG59dEJZ4thVwGukNMf6t8dx2NRHg2ube6ISxgGT1VIZejZVHMHx7HCPJ8hKO=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Attractions Curug Sidomba",
            slug: "attractions-curug-sidomba",
            city: "Linggajati",
            province: "Jawa Barat",
            address: "4F38+CF7, Peusing, Jalaksana, Peusing",
            lat: -6.896473599999998,
            lng: 108.4661754,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 1531,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Attractions Curug Sidomba adalah penginapan di Linggajati, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMe4zAevxSJqU7JPv7rIwtNucI5EYMFqRM6LKrpXWjA_V8rK_P02bM8rbxos5qnE6gK90Vj0ICYXYjz8IETC9XuBNqaMC9TZQKB8RnAclydIuTxEDbTmIOjmtWgkOA4TlYQSIwTjAiSL3Q2bFw=s1600-w571",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Grage Resort Sangkan",
            slug: "grage-resort-sangkan",
            city: "Linggajati",
            province: "Jawa Barat",
            address: "Jalan Panawuan-Sangkanurip, Panawuan",
            lat: -6.885965899999999,
            lng: 108.4976775,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 7058,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Grage Resort Sangkan adalah penginapan di Linggajati, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMGGZHdHHSG4PO7hD6e3g7FUVj_J6DBUO5HUrsxcXT9tWbU6-7d3I7j2ymF0rTHlU04eSgfZzgs0kMWu3hTlIboGicOJNaoYO91i3FdHKUtWR9nHeb3XErFjcA5kGAJdtjnuiTX9KRUBaQhO04=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Montana Boutique Hotel Kuningan",
            slug: "montana-boutique-hotel-kuningan",
            city: "Linggajati",
            province: "Jawa Barat",
            address: "Jalan Panawuan - Koreak No.128, Panawuan",
            lat: -6.881984300000001,
            lng: 108.4984143,
            phone: null,
            website: null,
            rating: 4,
            reviewCount: 1617,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Montana Boutique Hotel Kuningan adalah penginapan di Linggajati, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOvHCjB0p5Ph1yea1xX6od-E63KGsd89bGOu3ZHAQALYxVV7QTwGK3DYinsl3RNwX8hi-sDJ0z__NzSGmfpl_-Fjova2jggNrMXrk8qaT4-qNqOobtivIQZdtdgz4G_vHflVVSLu4V4KCYSLik=s1600-w1127",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Posko Cibunar & Linggajati",
            slug: "posko-cibunar-linggajati",
            city: "Linggajati",
            province: "Jawa Barat",
            address: "4F84+8CR, Jalan Linggasana, Linggarjati",
            lat: -6.884128700000001,
            lng: 108.4560009,
            phone: null,
            website: null,
            rating: 4.6,
            reviewCount: 34,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Posko Cibunar & Linggajati adalah penginapan di Linggajati, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP_KAt2g8keIoM_5zYxwy6RySWvfA8aCGpRH2dN1oRTMx0GU8ZasfBverG3Ey4lDL91qxCv-iAOg4RZA9HZRqx3Mep-GvkVuouwZ032fagrbqLzUSfC8EeFLb6KPvr2t3Rbrx1YIor8mlZYsgg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Villa Sutan Raja Kuningan",
            slug: "villa-sutan-raja-kuningan",
            city: "Linggajati",
            province: "Jawa Barat",
            address: "Panawuan",
            lat: -6.8821908,
            lng: 108.4999574,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 470,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Villa Sutan Raja Kuningan adalah penginapan di Linggajati, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOMdosy2I6VJmrlOEBIw1UGBfPusHAaOV8NUuBTCMlQdvCjjCerDYezvwc5BahLXUsp54U9efd4rDvu-l4x8aPrv6vcLG0PyExRI8zK-BuQcju_OanJye2Vak71TNMMKh43EvPlbg2MGHqdPg=s1600-w1280",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Salsabila Resto Outbond",
            slug: "salsabila-resto-outbond",
            city: "Linggajati",
            province: "Jawa Barat",
            address: "Jalan Panawuan Indrapatra, Panawuan",
            lat: -6.877137200000001,
            lng: 108.4994655,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 869,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Salsabila Resto Outbond adalah penginapan di Linggajati, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPLtX0rIf0b3ZnHy-1KLbKJ3qLSw7mrxDW1Thq4rCXlKe_nCIMptMJzjTFSQL6GZA7jPB_KNEscXZ7aCWcHkWX6LkrMJfUtVUhNfew0-eJvg99TUXuDUtBvNwWsWwomR0Q_osefCdmLZq54A4I=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Bukit Lambosir",
            slug: "bukit-lambosir",
            city: "Linggajati",
            province: "Jawa Barat",
            address: "4FP3+QCR, Setianegara, Cilimus, Randobawagirang",
            lat: -6.863023600000001,
            lng: 108.4535082,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 398,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Bukit Lambosir adalah penginapan di Linggajati, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPZXjmBk4dZZ0BP_OuuvUPf84CwzWICeSTe_TjyJw3qSf5U_K4WWfbzW0m8IgTpA39IEFdaIyDEdY_qYWVNeU48xywYYqdbKjhTtc1TLmfavoZxmsmhVGdGH_OW0IeaiU2h1uMm078GRcup2w=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Kampung Sunda Balong Dalem",
            slug: "kampung-sunda-balong-dalem",
            city: "Linggajati",
            province: "Jawa Barat",
            address: "Jalan Babakan Mulya, Babakanmulya",
            lat: -6.919276600000001,
            lng: 108.4766349,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 802,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Kampung Sunda Balong Dalem adalah penginapan di Linggajati, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN1wuqmuqYZtX4Lt5uZZlQCIqH2ytU-rDWd3sM_b6sWRp-YC3_K8NFBNoFnU0dlQX-8TfvMmlsjlVUZ7rxpwNVagQuO7zaeh8k90lXZ4yGTdWF_zpKfhiPT3CVvZx7nKqWCKkyrFbPfse3tag=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Sekretariat Viking Radical Cirebon",
            slug: "sekretariat-viking-radical-cirebon",
            city: "Linggajati",
            province: "Jawa Barat",
            address: "Jl. Pangeran Janapura No.8, Wanayasa",
            lat: -6.848043699999999,
            lng: 108.5153834,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 6,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Sekretariat Viking Radical Cirebon adalah penginapan di Linggajati, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPk7D8DrOCAKc5OHmhC2rHZqsTxr9bvdunfAtapw_PVum3mU9AZVahp4EP4YN7R5PowNgQEmRhmxDYNZA5032YZsgc32U3J5JwfhTHG7wOOLjBAxRXMlPlvUm07JFCNfW-hY5FjQyiHLYeQ3X0=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Pagergunung Campsite Cibuntu",
            slug: "pagergunung-campsite-cibuntu",
            city: "Linggajati",
            province: "Jawa Barat",
            address: "Jl. Jeruk Bonteng, Cibuntu",
            lat: -6.837799599999999,
            lng: 108.4418814,
            phone: null,
            website: null,
            rating: 4.6,
            reviewCount: 136,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Pagergunung Campsite Cibuntu adalah penginapan di Linggajati, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMW5Sf0AMx4NdcmYsgAMbp3n5hfbLbNcf2JaS_WB2rUXB8JYSaHTUicADZf_OC_r_K3LMNVzOIg_d9ODFw49ZqjxvjI8kphWh4iTTvfDevvGXYBSJp7jd6a-XtPlaStuY94CZ3_Vso8izefNQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Pondok Wisata Kabayan",
            slug: "pondok-wisata-kabayan",
            city: "Linggajati",
            province: "Jawa Barat",
            address: "Jalan Raya Sangkanurip No.133, Panawuan",
            lat: -6.884809,
            lng: 108.4999279,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 138,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Pondok Wisata Kabayan adalah penginapan di Linggajati, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN6Q6m5xD1i9mSvkJmTHGrJL3gjmi86ADUAevYFHpoVkWvNOAI6gmDJRno2ExPOtzEo-nLZAtyOQG3AmK39s3x52-tXQUvkdVu52r-gi-PgmnMpn2fqm00k2Wm8mVK2QZoqWWN_2GdJi8q-xg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Villa/Hotel ANUGERAH Linggarjati",
            slug: "villa-hotel-anugerah-linggarjati",
            city: "Linggajati",
            province: "Jawa Barat",
            address: "Linggasana",
            lat: -6.8844486,
            lng: 108.4773817,
            phone: null,
            website: null,
            rating: 3.8,
            reviewCount: 124,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Villa/Hotel ANUGERAH Linggarjati adalah penginapan di Linggajati, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPfaLrtSdnlXnDgplI7iOcMzhT9us0j2IQG1dh--oQn_83wgVVweRQXu3lMUoEpKI1fPr4bnz0c5IMHLv0NqTHL-NftW8R6RPC9pwwNi2mndIgf89uAOKjxDkCrm7cOOuym3Gh8jF4ibKW99YOcgPuQTg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Heritage Junior Guest House",
            slug: "heritage-junior-guest-house",
            city: "Linggajati",
            province: "Jawa Barat",
            address: "Jalan Bojong Linggajati, Linggasana",
            lat: -6.884317599999999,
            lng: 108.4790075,
            phone: null,
            website: null,
            rating: 4.6,
            reviewCount: 5,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Heritage Junior Guest House adalah penginapan di Linggajati, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZML7QDSCG5k2QDVFr3IVmuWc-NOzi6zZOcTeZ82KKptJeW3aufgTNC7w7nyVcKXAKo9qRTWE3b0c5R5JY7dyRHxz0d3Cfdm_uoQboSt1eVPeEyp81GXjwREWPUXPVwEPCPnbB8AyAA2cR8dUNvhR3CVzw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Villa Anugerah Linggarjati Mitra RedDoorz",
            slug: "villa-anugerah-linggarjati-mitra-reddoorz",
            city: "Linggajati",
            province: "Jawa Barat",
            address: "Indonesia",
            lat: -6.8846202,
            lng: 108.4764328,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Villa Anugerah Linggarjati Mitra RedDoorz adalah penginapan di Linggajati, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Rumah Pak Yadih",
            slug: "rumah-pak-yadih",
            city: "Linggajati",
            province: "Jawa Barat",
            address: "4F7G+XP7, Linggasana",
            lat: -6.885032700000001,
            lng: 108.4767016,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rumah Pak Yadih adalah penginapan di Linggajati, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Villa Darajat 26",
            slug: "villa-darajat-26",
            city: "Garut",
            province: "Jawa Barat",
            address:
                "Villa darajat26, Jalan Raya Darajat No.KM 14, drjt, Karyamekar",
            lat: -7.219277399999999,
            lng: 107.742317,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 55,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Villa Darajat 26 adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNxXzzLL83b64bmP822JcssuhMzH7ivURgdrZxlVsowTrbWNfYazRfFZqhdILK0FJ8tlmX95rsm7ujCiRXasAlzPyUEbCn1AZbED0tN4uabmvWV6QzScEIRLn7M7cximBW-XnPVQj_KQ511Ew=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "PENGINAPAN DARAJAT JAYA",
            slug: "penginapan-darajat-jaya",
            city: "Garut",
            province: "Jawa Barat",
            address: "Kp. Darajat rt/rw 09/02, Karyamekar",
            lat: -7.218440599999999,
            lng: 107.7428909,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 2,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "PENGINAPAN DARAJAT JAYA adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPHsM5JYl2rxzYx55kRKDDVd9bNRpiLaKkj1Xpx8aH-Mh15sD5KK4fww0n86L2kDL3F3ffGM8f6fiDUg4GdE_D-SZvBIkHuGsrj75BcqOOORU8nMFco3rXDLEJJCBQPm668YFJnyvMtWWIYoSE=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Darajat indah",
            slug: "darajat-indah",
            city: "Garut",
            province: "Jawa Barat",
            address: "Jalan Puncak Darajat, Karyamekar",
            lat: -7.219034100000001,
            lng: 107.7431866,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 74,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Darajat indah adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN5RFXwJYsOrUKAupKiRsmJ21v7leB3zFZeUQhLMah5LM6Kvffbh9teFygoezMktUtJYs2C1-qOOKAe5JCJTFnsO03iogygSF0atLD5AdLRxI9MUS71W1Gkoqatv-s96q9SvyNA2OhxRtwVNLQ=s1600-w1440",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Penginapan Pak AWALUDIN DARAJAT",
            slug: "penginapan-pak-awaludin-darajat",
            city: "Garut",
            province: "Jawa Barat",
            address: "QPJV+G8X, Jalan Puncak Darajat, Karyamekar",
            lat: -7.2186407,
            lng: 107.7433608,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 15,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Penginapan Pak AWALUDIN DARAJAT adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN2Ri4sCpdy6vp8MVdY3xQvP7YwFiBwBuwaViWMq7LEvtoUxhmhQ05fPU7nlZ64EI-wqppBacr5_gkgsAa457KKA7oz5BOQQTSsO-7WEtc3HJXwDhkuXGW7igQhg2W872H5Nj1VuMtSeaUb3PU=s1600-w1040",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Homestay winda darajat",
            slug: "homestay-winda-darajat",
            city: "Garut",
            province: "Jawa Barat",
            address: "Jalan Puncak Darajat, Karyamekar",
            lat: -7.218418199999999,
            lng: 107.7433728,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 22,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Homestay winda darajat adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNuZ38EA_TiR8wPMmkUy_fkilwfon0BXIywP5BUl4XIi-gY8DhhAEYtXH11uB0Er1ewgf7-NLIWPrdBlLpimE8tsRaT00TzGRupS1KbIJMFHEjk6dcx90o1GRDYJg2EYVebh4pL9oaNQGusqjo=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Bumi Daraja",
            slug: "bumi-daraja",
            city: "Garut",
            province: "Jawa Barat",
            address: "QPJV+462, Jalan Puncak Darajat, Karyamekar",
            lat: -7.21974,
            lng: 107.7430247,
            phone: null,
            website: null,
            rating: 2.5,
            reviewCount: 2,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Bumi Daraja adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOTa9xmYdURk-t07xV9iMG1kTngnkmSWVq6lEQ-Da7sqjCnBTded8RjPmKRO-QX4SbVwvs1j1sT3mMbANJTgW9f6vsJ28Ozc1a5Fqn2fMt9vAZPl0Rx3QtCuJEC0xW5sLsGn4LkfQgnigIg5w=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "PENGINAPAN DARAJAT GARUT",
            slug: "penginapan-darajat-garut",
            city: "Garut",
            province: "Jawa Barat",
            address: "QPJV+78W, kp.darajat RT.09/RW.2, Karyamekar",
            lat: -7.219253699999999,
            lng: 107.7433281,
            phone: null,
            website: null,
            rating: 3.8,
            reviewCount: 5,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "PENGINAPAN DARAJAT GARUT adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMmUTUWgNYSgdNZXxY1hzSE3BgTxYnx1H4nf9ZBRLDrLVZAWyeCSSEg-qPSSmBC-dojmE8Ru9WnXK6tghZXuybFAsPiu84IQWvgPA3NENuR6wN0yoq0D_VVyYJTJQnB4Q1OPkw3gAl3bBRhxg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Darajat Homestay",
            slug: "darajat-homestay",
            city: "Garut",
            province: "Jawa Barat",
            address: "Indonesia",
            lat: -7.2182493,
            lng: 107.7434159,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Darajat Homestay adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Homestay Amel",
            slug: "homestay-amel",
            city: "Garut",
            province: "Jawa Barat",
            address: "des, Kp.darajat RT.06/RW.07, Karyamekar",
            lat: -7.2179894,
            lng: 107.7434852,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Homestay Amel adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN004caK4m3scOm2lqUgRE1TcvYs5epA5-SxV-J5cQzu4TV1f6hHMUTGwRZi4vLDJDFAb1Mra8odee_D8dcW7xsGgG16JgZ2BgCHpPpTCcnjdc7l-CUutK3u7nw3GsZrzDWBohe-T2tO90oBzVCU1L-=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Bungalow Puncak Darajat Pass",
            slug: "bungalow-puncak-darajat-pass",
            city: "Garut",
            province: "Jawa Barat",
            address: "Jalan Puncak Darajat No.KM. 15, Karyamekar",
            lat: -7.2191466,
            lng: 107.7435431,
            phone: null,
            website: null,
            rating: 4.6,
            reviewCount: 302,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Bungalow Puncak Darajat Pass adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPRqAiMDmt3ALGOlOlQmhjQT136GakF4y7Dvb8uBdgGJBxTq7qjrOKjbltNU8KbJJFHtb7V5voQiV5bvndz0KiSvlQNc-zYaPa8cMG517i8gkESgVEMyImCpVRnpGhw9un8kRhiZkCNyKP2jC8=s1600-w1440",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "ViLLa ajis prayoga",
            slug: "villa-ajis-prayoga",
            city: "Garut",
            province: "Jawa Barat",
            address: "QPJV+WF9, Jalan Puncak Darajat, Karyamekar",
            lat: -7.217707900000001,
            lng: 107.7437471,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 2,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "ViLLa ajis prayoga adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNHY62CWian_2QCmGDuhyISC7i2vbNMXd2EfdMk1yu9WibKGX7eZH4UxbkMkTG9qMkEgrA27DGleAkYybevHyCV2syKZzv_bhvMoIk1IxoTV3NqfKcE4PIl4AUx7EJ3CgBBIUhllUe2KrNl=s1600-w960",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Puncak Darajat Highland",
            slug: "puncak-darajat-highland",
            city: "Garut",
            province: "Jawa Barat",
            address: "QPHV+78J, Jl. Puncak Darajat Des No No.KM25, Karyamekar",
            lat: -7.221944499999998,
            lng: 107.7415951,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 661,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Puncak Darajat Highland adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP7fQTZsN1DqyS-hxbyse-5OC8Jta_R50-nrnkT0uyMXzmduoLKxgXq_fXkvwvxDbmu9eq7uT1VLpou9t-6O09QvU6jSrU2uC_98tWObCl5N0lsizF6odcvWcBZ-8hbPfhdMG3DiM9GJguTo-s=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Parkir Darajat Resort",
            slug: "parkir-darajat-resort",
            city: "Garut",
            province: "Jawa Barat",
            address: "Karyamekar",
            lat: -7.217844099999998,
            lng: 107.7448076,
            phone: null,
            website: null,
            rating: 4.9,
            reviewCount: 13,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Parkir Darajat Resort adalah penginapan di Garut, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPVMMfoJLOktDAqV8L87P2Rz4b-76ftrlxjkKQ3LljTFtfvFlFKzgyqQCyBxj8oQ2XbvogF1_RCQpid7SPLfNwcmWph0VVsKlcOlS7jKJ19rzn3Gz3pd8KxrM96Ea1yIsfYaZj2PlEGQqtaUQ=s1600-w640",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Rumah Pohon Leo",
            slug: "rumah-pohon-leo",
            city: "Cileungsi",
            province: "Jawa Barat",
            address: "Taman Buah Mekarsari, Mekarsari",
            lat: -6.4199724,
            lng: 106.9871043,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 172,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rumah Pohon Leo adalah penginapan di Cileungsi, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPRVIDa5SD9gUmOmU593plmC4OOrH5G2BRI_ueQeyox_20fbbFeK2X7GpMuqA6L5CD99oU3B0YqTS0fjABXQObJrKmS6xO4lpIZFa6KDhAE0QYaI9smWF5wkBgHU_QF9ElN_0JfbantFWMXdw=s1600-w1500",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "The Kingdom of BGBJ",
            slug: "the-kingdom-of-bgbj",
            city: "Cileungsi",
            province: "Jawa Barat",
            address: "Jalan Pangkalan 5 RT.004/RW.003, Sumur Batu",
            lat: -6.3538569,
            lng: 107.0000526,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 116,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "The Kingdom of BGBJ adalah penginapan di Cileungsi, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMBVKlHOdeZ2Aym8VYAlpwVH5qzopNIZLeVMmu0-r9zTvxHb5PHc0S3jbn4HUQi4I3_ubRyiaeLPziH2_neP7bHrAjHSjLfOdWIF8-CMvRNGZvwyOtMBHEXfdJ0WrDz3XEL-COIGz-Kn1oN-UM=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "CPP PULSA",
            slug: "cpp-pulsa",
            city: "Cileungsi",
            province: "Jawa Barat",
            address: "HW6C+V32, Cicadas",
            lat: -6.437854400000001,
            lng: 106.9201537,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "CPP PULSA adalah penginapan di Cileungsi, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Cibubur Inn",
            slug: "cibubur-inn",
            city: "Cileungsi",
            province: "Jawa Barat",
            address:
                "Jalan Alternatif Cibubur No.99, RT.002/RW.008, Jatisampurna",
            lat: -6.3807941,
            lng: 106.9241998,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 1640,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Cibubur Inn adalah penginapan di Cileungsi, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNl0cFq8ejy7N7SHay0DctaWzwmxq3tHf9ZdiF8oVJwI87Vi5ha2JhT-eb1Xxd0YF-AiV_jbQQ8SnUFEQkUw7aeWYlRHnOFlBcu7fiNqcR__d00Pmuys_AS6OgX6FqR_-QWvGilR_1ErSNEXw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "KANDANG KINGKONG",
            slug: "kandang-kingkong",
            city: "Cileungsi",
            province: "Jawa Barat",
            address: "Jalan Bumi Mutiara No.33 Blok JG.3, Bojong Kulur",
            lat: -6.3288594,
            lng: 106.9760633,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 3,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "KANDANG KINGKONG adalah penginapan di Cileungsi, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMRpD7V8_Lk_IADWys-pVyQQj2E5by6XzUZ5F71hULKJnvctBCnHEFhhfirs4wf_s4tprCsxQyq4RohbsSHdnTMfqbnmWVd8vySlunximKPr8CJV5Q-Oj-Zav8___eBaTH7QQSWwRB3bbw2SA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Surya Kencana Seaside Hotel Pangandaran",
            slug: "surya-kencana-seaside-hotel-pangandaran",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address: "Jalan Pantai Barat, Pananjung",
            lat: -7.697650599999999,
            lng: 108.6553804,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 2126,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Surya Kencana Seaside Hotel Pangandaran adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMjWJUW3G29vileCn2YmSe9ZJU8tImQTfWcr3ac74-NAWoQhcrieBmhn2DyVAf_MeL7G28eokR4hawuJytaNk_hQ9IvbNLtgyPW6_4MbOqooTpAVUNJWziRlXkXjSgJ5YLJgrzDgkhhaM6Rq0s=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Hotel Grand Mutiara Pangandaran",
            slug: "hotel-grand-mutiara-pangandaran",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address: "Jalan Pamugaran Jalan Pantai Barat No.145, Pananjung",
            lat: -7.6897863,
            lng: 108.6462383,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 845,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hotel Grand Mutiara Pangandaran adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO4-iqorgfXZvOnTk8N5zAwKLaepKO9plQ-letq0n3jbjNTGKlViHQpsIZaNFVWyTMzrD5gr6SeGiiHis7BgkSp29iDWkQ_VtR7HKqG82Syo5LGpSEu42SEysckjKaMhC_SWydKlDTKkYDogg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Pondok Wayang",
            slug: "pondok-wayang",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address: "8M52+4XH, Jalan Bulak Laut, Pananjung",
            lat: -7.6921807,
            lng: 108.6524845,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 200,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Pondok Wayang adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOTMo48eqZ665Ka_afCquhO2Ng6AB8pGqIVnXxJeQ-pDWz1IB7B7vgzmCaVPShQsrT6sWyfEr7g7M1wECWKVndMsFz_pyYMyb0DmC84PpvNqhTysrfXzQfJubiT3zPhuskMVyu1yRfIUHIIDA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Sunrise Hotel Beach Pangandaran",
            slug: "sunrise-hotel-beach-pangandaran",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address: "Jalan Kidang Pananjung No.185, Pangandaran",
            lat: -7.700104199999999,
            lng: 108.6585604,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 1380,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Sunrise Hotel Beach Pangandaran adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMR8qT8196PZFFsdAqGjr7W8MMIV5niDx7qQHmMKNOo5PG31-Vgy349W4tQ6DZaoWY1XFKfS2hKjCPJ5XBB_nKKw8urlQaqzGfbcY5bcDdKEq0lMBiX5oRFRuL1ztEu1wHUhJsg0Yw6vYRw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Anda Boutique Hotel",
            slug: "anda-boutique-hotel",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address:
                "8J8H+3X9, Jalan Pamugaran Bulak Laut, Padasuka, Wonoharjo, Pananjung, Wonoharjo",
            lat: -7.684836499999999,
            lng: 108.6299909,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 9,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Anda Boutique Hotel adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPR-2zJMMD7lIgdhrmCnQ1FTAQsAXzSHRt5hrKlLMs8-uFWM8rrpX2N3A1Sy4LvStjwDIUCNp9LjhmnZ7mwUkkkSM-2cbHZUMvd8UlgE2sXFsdtAzaXZ6oUgVQiz401UJrZKc06_E5BDDSCyw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Mango Guesthouse",
            slug: "mango-guesthouse",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address:
                "8J5X+P8H, Jalan Bulak Laut RT.003/RW.002, Dusun Karang Sari, Pananjung",
            lat: -7.690697999999999,
            lng: 108.6483502,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 158,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Mango Guesthouse adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZM8Neg4e-s9sJcRwIuTOhgGA7ukIrTbBXgQwyNBOmOsZ7cP5ohzmw36_1hgdBccmPtzj-PQJQMLONE2HaDfchkHkRADFjMOTSZvzbbM3goJbYmA0QYYGS9hrhhcKOyUw2aBrMzh9SaMeili9uk=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "The Arnawa Pangandaran Hotel",
            slug: "the-arnawa-pangandaran-hotel",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address: "Jalan Bulak Laut No.12, Pananjung",
            lat: -7.692993,
            lng: 108.6535026,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 3415,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "The Arnawa Pangandaran Hotel adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNfhocqMknSvfns55ZHD0cVtRO4O4mrmi6zSa9QrZ9BS86Zhq4PzTbQVLuWohy_p5M0z_-puAIjrjQB9B1ISD8WhxDxQewc-rkXWyssPXdlKStbxRi54wQDPqt6yOwBFIR_GhiK7Ska0A3OvQ=s1600-w1280",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Nyiur Resort Hotel",
            slug: "nyiur-resort-hotel",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address: "Jalan Bulak Laut No.49, Pangandaran",
            lat: -7.693296399999999,
            lng: 108.6522624,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 1054,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Nyiur Resort Hotel adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOCoj_Q6iqLr4celqX0lC8jiknWWrxAvDT-nR1mvNHqw5ywpZs8sdEcJe_ZUACdDW-qYqlWwVnAWrGX951Nis71zE0oIWZ85yCvNlRRmnIoKxVSZITgdi-DQVJeHOHypBNTdHCFTk8qknwA10U=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Uni Beach Hotel",
            slug: "uni-beach-hotel",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address: "Jalan Pamugaran Bulak Laut No.28, Pananjung",
            lat: -7.691957899999999,
            lng: 108.6497671,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 2672,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Uni Beach Hotel adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNwD8rl-Ph0LSaf5WWTIJL1CSr_aF32CBDQMGr8o2oPoGKJAv9QYFkPlV2FjmVFccPZS7dVrrvSFn4qyXLJWyztS4Pxit0NG8kRLrDMFW1D8CiY58Xd7y-y2mESgsMHnPNSfgFioz348bFP0A=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Nusawiru Guest House",
            slug: "nusawiru-guest-house",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address: "Jalan Kidang Pananjung No.126, Pangandaran",
            lat: -7.6954663,
            lng: 108.6577206,
            phone: null,
            website: null,
            rating: 4.6,
            reviewCount: 91,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Nusawiru Guest House adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMOdq3u_DBapTmO4N7IkhYUXMfj_QYc3Bi28soj4zaduw0soD9f4KTGmwbmY-cIR8lyF6LFAENSLLSLVjQEV5NC8QB3IXa0YoGW2EQzCMXvOk4kB0oQModGMumkuIEyOiLqr7vxG8QbYERwnDc=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Rose Inn Hotel",
            slug: "rose-inn-hotel",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address:
                "Jl. Kidang Pananjung No. 119%C2%A0 Pananjung Pangandaran Ciamis, Pangandaran",
            lat: -7.695217599999998,
            lng: 108.6579232,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 925,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rose Inn Hotel adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPmY9wGZORNLz0LA4lp7mmXX8udbSt9lGrl_EyxB64yPO5XK7Me875B-gWbXFclt-daZ80zZ66AQbwM2afXQSgAtB3DIYI1UYBD7B5n6qHrETuLjv4iVRtFDzVnNYa02WpFuErgQKlI2DilOhnpkqpzgA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "OYO 2945 Hotel Pondok Idaman",
            slug: "oyo-2945-hotel-pondok-idaman",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address: "Wonoharjo",
            lat: -7.689413899999999,
            lng: 108.6454556,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 97,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "OYO 2945 Hotel Pondok Idaman adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO1QTxdjG80693Zta0-GUABy0MWIbuy_ajRP2y3i1sVchk-bw8Y1FovlSo_N3qXHdN7lyigx23wpvIYokEw-4f0YGLkj9dI-vP88Q4wBUKdkS8AvyKuci21yROCZ8MB2qUoh8vEzOGeUibWpw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "RedDoorz near Goa Panggung",
            slug: "reddoorz-near-goa-panggung",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address: "Jalan Pantai Timur No.67, Pangandaran",
            lat: -7.7015826,
            lng: 108.6582309,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 216,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "RedDoorz near Goa Panggung adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOVueBPy4q6TBsxUCn7tIE_t0zlhtncXvHzUr5BIHbrUk4Uzfm6di-6pBPzqM0c6wwm4m2ESoaj0yEZeLRDuNjNfYF1ziVelql3AxG0mbBRCn0x2yTObI-k2xxLyykAkYPE7JCBJOK5JJoO_eg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "The Amerta Guest House",
            slug: "the-amerta-guest-house",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address: "Jalan Kalen Buaya No.9, Pangandaran",
            lat: -7.698972299999999,
            lng: 108.6566521,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 31,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "The Amerta Guest House adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMg-FGBCWmmEyAO9-h9ILmKHVtugED1ne2F4SPKhrLwCDzT1-9iFVPGyz9teWZ1gKQRZ5HEf5WKboaDkeSqUA5ncG8es3qf2NhfKFRCQFciPv4jdS54oewVCt-odOWRx-ZvPZZrfqBF_lf7Og=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Grand Pacific Pangandaran",
            slug: "grand-pacific-pangandaran",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address: "Jalan Pramuka No.1, Pangandaran",
            lat: -7.6962873,
            lng: 108.6571666,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 926,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Grand Pacific Pangandaran adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMfRccKrU15x-3hPYeOKhZimBIJXqPX48U8qWE-Nrr2mhm69X6VZhoS4UtnNIuXqEmEEzgL-sSLukB84snafVkZhKWag5kT4TZGZS-mOEOQoOH1Y1758VFxkJaP-lAlrotHr7TTFxRglDzEbnofozWuoA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Grand Aquarium Hotel",
            slug: "grand-aquarium-hotel",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address: "Jalan Pantai Barat No.87, Pangandaran",
            lat: -7.703395700000001,
            lng: 108.6568777,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 1701,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Grand Aquarium Hotel adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPZaVJeZhfiZIn_6HnRiYANn7NiE3egBNwmyWPcj9oQo8pSvoylRDP8pgKoA8URVt-RKSO_pUH176JweCB2q-xwoBcRji2gAWnaQ4mi_OZwr4IA3P4RsahFeB37IOuGHueLsP-A-YokdM6Oxw=s1600-w1284",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Hawaii Beach Hotel",
            slug: "hawaii-beach-hotel",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address: "Jalan Pamugaran Bulak Laut RT.5/RW.02, Pananjung",
            lat: -7.6882122,
            lng: 108.6444928,
            phone: null,
            website: null,
            rating: 3.9,
            reviewCount: 76,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hawaii Beach Hotel adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOF98KBlToQfFI0ru5ZPY7r3C7wyb2ndPhS6ROSTAA1ULcOoNU6QXIPHcSX8J5MGTDlQ-TndWkSGZoloO_yEbpm0ShWATd2Ov5YXY9jz0emVAfXx_NyHljOW8_A_g5eyHtOwlMpewUd01hO=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Fortuna Hotel",
            slug: "fortuna-hotel",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address: "Jalan Kalen Buaya No.17A, RT.007/RW.03, Pangandaran",
            lat: -7.696960900000001,
            lng: 108.6559851,
            phone: null,
            website: null,
            rating: 3.9,
            reviewCount: 618,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Fortuna Hotel adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMOMRrsjrOsaXBRkaOfEbj68VyMxFfov1ht6xv3sDbvjEVWWGQvv1zKX6XJa5t5gT5KwmI3Ehr0nrNaY2oGjQLp5GKEJCQG3szK2xksdQHmRxK52vsRHLGOt0q0GgWyM-ZyPaaBuPUX-sEuYA=s1600-w1080",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Sawargi Hotel",
            slug: "sawargi-hotel",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address: "Jalan Pantai Barat No.47, Pangandaran",
            lat: -7.703249,
            lng: 108.656738,
            phone: null,
            website: null,
            rating: 3.6,
            reviewCount: 67,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Sawargi Hotel adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPTiI0jMjNoE3EnyABtLZjnrFdy51y4_Io0-uJWfenBZ7c_ttCSHQyon-b9iAcfO2MaIvOvXMJeZj3XstzLjpp0dZw6PyMk8LufV7Bn6ADVcKgxlQiDi11FbOBqjtr29HVv4ce47RcnW8MMxw=s1600-w800",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Pondok Mugibis",
            slug: "pondok-mugibis",
            city: "Desa Pagandaran",
            province: "Jawa Barat",
            address: "7MX4+7M2, Jalan Pantai Barat, Pangandaran",
            lat: -7.7018565,
            lng: 108.6566488,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 213,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Pondok Mugibis adalah penginapan di Desa Pagandaran, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNoXVi6rLE6jCg9yb2cNYD-6Anm5xp9YSWQvIsmzK5ll4WkOaFQDZg5JF7LgzrC4zNAHWl9oZlzgpz3pqv6ulHxTygb26S_HI1p2wR4fyRA28egjht5NNG7HprgUdCmJytwFgHLVP-J3qJ7=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Dadin",
            slug: "dadin",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "HPGJ+HC, Buniasih",
            lat: -7.4235723,
            lng: 106.7310729,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Dadin adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "NR tegal buled",
            slug: "nr-tegal-buled",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "HPFQ+W3J, Jl.raya, Tegalbuleud",
            lat: -7.425154000000001,
            lng: 106.7376472,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "NR tegal buled adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Penginapan Pondok Ayu",
            slug: "penginapan-pondok-ayu",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "Cidolog-Rambay, Tegalbuleud",
            lat: -7.425179200000001,
            lng: 106.7383608,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 51,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Penginapan Pondok Ayu adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOYsDsdOlaFt-4c0_NkMIJgl7n6Nx1tpkZlTf6-qaBHPwy3RN-4LGSXIekwmtDQlslwnnvRUX2f2sJ7LPyHLYA0l6gNFiwI5GgWhKDrenyakRDAd42e4WUjKFHdwyM-pwTe1-_Qg1T3J-tziDQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Abi Zard Travel Jabodetabek Sukabumi",
            slug: "abi-zard-travel-jabodetabek-sukabumi",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "HPGR+2F, Kp.panginuman, Tegalbuleud",
            lat: -7.4251729,
            lng: 106.741168,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 5,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Abi Zard Travel Jabodetabek Sukabumi adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPxPXAicUBB0d0u4mLO8TQeZwL1gcIVldhn7c4N9lUDxzvzdJzPAztQiuJlsCdeMOXY5jmoQH03WbRxPQQu1w6Ww2VsUHgbsttuz-hLw09oK7RXg7egocmp4QdvZ0SzI69JPAHBW7wy5h3bYA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Travel jabodetabek tegalbuleud 24jam",
            slug: "travel-jabodetabek-tegalbuleud-24jam",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "Jalan Siliwangi RT.03/rw03/RW.3, Tegalbuleud",
            lat: -7.425039600000001,
            lng: 106.7411515,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Travel jabodetabek tegalbuleud 24jam adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO7CjdWZGrZulYjiNk_rjwrRCcWgsM-nSCeWWawiHA1nn0KjB4lTTxT2Wd-a4xYJFy9--UpC66l20wM_SffKmqDKe4d3_BiU__1Qol193i-260uOU6LfzNIbH84tPo5wKLkWPWzz-WZnVPtaA=s1600-w828",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Penginapan Dua Putra",
            slug: "penginapan-dua-putra",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "HMHX+QRM, Jalan Tegalbuleud - Sindangbarang, Buniasih",
            lat: -7.4207696,
            lng: 106.6995456,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Penginapan Dua Putra adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Rumah apih radut",
            slug: "rumah-apih-radut",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "HPFW+Q6F, Tegalbuleud",
            lat: -7.425756599999999,
            lng: 106.7444264,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rumah apih radut adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Penginapan bunda ayu",
            slug: "penginapan-bunda-ayu",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "HMGP+HRF, Buniasih",
            lat: -7.4235629,
            lng: 106.687052,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 5,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Penginapan bunda ayu adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMR4Z9_gfIY2De40aVRqazklo7ByJYuOTL0ubVY4Tvsn76vcFo-oafDF8Qvcbsr6Jci_X_znLRHcyeUeHSBeyqHJnBN5BContYtTzJP-vfiRTL3R3C28DXW86HCu_2avPvKtkbWA37hK7hKsg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "RT. UGAN",
            slug: "rt-ugan",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "HMHM+G5C, Kp. Babadan, Buniasih",
            lat: -7.4211911,
            lng: 106.6828858,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 2,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "RT. UGAN adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN0jqcLXdpQAzfayL69EgaJ_dWGqmPtq2ZdGfgHy_l-byAy1cpbSnpUMG0ZDRGJ8aFyE6er4GXIDfkhynOrkItO6AaCl6BNIlNn0UPZQ54xw8z8Pr84WL-BpOsX8zttr6qOJ6lOXxCdIL9tVxo=s1600-w600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Muara Cikaso",
            slug: "muara-cikaso",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "Unnamed Road No.43186, Buniasih",
            lat: -7.421894999999999,
            lng: 106.682354,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 133,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Muara Cikaso adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMe7QcI73W-AvgoSYZtJJOJ3tXsUSlWQkDy3BQGIC1AZlWQC0waUZ_8t4Y_aq2p0Gy8_CKIBaxSI3LgsT6SKtMyMBE6b22fgG7cpcdanrcYxDdU9RGJPa86VrIRT0T70raI3W9_WcfRVofBkZk=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "CIKASO BEACH CLUB",
            slug: "cikaso-beach-club",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "HMHJ+2QF, Unnamed Road, Buniasih",
            lat: -7.4224324,
            lng: 106.6819248,
            phone: null,
            website: null,
            rating: 4.7,
            reviewCount: 16,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "CIKASO BEACH CLUB adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN46Nj6VAdsQgmvQEoBEWbzD67wImyd1lPwTHAfF5wcQ7uAAIDSWugRSWe1iB-AEXp7EA10WMXlHaRtt_Ovj6pNACZJVsEj6NCKeqWVdPxMvpWrie1A1IMLt_quuV3AE2vgJJgus56fkclX=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Indra lasmana",
            slug: "indra-lasmana",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "Kp pasir Pacet No.2, Sumberjaya",
            lat: -7.394845999999998,
            lng: 106.6925991,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Indra lasmana adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "SI JAGAD RAYA HOTEL",
            slug: "si-jagad-raya-hotel",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "HQC9+P37, Tegalbuleud",
            lat: -7.428217999999999,
            lng: 106.7676654,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "SI JAGAD RAYA HOTEL adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP98eyQ5r1euu2e0GDRKBcogz-jUeXYcDdIZpnZZHeV22eUiWmUcaKZKyXEuNyC546_1G077RK0pL11su1ZULLYMuin2CzzxvexLP_n9hjm-BTZW-pqgyaivMn8VAGcsQjusd0iMDAYi11n=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Pondok pesantren Nurul Hidayah",
            slug: "pondok-pesantren-nurul-hidayah",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "HMVG+RF, Sumberjaya",
            lat: -7.405384699999998,
            lng: 106.6761741,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 7,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Pondok pesantren Nurul Hidayah adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN3Q90XMJyYgRUikil7mE2v_Opn_l9sN4VEfxH5HPfnJ6WXrOGon1vuRPdTSvvoxwytUiTlyM6clQFxP6RB27875BXQCy2wMg4xVBoJ2ZYI10ZH1wUue1-JPgnv0RqAMMbTW81vNumX0OsTBh8=s1600-w802",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Bahomakmur blok e",
            slug: "bahomakmur-blok-e",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "HQCC+HPW, Cidolog-Rambay, Tegalbuleud",
            lat: -7.4285086,
            lng: 106.7718241,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Bahomakmur blok e adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Kebun penginapan Dedi ST +",
            slug: "kebun-penginapan-dedi-st",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "JQ4G+V3F, Calingcing",
            lat: -7.3941598,
            lng: 106.7747819,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Kebun penginapan Dedi ST + adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Central Busana",
            slug: "central-busana",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "Indonesia",
            lat: -7.415333599999999,
            lng: 106.7845356,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Central Busana adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP7NN_k8ZP1Y0SheBXSIdD0rrzejE2yKAFO_mHJpu9wpxrHwSJV3nrIFO5IAQbJzjGLVzTm6PWlLkYi0FqN5WNo1TrNGeRZCZQ9j24NoklvUx6v5XCuf_DNtlS3Hqe-qJfshiLcYb8ljo_CeMQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Rumah kang ayi",
            slug: "rumah-kang-ayi",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "JMC8+WW4, Sumberjaya",
            lat: -7.377730199999999,
            lng: 106.6673145,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rumah kang ayi adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZODHQA1Y1Cjy3SiaL3zoZzZXmviCIeIdBtxrJh44St02GSHQEBTLy6PBUcn0b9FcZKAiqce-1Lb07qiVlMpKc4Lc30n11kZY_F_42Q5XDxgFg1GkM2pIiOvhAUanUEdpO_kysh35Q2JOdNNbMA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Adiwijaya Hotel And Resort",
            slug: "adiwijaya-hotel-and-resort",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "JPWW+5RF, Rambay",
            lat: -7.354567499999998,
            lng: 106.7470536,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Adiwijaya Hotel And Resort adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "BC sampurna marjuli",
            slug: "bc-sampurna-marjuli",
            city: "Buniasih",
            province: "Jawa Barat",
            address: "JMQH+Q2M, Jalan Surade - Tegalbuleud, Sumberjaya",
            lat: -7.360535199999999,
            lng: 106.6775493,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "BC sampurna marjuli adalah penginapan di Buniasih, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Ketapang Resort",
            slug: "ketapang-resort",
            city: "Karangpapak",
            province: "Jawa Barat",
            address: "Jalan Pantai Cikembang, Pasir Baru",
            lat: -6.968002199999999,
            lng: 106.4140985,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 232,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Ketapang Resort adalah penginapan di Karangpapak, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPSXrVblaN99r4WP6bsj4MFAyC7UbrI7j3Ic7sUIEzP1ad51ClHydiEc0xUH_KT0IVlmgAYZkUwAb2RYe6gwNZG8muKXhdqGv9jlLaSN--C4d1qiTjqWQHomX2fGt9N_5O0khOYo3gTm1bbRA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "PENGINAPAN PUSAKA CEMARA",
            slug: "penginapan-pusaka-cemara",
            city: "Cidamar",
            province: "Jawa Barat",
            address: "G923+HFC, Pantai Cemara, cipanglay",
            lat: -7.498571900000001,
            lng: 107.3536556,
            phone: null,
            website: null,
            rating: 4.7,
            reviewCount: 24,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "PENGINAPAN PUSAKA CEMARA adalah penginapan di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMZiKeJVoviYz3UiXVDyVPJM_U53dn462IgC9WWJivJM2Mq_hLh1oJu69Z73RS1tBo-i2SEJIwsrN6RYzusBsVhfVm3vdGQT4gMVVvNgsc7urBYRThRTOt8fdlJJdOE9mJtI1JKahbbSgRXouagv7nBqw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "PENGINAPAN HEKEDE CEMARA",
            slug: "penginapan-hekede-cemara",
            city: "Cidamar",
            province: "Jawa Barat",
            address: "G923+W8, Cidamar",
            lat: -7.497830099999998,
            lng: 107.3532069,
            phone: null,
            website: null,
            rating: 4.1,
            reviewCount: 13,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "PENGINAPAN HEKEDE CEMARA adalah penginapan di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMqEgDepBT0NwRX0fN6MN6xeo0drqLwNcpUr7Txqt02XEx5PUUOLKsDFhntavspcJQPxaulDygQU-8LecQ7BjzUFZxQSndagjUANfJ_CpRWZqEJbb2iOfKvrcjATK5u2aLXpYfMWi6u1seWqnv3oAdSWg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "PENGINAPAN UNUNG DABLU",
            slug: "penginapan-unung-dablu",
            city: "Cidamar",
            province: "Jawa Barat",
            address: "G933+66H, Unnamed Road, Cidamar",
            lat: -7.496943700000001,
            lng: 107.3531221,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "PENGINAPAN UNUNG DABLU adalah penginapan di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMyblh8E7yNcgiNkiF2Cf121WlKY39Iwdj3MpCIgYnHL_8vKwPWKpIH6S_L0-HxEg0Aoo8ScM5jHenjWSzqg5s9FmWCom7Y2lE7haAwi0qTAaSN-l-OwiuxdlJlNSLcxRlTPEmMMN5tl-o8=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Penginapan ANGLING DARMA",
            slug: "penginapan-angling-darma",
            city: "Cidamar",
            province: "Jawa Barat",
            address: "Cidamar",
            lat: -7.489309899999999,
            lng: 107.3528225,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 19,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Penginapan ANGLING DARMA adalah penginapan di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNW514WWLxczRWrtvs30gZJqNvlzGUhBG_fSWpegtALb7uJ-30Scn8v6kT69m3X_R8pvs8B832Uor5XG23_dbMLStXhJ3RSao0DYk4uf6AY3Bcbvc_WqaQJibqW5rSjRuLm-wde0LzzIOoxAF0TI6Z-bw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "MAULIDIA GUEST HOUSE",
            slug: "maulidia-guest-house",
            city: "Cidamar",
            province: "Jawa Barat",
            address: "G946+VJF, Cidamar",
            lat: -7.492807699999998,
            lng: 107.3615575,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "MAULIDIA GUEST HOUSE adalah penginapan di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Hotel Ma'arif",
            slug: "hotel-ma-arif",
            city: "Cidamar",
            province: "Jawa Barat",
            address: "G85W+R6J, Kertajadi",
            lat: -7.490423,
            lng: 107.3455231,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hotel Ma'arif adalah penginapan di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Cianjur",
            slug: "cianjur",
            city: "Cidamar",
            province: "Jawa Barat",
            address: "G85W+R6J, Kertajadi",
            lat: -7.490423,
            lng: 107.3455231,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Cianjur adalah penginapan di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOdoup9j7lQFypQmtbCZiVSKA114zBjzAraopZKd8cnkVIrcybmGcptH8O4ytHhvX_wz4rVSsitTBvgjm8bTrifOVTJzwUEqieClJuextvaiG3GPhVVXJAeSSYcgWWaRhzspqPgBApNJ1dCM1I=s1600-w720",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Grape Farm HSN",
            slug: "grape-farm-hsn",
            city: "Cidamar",
            province: "Jawa Barat",
            address: "Kertajadi",
            lat: -7.490423,
            lng: 107.3455231,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Grape Farm HSN adalah penginapan di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Saung Kuring",
            slug: "saung-kuring",
            city: "Cidamar",
            province: "Jawa Barat",
            address: "Jalan Raya Cidaun, Kertajadi",
            lat: -7.4891806,
            lng: 107.3473179,
            phone: null,
            website: null,
            rating: 4.6,
            reviewCount: 68,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Saung Kuring adalah penginapan di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMDx0cgz-Q_L286V_Lh4xytrcI-Qv8iwvKQulVOgcR5TOLzKapCNVu3DriZLlSEtHCgZWH5rNiPus7Xq2Tq17kC2q4M8xBGH6XreWlRuozyaqtQmqsYD68AQl3INw9GqmCxUN1MR7tldHdt=s1600-w780",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Kost Rizki Griya",
            slug: "kost-rizki-griya",
            city: "Cidamar",
            province: "Jawa Barat",
            address: "G956+RHM, Kp. Babakan Garut RT.05/RW.06, Cidamar",
            lat: -7.490422799999999,
            lng: 107.3614122,
            phone: null,
            website: null,
            rating: 4,
            reviewCount: 2,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Kost Rizki Griya adalah penginapan di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZM4lyFFukXcMCXUe-7J5YORc6TDgigG_ggho2EvihT_s9AZgilXWauExeHcl95tQfMGnf1-D85EXgsNdsECO9q4rZi2bkys2XfPpOxdDPFXiR9LqGf3yD37Y9KetSU-AC03_2NSdCKFLSycIKXuuvHjNg=s1600-w1200",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Penginapan Abadi",
            slug: "penginapan-abadi",
            city: "Cidamar",
            province: "Jawa Barat",
            address: "G85R+FQC, Kertajadi",
            lat: -7.491314199999997,
            lng: 107.341886,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 15,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Penginapan Abadi adalah penginapan di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP9fm5bVQy8Qo38P1RrKMiYD2TomGaBoLlb4Yw5iwkDGsqRkRm7u4CSX2IXCNOtL41AsLHAzo0dwcdtuWUGUwpK6zTEyGoatdhFBF0XU8wZ883WLNBnazDHuFzyNtb4BGe7HsKM7QNoVczGEg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Kontrakan nurussaadah",
            slug: "kontrakan-nurussaadah",
            city: "Cidamar",
            province: "Jawa Barat",
            address: "G967+M32, Kp.eyang ngbeui, Cidamar",
            lat: -7.4883681,
            lng: 107.3626474,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 2,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Kontrakan nurussaadah adalah penginapan di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Kontrakan dan penginapan pa Deni",
            slug: "kontrakan-dan-penginapan-pa-deni",
            city: "Cidamar",
            province: "Jawa Barat",
            address: "Kp. Eyang Ngabeui RT.04/RW.05, Cidamar",
            lat: -7.487891599999998,
            lng: 107.3625289,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 11,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Kontrakan dan penginapan pa Deni adalah penginapan di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMh7B1dwRPCXMcwzSvsOeDpxkdDvMb6YC2jUXQGrtIdhh-FJU1LvXhrHmdDRwIADc_jMbpRU7XGJpr1ZlNDpyYAsyWx6YMUnM9CBlS0nF65asKxXmdhj4S81VgNV93ORhsMdH8x3OYuBUbLZhByxHx6iw=s1600-w720",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "bumi ijuk",
            slug: "bumi-ijuk",
            city: "Cidamar",
            province: "Jawa Barat",
            address: "G975+JRJ, Cidamar",
            lat: -7.485923799999999,
            lng: 107.3595209,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "bumi ijuk adalah penginapan di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Rest area cityhook",
            slug: "rest-area-cityhook",
            city: "Cidamar",
            province: "Jawa Barat",
            address: "G949+HW8, Jalan Raya, Cidamar",
            lat: -7.4935912,
            lng: 107.3698268,
            phone: null,
            website: null,
            rating: 4.8,
            reviewCount: 42,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rest area cityhook adalah penginapan di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNJp4L2jq3YQeB0cMMc16XnzIWkwkjFf9O8vnwcifDEEgN1-CIWJYZW7k47KfcPg3eyQibBZIqnVmlDgrjqHSAJrU0jMvv-h801pNj9mENs9O6GCcblSIz-a_s4Zc4hTc76pcEtkta3Dznge8Y=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Hotel Bumi Alam Cidaun",
            slug: "hotel-bumi-alam-cidaun",
            city: "Cidamar",
            province: "Jawa Barat",
            address: "G94C+X2, Cidamar",
            lat: -7.493328099999998,
            lng: 107.3705123,
            phone: null,
            website: null,
            rating: 4.7,
            reviewCount: 20,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hotel Bumi Alam Cidaun adalah penginapan di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOelmdFqGqllJiAMYIRZk_4qROqjrueenE-Fn2GNcUq-QDES0GepF07RCe6aP0JSIuGp8Dm75dIqYu8BwpdkgbUt1bEbnlvGWt2QUCwzl6KU2MyOpr8lbcof691nGBbZxGtBaYodvLfL5xQHAw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Penginapan Pak Usup",
            slug: "penginapan-pak-usup",
            city: "Cidamar",
            province: "Jawa Barat",
            address: "G92H+JHQ, Cidamar",
            lat: -7.4984004,
            lng: 107.3789955,
            phone: null,
            website: null,
            rating: 3.1,
            reviewCount: 7,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Penginapan Pak Usup adalah penginapan di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN-uM5wBnr-jvs--he-R1NlCr0XUAdPp99juQf7fXQ9h6Eq_m8wD6E7qemaLN9DBcrX_73HQKkAatzHn9YQlBm4p1lGxSN2bnyYbZ7l7BP5tpfvwBl19kiwbRgnGv2MpA9n0QJM6A7UhRMnEQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Pesantren Riyadhul Huda",
            slug: "pesantren-riyadhul-huda",
            city: "Cidamar",
            province: "Jawa Barat",
            address: "G85G+428, Kp. Sukamulya RT.03/RW.04, Kertajadi",
            lat: -7.4922071,
            lng: 107.3250654,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Pesantren Riyadhul Huda adalah penginapan di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Warung kediri si abang tea",
            slug: "warung-kediri-si-abang-tea",
            city: "Cidamar",
            province: "Jawa Barat",
            address: "cipunage, Pelabuhan jayanti",
            lat: -7.4989916,
            lng: 107.3831454,
            phone: null,
            website: null,
            rating: 4.6,
            reviewCount: 7,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Warung kediri si abang tea adalah penginapan di Cidamar, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPt342qEhpgwXejI9pTd_NZcAXVZlkCaBitsRHTq02xP1HbzTg9Nrx_Twf2VdnmAsL4I0jbOksRcUPovWSUFx5UGKQkxnABRlaY7y9A7kpCVeUSzJLv_fQV0m_yg9GEXqCQlKJxQxJHhCrQQqEHjmWx3A=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Oakwood Hotel & Apartments Taman Mini Jakarta",
            slug: "oakwood-hotel-apartments-taman-mini-jakarta",
            city: "Depok",
            province: "Jawa Barat",
            address: "Jalan Taman Mini Indonesia Indah Pintu 1 Tmii, Ceger",
            lat: -6.3030836,
            lng: 106.8863433,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 4947,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Oakwood Hotel & Apartments Taman Mini Jakarta adalah penginapan di Depok, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPmPg5W6Yt4bCgS3fYPudfHHAH036rDf-_8vRARBMRwbRXk00ZtHGJaEUwukFVXb4Vt0-1aNdItSeNVEwyqRdyq3bgwEyMTEWhYPRU7z-KCh_COeTm7LVCxcFzTfY6KWmTNEtfnVrI5PsvW=s1600-w900",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Hotel Santika Depok",
            slug: "hotel-santika-depok",
            city: "Depok",
            province: "Jawa Barat",
            address: "Jalan Margonda No.88, Kemiri Muka",
            lat: -6.3864913,
            lng: 106.826124,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 4543,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hotel Santika Depok adalah penginapan di Depok, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZM8vDfxj4tP6t2ChxbQqh3d8BztmYvZZL_yLUhZpCu9qS_-iBOFujDmhEm1axSEdPPNchwl1qNfs-GvHZpJG8FKDS2Gtood-XaQ4rqBU_ml50m4lIGxUzEbRBKDq-XpA4MfRhVV_77NwpUl=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Jakarta Madrix",
            slug: "jakarta-madrix",
            city: "Depok",
            province: "Jawa Barat",
            address:
                "The London Living Kebagusan City Aparthotel, Tower C 1KC29, Jalan Baung RT.2/RW.3, Kebagusan",
            lat: -6.3077478,
            lng: 106.8358841,
            phone: null,
            website: null,
            rating: 3.1,
            reviewCount: 24,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Jakarta Madrix adalah penginapan di Depok, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOeJGTqUSvGn8kliTzMFvH91KW9XDZCzUSVp_8rd-a2jErTES6wQQgzN4cxyGybZ_b2maFevUj7fDlTPvvyTdHNBq7M1RVhS0-hSISX5eVVfOMZthVGNfihKGT7xskcp05NzJR5dcUDV0ZzyQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "OYO Life 3162 Raihan Residence",
            slug: "oyo-life-3162-raihan-residence",
            city: "Depok",
            province: "Jawa Barat",
            address: "Jalan Sakub No.27 A, Bakti Jaya",
            lat: -6.377547300000001,
            lng: 106.8478146,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 3,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "OYO Life 3162 Raihan Residence adalah penginapan di Depok, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMk8-93UTCOHVvrfJy4A5DGu9URSKb5QWc82evhwUoiYBAxgNSyClOdBn3uoVcOcbCkYenkQY3EFQjTIiKQ2GZJu7Lm9hJihYZxF7IBHAB4dS2l843Hbkickaa35eJBY9hydoY_2EjwqXeimg=s1600-w412",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Samuel Margonda Residence",
            slug: "samuel-margonda-residence",
            city: "Depok",
            province: "Jawa Barat",
            address: "Margonda Residence, Jalan Margonda, Pondok Cina",
            lat: -6.3638356,
            lng: 106.8346275,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Samuel Margonda Residence adalah penginapan di Depok, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "OYO Life 3034 Taman Melati",
            slug: "oyo-life-3034-taman-melati",
            city: "Depok",
            province: "Jawa Barat",
            address: "18, Jalan Margonda Raya Gang Salak No.18, Pondok Cina",
            lat: -6.358150600000001,
            lng: 106.8336783,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "OYO Life 3034 Taman Melati adalah penginapan di Depok, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZM7xF1eZC9vJZ6ZSPG5iTeI852RbX1H-w4Bbt1yBsUKzrFYLXOV5HWB9Visf3p_6GNgXHvySa-_Q_U4MOihgcbQA9pnx0GsZFxdJ_S7T8e3cxbVr5emo08OVezp7hvF1MxnGQGYPKAulsKZ0w=s1600-w1508",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Wisma Konservasi",
            slug: "wisma-konservasi",
            city: "Depok",
            province: "Jawa Barat",
            address:
                "PPSDM KEBTKE, Jalan Raya Poncol No.39 12, RT.12/RW.7, Susukan",
            lat: -6.322665,
            lng: 106.8695432,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 10,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Wisma Konservasi adalah penginapan di Depok, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMGcixDiKJeI7aIYs_Hl8PCEPNY5_1wKwbuYUmONxC8dtNNCcgAu4P0gBJHeps1ykl1N9Plz8qoG_RsrOef52Lxc35Yu5v4RWEl29zdONvEyoqsq76C9pf4lW1IdtNNpoBch69Pdrb63Gafrg=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Modern Residence 3 by Hendra",
            slug: "modern-residence-3-by-hendra",
            city: "Depok",
            province: "Jawa Barat",
            address: "Jalan Margonda No.Kav. 88, Kemiri Muka",
            lat: -6.386980499999999,
            lng: 106.8268826,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Modern Residence 3 by Hendra adalah penginapan di Depok, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "OYO 3691 Apartment Saladin Mansion",
            slug: "oyo-3691-apartment-saladin-mansion",
            city: "Depok",
            province: "Jawa Barat",
            address: "39, Jalan Margonda No.39, Depok",
            lat: -6.393461500000001,
            lng: 106.8234147,
            phone: null,
            website: null,
            rating: 2.5,
            reviewCount: 29,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "OYO 3691 Apartment Saladin Mansion adalah penginapan di Depok, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPEbgVSZc6mJg9nSGKtqUpqQhXOEEh6lMTFJHugrc9a19pUdRDJiBHWtYexkfFu2pkArFkuXsGRtD6z9S2ChBzmk5Arn64wzJymR3osIqJsW651wJka4vPjZuMEoIEPchXhLkBXOIGBbhXl0qE=s1600-w1080",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "OYO 2229 Dolfie Residence",
            slug: "oyo-2229-dolfie-residence",
            city: "Depok",
            province: "Jawa Barat",
            address: "Jalan Bungur No.6, RT.3/RW.11, Depok",
            lat: -6.3986016,
            lng: 106.8212991,
            phone: null,
            website: null,
            rating: 3.6,
            reviewCount: 91,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "OYO 2229 Dolfie Residence adalah penginapan di Depok, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP0bEeTsv5eihYB-HFOuIq84d7f68zi0BUvCL3Nt336VkcALWj2iflonc8DtqAXHUQjqq8pCZ8ERa3dqvMHi0uBh9WfLmfF02tgULmY5fRtcyT-Eb2935CWkMEkfkK_HDJ2fa_X_rutfrztTuo=s1600-w640",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "King Apartmen House",
            slug: "king-apartmen-house",
            city: "Depok",
            province: "Jawa Barat",
            address: "mares 3 dmall, Jalan Margonda No.kav 88, Kemiri Muka",
            lat: -6.386833899999999,
            lng: 106.8265029,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 1,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "King Apartmen House adalah penginapan di Depok, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Bella's house",
            slug: "bella-s-house",
            city: "Depok",
            province: "Jawa Barat",
            address: "9, Jalan Manunggal XVII No.72, RT.8/RW.4, Lubang Buaya",
            lat: -6.297916000000001,
            lng: 106.8928935,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Bella's house adalah penginapan di Depok, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Hotel Bumi Wiyata",
            slug: "hotel-bumi-wiyata",
            city: "Depok",
            province: "Jawa Barat",
            address: "Jalan Margonda No.281, Kemiri Muka",
            lat: -6.3791509,
            lng: 106.8300297,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 6956,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hotel Bumi Wiyata adalah penginapan di Depok, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP-gLDo54Omj9PUH7wvAfRphjI2to-x0-5AvC2rqGWJRSSUEC7kzCJIRMDaKSwl96C_xU6dZYG2lfCoFTYWNiAw8pPBRfxrt97b7zK9yAm5YDNf7ZeckzZiJaL-udw4pAombsCmxvtZfW5zUgY=s1600-w1366",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "FrescoBett @ Mares",
            slug: "frescobett-mares",
            city: "Depok",
            province: "Jawa Barat",
            address: "Margonda Residence, Jalan Margonda No.64, Pondok Cina",
            lat: -6.363949499999999,
            lng: 106.8344921,
            phone: null,
            website: null,
            rating: 1,
            reviewCount: 2,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "FrescoBett @ Mares adalah penginapan di Depok, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMQ6n94jBPcW4yAEGLtL9l6ucbyqwzCDBDwTrd67qRiRJ2FU2BjqqspxlX9Vn_M6uR3iNrejpCsUG_w_9-WsZsm7Mb3RAcFW5wchqghagy1fax4n7WfC013uzVCf8xk1wfMKHBNFIPzNvuI=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Maerokoco Syariah Room",
            slug: "maerokoco-syariah-room",
            city: "Depok",
            province: "Jawa Barat",
            address: "Jalan Raya Inpres No.10 5, RT.5/RW.1, Kampung Tengah",
            lat: -6.2903747,
            lng: 106.87012,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 274,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Maerokoco Syariah Room adalah penginapan di Depok, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMHUutdJZqab8besqQxzh_gBR3Dylm8yqxTzdtcqrDMhPqORQsvE-mIef-BdyYVd1_WkXPt1bhCBV2tatY9-FaS6reRGw81e_Hv9hVFF2zaQdRuPg87b0tlP_npkTPXQ3pFd5PEIEwh9zxsRMqCq32qTQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "SMP Tahfidz Putra Madinatul Quran Bogor (MQ1)",
            slug: "smp-tahfidz-putra-madinatul-quran-bogor-mq1",
            city: "Cileungsi",
            province: "Jawa Barat",
            address: "Singasari",
            lat: -6.499555299999999,
            lng: 107.0073771,
            phone: null,
            website: null,
            rating: 4.7,
            reviewCount: 66,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "SMP Tahfidz Putra Madinatul Quran Bogor (MQ1) adalah penginapan di Cileungsi, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOVkRhQbhx2MeKvvthH6DhgM2bC390XGa1lXxBFgouDvmrhJHuAT-ORp1y51CECpwt-pjWPmx4r2FacXhaUR_o4n0Hyyggg8eIM-W1qKd4r6VkHuUyXiy2ra2s6NPyzXtQHWKHvL4p-WrePZBbCZ2KGaA=s1600-w800",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Grand Nusa Indah Blok Jasminum",
            slug: "grand-nusa-indah-blok-jasminum",
            city: "Cileungsi",
            province: "Jawa Barat",
            address: "Jalan Grand Nusa Indah Raya Blok J2/17, Setu Sari",
            lat: -6.4286266,
            lng: 107.0103401,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 12,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Grand Nusa Indah Blok Jasminum adalah penginapan di Cileungsi, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOPCb1ZIrcihSV7WXya-Guk5m3YFCtCJsFGpHV8h0GHPDkrRtEHY-JjTncws6TjGC8fui_vjoAv-U8jn1oRUN6oQQx7VdMLsejsoTLRQDhtVFBjRmuOxboz1QDdfGTnNEPI9YNUuYRsj9zqdHOakXbLxQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Jenica Constanza Uffi",
            slug: "jenica-constanza-uffi",
            city: "Cileungsi",
            province: "Jawa Barat",
            address: "grand nusa indah cluster brunfelsia B13/12, Mampir",
            lat: -6.4269253,
            lng: 107.0088033,
            phone: null,
            website: null,
            rating: 4,
            reviewCount: 3,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Jenica Constanza Uffi adalah penginapan di Cileungsi, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Doraemon Club",
            slug: "doraemon-club",
            city: "Cileungsi",
            province: "Jawa Barat",
            address: "Jalan Grand Nusa Indah Raya No.Road, Mampir",
            lat: -6.4270401,
            lng: 107.0084946,
            phone: null,
            website: null,
            rating: 5,
            reviewCount: 6,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Doraemon Club adalah penginapan di Cileungsi, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN9fo7DPPitil5_WOvTyYIfJ2faPJwe8jbJ7IrUiSzmhyvXgVDZxbUMaV_DJr_UsF3O4DaIG9d6NH2xs7num7lVnOdmi7XtEyXR8t_8VhV71FdZ-cLHDNxaQ69VkFKGpJgKtLOyYScBfPX7Nig=s1600-w864",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Graha Nusa Indah Blok Tamarindus (T3)",
            slug: "graha-nusa-indah-blok-tamarindus-t3",
            city: "Cileungsi",
            province: "Jawa Barat",
            address: "H2G5+8H6, Mampir",
            lat: -6.4242171,
            lng: 107.0088997,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 4,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Graha Nusa Indah Blok Tamarindus (T3) adalah penginapan di Cileungsi, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPM2BM4zUDBswyLYrNIgMdGSDaEGD4cVyMeUXM89FCpVw-iL6dDgP7EwN7dpKBHdK0bWepqfhJBFohc2K1Bn3Nspgb6txN3YcywwtTWdAknUlmaT4nDmS148f_oRi9yDD7t2DfTT7l6pfwasg=s1600-w750",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Home Rani",
            slug: "home-rani",
            city: "Cileungsi",
            province: "Jawa Barat",
            address: "Kp, Jalan Cempaka No.RT11/06, Mampir",
            lat: -6.428492599999999,
            lng: 107.0062363,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Home Rani adalah penginapan di Cileungsi, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO0NZXU8df0aQw9SjpUP9D4CUqPX2pf92XauGCOyn7w6exNQbEAjyjZtwq5VrWa3wNUegHMH2dyJgFf544MZ9up91_JWVYKUkh5e4UrqrRKg2sPvm2ovMly_OQWlZ02GaUgr-1Kx_kcD2moLw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Rani Nay",
            slug: "rani-nay",
            city: "Cileungsi",
            province: "Jawa Barat",
            address: "H2C4+P9G, Kp Jalan Cempaka RT.11/RW.06, Mampir",
            lat: -6.4281869,
            lng: 107.0059388,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rani Nay adalah penginapan di Cileungsi, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNu6DvUSMxxQoCW-U7ZQEv--yITaZcMx3gxip9oX97ouymf3Y-r4fYaWpQiQ5-A0xMlVz0890y_mVV8ASJfYo7B5eaiFWUSTNsjOcLFcet4JUeKlatyGF4VRoXmG-vXyEAu4m7Jd52qKX5JmQ4=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "RaiDel Home",
            slug: "raidel-home",
            city: "Cileungsi",
            province: "Jawa Barat",
            address: "H2F7+PGP, Setu Sari",
            lat: -6.425671899999999,
            lng: 107.0138365,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "RaiDel Home adalah penginapan di Cileungsi, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO0YYcCwz4wbUiZZaiEczf0LksauF_-J63xG4prIakOtdeLXWxDI1-pB-WY9g0fOdYGl3FhxJxZTR--2cb0UHpLAw8m8gHRNiRbCvVSMrjwaFwN8PGM1qflbR-cafQHyBgcmNc3FJPdyVGuuOg=s1600-w1440",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Rumah ifull",
            slug: "rumah-ifull",
            city: "Cileungsi",
            province: "Jawa Barat",
            address: "H2C4+PCV, Mampir",
            lat: -6.428378,
            lng: 107.0054201,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rumah ifull adalah penginapan di Cileungsi, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Faris Althaf",
            slug: "faris-althaf",
            city: "Cileungsi",
            province: "Jawa Barat",
            address: "H2C4+PCV, Mampir",
            lat: -6.428468899999999,
            lng: 107.0053386,
            phone: null,
            website: null,
            rating: 0,
            reviewCount: 0,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Faris Althaf adalah penginapan di Cileungsi, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [],
            facilityNames: [],
        },
        {
            name: "Hilton Bandung",
            slug: "hilton-bandung",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "Jalan HOS. Cokroaminoto No.41-43, Arjuna",
            lat: -6.9130232,
            lng: 107.5977782,
            phone: null,
            website: null,
            rating: 4.7,
            reviewCount: 11770,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hilton Bandung adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNbUarisbyXNT0ZXnL2G60SXffigDUKhUZ_lkUcZWFuMSb-ZmuPRCxHwoySCaWwd1H8YTzl0uK_MAuVaZRcEbDdbwBYz0b-b64d7EX4_C5c4oSPrRhPM3wdJNStnVGz8gm7aBLAcaoOozLK9w=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Aston Tropicana",
            slug: "aston-tropicana",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "Jalan Cihampelas No.125 - 127, Cipaganti",
            lat: -6.896163,
            lng: 107.6036167,
            phone: null,
            website: null,
            rating: 4.8,
            reviewCount: 25459,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Aston Tropicana adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN9FkMielgk20s6k3YM0EG7uMtQ6KX7CdIy3-RHe_tMYa0WjhzKSNnEB37eBWStUwMlV_pCZ_IFeY0fHxYn6_Cq89OzjeZ7ZxTOUCRHhlrV873mt8Elbs_NB467R1hWRkaeW41l6Qbh0hXOmOY=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Amaroossa Hotel Bandung",
            slug: "amaroossa-hotel-bandung",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "Jalan Aceh No.71A, Citarum",
            lat: -6.908499,
            lng: 107.6184802,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 4465,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Amaroossa Hotel Bandung adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOhTAJQ7fWivvVvQNzzvzeRdWF7acQAb8496RBTSwoOeDGWfPps1iJc6t86ITshqSMQl_F1wdi_uq-V4Ahu2pqdnYE0h7kkTSS8w5-gW1RCKNRxRTv9zwtuki5vblr7KDOa6CdjsO-8noLZSCo=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Amaris Hotel Cimanuk",
            slug: "amaris-hotel-cimanuk",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "Jalan Cimanuk No.14, Citarum",
            lat: -6.9043659,
            lng: 107.620665,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 1950,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Amaris Hotel Cimanuk adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMUYF4JYa3Z4u2AImQKNE19BtQdtlsikKxyrkMlAJYAkTVJyTtQ9jGB2MyGzdobQaLKkoHGLHviTSrYZxufg-1mJP7AQOzdzAK2tA_7Ci9qiYBWTmr9msUuNl_XpPsG9WcIJYv5aGQu6ER78Q=s1600-w750",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Hotel Santika Bandung",
            slug: "hotel-santika-bandung",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "Jalan Sumatera No.52 - 54, Citarum",
            lat: -6.907617600000001,
            lng: 107.6119761,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 4032,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hotel Santika Bandung adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOzxktLZvaNZW97TXa8Y6ojE0EhCYT8mhILHkOIgJ4KAPW5Js8hw18N7a_FItHgaHZ7buqGG74gyWUlr3O0Gz4KJXDLjCnyXRNJKg6BdKGCvfVmgpkR6ZT4n436Cy5CrxR0uG5mL3VaAkvdVRM=s1600-w540",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Grand Pasundan Convention Hotel",
            slug: "grand-pasundan-convention-hotel",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "Jalan Peta No.147 - 149, Suka Asih",
            lat: -6.9367396,
            lng: 107.593498,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 8332,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Grand Pasundan Convention Hotel adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO30oi-MC4WJ9GUEK_JGNtQgTDEPtdsSMesLEf8AwdP50BJR4DnrJ97Kc34OO7b4JFMki5-iv-_KBNCMHczFdSx54Ps_J0oij7y7Cv2kE4-1JjA_QTtssylkc3ZEMntN4kJJwj2e-2cf_A69TYurJpX=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Sensa Hotel",
            slug: "sensa-hotel",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "Jalan Cihampelas No.160, Cipaganti",
            lat: -6.8948852,
            lng: 107.6050051,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 4590,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Sensa Hotel adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOFA1O9qnyt0a_6yKDwCdECXn0P745tzb-B_Kgc0gR3Ay7IcGggqFTkPLsJxIymmIZSUC40NKyx5eH7vUpG8Vj2_AaibRXVP92DBzpCgTO36yB5s2tpAnJqeBFcg2dqLz4bkZuYWMsKXTQjdA=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Gino Feruci Braga Hotel",
            slug: "gino-feruci-braga-hotel",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "Jalan Braga No.67, Braga",
            lat: -6.917815300000001,
            lng: 107.6090632,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 6130,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Gino Feruci Braga Hotel adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOGlde-j5AhP6PL463dPCpFpx27N3VHIpAwhZGS0BrL5MnaEJUY-l_3L3pbqaLcV4q4le-2KSDTAZh_WmuaHg-oNWUlNeCgKipUt7TgQFalLum0I21K8FG-aHnEEkfjF05T2SulYixny1c2=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Gino Feruci Kebonjati Hotel",
            slug: "gino-feruci-kebonjati-hotel",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "Jalan Kebon Jati No.71-75, Kebon Jeruk",
            lat: -6.9163786,
            lng: 107.5988089,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 4757,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Gino Feruci Kebonjati Hotel adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZP2b6bTkL5E1O6iR9v_5i308Meypjo4zEgcSI9LbuSCdO5lYlBARlUQRlHYwQ_p166oBgGZ1UJ-8kxv7BGw9aeoRdYUBsWl3_z4pyYA-AJ1ztCgtoU5N1WvmkH6H79Nn0COG8zyu2dKV9OuSw=s1600-w1280",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Grha Ciumbuleuit Guest House",
            slug: "grha-ciumbuleuit-guest-house",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "Jalan Ciumbuleuit No.156, Ciumbuleuit",
            lat: -6.866522199999998,
            lng: 107.6063193,
            phone: null,
            website: null,
            rating: 4.2,
            reviewCount: 2440,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Grha Ciumbuleuit Guest House adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNliK9BiSIjShpf3CJfDU6kEr3QJZCLsLz59KVrgeavDlxysn3wo2vdUcN-LguRZ0YBKsvMmS1tQakHX80k7oTiVz-xGbN3kNY-5QTQq48y-SL5J0C5AnMKwY-ndIh8paRUo_oXm6nixRtyKg=s1600-w1000",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Serela Riau Hotel",
            slug: "serela-riau-hotel",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "Jalan L. L. R.E. Martadinata No.56, Citarum",
            lat: -6.906132799999999,
            lng: 107.6199037,
            phone: null,
            website: null,
            rating: 4,
            reviewCount: 3061,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Serela Riau Hotel adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMaZwc0xTJxUFc_LJq35euhHu5vSozgbg6DapGQZT8fHmreOiai8Kn0L24yifzQeYjIWP0JZIZRxI2Xsp9AgJc5CQU_-GbIBPfkmHeol7H1EAS_3UWfts9RQCITuZ3r3vB8NVJh-8qI-pNKodNKPFuZ8g=s1600-w740",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Hotel California",
            slug: "hotel-california",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "Jalan Wastukencana No.48, RT.01/RW.17, Tamansari",
            lat: -6.9037693,
            lng: 107.6052596,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 3285,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hotel California adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZNBOkM3LLJ3eSmEDnSiUBSPCMPOs6zp7iE261v0cjisOHz7BjDoXE-rAqm9f2N30oXdjPbt4Zr0AfSMyWlyPVL1Mrj5lVSXl2fErzUb50Klakk_34MZVAmn62kgDbc34nYin4M1oKNaJVyUYoI=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Rehat at Ottenville Boutique Hotel",
            slug: "rehat-at-ottenville-boutique-hotel",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "3JW2+V83, Jalan Doktor Otten No.6, Pasir Kaliki",
            lat: -6.902856099999999,
            lng: 107.6007707,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 699,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Rehat at Ottenville Boutique Hotel adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZPcwoLz98KmwpXhkU2jXT1w28mNT3i24sVqT4VmCsDXhHxT10jgrXI4hOS943bw-UTjFR7P-Wrt5fUcGNnoM0qe0Re7niYenJVMHkNYFAlks1siD7nUqIyPFMDzjjz1nrn8zP0MPx9hO2Lj4_G6YSSK=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Summer Hills Hotel & Villas",
            slug: "summer-hills-hotel-villas",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "Jalan Setrasari Raya No.10, Sukarasa",
            lat: -6.870642899999999,
            lng: 107.5858905,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 2861,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Summer Hills Hotel & Villas adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOX8nMWuYwzj1O9GIkn0X_vzHqx0FKtxN5Wr_nHMk737Gxoe4qkHMGIs0UR3TYvxDYSR3RT5sBggTDKgkdMlPnCYC-RjI6DIL7pzw19PvXG6zAYN7yFzjquzWYlKpnbM_pZkgshZ9fLWm_WKQ=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "The Valley Resort Hotel",
            slug: "the-valley-resort-hotel",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "Jalan Lembah Pakar Timur No.28, Ciburial",
            lat: -6.8634173,
            lng: 107.6336826,
            phone: null,
            website: null,
            rating: 4.6,
            reviewCount: 3275,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "The Valley Resort Hotel adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZMKRay4MtNRhmnHlvYzE5Poed8Ox1xRXpvUNI-Fh1oWu0Mtlypa1DE31DedMKuw1fjtaPuH7k8gGfMyjZgkezcmADJxbrQoQvtMR3zNabiHqnXcbsytp5OOr6j5br_Jros_1GILXU-0LgAjHDs=s1600-w900",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Grand Pacific Hotel",
            slug: "grand-pacific-hotel",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "Jalan Pasir Kaliki No.100, Pasir Kaliki",
            lat: -6.9087923,
            lng: 107.5979058,
            phone: null,
            website: null,
            rating: 4.4,
            reviewCount: 2985,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Grand Pacific Hotel adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZOSPE0twlPefdnmQYkYk9k-BzvGZ8Hj5o6CIErM93y84P8fBBd4rT1hZznd_grYwhDGYP7hk8C_Z7Qgg_VFS7WjOHubRXzavmJF-hZV6m9evTCdW1Wooxt-YqtzY14W4ejtL9NEQIolctKozlWRKxeQqg=s1600-w1064",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Novotel Bandung",
            slug: "novotel-bandung",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "Jalan Cihampelas No.23 25, Pasir Kaliki",
            lat: -6.9048517,
            lng: 107.604083,
            phone: null,
            website: null,
            rating: 4.6,
            reviewCount: 10136,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Novotel Bandung adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZM-0UICfLSEC1y18KnsHKYMiaWSPrT0BxdIX9DF5e1ugm5E-TURQM9MwOmzHnFL1zp0kkuYVKxUvis5PWPxKUrGB2b2JtCWed_x1Q1gHs_2DOmTdn5wkEasPJUgPoVTou9tIcjp6knNQhzzjVJ6XmgLOw=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Amaris Hotel Cihampelas",
            slug: "amaris-hotel-cihampelas",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "Jalan Cihampelas No.171, Cipaganti",
            lat: -6.890236599999999,
            lng: 107.6037406,
            phone: null,
            website: null,
            rating: 4.3,
            reviewCount: 4084,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Amaris Hotel Cihampelas adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZO97wXmBmmtiX914ymeYrxQ4tfHdA__g6BguAVXVgqywM1lS7Gf2pK_Efvobqld42L6UnuKGiiuJD81AMhYl7cjOktnB7dOxVg1NQ1dgTmXV1qJ5nFWyK-bhlLNjeXiWIKtvILO5nfGzQHOqA=s1600-w720",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "ibis Bandung Trans Studio",
            slug: "ibis-bandung-trans-studio",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "Jalan Gatot Subroto No.289, Cibangkong",
            lat: -6.927261,
            lng: 107.636406,
            phone: null,
            website: null,
            rating: 4.5,
            reviewCount: 14593,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "ibis Bandung Trans Studio adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZN8mpnDCUphjRJKQWUHj2mO774bsQTeywVPOFkMdb_g-cPSWefPjn8wBqNK0ygsBS59wpuvE05jGmmvGk25yYLNFojI1rsGSEpyrap_PRc4K7jYv2rNcrpQG6wHDa_w7NthwymBWTJLHZKC-mI=s1600-w1600",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
        {
            name: "Hotel Serena",
            slug: "hotel-serena",
            city: "Kota Bandung",
            province: "Jawa Barat",
            address: "Jalan Marjuk Jalan Kebon Kawung, Pasir Kaliki",
            lat: -6.911797000000001,
            lng: 107.602606,
            phone: null,
            website: null,
            rating: 3.8,
            reviewCount: 1425,
            validationStatus: "PENDING",
            description: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Hotel Serena adalah penginapan di Kota Bandung, Jawa Barat.",
                            },
                        ],
                    },
                ],
            },
            images: [
                {
                    imageUrl:
                        "https://lh3.googleusercontent.com/place-photos/AJRVUZObgP-R2GKkdhqgHYcM3pubecRZoQ_w9G7S4O7u6gYVrC1ZwpvZe68JpRXIbEmuXSUE_gF5GPfaw45vRlDsFkvyEIBMz9w4YFUJrg1IGnxnYJslVEyYmJrDe4HNi62jOUY1hLXD4tYJJw83JQ=s1600-w640",
                    caption: "Foto utama",
                    isPrimary: true,
                },
            ],
            facilityNames: [],
        },
    ];

    for (const a of accommodationData) {
        await prisma.accommodation.create({
            data: {
                name: a.name,
                slug: a.slug,
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
                images:
                    a.images && a.images.length
                        ? { create: a.images }
                        : undefined,
                facilities: {
                    create: (a.facilityNames as string[]).map((fn: string) => ({
                        facilityId: facilities[fn]!.id,
                    })),
                },
            },
        });
    }
    console.log(
        "  ✓ " +
            accommodationData.length +
            " accommodations with images created",
    );

    console.log("\n✅ Seeding selesai!");
    console.log("   Categories: " + categoryData.length);
    console.log("   Halal Facilities: " + facilityData.length);
    console.log("   Destinations: " + destinationData.length);
    console.log("   UMKMs: " + umkmData.length);
    console.log("   Accommodations: " + accommodationData.length);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
