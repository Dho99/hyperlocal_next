import { ValidationPendingAccommodationList } from "./validation-pending-list";

export default function ValidasiPenginapanPage() {
    return (
        <div className="flex flex-col gap-6 p-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-stone-900">
                    Validasi Penginapan
                </h1>
                <p className="text-sm text-stone-500">
                    Tinjau dan validasi data penginapan yang menunggu persetujuan.
                </p>
            </div>

            <ValidationPendingAccommodationList />
        </div>
    );
}
