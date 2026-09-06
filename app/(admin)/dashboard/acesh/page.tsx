import { AceshDashboardClient } from "@/components/admin/acesh/acesh-dashboard-client";

export default function AceshDashboardPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading">Dashboard ACES-H</h1>
                <p className="text-sm text-muted-foreground">Rekap kesiapan destinasi berdasarkan Model SAFAR ACES-H — filter siap/belum, terverifikasi/pending, dan distribusi klasifikasi.</p>
            </div>
            <AceshDashboardClient />
        </div>
    );
}
