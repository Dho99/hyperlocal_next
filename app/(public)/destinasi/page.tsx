import Navbar from "@/components/ui/navbar";
import { PublicDestinationList } from "@/components/destinations/public-destination-list";

export const metadata = {
    title: "Destinasi - HyperLocal",
    description:
        "Jelajahi destinasi wisata halal terbaik di Indonesia. Temukan informasi lengkap, rating, dan fasilitas halal.",
};

export default function DestinasiPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-4xl sm:text-5xl font-heading font-bold text-[#1f1635]">
                        Jelajahi Destinasi
                    </h1>
                    <p className="text-lg text-[#494551] max-w-2xl mx-auto">
                        Temukan tempat wisata halal terbaik, dari kuliner hingga
                        penginapan, semua dalam satu platform.
                    </p>
                </div>
                <PublicDestinationList />
            </main>
        </div>
    );
}
