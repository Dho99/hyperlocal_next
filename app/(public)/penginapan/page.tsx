import { PublicAccommodationList } from "@/components/accommodations/public-accommodation-list";

export const metadata = {
    title: "Penginapan - HyperLocal",
    description: "Temukan penginapan ramah muslim terbaik di Indonesia.",
};

export default function PenginapanPage() {
    return (
        <div className="min-h-screen bg-stone-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-4xl sm:text-5xl font-heading font-bold text-stone-900">
                        Cari Penginapan
                    </h1>
                    <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                        Temukan penginapan ramah muslim dengan fasilitas halal
                        terbaik untuk perjalanan Anda.
                    </p>
                </div>
                <PublicAccommodationList />
            </main>
        </div>
    );
}
