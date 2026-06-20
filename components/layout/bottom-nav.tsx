"use client";

import { Home, Map, Compass, User, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const bottomNavItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Destinasi", href: "/destinasi", icon: Map },
    { label: "UMKM", href: "/umkm", icon: Store },
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
        <nav className="fixed bottom-0 left-0 z-50 grid w-full grid-cols-5 items-center rounded-t-2xl bg-[var(--navbar-bg)] py-2 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur-lg md:hidden">
            {bottomNavItems.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                    <Link
                        key={item.label}
                        href={item.href}
                        className="flex flex-col items-center justify-center"
                    >
                        <div
                            className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 transition active:scale-95 ${
                                active
                                    ? "rounded-xl bg-[var(--navbar-active)]/10 text-[var(--navbar-active)]"
                                    : "text-[var(--navbar-text)] hover:text-[var(--navbar-active)]"
                            }`}
                        >
                            <Icon className={`size-5 ${active ? "stroke-[2.5px]" : "stroke-2"}`} />
                            <span className="text-[10px] font-semibold tracking-tight uppercase">
                                {item.label}
                            </span>
                        </div>
                    </Link>
                );
            })}
        </nav>
    );
}
