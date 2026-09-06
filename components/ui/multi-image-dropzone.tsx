"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
    Upload,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

interface UploadingFile {
    id: string;
    file: File;
    preview: string;
    progress: number;
    status: "idle" | "uploading" | "success" | "error";
    url?: string;
    error?: string;
}

interface MultiImageDropzoneProps {
    value?: string[];
    onChange?: (urls: string[]) => void;
    folder?: string;
    maxFiles?: number;
    disabled?: boolean;
    className?: string;
}

export function MultiImageDropzone({
    value = [],
    onChange,
    folder = "validations",
    maxFiles = 5,
    disabled = false,
    className,
}: MultiImageDropzoneProps) {
    const [files, setFiles] = useState<UploadingFile[]>([]);

    useEffect(() => {
        // Functional set — hindari closure stale `files` saat parent update via onChange
        setFiles((prev) => {
            const currentUrls = prev
                .filter((f) => f.status === "success" && f.url)
                .map((f) => f.url!);
            const sorted = [...currentUrls].sort();
            const sortedValue = [...(value ?? [])].sort();
            if (JSON.stringify(sorted) === JSON.stringify(sortedValue)) {
                return prev;
            }
            return (value ?? []).map((url) => ({
                id: url,
                file: new File([], url),
                preview: url,
                progress: 100,
                status: "success" as const,
                url,
            }));
        });
    }, [value]);

    const triggerOnChange = useCallback(
        (updated: UploadingFile[]) => {
            const urls = updated
                .filter((f) => f.status === "success" && f.url)
                .map((f) => f.url!);
            onChange?.(urls);
        },
        [onChange],
    );

    const uploadFile = useCallback(
        async (fileObj: UploadingFile) => {
            const formData = new FormData();
            formData.append("file", fileObj.file);

            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileObj.id
                        ? { ...f, status: "uploading" as const }
                        : f,
                ),
            );

            try {
                const res = await fetch(`/api/upload?folder=${folder}`, {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json().catch(() => null);

                if (!res.ok || !data?.success) {
                    throw new Error(
                        data?.message || `Upload gagal (${res.status})`,
                    );
                }

                const url = data.data.path as string;
                const oldPreview = fileObj.preview;
                setFiles((prev) => {
                    const next = prev.map((f) =>
                        f.id === fileObj.id
                            ? {
                                  ...f,
                                  status: "success" as const,
                                  url,
                                  progress: 100,
                              }
                            : f,
                    );
                    // Blob lokal tak lagi dipakai setelah URL cloudinary ada — revoke agar tak leak
                    if (oldPreview.startsWith("blob:")) {
                        queueMicrotask(() => URL.revokeObjectURL(oldPreview));
                    }
                    // setState updater async — propagate via microtask agar state flush dulu
                    queueMicrotask(() => triggerOnChange(next));
                    return next;
                });
            } catch (err) {
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === fileObj.id
                            ? {
                                  ...f,
                                  status: "error" as const,
                                  error:
                                      (err as Error).message || "Upload gagal",
                              }
                            : f,
                    ),
                );
            }
        },
        [folder, triggerOnChange],
    );

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            // Slot tersisa dari state render saat ini; hanya file yang masuk kuota yang di-upload
            // (hindari orphan upload dari file ter-slice maxFiles=5)
            const available = Math.max(0, maxFiles - files.length);
            const capped = acceptedFiles.slice(0, available);
            if (capped.length === 0) return;
            const toUpload: UploadingFile[] = capped.map((file) => ({
                id: `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`,
                file,
                preview: URL.createObjectURL(file),
                progress: 0,
                status: "idle" as const,
            }));
            setFiles((prev) => [...prev, ...toUpload].slice(0, maxFiles));
            toUpload.forEach((f) => uploadFile(f));
        },
        [maxFiles, files.length, uploadFile],
    );

    const removeFile = useCallback(
        async (id: string) => {
            const fileToRemove = files.find((f) => f.id === id);
            if (fileToRemove?.url) {
                try {
                    await fetch("/api/upload", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url: fileToRemove.url }),
                    });
                } catch {
                    // ignore delete errors
                }
            }

            const updated = files.filter((f) => f.id !== id);
            setFiles(updated);
            triggerOnChange(updated);

            if (
                fileToRemove?.preview &&
                fileToRemove.preview.startsWith("blob:")
            ) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
        },
        [files, triggerOnChange],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
        multiple: true,
        maxFiles: maxFiles - files.length,
        disabled: disabled || files.length >= maxFiles,
    });

    const existingCount = files.filter(
        (f) => f.status === "success" && f.url,
    ).length;

    return (
        <div className={cn("space-y-3", className)}>
            {existingCount < maxFiles && !disabled && (
                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-4 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-center group",
                        isDragActive
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-xs font-medium">
                        {isDragActive
                            ? "Lepaskan file"
                            : "Klik atau seret gambar"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                        {maxFiles - existingCount} file tersisa
                    </p>
                </div>
            )}

            {files.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            className="relative aspect-square rounded-md overflow-hidden bg-muted border group"
                        >
                            {file.status === "success" && file.url ? (
                                <Image
                                    src={file.url}
                                    alt="evidence"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <Image
                                    src={file.preview}
                                    alt="preview"
                                    fill
                                    unoptimized
                                    className="object-cover opacity-60"
                                />
                            )}

                            {file.status === "uploading" && (
                                <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center gap-1">
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                    <span className="text-[10px] text-muted-foreground">
                                        {file.progress}%
                                    </span>
                                </div>
                            )}

                            {file.status === "success" && (
                                <div className="absolute top-1 right-1">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 drop-shadow-sm" />
                                </div>
                            )}

                            {file.status === "error" && (
                                <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center">
                                    <AlertCircle className="h-5 w-5 text-destructive" />
                                </div>
                            )}

                            <button
                                type="button"
                                className="absolute top-1 left-1 h-5 w-5 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeFile(file.id)}
                            >
                                <X className="h-3 w-3" />
                            </button>

                            {file.status === "uploading" && (
                                <div className="absolute bottom-0 left-0 right-0">
                                    <Progress
                                        value={file.progress}
                                        className="h-1 rounded-none"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {files.length === 0 && (
                <div className="flex items-center justify-center gap-2 p-3 rounded-md bg-muted/30 border border-dashed">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                        Belum ada bukti foto
                    </span>
                </div>
            )}
        </div>
    );
}
