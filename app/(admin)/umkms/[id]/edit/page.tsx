import { getCategories } from "@/lib/services/category-service";
import { getUmkm } from "@/lib/services/umkm-service";
import { UmkmForm } from "@/components/admin/umkms/umkm-form";
import { notFound } from "next/navigation";
import { CategoryType } from "@/lib/generated/prisma";

interface EditUmkmPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditUmkmPage({ params }: EditUmkmPageProps) {
  const { id } = await params;
  const umkm = await getUmkm(id);
  const categories = await getCategories(CategoryType.UMKM);

  if (!umkm) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading">
          Edit UMKM
        </h1>
        <p className="text-muted-foreground">
          Perbarui informasi untuk UMKM {umkm.name}.
        </p>
      </div>

      <UmkmForm initialData={umkm} categories={categories} />
    </div>
  );
}
