"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { registerSchema } from "@/lib/validations/auth.schema";
import type { RegisterFormValues } from "@/types/auth";
import {
  Loader2,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authClient } from "@/lib/auth-client";

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);
    setError(null);

    await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      role: "user",
      fetchOptions: {
        onSuccess: () => {
          setIsSuccess(true);
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        },
        onError: (ctx) => {
          console.log(ctx.error);
          setError(
            ctx.error.message ||
            "Gagal mendaftar. Silakan coba lagi.",
          );
        },
      },
    });

    setIsLoading(false);
  }

  if (isSuccess) {
    return (
      <Card className="border-none shadow-xl ring-1 ring-border/50 text-center p-6">
        <CardContent className="pt-6 space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Pendaftaran Berhasil!
          </CardTitle>
          <CardDescription className="text-base">
            Akun Anda telah berhasil dibuat. Anda akan diarahkan ke
            halaman masuk dalam beberapa detik...
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-xl ring-1 ring-border/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          Daftar Akun User
        </CardTitle>
        <CardDescription>
          Buat akun baru untuk mulai menjelajahi destinasi halal.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CardContent className="space-y-4">
          {error && (
            <Alert
              variant="destructive"
              className="bg-destructive/10 text-destructive border-destructive/20"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Nama Anda"
                className="pl-10 focus-visible:ring-primary/20"
                disabled={isLoading}
                {...form.register("name")}
              />
            </div>
            {form.formState.errors.name && (
              <p className="text-xs font-medium text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="email@anda.com"
                className="pl-10 focus-visible:ring-primary/20"
                disabled={isLoading}
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-xs font-medium text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10 focus-visible:ring-primary/20"
                  disabled={isLoading}
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-xs font-medium text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  className="pl-10 focus-visible:ring-primary/20"
                  disabled={isLoading}
                  {...form.register("confirmPassword")}
                />
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-xs font-medium text-destructive">
                  {
                    form.formState.errors.confirmPassword
                      .message
                  }
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2 pt-2">
              <div className="flex items-center h-5">
                <Controller
                  name="terms"
                  control={form.control}
                  render={({ field }) => (
                    <Checkbox
                      id="terms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  )}
                />
              </div>
              <Label
                htmlFor="terms"
                className="block text-sm font-medium leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Saya menyetujui{" "}
                <Link
                  href="/terms"
                  className="text-primary hover:underline font-semibold"
                >
                  Syarat & Ketentuan
                </Link>{" "}
                dan{" "}
                <Link
                  href="/privacy"
                  className="text-primary hover:underline font-semibold"
                >
                  Kebijakan Privasi
                </Link>
              </Label>
            </div>
            {form.formState.errors.terms && (
              <p className="text-xs font-medium text-destructive pl-6">
                {form.formState.errors.terms.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full font-semibold shadow-md transition-all active:scale-95"
            disabled={isLoading}
          >
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Buat Akun Sekarang
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link
              href={"/login"}
              className="font-semibold text-primary hover:underline"
            >
              Masuk
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}



