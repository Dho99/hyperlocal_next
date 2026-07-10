"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  Download,
  Upload,
  FileSpreadsheet,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ImportResult } from "@/lib/services/import-service";

type ImportType = "destination" | "umkm" | "accommodation" | "facility";

const TYPE_LABELS: Record<ImportType, string> = {
  destination: "Destinasi",
  umkm: "UMKM",
  accommodation: "Penginapan",
  facility: "Fasilitas",
};

interface TabState {
  file: File | null;
  loading: boolean;
  result: ImportResult | null;
}

const initialTabState = (): TabState => ({
  file: null,
  loading: false,
  result: null,
});

export function ImportForm() {
  const [activeTab, setActiveTab] = useState<ImportType>("destination");
  const [states, setStates] = useState<Record<ImportType, TabState>>({
    destination: initialTabState(),
    umkm: initialTabState(),
    accommodation: initialTabState(),
    facility: initialTabState(),
  });

  const updateState = (type: ImportType, patch: Partial<TabState>) => {
    setStates((prev) => ({ ...prev, [type]: { ...prev[type], ...patch } }));
  };

  const handleDrop = useCallback(
    (type: ImportType) => (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (!file.name.endsWith(".xlsx")) {
        toast.error("Hanya file .xlsx yang diterima");
        return;
      }
      updateState(type, { file, result: null });
    },
    []
  );

  const { getRootProps: getDestRootProps, getInputProps: getDestInputProps, isDragActive: isDestDrag } =
    useDropzone({ onDrop: handleDrop("destination"), accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] }, multiple: false });
  const { getRootProps: getUmkmRootProps, getInputProps: getUmkmInputProps, isDragActive: isUmkmDrag } =
    useDropzone({ onDrop: handleDrop("umkm"), accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] }, multiple: false });
  const { getRootProps: getAccRootProps, getInputProps: getAccInputProps, isDragActive: isAccDrag } =
    useDropzone({ onDrop: handleDrop("accommodation"), accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] }, multiple: false });
  const { getRootProps: getFacRootProps, getInputProps: getFacInputProps, isDragActive: isFacDrag } =
    useDropzone({ onDrop: handleDrop("facility"), accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"] }, multiple: false });

  const dropzoneProps: Record<
    ImportType,
    { getRootProps: () => object; getInputProps: () => object; isDragActive: boolean }
  > = {
    destination: { getRootProps: getDestRootProps, getInputProps: getDestInputProps, isDragActive: isDestDrag },
    umkm: { getRootProps: getUmkmRootProps, getInputProps: getUmkmInputProps, isDragActive: isUmkmDrag },
    accommodation: { getRootProps: getAccRootProps, getInputProps: getAccInputProps, isDragActive: isAccDrag },
    facility: { getRootProps: getFacRootProps, getInputProps: getFacInputProps, isDragActive: isFacDrag },
  };

  const downloadTemplate = async (type: ImportType) => {
    try {
      const res = await fetch(`/api/admin/import/template?type=${type}`);
      if (!res.ok) throw new Error("Gagal mengunduh template");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `template-import-${TYPE_LABELS[type].toLowerCase()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Gagal mengunduh template");
    }
  };

  const handleImport = async (type: ImportType) => {
    const state = states[type];
    if (!state.file) {
      toast.error("Pilih file terlebih dahulu");
      return;
    }

    updateState(type, { loading: true, result: null });

    try {
      const formData = new FormData();
      formData.append("file", state.file);
      formData.append("type", type);

      const res = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });

      const data: ImportResult = await res.json();

      if (!res.ok) {
        toast.error((data as { error?: string }).error ?? "Gagal memproses import");
        updateState(type, { loading: false });
        return;
      }

      updateState(type, { loading: false, result: data });

      if (data.inserted > 0) {
        toast.success(
          `${data.inserted} dari ${data.total} data ${TYPE_LABELS[type].toLowerCase()} berhasil diimport`
        );
      } else {
        toast.error("Tidak ada data yang berhasil diimport");
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengimport data");
      updateState(type, { loading: false });
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ImportType)}>
      <TabsList className="grid w-full grid-cols-4 max-w-xl">
        <TabsTrigger value="destination">Destinasi</TabsTrigger>
        <TabsTrigger value="umkm">UMKM</TabsTrigger>
        <TabsTrigger value="accommodation">Penginapan</TabsTrigger>
        <TabsTrigger value="facility">Fasilitas</TabsTrigger>
      </TabsList>

      {(["destination", "umkm", "accommodation", "facility"] as ImportType[]).map((type) => {
        const state = states[type];
        const dz = dropzoneProps[type];

        return (
          <TabsContent key={type} value={type} className="mt-6 space-y-6">
            {/* Step 1: Download template */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">1. Unduh Template</CardTitle>
                    <CardDescription className="mt-1">
                      Unduh template Excel, isi data {TYPE_LABELS[type].toLowerCase()}, lalu upload kembali.
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => downloadTemplate(type)}>
                    <Download className="mr-2 h-4 w-4" />
                    Template {TYPE_LABELS[type]}
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Step 2: Upload file */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">2. Upload File</CardTitle>
                <CardDescription>Upload file .xlsx yang sudah diisi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  {...dz.getRootProps()}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
                    dz.isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
                  }`}
                >
                  <input {...dz.getInputProps()} />
                  {state.file ? (
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium">{state.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(state.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateState(type, { file: null, result: null });
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <FileUp className="mb-3 h-10 w-10 text-muted-foreground/50" />
                      <p className="text-sm font-medium">
                        {dz.isDragActive ? "Lepaskan file di sini" : "Drag & drop file .xlsx"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        atau klik untuk memilih file
                      </p>
                    </>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleImport(type)}
                    disabled={!state.file || state.loading}
                  >
                    {state.loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Data
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Result */}
            {state.result && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">3. Hasil Import</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {state.result.inserted} berhasil diimport
                      </span>
                    </div>
                    {state.result.errors.length > 0 && (
                      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {state.result.errors.length} baris gagal
                        </span>
                      </div>
                    )}
                  </div>

                  {state.result.errors.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-muted-foreground">
                        Detail kesalahan:
                      </p>
                      <div className="rounded-md border overflow-auto max-h-64">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-20">Baris</TableHead>
                              <TableHead>Kolom</TableHead>
                              <TableHead>Pesan</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {state.result.errors.map((err, i) => (
                              <TableRow key={i}>
                                <TableCell>
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {err.row}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm">{err.field}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {err.message}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
