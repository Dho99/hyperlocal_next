import Link from "next/link";
import { AdminNav } from "./admin-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function AdminSidebar() {
    return (
        <aside className="hidden border-r bg-card/50 backdrop-blur-sm lg:block lg:w-72 lg:flex-none">
            <div className="flex h-full flex-col">
                <div className="flex h-16 items-center px-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground text-xs">H</span>
                        </div>
                        <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Hyperlocal
                        </span>
                    </Link>
                </div>
                <Separator />
                <ScrollArea className="flex-1">
                    <div className="py-2">
                        <AdminNav />
                    </div>
                </ScrollArea>
                <div className="p-4 mt-auto border-t bg-muted/30">
                    <div className="flex items-center gap-3 px-2 py-1.5 text-xs text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span>Admin System Active</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
