import { AccommodationForm } from "../components/accommodation-form";

export default async function NewAccommodationPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight font-heading">Tambah Penginapan Baru</h1>
                <p className="text-muted-foreground">
                    Lengkapi formulir di bawah untuk menambahkan penginapan ramah muslim baru.
                </p>
            </div>
            <AccommodationForm />
        </div>
    );
}
