"use client";

import { useState, useCallback } from "react";
import { format, subDays, startOfMonth, endOfMonth, endOfDay, startOfDay } from "date-fns";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileDown,
  Loader2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/axios";
import type { ReportData, ReportCategory, ExportFormat } from "@/lib/services/export-service";

const categoryOptions: { value: ReportCategory; label: string }[] = [
  { value: "destinations", label: "Data Destinasi" },
  { value: "umkms", label: "Data UMKM" },
  { value: "coverage-areas", label: "Data Cakupan Wilayah" },
  { value: "accommodations", label: "Data Akomodasi" },
  { value: "reviews", label: "Data Ulasan & Sentimen" },
  { value: "interactions", label: "Data Interaksi" },
];

const quickDates = [
  { label: "Hari Ini", days: 0 },
  { label: "7 Hari", days: 7 },
  { label: "30 Hari", days: 30 },
  { label: "90 Hari", days: 90 },
];

export function LaporanGenerator() {
  const today = new Date();
  const [startDate, setStartDate] = useState(
    format(startOfMonth(today), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    format(endOfDay(today), "yyyy-MM-dd").split("T")[0]
  );
  const [selectedCategories, setSelectedCategories] = useState<ReportCategory[]>([
    "destinations",
    "umkms",
  ]);
  const [reportData, setReportData] = useState<ReportData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");

  const toggleCategory = (cat: ReportCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat]
    );
  };

  const handleQuickDate = (days: number) => {
    const end = new Date();
    const start = days === 0 ? endOfDay(end) : subDays(end, days);
    setStartDate(format(startOfDay(start), "yyyy-MM-dd"));
    setEndDate(format(endOfDay(end), "yyyy-MM-dd").split("T")[0]);
  };

  const handleGenerate = useCallback(async () => {
    if (selectedCategories.length === 0) {
      toast.error("Pilih minimal satu kategori data");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Pilih rentang tanggal");
      return;
    }

    setLoading(true);
    setReportData(null);
    setActiveTab("");

    try {
      const res = await api.post("/admin/reports/generate", {
        startDate,
        endDate,
        categories: selectedCategories,
      });
      const result: { data: ReportData[] } = res.data;
      setReportData(result.data);
      if (result.data.length > 0) {
        setActiveTab(result.data[0].category);
      }
      toast.success("Laporan berhasil digenerate");
    } catch {
      toast.error("Gagal generate laporan");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedCategories]);

  const handleExportPdf = useCallback(() => {
    if (!reportData || reportData.length === 0) {
      toast.error("Generate laporan terlebih dahulu");
      return;
    }

    setExporting("pdf");

    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.width;

      doc.setFontSize(18);
      doc.setTextColor("#065F46");
      doc.text("Laporan Data HyperLocal", pageWidth / 2, 15, { align: "center" });

      doc.setFontSize(9);
      doc.setTextColor("#6B7280");
      const periodText = `Periode: ${startDate} — ${endDate}  |  Dicetak: ${new Date().toLocaleDateString("id-ID")}`;
      doc.text(periodText, pageWidth / 2, 22, { align: "center" });

      let y = 28;
      for (const section of reportData) {
        if (y > 190) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor("#065F46");
        doc.text(section.label, 14, y);
        y += 6;

        const headers = section.columns.map((c) => c.label);
        const body = section.rows.map((r) =>
          section.columns.map((c) => {
            const val = r[c.key];
            return val === null || val === undefined ? "" : String(val);
          })
        );

        autoTable(doc, {
          head: [headers],
          body,
          startY: y,
          styles: { fontSize: 6, cellPadding: 1.2 },
          headStyles: { fillColor: [6, 95, 70], textColor: [255, 255, 255], fontStyle: "bold" },
          alternateRowStyles: { fillColor: [243, 244, 246] },
          margin: { left: 10, right: 10 },
        });

        y = (doc as any).lastAutoTable.finalY + 8;
      }

      doc.save(`laporan-hyperlocal-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("PDF berhasil didownload");
    } catch {
      toast.error("Gagal generate PDF");
    } finally {
      setExporting(null);
    }
  }, [reportData, startDate, endDate]);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (!reportData || reportData.length === 0) {
        toast.error("Generate laporan terlebih dahulu");
        return;
      }

      setExporting(format);

      try {
        const res = await api.post(
          "/admin/reports/generate",
          {
            startDate,
            endDate,
            categories: selectedCategories,
            format,
          },
          { responseType: "blob" }
        );

        const blob = new Blob([res.data]);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const header = res.headers["content-disposition"];
        const filename =
          header?.match(/filename="?(.+?)"?$/)?.[1] ??
          `laporan-hyperlocal-${format(new Date(), "yyyy-MM-dd")}.${format === "xlsx" ? "xlsx" : format === "pdf" ? "pdf" : "csv"}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Laporan berhasil diexport");
      } catch {
        toast.error("Gagal export laporan");
      } finally {
        setExporting(null);
      }
    },
    [reportData, startDate, endDate, selectedCategories]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Rentang Tanggal</Label>
            <div className="flex flex-wrap gap-2">
              {quickDates.map((qd) => (
                <Button
                  key={qd.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDate(qd.days)}
                >
                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                  {qd.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="text-xs text-muted-foreground">
                  Tanggal Mulai
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-44"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate" className="text-xs text-muted-foreground">
                  Tanggal Akhir
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-44"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Kategori Data</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoryOptions.map((cat) => (
                <label
                  key={cat.value}
                  className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors has-data-checked:border-emerald-600 has-data-checked:bg-emerald-50 dark:has-data-checked:bg-emerald-950/20"
                >
                  <Checkbox
                    checked={selectedCategories.includes(cat.value)}
                    onCheckedChange={() => toggleCategory(cat.value)}
                  />
                  <span className="text-sm font-medium">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full sm:w-auto gap-2 bg-emerald-700 hover:bg-emerald-800"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            {loading ? "Memproses..." : "Generate Laporan"}
          </Button>
        </CardContent>
      </Card>

      {reportData && reportData.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Export Laporan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleExport("csv")}
                  disabled={exporting !== null}
                  className="gap-2"
                >
                  {exporting === "csv" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 text-green-600" />
                  )}
                  {exporting === "csv" ? "Mengexport..." : "Export CSV"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport("xlsx")}
                  disabled={exporting !== null}
                  className="gap-2"
                >
                  {exporting === "xlsx" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  )}
                  {exporting === "xlsx" ? "Mengexport..." : "Export Excel"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportPdf}
                  disabled={exporting !== null}
                  className="gap-2"
                >
                  {exporting === "pdf" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 text-red-600" />
                  )}
                  {exporting === "pdf" ? "Mengexport..." : "Export PDF"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pratinjau Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 flex-wrap h-auto">
                  {reportData.map((section) => (
                    <TabsTrigger key={section.category} value={section.category}>
                      {section.label}
                      <Badge variant="secondary" className="ml-2">
                        {section.rows.length}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
                {reportData.map((section) => (
                  <TabsContent key={section.category} value={section.category}>
                    <div className="rounded-md border overflow-auto max-h-96">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {section.columns.map((col) => (
                              <TableHead key={col.key} className="whitespace-nowrap text-xs">
                                {col.label}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {section.rows.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={section.columns.length}
                                className="text-center text-muted-foreground py-8"
                              >
                                Tidak ada data untuk periode ini
                              </TableCell>
                            </TableRow>
                          ) : (
                            section.rows.slice(0, 50).map((row, idx) => (
                              <TableRow key={idx}>
                                {section.columns.map((col) => (
                                  <TableCell key={col.key} className="whitespace-nowrap text-xs">
                                    {row[col.key] ?? ""}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {section.rows.length > 50 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Menampilkan 50 dari {section.rows.length} data. Export untuk data lengkap.
                      </p>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
