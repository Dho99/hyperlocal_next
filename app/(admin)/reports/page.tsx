import { ReportListClient } from "@/components/admin/reports/report-list-client";

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading">
          Laporan Pengguna
        </h1>
        <p className="text-muted-foreground">
          Kelola laporan masalah dari pengguna terkait destinasi, UMKM, dan penginapan.
        </p>
      </div>

      <ReportListClient />
    </div>
  );
}
