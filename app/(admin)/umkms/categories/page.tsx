import { CategoryList } from "@/components/admin/categories/category-list";
import { CategoryForm } from "@/components/admin/categories/category-form";
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import { CategoryType } from "@/lib/generated/prisma";

export default async function UmkmCategoriesPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight font-heading">Manajemen Kategori UMKM</h1>
                <p className="text-muted-foreground">
                    Kelola kategori khusus untuk UMKM pariwisata halal.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <Card className="border-none shadow-sm ring-1 ring-border/50">
                        <CardHeader>
                            <CardTitle className="font-heading">Tambah Kategori</CardTitle>
                            <CardDescription>Buat kategori baru untuk UMKM.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CategoryForm type={CategoryType.UMKM} />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card className="border-none shadow-sm ring-1 ring-border/50">
                        <CardHeader>
                            <CardTitle className="font-heading">Daftar Kategori</CardTitle>
                            <CardDescription>Daftar semua kategori UMKM yang tersedia.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CategoryList type={CategoryType.UMKM} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
