import {
    PrismaClient,
    CertificationStatus,
    ValidationStatus,
    InteractionType,
    SentimentLabel,
} from "../lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Cleaning up database...");
    // Order matters due to foreign keys
    await prisma.destinationInteraction.deleteMany();
    await prisma.reviewSentiment.deleteMany();
    await prisma.review.deleteMany();
    await prisma.halalValidation.deleteMany();
    await prisma.halalCertification.deleteMany();
    await prisma.umkmImage.deleteMany();
    await prisma.umkm.deleteMany();
    await prisma.destinationImage.deleteMany();
    await prisma.destinationHalalFacility.deleteMany();
    await prisma.destination.deleteMany();
    await prisma.halalFacility.deleteMany();
    await prisma.category.deleteMany();
    await prisma.halalReadinessScore.deleteMany();

    console.log("Starting seeding with expanded data...");

    // 1. Create Categories
    const categoriesData = [
        { name: "Kuliner Halal", slug: "kuliner-halal", description: "Makanan dan minuman terjamin halal." },
        { name: "Wisata Religi", slug: "wisata-religi", description: "Destinasi religi dan sejarah Islam." },
        { name: "Alam & Taman", slug: "alam-taman", description: "Wisata alam yang ramah keluarga." },
        { name: "Belanja & Retail", slug: "belanja-retail", description: "Pusat perbelanjaan dan oleh-oleh." },
        { name: "Budaya & Heritage", slug: "budaya-heritage", description: "Situs budaya dan warisan sejarah." },
        { name: "Hotel & Penginapan", slug: "hotel-penginapan", description: "Akomodasi ramah muslim." },
    ];

    const categories = [];
    for (const data of categoriesData) {
        const cat = await prisma.category.create({ data });
        categories.push(cat);
    }

    // 2. Create Global Halal Facilities
    const facilitiesData = [
        { name: "Masjid Utama", facilityType: "MOSQUE", weight: 30 },
        { name: "Mushola Bersih", facilityType: "MOSQUE", weight: 20 },
        { name: "Area Wudhu Terpisah", facilityType: "MOSQUE", weight: 10 },
        { name: "Restoran Halal Tersertifikasi", facilityType: "RESTAURANT", weight: 40 },
        { name: "Kantin Halal", facilityType: "RESTAURANT", weight: 20 },
        { name: "Akses Kursi Roda", facilityType: "ACCESSIBILITY", weight: 10 },
        { name: "Toilet Ramah Difabel", facilityType: "ACCESSIBILITY", weight: 5 },
        { name: "Ruang Laktasi", facilityType: "FAMILY", weight: 10 },
        { name: "Area Bermain Anak", facilityType: "FAMILY", weight: 5 },
        { name: "Arah Kiblat", facilityType: "ADDITIONAL", weight: 5 },
        { name: "Jadwal Salat", facilityType: "ADDITIONAL", weight: 5 },
    ];

    const facilities = [];
    for (const data of facilitiesData) {
        const facility = await prisma.halalFacility.create({ data });
        facilities.push(facility);
    }

    // 3. Create Destinations in different cities
    const destinationsData = [
        {
            name: "Masjid Raya Bandung",
            slug: "masjid-raya-bandung",
            city: "Bandung",
            province: "Jawa Barat",
            lat: -6.9218,
            lng: 107.6069,
            catSlug: "wisata-religi",
            halalScore: 95
        },
        {
            name: "Masjid Istiqlal",
            slug: "masjid-istiqlal",
            city: "Jakarta Pusat",
            province: "DKI Jakarta",
            lat: -6.1702,
            lng: 106.8314,
            catSlug: "wisata-religi",
            halalScore: 100
        },
        {
            name: "Taman Mini Indonesia Indah",
            slug: "tmii",
            city: "Jakarta Timur",
            province: "DKI Jakarta",
            lat: -6.3024,
            lng: 106.8951,
            catSlug: "budaya-heritage",
            halalScore: 85
        },
        {
            name: "Farm House Lembang",
            slug: "farm-house-lembang",
            city: "Bandung Barat",
            province: "Jawa Barat",
            lat: -6.8327,
            lng: 107.6049,
            catSlug: "alam-taman",
            halalScore: 75
        },
        {
            name: "Candi Prambanan",
            slug: "candi-prambanan",
            city: "Sleman",
            province: "DI Yogyakarta",
            lat: -7.7520,
            lng: 110.4914,
            catSlug: "budaya-heritage",
            halalScore: 65
        },
        {
            name: "Malioboro Street",
            slug: "malioboro",
            city: "Yogyakarta",
            province: "DI Yogyakarta",
            lat: -7.7926,
            lng: 110.3658,
            catSlug: "belanja-retail",
            halalScore: 80
        },
        {
            name: "Tangkuban Perahu",
            slug: "tangkuban-perahu",
            city: "Subang",
            province: "Jawa Barat",
            lat: -6.7596,
            lng: 107.5947,
            catSlug: "alam-taman",
            halalScore: 60
        },
        {
            name: "Kota Tua Jakarta",
            slug: "kota-tua-jakarta",
            city: "Jakarta Barat",
            province: "DKI Jakarta",
            lat: -6.1376,
            lng: 106.8124,
            catSlug: "budaya-heritage",
            halalScore: 70
        }
    ];

    const destinations = [];
    for (const d of destinationsData) {
        const category = categories.find(c => c.slug === d.catSlug);
        const dest = await prisma.destination.create({
            data: {
                name: d.name,
                slug: d.slug,
                categoryId: category!.id,
                city: d.city,
                province: d.province,
                latitude: d.lat,
                longitude: d.lng,
                halalScore: d.halalScore,
                status: ValidationStatus.APPROVED,
                destinationHalalFacilities: {
                    create: facilities.slice(0, Math.floor(Math.random() * 5) + 3).map(f => ({
                        facilityId: f.id
                    }))
                }
            }
        });
        destinations.push(dest);
    }

    // 4. Create UMKMs
    const umkmNames = [
        "Sate Maranggi Berkah", "Nasi Goreng Halal", "Bakso Atom", "Soto Madura Barokah", 
        "Ayam Bakar Madu", "Es Cendol Elizabeth", "Kopi Kenangan Halal", "Martabak Pecenongan",
        "Gudeg Yu Djum", "Sate Klathak Pak Pong", "Bakpia Pathok 25", "Oleh-oleh Bandung",
        "Rumah Makan Padang Sederhana", "Ayam Geprek Bensu", "Steak Nusantara", "Penyetan Cok"
    ];

    const certStatuses = [CertificationStatus.VALID, CertificationStatus.PENDING, CertificationStatus.EXPIRED, CertificationStatus.REVOKED];

    for (let i = 0; i < 40; i++) {
        const dest = destinations[i % destinations.length];
        const status = certStatuses[Math.floor(Math.random() * certStatuses.length)];
        const name = `${umkmNames[i % umkmNames.length]} ${i}`;
        
        await prisma.umkm.create({
            data: {
                name,
                slug: name.toLowerCase().replace(/ /g, '-') + '-' + i,
                owner: "Owner " + i,
                category: { connect: { id: categories[0].id } }, // Kuliner
                destination: { connect: { id: dest.id } },
                address: "Jl. " + dest.city + " No. " + i,
                phone: "0812" + Math.floor(Math.random() * 100000000),
                rating: 3 + Math.random() * 2,
                reviewCount: Math.floor(Math.random() * 100),
                certifications: {
                    create: {
                        certificateNo: "CERT-" + i + "-" + Math.random().toString(36).substring(7).toUpperCase(),
                        issuer: "BPJPH",
                        issuedAt: new Date("2023-01-01"),
                        expiredAt: new Date("2027-01-01"),
                        status: status,
                        validations: {
                            create: {
                                status: status === CertificationStatus.VALID ? ValidationStatus.APPROVED : ValidationStatus.PENDING,
                                notes: "Seeded data",
                                validatedAt: new Date()
                            }
                        }
                    }
                }
            }
        });
    }

    // 5. Create Interactions and Reviews
    console.log("Creating interactions and reviews...");
    const interactionTypes: InteractionType[] = ["VIEW", "SEARCH", "CLICK", "SAVE", "SHARE", "ROUTE"];
    const keywords = ["masjid", "halal", "wisata", "bandung", "jakarta", "makanan"];

    for (const dest of destinations) {
        // Create 20-50 interactions per destination over the last 30 days
        const interactionCount = 20 + Math.floor(Math.random() * 30);
        for (let i = 0; i < interactionCount; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 28));
            
            await prisma.destinationInteraction.create({
                data: {
                    destination: { connect: { id: dest.id } },
                    type: interactionTypes[Math.floor(Math.random() * interactionTypes.length)],
                    keyword: keywords[Math.floor(Math.random() * keywords.length)],
                    createdAt: date
                }
            });
        }

        // Create 3-5 reviews per destination
        const reviewCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < reviewCount; i++) {
            const rating = 3 + Math.floor(Math.random() * 3);
            const review = await prisma.review.create({
                data: {
                    rating,
                    comment: "Wisata yang bagus dan ramah muslim.",
                    destination: { connect: { id: dest.id } },
                    user: {
                        connectOrCreate: {
                            where: { id: "user_seed_" + i },
                            create: {
                                id: "user_seed_" + i,
                                name: "User " + i,
                                email: `user${i}@example.com`,
                                role: "user"
                            }
                        }
                    }
                }
            });

            await prisma.reviewSentiment.create({
                data: {
                    reviewId: review.id,
                    label: rating >= 4 ? SentimentLabel.POSITIVE : SentimentLabel.NEUTRAL,
                    score: rating / 5,
                    keywords: ["bagus", "ramah"]
                }
            });
        }
    }

    console.log("Seeding completed successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
