"use client";

import Link from "next/link";
import { AdminNav } from "./admin-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { LogoutDialog } from "./logout-dialog";
import { BrandLogo } from "@/components/ui/brand-logo";

export function AdminSidebar() {
    return (
        <aside className="hidden bg-emerald-900 text-white lg:block lg:w-80 lg:flex-none">
            <div className="flex h-full flex-col">
                <div className="flex h-24 items-start px-8 pt-10">
                    <Link
                        href="/dashboard"
                        className="flex items-center"
                    >
                        <BrandLogo className="rounded-md bg-white/95 p-1.5" size="lg" />
                    </Link>
                </div>
                <Separator className="bg-white/10" />
                <ScrollArea className="flex-1">
                    <div className="px-3 py-8">
                        <AdminNav />
                    </div>
                </ScrollArea>
                <div className="mt-auto space-y-4 border-t border-white/20 p-5">
                    <div className="flex items-center gap-3 px-2 py-1.5 text-xs text-white/55">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span>Admin System Active</span>
                    </div>
                    <LogoutDialog>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-3 text-white/55 hover:bg-white/10 hover:text-white"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Keluar</span>
                        </Button>
                    </LogoutDialog>
                </div>
            </div>
        </aside>
    );
}
