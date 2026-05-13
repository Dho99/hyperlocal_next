import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

interface AdminLayoutProps {
    children: React.ReactNode;
    user: any;
}

export function AdminLayout({ children, user }: AdminLayoutProps) {
    return (
        <div className="flex min-h-screen bg-muted/20">
            <AdminSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <AdminTopbar user={user} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
                <footer className="border-t bg-card/50 px-6 py-4 text-center text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Hyperlocal Admin Portal. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}
