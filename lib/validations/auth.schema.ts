import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email({ message: "Email tidak valid" }),
    password: z.string().min(1, { message: "Password wajib diisi" }),
});

export const registerSchema = z
    .object({
        name: z.string().min(2, { message: "Nama minimal 2 karakter" }),
        email: z.string().email({ message: "Email tidak valid" }),
        password: z.string().min(8, { message: "Password minimal 8 karakter" }),
        confirmPassword: z.string(),
        terms: z.boolean().refine((val) => val === true, {
            message: "Anda harus menyetujui Syarat & Ketentuan",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Konfirmasi password tidak cocok",
        path: ["confirmPassword"],
    });
