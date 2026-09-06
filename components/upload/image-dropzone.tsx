"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import Image from "next/image";

interface ImageDropzoneProps {
    folder:
        | "destinations"
        | "umkm"
        | "users"
        | "validations"
        | "categories"
        | "facilities"
        | "accommodations";
    multiple?: boolean;
    maxFiles?: number;
    onUploadComplete?: (urls: string[]) => void;
    className?: string;
}

interface UploadingFile {
    id: string;
    file: File;
    preview: string;
    progress: number;
    status: "idle" | "uploading" | "success" | "error";
    url?: string;
    error?: string;
}

export function ImageDropzone({
    folder,
    multiple = false,
    maxFiles = 1,
    onUploadComplete,
    className,
}: ImageDropzoneProps) {
    const [files, setFiles] = useState<UploadingFile[]>([]);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const newFiles: UploadingFile[] = acceptedFiles.map((file) => ({
                id: Math.random().toString(36).substring(7),
                file,
                preview: URL.createObjectURL(file),
                progress: 0,
                status: "idle" as const,
            }));

            const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
            setFiles(updatedFiles.slice(0, maxFiles));

            // Auto-upload each file
            newFiles.forEach((fileObj) => {
                uploadFile(fileObj);
            });
        },
        [files, multiple, maxFiles, folder], //eslint-disable-line
    );

    const uploadFile = async (fileObj: UploadingFile) => {
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
            const response = await axios.post(
                `/api/upload?folder=${folder}`,
                formData,
                {
                    onUploadProgress: (progressEvent) => {
                        const progress = progressEvent.total
                            ? Math.round(
                                  (progressEvent.loaded * 100) /
                                      progressEvent.total,
                              )
                            : 0;
                        setFiles((prev) =>
                            prev.map((f) =>
                                f.id === fileObj.id ? { ...f, progress } : f,
                            ),
                        );
                    },
                },
            );

            if (response.data.success) {
                const url = response.data.data.path;
                setFiles((prev) => {
                    const updated = prev.map((f) =>
                        f.id === fileObj.id
                            ? {
                                  ...f,
                                  status: "success" as const,
                                  url,
                                  progress: 100,
                              }
                            : f,
                    );

                    const completedUrls = updated
                        .filter((f) => f.status === "success" && f.url)
                        .map((f) => f.url!);

                    if (onUploadComplete) onUploadComplete(completedUrls);
                    return updated;
                });
            } else {
                throw new Error(response.data.message);
            }
        } catch (error: unknown) {
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileObj.id
                        ? {
                              ...f,
                              status: "error" as const,
                              error:
                                  (error as Error).message || "Upload failed",
                          }
                        : f,
                ),
            );
        }
    };

    const removeFile = async (id: string) => {
        const fileToRemove = files.find((f) => f.id === id);

        if (fileToRemove?.url) {
            try {
                await axios.delete("/api/upload", {
                    data: { url: fileToRemove.url },
                });
            } catch (error) {
                console.error("Failed to delete file from server", error);
            }
        }

        setFiles((prev) => {
            const updated = prev.filter((f) => f.id !== id);
            const completedUrls = updated
                .filter((f) => f.status === "success" && f.url)
                .map((f) => f.url!);
            if (onUploadComplete) onUploadComplete(completedUrls);
            return updated;
        });

        if (fileToRemove?.preview) {
            URL.revokeObjectURL(fileToRemove.preview);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/jpeg": [],
            "image/png": [],
            "image/webp": [],
        },
        multiple,
        maxFiles: maxFiles - files.length,
        disabled: files.length >= maxFiles,
    });

    return (
        <div className={cn("space-y-4", className)}>
            {files.length < maxFiles && (
                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center group",
                        isDragActive
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                        files.length >= maxFiles &&
                            "opacity-50 cursor-not-allowed pointer-events-none",
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium">
                            {isDragActive
                                ? "Lepaskan file di sini"
                                : "Klik atau seret gambar ke sini"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            PNG, JPG atau WebP (Maks. 5MB)
                        </p>
                    </div>
                </div>
            )}

            {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            className="relative group border rounded-lg p-3 flex items-center gap-4 bg-card shadow-sm overflow-hidden"
                        >
                            <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0 border">
                                <Image
                                    src={file.preview}
                                    alt="preview"
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                                {file.status === "uploading" && (
                                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                                <p className="text-sm font-medium truncate pr-6">
                                    {file.file.name}
                                </p>

                                {file.status === "uploading" && (
                                    <div className="space-y-1.5">
                                        <Progress
                                            value={file.progress}
                                            className="h-1.5"
                                        />
                                        <p className="text-[10px] text-muted-foreground">
                                            {file.progress}% mengunggah...
                                        </p>
                                    </div>
                                )}

                                {file.status === "success" && (
                                    <div className="flex items-center gap-1.5 text-green-600">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-medium uppercase tracking-wider">
                                            Selesai
                                        </span>
                                    </div>
                                )}

                                {file.status === "error" && (
                                    <div className="flex items-center gap-1.5 text-destructive">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-medium truncate">
                                            {file.error || "Gagal"}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeFile(file.id)}
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
