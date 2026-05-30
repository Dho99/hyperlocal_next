import { getAccommodations } from "@/lib/services/accommodation-service";
import { AccommodationList } from "@/components/admin/accommodations/accommodation-list";
import { AddButton } from "@/components/admin/add-button";

export default async function AccommodationsPage() {
    const accommodations = await getAccommodations();

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight font-heading">
                        Daftar Penginapan
                    </h1>
                    <p className="text-muted-foreground">
                        Kelola data penginapan ramah muslim.
                    </p>
                </div>
                <AddButton href="/accommodations/new" title="Tambah Penginapan" />
            </div>

            <AccommodationList initialAccommodations={accommodations} />
        </div>
    );
}
