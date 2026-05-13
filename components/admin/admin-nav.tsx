"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
    LayoutDashboard, 
    MapPin, 
    CheckCircle, 
    Store, 
    ShieldCheck, 
    BarChart3, 
    Settings,
    ChevronRight
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
    },
    {
        title: "Fasilitas Halal",
        href: "/halal-facilities",
        icon: CheckCircle,
    },
    {
        title: "UMKM",
        href: "/umkms",
        icon: Store,
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

    return (
        <nav className="grid items-start gap-2 px-2 py-4">
            {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onItemClick}
                        className={cn(
                            "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                            isActive 
                                ? "bg-primary text-primary-foreground shadow-sm" 
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={cn(
                                "h-4 w-4 shrink-0 transition-colors",
                                isActive ? "text-primary-foreground" : "group-hover:text-foreground"
                            )} />
                            <span>{item.title}</span>
                        </div>
                        {isActive && <ChevronRight className="h-3 w-3 opacity-50" />}
                    </Link>
                );
            })}
        </nav>
    );
}
