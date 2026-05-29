import { getCategories } from "@/lib/services/category-service";
import { UmkmForm } from "@/components/admin/umkms/umkm-form";
import { CategoryType } from "@/lib/generated/prisma";

export default async function NewUmkmPage() {
  const categories = await getCategories(CategoryType.UMKM);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight font-heading">
          Tambah UMKM Baru
        </h1>
        <p className="text-muted-foreground">
          Daftarkan UMKM baru ke dalam sistem pariwisata halal.
        </p>
      </div>

      <UmkmForm categories={categories} />
    </div>
  );
}
