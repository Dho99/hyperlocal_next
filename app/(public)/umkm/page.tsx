import { UmkmList } from "@/components/public/umkm/umkm-list";

interface UmkmPageProps {
    searchParams: Promise<{
        search?: string;
        category?: string;
    }>;
}

export default async function UmkmPage({ searchParams }: UmkmPageProps) {
    const { search, category } = await searchParams;

    return (
        <div className="min-h-screen bg-background">
            <UmkmList initialSearch={search} initialCategory={category} />
        </div>
    );
}
