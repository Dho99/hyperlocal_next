"use client";

import {
    ShieldCheck,
    Compass,
    Sparkles,
    Search,
    Map,
    Landmark,
    Utensils,
    Hotel,
    type LucideProps,
} from "lucide-react";
import type { Reason, Step, Faq } from "./landing";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

type IconType = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

export const reasons: Reason[] = [
    {
        title: "Data Terverifikasi",
        copy: "Destinasi diperkaya status validasi, skor kesiapan halal, rating, dan fasilitas pendukung dari database.",
        icon: ShieldCheck,
    },
    {
        title: "Informasi Lokal",
        copy: "Kategori, kota, UMKM, dan aktivitas pengguna dirangkum dari data operasional yang terus bertambah.",
        icon: Compass,
    },
    {
        title: "Ramah Muslim",
        copy: "Fasilitas seperti tempat ibadah, kuliner halal, dan penginapan ditampilkan sesuai relasi yang tersedia.",
        icon: Sparkles,
    },
];

export const steps: Step[] = [
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
        icon: Map,
    },
];

export const facilityDefinitions: Array<{ title: string; icon: IconType }> = [
    { title: "Fasilitas Halal", icon: Landmark },
    { title: "UMKM Terdata", icon: Utensils },
    { title: "Sertifikasi Valid", icon: ShieldCheck },
    { title: "Destinasi Approved", icon: Hotel },
];

export const faqs: Faq[] = [
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
