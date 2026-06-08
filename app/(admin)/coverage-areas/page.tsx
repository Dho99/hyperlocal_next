import CoverageAreaListDynamic from "./coverage-area-list-dynamic";

export const metadata = {
  title: "Area Cakupan",
};

export default function CoverageAreasPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-heading">
            Area Cakupan
          </h1>
          <p className="text-muted-foreground">
            Kelola area geografis untuk memfilter destinasi dan UMKM berdasarkan
            wilayah.
          </p>
        </div>
      </div>

      <CoverageAreaListDynamic />
    </div>
  );
}
