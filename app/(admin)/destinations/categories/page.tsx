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

export default async function CategoriesPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading">Manajemen Kategori Destinasi</h1>
                <p className="text-muted-foreground">
                    Kelola kategori khusus untuk destinasi pariwisata halal.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <Card className="border-none shadow-sm ring-1 ring-border/50">
                        <CardHeader>
                            <CardTitle className="font-heading">Tambah Kategori</CardTitle>
                            <CardDescription>Buat kategori baru untuk destinasi.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CategoryForm type={CategoryType.DESTINATION} />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card className="border-none shadow-sm ring-1 ring-border/50">
                        <CardHeader>
                            <CardTitle className="font-heading">Daftar Kategori</CardTitle>
                            <CardDescription>Daftar semua kategori destinasi yang tersedia.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CategoryList type={CategoryType.DESTINATION} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
