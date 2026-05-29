import Navbar from "@/components/ui/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <div className="pb-16 md:pb-0">{children}</div>
            <BottomNav />
        </>
    );
}
