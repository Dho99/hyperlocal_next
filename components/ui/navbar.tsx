"use client";

import { Bell, Compass, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { label: "Home", href: "/" },
    { label: "Destinasi", href: "/destinasi" },
    { label: "Kuliner", href: "/umkm" },
    { label: "Penginapan", href: "/penginapan" },
    { label: "Peta", href: "/peta" },
] as const;

export default function Navbar() {
    const pathname = usePathname();

    function isActive(item: (typeof navItems)[number]) {
        if (item.href === "/") {
            return pathname === "/";
        }
        if (item.href.startsWith("/#")) {
            return pathname === "/";
        }
        if (item.href === "/destinasi") {
            return (
                pathname === "/destinasi" || pathname.startsWith("/destinasi/")
            );
        }
        if (item.href === "/umkm") {
            return pathname === "/umkm" || pathname.startsWith("/umkm/");
        }
        if (item.href === "/penginapan") {
            return pathname === "/penginapan" || pathname.startsWith("/penginapan/");
        }
        return pathname.startsWith(item.href);
    }

    return (
        <header className="sticky top-0 z-50 border-b border-white/40 bg-white/65 shadow-sm backdrop-blur-xl">
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link
                    className="font-heading text-xl font-bold text-emerald-900"
                    href="/"
                >
                    HyperLocal
                </Link>
                <div className="hidden items-center gap-2 rounded-full bg-white/55 p-1 text-sm font-medium text-stone-600 shadow-inner ring-1 ring-stone-200/50 md:flex">
                    {navItems.map((item) => {
                        const active = isActive(item);
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`rounded-full px-4 py-2 transition ${
                                    active
                                        ? "bg-emerald-100 text-emerald-900 font-semibold shadow-sm"
                                        : "hover:bg-emerald-50 hover:text-emerald-900"
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
                <div className="hidden items-center gap-4 text-stone-600 md:flex">
                    <Bell className="size-4" />
                    <Compass className="size-4" />
                    <div className="size-8 overflow-hidden rounded-full bg-emerald-100">
                        <Image
                            alt="Profil pengguna"
                            height={64}
                            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=128&q=80"
                            width={64}
                        />
                    </div>
                </div>
                {/* <Link
                    aria-label="Buka menu"
                    className="rounded-full border border-[#cbc4d2] bg-white/70 p-2 text-[#4f378a] hidden"
                    href="#"
                >
                    <Menu className="size-5" />
                </Link> */}
            </nav>
        </header>
    );
}
