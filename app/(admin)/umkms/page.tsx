import { AddButton } from "@/components/admin/add-button";
import { UmkmList } from "@/components/admin/umkms/umkm-list";
import { getCategories } from "@/lib/services/category-service";
import { CategoryType } from "@/lib/generated/prisma";

export default async function UmkmsPage() {
    const categories = await getCategories(CategoryType.UMKM);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight font-heading">
                        Manajemen UMKM
                    </h1>
                    <p className="text-muted-foreground">
                        Kelola data Usaha Mikro Kecil Menengah dan status
                        sertifikasi halal.
                    </p>
                </div>
                <AddButton href="/umkms/new" title="Tambah UMKM" />
            </div>

            <UmkmList categories={categories} />
        </div>
    );
}
