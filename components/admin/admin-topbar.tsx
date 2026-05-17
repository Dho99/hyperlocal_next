"use client";

import { Search, Bell, User, LogOut, Menu, Settings, HelpCircle, Grid3X3 } from "lucide-react";
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
        <header className="sticky top-0 z-30 flex h-20 items-center border-b border-[#cbc4d2] bg-[#fdf7ff] px-6">
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
                <SheetContent side="left" className="w-[300px] p-0">
                    <SheetHeader className="h-16 flex items-center px-6 border-b">
                        <SheetTitle className="text-left font-bold text-xl font-heading">
                            HalalAdmin
                        </SheetTitle>
                    </SheetHeader>
                    <div className="py-2">
                        <AdminNav onItemClick={() => setIsMobileOpen(false)} />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Logo for mobile only */}
            <div className="flex lg:hidden items-center gap-2 mr-4">
                <div className="h-7 w-7 rounded bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-[10px] font-heading">
                        HA
                    </span>
                </div>
            </div>

            <h2 className="hidden min-w-[280px] font-heading text-3xl font-semibold tracking-tight text-[#1d1b20] lg:block">
                Pariwisata Halal
            </h2>

            {/* Desktop Search */}
            <div className="relative hidden max-w-[560px] flex-1 items-center md:flex">
                <Search className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#494551]" />
                <Input
                    type="search"
                    placeholder="Cari destinasi, UMKM..."
                    className="h-12 w-full rounded-full border-[#cbc4d2] bg-[#f2ecf4] pl-14 text-lg text-[#494551] shadow-none focus-visible:ring-primary/20"
                />
            </div>

            <div className="ml-auto flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full hover:bg-[#f2ecf4]"
                >
                    <Bell className="h-6 w-6 text-[#1d1b20]" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-[#f2ecf4]"
                >
                    <HelpCircle className="h-6 w-6 text-[#1d1b20]" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-[#f2ecf4]"
                >
                    <Grid3X3 className="h-6 w-6 text-[#1d1b20]" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative h-11 w-11 rounded-full p-0"
                        >
                            <Avatar className="h-10 w-10 border border-[#cbc4d2] shadow-sm transition-transform hover:scale-105">
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
