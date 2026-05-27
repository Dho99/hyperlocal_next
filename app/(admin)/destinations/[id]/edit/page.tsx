import { getDestination } from "@/lib/services/destination-service";
import { getCategories } from "@/lib/services/category-service";
import { DestinationForm } from "../../components/destination-form";
import type { Destination } from "@/types/destination";
import { notFound } from "next/navigation";

interface EditDestinationPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditDestinationPage({
    params,
}: EditDestinationPageProps) {
    const { id } = await params;
    const [destination, categories] = await Promise.all([
        getDestination(id),
        getCategories(),
    ]);

    if (!destination) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight font-heading">
                    Edit Destinasi
                </h1>
                <p className="text-muted-foreground">
                    Perbarui informasi untuk destinasi {destination.name}.
                </p>
            </div>

            <DestinationForm
                initialData={destination as Destination}
                categories={categories}
            />
        </div>
    );
}
