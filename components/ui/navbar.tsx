"use client";

import { Bookmark, Lock, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { InstallButton } from "@/components/pwa/install-button";
import { BrandLogo } from "@/components/ui/brand-logo";

const navItems = [
    { label: "Home", href: "/" },
    { label: "Destinasi", href: "/destinasi" },
    { label: "UMKM", href: "/umkm" },
    { label: "Penginapan", href: "/penginapan" },
    { label: "Peta", href: "/peta" },
] as const;

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = authClient.useSession();

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
            return (
                pathname === "/penginapan" ||
                pathname.startsWith("/penginapan/")
            );
        }
        return pathname.startsWith(item.href);
    }

    const user = session?.user;

    return (
        <header className="sticky top-0 z-50 border-b border-white/40 bg-white/65 shadow-sm backdrop-blur-xl">
            <nav className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                {/* Brand Logo - Left Aligned */}
                <div className="flex flex-1 items-center justify-start">
                    <Link
                        className="flex shrink-0 items-center"
                        href="/"
                        aria-label="Beranda"
                    >
                        <BrandLogo priority size="md" />
                    </Link>
                </div>

                {/* Main Navigation - Truly Centered */}
                <div className="hidden items-center gap-1 rounded-full bg-white/55 p-1 text-sm font-medium text-stone-600 shadow-inner ring-1 ring-stone-200/50 md:flex">
                    {navItems.map((item) => {
                        const active = isActive(item);
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`rounded-full px-4 py-2 transition-all duration-200 ${active
                                        ? "bg-emerald-100 text-emerald-900 font-semibold shadow-sm"
                                        : "hover:bg-emerald-50 hover:text-emerald-900"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Right Side Items - Right Aligned */}
                <div className="flex flex-1 items-center justify-end gap-3 text-stone-600">
                    <div className="hidden items-center gap-3 md:flex">
                        <InstallButton />
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="size-8 overflow-hidden rounded-full bg-emerald-100 ring-2 ring-transparent transition-all hover:ring-emerald-300 focus-visible:ring-emerald-500"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage
                                                src={user.image ?? undefined}
                                                alt={user.name}
                                            />
                                            <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-semibold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage
                                                    src={user.image ?? undefined}
                                                    alt={user.name}
                                                />
                                                <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-semibold">
                                                    {user.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <p className="text-sm font-semibold text-stone-800">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-stone-500">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        asChild
                                        className="cursor-pointer gap-2.5 py-2.5 focus:bg-emerald-50 focus:text-emerald-950"
                                    >
                                        <Link href="/profile?tab=edit">
                                            <User className="h-4 w-4" />
                                            <span>Profil Saya</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        asChild
                                        className="cursor-pointer gap-2.5 py-2.5 focus:bg-emerald-50 focus:text-emerald-950"
                                    >
                                        <Link href="/profile?tab=password">
                                            <Lock className="h-4 w-4" />
                                            <span>Ubah Password</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        asChild
                                        className="cursor-pointer gap-2.5 py-2.5 focus:bg-emerald-50 focus:text-emerald-950"
                                    >
                                        <Link href="/profile?tab=saved">
                                            <Bookmark className="h-4 w-4" />
                                            <span>Destinasi Tersimpan</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        variant="destructive"
                                        className="cursor-pointer gap-2.5 py-2.5"
                                        onClick={() =>
                                            authClient.signOut().then(() => {
                                                router.replace("/");
                                            })
                                        }
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Keluar</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link
                                href="/halal"
                                className="size-9 overflow-hidden rounded-full bg-emerald-100 ring-2 ring-transparent transition-all hover:ring-emerald-300"
                            >
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-bold">
                                        ?
                                    </AvatarFallback>
                                </Avatar>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}
