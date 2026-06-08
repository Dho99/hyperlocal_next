import { LaporanGenerator } from "@/components/admin/laporan/laporan-generator";

export default function LaporanPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight font-heading">
          Generate Laporan
        </h1>
        <p className="text-muted-foreground">
          Buat laporan data destinasi, UMKM, akomodasi, dan lainnya dalam format CSV, Excel, atau PDF.
        </p>
      </div>

      <LaporanGenerator />
    </div>
  );
}
