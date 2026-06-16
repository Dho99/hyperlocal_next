import { FacilitiesTable } from "./components/facility-table";

export default function FacilitiesPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight font-heading">
                        Manajemen Fasilitas
                    </h1>
                    <p className="text-muted-foreground">
                        Kelola data master fasilitas halal yang tersedia di
                        berbagai destinasi.
                    </p>
                </div>
            </div>

            <FacilitiesTable />
        </div>
    );
}
