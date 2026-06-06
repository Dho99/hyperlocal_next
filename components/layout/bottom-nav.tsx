"use client";

import { Home, Map, Compass, User, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const bottomNavItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Destinasi", href: "/destinasi", icon: Map },
    { label: "Kuliner", href: "/umkm", icon: Store },
    { label: "Peta", href: "/peta", icon: Compass },
    { label: "Profile", href: "/profile", icon: User },
] as const;

function isActive(pathname: string, href: string): boolean {
    if (href === "/") return pathname === "/";
    if (href === "/destinasi")
        return pathname === "/destinasi" || pathname.startsWith("/destinasi/");
    if (href === "/umkm")
        return pathname === "/umkm" || pathname.startsWith("/umkm/");
    return pathname.startsWith(href);
}

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-xl bg-white/80 px-4 py-2 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur-lg md:hidden">
            {bottomNavItems.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex flex-col items-center justify-center gap-0.5 px-4 py-1 text-xs font-medium transition active:scale-90 ${
                            active
                                ? "rounded-full bg-emerald-100 text-emerald-900"
                                : "text-stone-600 hover:text-emerald-900"
                        }`}
                    >
                        <Icon className="size-5" />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
