import { PublicDestinationList } from "@/components/destinations/public-destination-list";
import { getCategories } from "@/lib/services/category-service";

export const metadata = {
    title: "Destinasi",
    description:
        "Jelajahi destinasi wisata halal terbaik di Indonesia. Temukan informasi lengkap, rating, dan fasilitas halal.",
};

export default async function DestinasiPage() {
    const categories = await getCategories("DESTINATION");

    return (
        <div className="min-h-screen bg-background">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-16 pb-12">
                <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                    <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground">
                        Jelajahi Destinasi
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Temukan tempat wisata halal terbaik, dari kuliner hingga
                        penginapan, semua dalam satu platform.
                    </p>
                </div>
                <PublicDestinationList categories={categories} />
            </main>
        </div>
    );
}
