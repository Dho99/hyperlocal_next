import Link from "next/link";
import { Map as MapIcon } from "lucide-react";
import { SectionHeading } from "@/components/public/home/section-heading";
import { formatNumber } from "@/fitur/data/landing-data";
import { EmptyState } from "./empty-state";

interface CategoryWithCounts {
    id: string;
    name: string;
    description: string | null;
    _count: {
        destinations: number;
        umkms: number;
    };
}

interface CategoriesSectionProps {
    categories: CategoryWithCounts[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
    return (
        <section
            className="mx-auto max-w-7xl scroll-mt-20 px-4 py-10 sm:px-6 lg:px-8"
            id="categories"
        >
            <SectionHeading
                action="Lihat Destinasi"
                actionHref="/destinasi"
                eyebrow={`${formatNumber(categories.length)} kategori aktif dari database.`}
                title="Kategori Destinasi"
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categories.length ? (
                    categories.map((category) => (
                        <Link
                            className="rounded-xl border border-[#cbc4d2]/60 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            href={`/destinasi?category=${category.id}`}
                            key={category.id}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex size-11 items-center justify-center rounded-lg bg-[#e9ddff] text-[#4f378a]">
                                    <MapIcon className="size-5" />
                                </div>
                                <span className="text-xs font-bold text-[#4f378a]">
                                    {formatNumber(
                                        category._count.destinations,
                                    )}{" "}
                                    lokasi
                                </span>
                            </div>
                            <h3 className="mt-4 font-heading text-lg font-bold">
                                {category.name}
                            </h3>
                            <p className="mt-2 text-sm text-[#494551]">
                                {category.description ||
                                    `${formatNumber(category._count.umkms)} UMKM terkait kategori ini.`}
                            </p>
                        </Link>
                    ))
                ) : (
                    <EmptyState message="Belum ada kategori di database." />
                )}
            </div>
        </section>
    );
}
