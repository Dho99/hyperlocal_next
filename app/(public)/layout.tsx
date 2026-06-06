import Navbar from "@/components/ui/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <div className="pb-16 md:pb-0">{children}</div>
            <InstallPrompt />
            <BottomNav />
        </>
    );
}
