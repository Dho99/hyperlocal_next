import { DestinationDetail } from "@/components/admin/destinations/destination-detail";

interface DestinationPageProps {
    params: Promise<{ id: string }>;
}

export default async function DestinationPage({ params }: DestinationPageProps) {
    const { id } = await params;

    return (
        <div className="space-y-8">
            <DestinationDetail id={id} />
        </div>
    );
}
