import Navbar from "@/components/ui/navbar";
import { ExploreResults } from "@/components/public/explore/explore-results";

interface PageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function ExplorePage({ searchParams }: PageProps) {
    const { q } = await searchParams;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
                <ExploreResults query={q ?? ""} />
            </main>
        </div>
    );
}
