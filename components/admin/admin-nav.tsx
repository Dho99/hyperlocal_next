"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    MapPin,
    CheckCircle,
    Store,
    ShieldCheck,
    BarChart3,
    Settings,
    ChevronRight,
    ChevronDown,
} from "lucide-react";

export const navItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Destinasi",
        href: "/destinations",
        icon: MapPin,
        subItems: [
            {
                title: "Daftar Destinasi",
                href: "/destinations",
            },
            {
                title: "Manajemen Kategori",
                href: "/destinations/categories",
            },
        ],
    },
    {
        title: "Fasilitas",
        href: "/facilities",
        icon: CheckCircle,
    },
    {
        title: "UMKM",
        href: "/umkms",
        icon: Store,
        subItems: [
            {
                title: "Daftar UMKM",
                href: "/umkms",
            },
            {
                title: "Manajemen Kategori",
                href: "/umkms/categories",
            },
        ],
    },
    {
        title: "Validasi",
        href: "/validations",
        icon: ShieldCheck,
    },
    {
        title: "Statistik",
        href: "/statistics",
        icon: BarChart3,
    },
    {
        title: "Pengaturan",
        href: "/settings",
        icon: Settings,
    },
];

interface AdminNavProps {
    onItemClick?: () => void;
}

export function AdminNav({ onItemClick }: AdminNavProps) {
    const pathname = usePathname();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const isRouteActive = (href: string) =>
        pathname === href || pathname.startsWith(`${href}/`);

    useEffect(() => {
        const activeParent = navItems.find((item) =>
            item.subItems?.some(
                (sub) =>
                    pathname === sub.href ||
                    pathname?.startsWith(`${sub.href}/`),
            ),
        );
        if (activeParent) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setExpandedItems((prev) =>
                prev.includes(activeParent.title)
                    ? prev
                    : [...prev, activeParent.title],
            );
        }
    }, [pathname]);

    const toggleExpand = (title: string) => {
        setExpandedItems((prev) =>
            prev.includes(title)
                ? prev.filter((t) => t !== title)
                : [...prev, title],
        );
    };

    return (
        <nav className="grid items-start gap-3 px-0 py-0">
            {navItems.map((item) => {
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isExpanded =
                    expandedItems.includes(item.title) ||
                    isRouteActive(item.href);
                const isParentActive =
                    isRouteActive(item.href) ||
                    (hasSubItems &&
                        item.subItems?.some((sub) => isRouteActive(sub.href)));
                const isDirectActive = pathname === item.href;

                return (
                    <div key={item.title} className="flex flex-col gap-1">
                        {hasSubItems ? (
                            <button
                                onClick={() => toggleExpand(item.title)}
                                className={cn(
                                    "group flex w-full items-center justify-between rounded-lg px-5 py-4 text-left text-xl font-medium transition-all duration-200",
                                    isParentActive
                                        ? "bg-[#6750a4] text-white"
                                        : "text-white/35 hover:bg-white/10 hover:text-white/80",
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon
                                        className={cn(
                                            "h-6 w-6 shrink-0 transition-colors",
                                            isParentActive
                                                ? "text-white"
                                                : "group-hover:text-white/80",
                                        )}
                                    />
                                    <span>{item.title}</span>
                                </div>
                                {isExpanded ? (
                                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                                ) : (
                                    <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                                )}
                            </button>
                        ) : (
                            <Link
                                href={item.href}
                                onClick={onItemClick}
                                className={cn(
                                    "group flex items-center justify-between rounded-lg px-5 py-4 text-xl font-medium transition-all duration-200",
                                    isDirectActive
                                        ? "bg-[#6750a4] text-white shadow-sm"
                                        : "text-white/35 hover:bg-white/10 hover:text-white/80",
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon
                                        className={cn(
                                            "h-6 w-6 shrink-0 transition-colors",
                                            isDirectActive
                                                ? "text-white"
                                                : "group-hover:text-white/80",
                                        )}
                                    />
                                    <span>{item.title}</span>
                                </div>
                            </Link>
                        )}

                        {hasSubItems && isExpanded && (
                            <div className="mb-1 ml-6 mt-1 flex flex-col gap-1 border-l border-white/15 pl-3">
                                {item.subItems?.map((subItem) => {
                                    const isSubActive =
                                        pathname === subItem.href;

                                    return (
                                        <Link
                                            key={subItem.href}
                                            href={subItem.href}
                                            onClick={onItemClick}
                                            className={cn(
                                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                                                isSubActive
                                                    ? "bg-[#6750a4] text-white shadow-sm"
                                                    : "text-white/35 hover:bg-white/10 hover:text-white/80",
                                            )}
                                        >
                                            {subItem.title}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
