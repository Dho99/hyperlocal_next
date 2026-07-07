"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Send,
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
import { BrandLogo } from "../ui/brand-logo";
import { MailCheck } from "lucide-react";

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup cooldown interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

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
    setRegisteredEmail(values.email);

    await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      role: "user",
      fetchOptions: {
        onSuccess: () => {
          setIsSuccess(true);
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

  async function handleResendVerification() {
    if (!registeredEmail || resendCooldown > 0) return;
    setIsResending(true);
    setResendMsg(null);
    try {
      const res = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registeredEmail,
          callbackURL: "/",
        }),
      });
      if (!res.ok) throw new Error("Gagal mengirim ulang.");
      setResendMsg("Link verifikasi telah dikirim ulang!");
      // Start 60-second cooldown
      setResendCooldown(60);
      cooldownRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setResendMsg("Gagal mengirim ulang. Silakan coba lagi.");
    }
    setIsResending(false);
  }

  if (isSuccess) {
    return (
      <Card className="border-none shadow-xl ring-1 ring-border/50 text-center p-6">
        <CardContent className="pt-6 space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Verifikasi Email Anda
          </CardTitle>
          <CardDescription className="text-base">
            Akun Anda telah berhasil dibuat. Link verifikasi telah dikirim
            ke{" "}
            <span className="font-semibold text-foreground">
              {registeredEmail}
            </span>
            . Cek inbox (dan folder spam) untuk mengaktifkan akun Anda.
          </CardDescription>
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleResendVerification}
            disabled={isResending || resendCooldown > 0}
          >
            {isResending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {resendCooldown > 0
              ? `Kirim Ulang (${resendCooldown}s)`
              : "Kirim Ulang Link Verifikasi"}
          </Button>
          {resendMsg && (
            <p className="text-sm font-medium text-green-600">
              {resendMsg}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-xl ring-1 ring-border/50">
      <CardHeader className="space-y-1">
        <div className="flex justify-center">
          <BrandLogo size="sm" priority />
        </div>
        <div className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            Daftar Akun User
          </CardTitle>
          <CardDescription>
            Buat akun baru untuk mulai menjelajahi destinasi halal.
          </CardDescription>
        </div>
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
              href={"/halal"}
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



