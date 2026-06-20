import { PublicAccommodationList } from "@/components/accommodations/public-accommodation-list";

export const metadata = {
    title: "Penginapan",
    description: "Temukan penginapan ramah muslim terbaik di Indonesia.",
};

export default function PenginapanPage() {
    return (
        <div className="min-h-screen bg-background">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground">
                        Cari Penginapan
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Temukan penginapan ramah muslim dengan fasilitas halal
                        terbaik untuk perjalanan Anda.
                    </p>
                </div>
                <PublicAccommodationList />
            </main>
        </div>
    );
}
