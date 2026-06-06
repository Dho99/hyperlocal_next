import { getReports } from "@/lib/services/report-service";
import { ReportListClient } from "@/components/admin/reports/report-list-client";

export default async function ReportsPage() {
  const reports = await getReports();

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight font-heading">
          Laporan Pengguna
        </h1>
        <p className="text-muted-foreground">
          Kelola laporan masalah dari pengguna terkait destinasi, UMKM, dan penginapan.
        </p>
      </div>

      <ReportListClient initialReports={JSON.parse(JSON.stringify(reports))} />
    </div>
  );
}
