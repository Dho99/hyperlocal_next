import {
    ShieldCheck,
    Compass,
    Sparkles,
    Search,
    Map,
    Landmark,
    Utensils,
    Hotel,
    CheckCircle2,
} from "lucide-react";
import type { ComponentType } from "react";

export interface Reason {
    title: string;
    copy: string;
    icon: ComponentType<{ className?: string }>;
}

export interface VerifiedDestination {
    title: string;
    location: string;
    score: string;
    image: string;
}

export interface NearbyPlace {
    title: string;
    distance: string;
    type: string;
    icon: ComponentType<{ className?: string }>;
}

export interface Route {
    title: string;
    meta: string;
    image: string;
}

export interface Step {
    title: string;
    copy: string;
    icon: ComponentType<{ className?: string }>;
}

export interface Facility {
    title: string;
    count: string;
    icon: ComponentType<{ className?: string }>;
}

export interface Faq {
    question: string;
    answer: string;
}

export const destinations = [
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

export const routes: Route[] = [
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

export const reasons: Reason[] = [
    {
        title: "Data Terverifikasi",
        copy: "Setiap destinasi dan fasilitas telah melalui proses verifikasi ketat untuk memastikan standar halal.",
        icon: ShieldCheck,
    },
    {
        title: "Informasi Lokal",
        copy: "Temukan rekomendasi dari warga lokal untuk pengalaman wisata yang otentik dan mendalam.",
        icon: Compass,
    },
    {
        title: "Ramah Muslim",
        copy: "Fasilitas yang disesuaikan untuk kebutuhan wisatawan muslim, mulai dari tempat ibadah hingga makanan.",
        icon: Sparkles,
    },
];

export const verifiedDestinations: VerifiedDestination[] = [
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

export const nearbyPlaces: NearbyPlace[] = [
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

export const steps: Step[] = [
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

export const facilities: Facility[] = [
    { title: "Mushola & Masjid", count: "426 lokasi", icon: Landmark },
    { title: "Restoran Halal", count: "1,120 UMKM", icon: Utensils },
    { title: "Hotel Syariah", count: "318 penginapan", icon: Hotel },
    { title: "Rute Keluarga", count: "84 itinerary", icon: Sparkles },
];

export const faqs: Faq[] = [
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

export const testimonials = [
    { name: "Aisyah R.", initial: "A" },
    { name: "Budi S.", initial: "B" },
    { name: "Dina M.", initial: "D" },
];
