import { ImportForm } from "./components/import-form";

export const metadata = {
  title: "Import Data",
};

export default function ImportPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading">Import Data</h1>
        <p className="text-muted-foreground">
          Unduh template Excel, isi data, lalu upload untuk import massal destinasi, UMKM, atau penginapan.
        </p>
      </div>

      <ImportForm />
    </div>
  );
}
