import { getCategories } from "@/lib/services/category-service";
import { CategoryList } from "@/components/admin/categories/category-list";
import { CategoryForm } from "@/components/admin/categories/category-form";
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";

export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight font-heading">Manajemen Kategori</h1>
                <p className="text-muted-foreground">
                    Kelola kategori untuk destinasi dan UMKM pariwisata halal.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <Card className="border-none shadow-sm ring-1 ring-border/50">
                        <CardHeader>
                            <CardTitle className="font-heading">Tambah Kategori</CardTitle>
                            <CardDescription>Buat kategori baru untuk klasifikasi data.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CategoryForm />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card className="border-none shadow-sm ring-1 ring-border/50">
                        <CardHeader>
                            <CardTitle className="font-heading">Daftar Kategori</CardTitle>
                            <CardDescription>Daftar semua kategori yang tersedia dalam sistem.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CategoryList initialCategories={categories} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
