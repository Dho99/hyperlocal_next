"use client";

import { Search, Bell, User, LogOut, Menu, Plus, Settings } from "lucide-react";
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
import { authClient } from "@/lib/auth-client"; // I will create this file next
import { useRouter } from "next/navigation";

export function AdminTopbar({ user }: { user: any }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login");
                },
            },
        });
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
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
                        <SheetTitle className="text-left font-bold text-xl">
                            Hyperlocal
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
                    <span className="text-primary-foreground text-[10px]">
                        H
                    </span>
                </div>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md items-center relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Cari destinasi, UMKM, atau data..."
                    className="w-full bg-muted/40 pl-9 rounded-full focus-visible:ring-primary/20"
                />
            </div>

            <div className="flex items-center gap-3 ml-auto">
                <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex gap-2 rounded-full px-4 border-dashed border-primary/50 text-primary hover:bg-primary/5"
                >
                    <Plus className="h-4 w-4" />
                    <span className="text-xs font-semibold">Data Baru</span>
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full hover:bg-muted"
                >
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
                </Button>

                <div className="h-8 w-px bg-border mx-1" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative h-10 w-10 rounded-full p-0"
                        >
                            <Avatar className="h-9 w-9 border shadow-sm transition-transform hover:scale-105">
                                <AvatarImage
                                    src={user?.image}
                                    alt={user?.name}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {user?.name?.charAt(0).toUpperCase() || "A"}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-56"
                        align="end"
                        forceMount
                    >
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
                        <DropdownMenuItem
                            className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Keluar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
