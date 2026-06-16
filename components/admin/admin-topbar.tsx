"use client";

import {
    Search,
    Bell,
    User,
    LogOut,
    Menu,
    Settings,
    HelpCircle,
    Grid3X3,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { AdminNav } from "./admin-nav";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoutDialog } from "./logout-dialog";
import { BrandLogo } from "@/components/ui/brand-logo";

interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
}

export function AdminTopbar({ user }: { user: User }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const router = useRouter();
    void router;

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-[#d7e5dc] bg-[#f7fbf8] px-4">
            {/* Mobile Sidebar */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden mr-2"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent
                    side="left"
                    className="w-[280px] gap-0 border-emerald-800 bg-emerald-900 p-0 text-white"
                >
                    <SheetHeader className="flex h-16 items-center border-b border-white/10 px-4">
                        <SheetTitle className="sr-only">Menu Admin</SheetTitle>
                        <div className="overflow-hidden py-1.5">
                            <BrandLogo
                                className="[&>span]:text-sm"
                                size="sm"
                                variant="light"
                            />
                        </div>
                    </SheetHeader>
                    <div className="py-3">
                        <AdminNav onItemClick={() => setIsMobileOpen(false)} />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Logo for mobile only */}
            <div className="mr-4 flex min-w-0 items-center gap-2 lg:hidden">
                <BrandLogo size="sm" />
            </div>

            {/* <h2 className="hidden min-w-[280px] font-heading text-3xl font-semibold tracking-tight text-[#1d1b20] lg:block">
                Pariwisata Halal
            </h2> */}

            {/* Desktop Search */}
            <div className="relative hidden max-w-[460px] flex-1 items-center md:flex">
                <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#494551]" />
                <Input
                    type="search"
                    placeholder="Cari destinasi, UMKM..."
                    className="h-9 w-full rounded-full border-[#cfe0d6] bg-[#eef7f2] pl-10 text-sm text-[#3f4f47] shadow-none focus-visible:ring-primary/20"
                />
            </div>

            <div className="ml-auto flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full hover:bg-[#eef7f2]"
                >
                    <Bell className="h-4.5 w-4.5 text-[#1d1b20]" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-[#eef7f2]"
                >
                    <HelpCircle className="h-4.5 w-4.5 text-[#1d1b20]" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-[#eef7f2]"
                >
                    <Grid3X3 className="h-4.5 w-4.5 text-[#1d1b20]" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative h-9 w-9 rounded-full p-0"
                        >
                            <Avatar className="h-8 w-8 border border-[#cfe0d6] shadow-sm transition-transform hover:scale-105">
                                <AvatarImage
                                    src={user?.image ?? undefined}
                                    alt={user?.name}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {user?.name?.charAt(0).toUpperCase() || "A"}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-semibold leading-none">
                                    {user?.name}
                                </p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-accent">
                            <User className="h-4 w-4" />
                            <span>Profil Admin</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-accent">
                            <Settings className="h-4 w-4" />
                            <span>Pengaturan Akun</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <LogoutDialog>
                            <DropdownMenuItem
                                className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                                onSelect={(e) => e.preventDefault()}
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Keluar</span>
                            </DropdownMenuItem>
                        </LogoutDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
