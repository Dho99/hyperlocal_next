"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema } from "@/lib/validations/auth.schema";
import type { LoginFormValues } from "@/types/auth";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";
//
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authClient } from "@/lib/auth-client";

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setError(null);

    console.log(values);

    await authClient.signIn.email({
      email: values.email,
      password: values.password,
      fetchOptions: {
        onSuccess: (ctx) => {
          const user = ctx.data.user;
          if (user.role === "admin") {
            router.push("/dashboard");
          } else {
            const redirect =
              new URLSearchParams(window.location.search).get(
                "redirect",
              ) ?? "/";
            router.push(
              redirect.startsWith("/") &&
                !redirect.startsWith("//")
                ? redirect
                : "/",
            );
          }
          router.refresh();
        },
        onError: (ctx) => {
          setError(
            ctx.error.message ||
            "Gagal masuk. Silakan cek email dan password Anda.",
          );
        },
      },
    });

    setIsLoading(false);
  }

  return (
    <Card className="border-none shadow-xl ring-1 ring-border/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Masuk User</CardTitle>
        <CardDescription>
          Masukkan email dan password Anda untuk mulai menjelajah.
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
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={"user@email.com"}
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Lupa password?
              </Link>
            </div>
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
            Masuk Sekarang
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline"
            >
              Daftar Gratis
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
