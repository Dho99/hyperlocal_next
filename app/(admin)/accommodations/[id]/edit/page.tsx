import { getAccommodation } from "@/lib/services/accommodation-service";
import { AccommodationForm } from "../../components/accommodation-form";
import type { Accommodation } from "@/types/accommodation";
import { notFound } from "next/navigation";

interface EditAccommodationPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditAccommodationPage({ params }: EditAccommodationPageProps) {
    const { id } = await params;
    const accommodation = await getAccommodation(id);

    if (!accommodation) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading">
                    Edit Penginapan
                </h1>
                <p className="text-muted-foreground">
                    Perbarui informasi untuk penginapan {accommodation.name}.
                </p>
            </div>
            <AccommodationForm
                initialData={accommodation as Accommodation}
            />
        </div>
    );
}
