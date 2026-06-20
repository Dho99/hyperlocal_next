import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
}

interface AdminLayoutProps {
    children: React.ReactNode;
    user: User;
}

export function AdminLayout({ children, user }: AdminLayoutProps) {
    return (
        <div className="admin-scale flex h-dvh bg-background">
            <AdminSidebar />
            <div className="flex flex-1 flex-col relative">
                <AdminTopbar user={user} />
                <main className="flex-1 overflow-y-auto px-4 py-5 md:px-5 lg:px-6">
                    <div className="mx-auto w-full max-w-[1360px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
                <footer className="border-t border-border bg-background/60 px-6 py-4 text-center text-xs text-muted-foreground">
                    <p>
                        &copy; {new Date().getFullYear()}. All rights reserved.
                    </p>
                </footer>
            </div>
        </div>
    );
}
