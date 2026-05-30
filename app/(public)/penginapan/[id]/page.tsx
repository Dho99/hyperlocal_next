import { PublicAccommodationDetail } from "@/components/accommodations/public-accommodation-detail";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PenginapanDetailPage({ params }: PageProps) {
    const { id } = await params;
    return <PublicAccommodationDetail id={id} />;
}
