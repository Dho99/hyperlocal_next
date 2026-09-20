import { PenilaianList } from "@/components/admin/penilaian/penilaian-list";

export default function PenilaianPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight font-heading sm:text-3xl">
                    Penilaian Destinasi
                </h1>
                <p className="text-muted-foreground">
                    Tinjau dan hapus komentar penilaian survey ACES-H dari
                    traveller.
                </p>
            </div>
            <PenilaianList />
        </div>
    );
}
