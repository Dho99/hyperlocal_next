import { getUmkm } from "@/lib/services/umkm-service";
import { ReviewForm } from "@/components/public/umkm/review-form";
import { notFound } from "next/navigation";

interface RatingPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function RatingPage({ params }: RatingPageProps) {
    const { id } = await params;
    const umkm = await getUmkm(id, "public");

    if (!umkm) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            <ReviewForm umkm={umkm} />
        </div>
    );
}
