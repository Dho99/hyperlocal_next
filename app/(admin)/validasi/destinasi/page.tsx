import { Suspense } from "react";
import { ValidationsClient } from "@/components/admin/validations/validations-client";

export default function ValidationsPage() {
    return (
        <div className="flex flex-col gap-6 p-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Validasi Destinasi
                </h1>
                <p className="text-muted-foreground">
                    Kelola dan tinjau permintaan validasi destinasi wisata halal.
                </p>
            </div>

            <Suspense
                fallback={
                    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed">
                        <p className="text-sm text-muted-foreground italic">
                            Memuat data validasi...
                        </p>
                    </div>
                }
            >
                <ValidationsClient />
            </Suspense>
        </div>
    );
}
