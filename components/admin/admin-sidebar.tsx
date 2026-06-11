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
        <aside className="hidden bg-emerald-900 text-white lg:block lg:w-64 lg:flex-none">
            <div className="flex h-full flex-col">
                <div className="flex h-16 items-start px-4 pt-4">
                    <Link
                        href="/dashboard"
                        className="flex w-full min-w-0 items-center overflow-hidden py-1.5"
                        aria-label="Dashboard"
                    >
                        <BrandLogo
                            className="min-w-0 gap-2 [&>img]:h-8 [&>img]:w-7 [&>span]:text-xs"
                            size="sm"
                            priority
                            variant="light"
                        />
                    </Link>
                </div>
                <Separator className="bg-white/10" />
                <ScrollArea className="flex-1">
                    <div className="px-2.5 py-4">
                        <AdminNav />
                    </div>
                </ScrollArea>
                <div className="mt-auto space-y-2 border-t border-white/20 p-3">
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
