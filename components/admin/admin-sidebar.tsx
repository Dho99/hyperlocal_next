"use client";

import { AdminNav } from "./admin-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { LogoutDialog } from "./logout-dialog";
import { BrandLogo } from "../ui/brand-logo";

export function AdminSidebar() {
    return (
        <aside className="hidden bg-sidebar text-sidebar-foreground lg:block lg:w-64 lg:flex-none">
            <div className="flex h-full flex-col">
                <div className="flex h-20 items-center border-b border-white/10 px-4">
                    <div className="flex h-14 w-full min-w-0 items-center">
                        <BrandLogo
                            className="min-w-0 [&_img]:max-w-full [&_img]:h-12"
                            size="lg"
                            priority
                            src="/logo/safar_admin_dark.png"
                            width={2000}
                            height={448}
                        />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="px-2.5 py-4">
                        <AdminNav />
                    </div>
                </ScrollArea>
                <div className="mt-auto space-y-2 border-t border-sidebar-border p-3">
                    <div className="flex items-center gap-3 px-2 py-1.5 text-xs text-sidebar-foreground/55">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span>Admin System Active</span>
                    </div>
                    <LogoutDialog>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-3 text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
