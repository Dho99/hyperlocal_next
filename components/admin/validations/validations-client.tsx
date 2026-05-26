"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ValidationForm } from "./validation-form";
import type {
    HalalCertification,
    ValidationStatus,
} from "@/lib/generated/prisma";

export function ValidationsClient() {
    const [validations, setValidations] = useState<HalalCertification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedValidation, setSelectedValidation] =
        useState<HalalCertification | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchValidations = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/validations");
            const data = await res.json();
            if (data.success) {
                setValidations(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch validations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadValidations = async () => {
            await fetchValidations();
        };

        void loadValidations();
    }, []);

    const handleReview = (validation: HalalCertification) => {
        setSelectedValidation(validation);
        setIsDialogOpen(true);
    };

    const handleSuccess = () => {
        setIsDialogOpen(false);
        setSelectedValidation(null);
        fetchValidations();
    };

    const getStatusBadge = (status: ValidationStatus) => {
        switch (status) {
            case "PENDING":
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-600 border-yellow-200"
                    >
                        Pending
                    </Badge>
                );
            case "APPROVED":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-600 border-green-200"
                    >
                        Approved
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-50 text-red-600 border-red-200"
                    >
                        Rejected
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (loading && validations.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed">
                <p className="text-sm text-muted-foreground italic">
                    Memuat data...
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[200px]">
                                ID Sertifikasi
                            </TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Tgl Pengajuan</TableHead>
                            <TableHead>Tgl Validasi</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {validations.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    Belum ada data validasi.
                                </TableCell>
                            </TableRow>
                        ) : (
                            validations.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-mono text-xs">
                                        {item.certificateNo}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(
                                            item.status as ValidationStatus,
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {format(
                                            new Date(item.createdAt),
                                            "dd MMM yyyy",
                                            { locale: id },
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {item.createdAt
                                            ? format(
                                                  new Date(item.createdAt),
                                                  "dd MMM yyyy",
                                                  { locale: id },
                                              )
                                            : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleReview(item)}
                                        >
                                            Tinjau
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Tinjau Validasi Halal</DialogTitle>
                        <DialogDescription>
                            Tentukan status validasi untuk sertifikasi ini.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedValidation && (
                        <ValidationForm
                            validationId={selectedValidation.id}
                            defaultValues={{
                                status: selectedValidation.status as ValidationStatus,
                                notes: selectedValidation.notes,
                            }}
                            onSuccess={handleSuccess}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
