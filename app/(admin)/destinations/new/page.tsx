import { getCategories } from "@/lib/services/category-service";
import { DestinationForm } from "../components/destination-form";
import { CategoryType } from "@/lib/generated/prisma";

export default async function NewDestinationPage() {
    const categories = await getCategories(CategoryType.DESTINATION);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading">Tambah Destinasi Baru</h1>
                <p className="text-muted-foreground">
                    Lengkapi formulir di bawah untuk menambahkan destinasi pariwisata halal baru.
                </p>
            </div>

            <DestinationForm categories={categories} />
        </div>
    );
}
