"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
    updateValidationSchema,
    UpdateValidationInput,
} from "@/lib/validations/halal-validation.schema";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ValidationFormProps {
    validationId: string;
    defaultValues: UpdateValidationInput;
    onSuccess: () => void;
}

export function ValidationForm({
    validationId,
    defaultValues,
    onSuccess,
}: ValidationFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<UpdateValidationInput>({
        resolver: zodResolver(updateValidationSchema),
        defaultValues,
    });

    const onSubmit = async (values: UpdateValidationInput) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/validations/${validationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (res.ok) {
                onSuccess();
            } else {
                const errorData = await res.json();
                console.error("Submission error:", errorData);
            }
        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 py-4"
            >
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status Validasi</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="PENDING">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="APPROVED">
                                        Approved
                                    </SelectItem>
                                    <SelectItem value="REJECTED">
                                        Rejected
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Catatan Peninjau</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Masukkan catatan tinjauan di sini... (maks 500 karakter)"
                                    className="resize-none"
                                    rows={4}
                                    {...field}
                                    value={field.value || ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#24005d] hover:bg-[#24005d]/90"
                    >
                        {isSubmitting ? "Menyimpan..." : "Simpan Keputusan"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
