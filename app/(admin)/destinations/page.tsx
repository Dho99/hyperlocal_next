import { getCategories } from "@/lib/services/category-service";
import { DestinationList } from "@/components/admin/destinations/destination-list";
import { AddButton } from "@/components/admin/add-button";
import { CategoryType } from "@/lib/generated/prisma";

export default async function DestinationsPage() {
    const categories = await getCategories(CategoryType.DESTINATION);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading">
                        Daftar Destinasi
                    </h1>
                    <p className="text-muted-foreground">
                        Kelola data destinasi pariwisata halal di daerah Anda.
                    </p>
                </div>
                <AddButton href="/destinations/new" title="Tambah Destinasi" />
            </div>

            <DestinationList categories={categories} />
        </div>
    );
}
