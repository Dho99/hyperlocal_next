import { PublicDestinationDetail } from "@/components/destinations/public-destination-detail";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function DestinasiDetailPage({ params }: PageProps) {
    const { id } = await params;
    return <PublicDestinationDetail id={id} />;
}
