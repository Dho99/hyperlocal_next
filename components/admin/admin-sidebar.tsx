"use client";

import Image from "next/image";
import { AdminNav } from "./admin-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { LogoutDialog } from "./logout-dialog";

export function AdminSidebar() {
    return (
        <aside className="hidden bg-emerald-900 text-white lg:block lg:w-64 lg:flex-none">
            <div className="flex h-full flex-col">
                <div className="flex h-16 items-center border-b border-white/10 px-5">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <div className="bg-white w-10 h-10 flex justify-center items-center rounded-md">
                          <Image
                              src="/logo/Logo_Mobile.png"
                              alt=""
                              width={677}
                              height={838}
                              priority
                              className="h-9 w-7 shrink-0 object-contain"
                          />
                        </div>
                        <span className="truncate font-heading text-base font-extrabold leading-none text-white">
                            Safar
                        </span>
                    </div>
                </div>
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
