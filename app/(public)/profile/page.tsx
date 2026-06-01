"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
    User,
    Lock,
    Bookmark,
    Camera,
    Loader2,
    X,
    MapPin,
    AlertCircle,
    BookOpen,
    Calendar,
    Trash2,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TABS = [
    { key: "profil", label: "Profil Saya", icon: User },
    { key: "password", label: "Ubah Password", icon: Lock },
    { key: "saved", label: "Tersimpan", icon: Bookmark },
    { key: "my-itinerary", label: "Rencana Saya", icon: Calendar },
] as const;

const basicInfoSchema = z.object({
    name: z.string().min(1, "Nama tidak boleh kosong"),
});

const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
        newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
        confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Password tidak cocok",
        path: ["confirmPassword"],
    });

interface SavedItem {
    id: string;
    name: string;
    slug: string;
    type: "DESTINASI" | "UMKM";
    subtitle: string;
    imageUrl: string | null;
    savedAt: string;
}

function ProfilePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") || "profil";
    const { data: session, isPending: sessionPending } =
        authClient.useSession();

    const isValidTab = TABS.some((t) => t.key === activeTab);
    const currentTab = isValidTab ? activeTab : "profil";

    useEffect(() => {
        if (!sessionPending && !session) {
            router.push("/user/login");
        }
    }, [session, sessionPending, router]);

    if (sessionPending || !session) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-stone-50">
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="font-heading text-3xl font-bold text-stone-800">
                        Pengaturan Profil
                    </h1>
                    <p className="mt-1 text-stone-500">
                        Kelola informasi akun dan favorit Anda.
                    </p>
                </div>

                <div className="mb-8 flex gap-1 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-stone-200/60">
                    {TABS.map((tab) => {
                        const active = currentTab === tab.key;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() =>
                                    router.push(`/profile?tab=${tab.key}`)
                                }
                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                                    active
                                        ? "bg-emerald-100 text-emerald-900 shadow-sm"
                                        : "text-stone-600 hover:bg-stone-50 hover:text-stone-800"
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {currentTab === "profil" && <ProfilTab user={session.user} />}
                {currentTab === "password" && <PasswordTab />}
                {currentTab === "saved" && <SavedTab />}
                {currentTab === "my-itinerary" && <MyItineraryTab />}
            </div>
        </main>
    );
}

export default function ProfilePage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[60vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
            }
        >
            <ProfilePageContent />
        </Suspense>
    );
}

function ProfilTab({
    user,
}: {
    user: { name: string; email: string; image?: string | null };
}) {
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof basicInfoSchema>>({
        resolver: zodResolver(basicInfoSchema),
        defaultValues: { name: user.name },
    });

    const handleAvatarSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (
                ![
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "image/webp",
                ].includes(file.type)
            ) {
                toast.error(
                    "Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.",
                );
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Ukuran gambar maksimal 5MB.");
                return;
            }

            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        },
        [],
    );

    const onSubmit = useCallback(
        async (values: z.infer<typeof basicInfoSchema>) => {
            setIsSubmitting(true);
            try {
                let imageUrl: string | null | undefined = user.image;

                if (avatarFile) {
                    const formData = new FormData();
                    formData.append("file", avatarFile);
                    const res = await fetch("/api/upload?folder=users", {
                        method: "POST",
                        body: formData,
                    });
                    const uploadResult = await res.json();
                    if (!res.ok || !uploadResult.success) {
                        throw new Error(
                            uploadResult.message || "Gagal mengunggah gambar",
                        );
                    }
                    imageUrl = uploadResult.data.url;
                }

                await authClient.updateUser({
                    name: values.name,
                    image: imageUrl ?? undefined,
                });

                toast.success("Profil berhasil diperbarui");
            } catch (err: unknown) {
                toast.error(
                    err instanceof Error ? err.message : "Terjadi kesalahan",
                );
            } finally {
                setIsSubmitting(false);
            }
        },
        [avatarFile, user.image],
    );

    const displayImage = avatarPreview ?? user.image;

    return (
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-stone-800">
                    Informasi Dasar
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                    Perbarui nama dan foto profil Anda.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center gap-5">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="relative group size-20 shrink-0 rounded-full overflow-hidden bg-emerald-50 border-2 border-dashed border-stone-300 hover:border-emerald-400 transition-colors"
                    >
                        {displayImage ? (
                            <Image
                                src={displayImage}
                                alt="Avatar"
                                fill
                                className="object-cover"
                                sizes="80px"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <User className="size-8 text-stone-400" />
                            </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                            <Camera className="size-5 text-white" />
                        </div>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAvatarSelect}
                    />
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-stone-700">
                            Foto Profil
                        </p>
                        <p className="text-xs text-stone-500">
                            Klik untuk mengganti. Format: JPG, PNG, WebP. Maks:
                            5MB.
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name" className="text-stone-700">
                        Nama Lengkap
                    </Label>
                    <Input
                        id="name"
                        {...form.register("name")}
                        className="border-stone-300 focus-visible:ring-emerald-500"
                    />
                    {form.formState.errors.name && (
                        <p className="text-xs text-rose-600">
                            {form.formState.errors.name.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-stone-700">
                        Email
                    </Label>
                    <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="border-stone-300 bg-stone-50 cursor-not-allowed text-stone-500"
                    />
                    <p className="text-xs text-stone-500">
                        Email tidak dapat diubah.
                    </p>
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                    {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Simpan Perubahan
                </Button>
            </form>
        </div>
    );
}

function PasswordTab() {
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof changePasswordSchema>>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = useCallback(
        async (values: z.infer<typeof changePasswordSchema>) => {
            setError(null);
            setIsSubmitting(true);
            try {
                await authClient.changePassword({
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                });
                toast.success("Password berhasil diubah");
                form.reset();
            } catch (err: unknown) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Password saat ini salah";
                setError(message);
                toast.error(message);
            } finally {
                setIsSubmitting(false);
            }
        },
        [form],
    );

    return (
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-stone-800">
                    Ubah Password
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                    Gunakan kata sandi yang kuat dan berbeda dari sebelumnya.
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-stone-700">
                        Password Saat Ini
                    </Label>
                    <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Masukkan password saat ini"
                        {...form.register("currentPassword")}
                        className="border-stone-300 focus-visible:ring-emerald-500"
                    />
                    {form.formState.errors.currentPassword && (
                        <p className="text-xs text-rose-600">
                            {form.formState.errors.currentPassword.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-stone-700">
                        Password Baru
                    </Label>
                    <Input
                        id="newPassword"
                        type="password"
                        placeholder="Minimal 8 karakter"
                        {...form.register("newPassword")}
                        className="border-stone-300 focus-visible:ring-emerald-500"
                    />
                    {form.formState.errors.newPassword && (
                        <p className="text-xs text-rose-600">
                            {form.formState.errors.newPassword.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-stone-700">
                        Konfirmasi Password Baru
                    </Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Ulangi password baru"
                        {...form.register("confirmPassword")}
                        className="border-stone-300 focus-visible:ring-emerald-500"
                    />
                    {form.formState.errors.confirmPassword && (
                        <p className="text-xs text-rose-600">
                            {form.formState.errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                    {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Ubah Password
                </Button>
            </form>
        </div>
    );
}

function SavedTab() {
    const [items, setItems] = useState<SavedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetch("/api/user/profile/saved")
            .then((res) => res.json())
            .then((json) => {
                if (json.data) setItems(json.data);
            })
            .catch(() => toast.error("Gagal memuat item tersimpan"))
            .finally(() => setLoading(false));
    }, []);

    const handleRemove = useCallback(
        async (item: SavedItem) => {
            setRemovingIds((prev) => new Set(prev).add(item.id));
            const prev = items;
            setItems((prevItems) => prevItems.filter((i) => i.id !== item.id));

            try {
                const res = await fetch("/api/track", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        targetId: item.id,
                        targetType: item.type,
                        actionType: "BOOKMARK",
                    }),
                });

                if (!res.ok) throw new Error("Gagal menghapus");
                toast.success(`${item.name} dihapus dari tersimpan`);
            } catch {
                setItems(prev);
                toast.error("Gagal menghapus bookmark");
            } finally {
                setRemovingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(item.id);
                    return next;
                });
            }
        },
        [items],
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="rounded-xl border border-stone-200 bg-white p-12 shadow-sm">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
                        <BookOpen className="h-8 w-8 text-stone-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-stone-700">
                            Belum Ada Item Tersimpan
                        </h3>
                        <p className="mt-1 text-sm text-stone-500">
                            Jelajahi destinasi atau UMKM dan klik ikon bookmark
                            untuk menyimpannya.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => (window.location.href = "/destinasi")}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white"
                        >
                            Jelajahi Destinasi
                        </Button>
                        <Button
                            onClick={() => (window.location.href = "/umkm")}
                            variant="outline"
                            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                        >
                            Jelajahi UMKM
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
                const itemHref =
                    item.type === "DESTINASI"
                        ? `/destinasi/${item.slug}`
                        : `/umkm/${item.slug}`;

                return (
                    <div
                        key={item.id}
                        className={`group relative overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-all hover:shadow-md ${
                            removingIds.has(item.id)
                                ? "opacity-50 pointer-events-none"
                                : ""
                        }`}
                    >
                        <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            disabled={removingIds.has(item.id)}
                            className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-stone-500 opacity-0 shadow-sm transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                            aria-label="Hapus dari tersimpan"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <a href={itemHref} className="block">
                            <div className="relative h-40 w-full bg-stone-100">
                                {item.imageUrl ? (
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <MapPin className="h-8 w-8 text-stone-300" />
                                    </div>
                                )}
                                <div className="absolute bottom-2 left-2">
                                    <span className="rounded-md bg-black/60 backdrop-blur-sm px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                                        {item.type}
                                    </span>
                                </div>
                            </div>
                        </a>

                        <div className="p-4">
                            <a href={itemHref}>
                                <h3 className="font-semibold text-stone-800 truncate hover:text-emerald-700 transition-colors">
                                    {item.name}
                                </h3>
                            </a>
                            <p className="mt-0.5 text-sm text-stone-500 truncate">
                                {item.subtitle}
                            </p>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemove(item)}
                                disabled={removingIds.has(item.id)}
                                className="mt-3 w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            >
                                {removingIds.has(item.id) ? (
                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                ) : (
                                    <X className="mr-1 h-3 w-3" />
                                )}
                                Hapus
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

interface ItineraryDestination {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    imageUrl: string | null;
    category: { name: string } | null;
}

interface ItineraryItem {
    id: string;
    dayNumber: number;
    orderIndex: number;
    notes: string | null;
    destination: ItineraryDestination;
}

interface Itinerary {
    id: string;
    title: string;
    city: string | null;
    createdAt: string;
    items: ItineraryItem[];
}

function MyItineraryTab() {
    const [itineraries, setItineraries] = useState<Itinerary[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const fetchItineraries = useCallback(async () => {
        try {
            const res = await fetch("/api/itineraries");
            if (!res.ok) throw new Error("Gagal memuat");
            const json = await res.json();
            setItineraries(json.data || []);
        } catch {
            toast.error("Gagal memuat rencana perjalanan");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItineraries();
    }, [fetchItineraries]);

    const handleDelete = useCallback(async (id: string) => {
        setDeletingIds((prev) => new Set(prev).add(id));
        try {
            const res = await fetch(`/api/itineraries/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Gagal menghapus");
            setItineraries((prev) => prev.filter((i) => i.id !== id));
            toast.success("Rencana berhasil dihapus");
        } catch {
            toast.error("Gagal menghapus rencana");
        } finally {
            setDeletingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    }, []);

    const toggleExpand = useCallback((id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (itineraries.length === 0) {
        return (
            <div className="rounded-xl border border-stone-200 bg-white p-12 shadow-sm">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
                        <Calendar className="h-8 w-8 text-stone-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-stone-700">
                            Belum Ada Rencana Perjalanan
                        </h3>
                        <p className="mt-1 text-sm text-stone-500">
                            Gunakan fitur pencarian di beranda untuk membuat
                            rencana perjalanan.
                        </p>
                    </div>
                    <Button
                        onClick={() => (window.location.href = "/")}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white"
                    >
                        Buat Rencana Sekarang
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {itineraries.map((itin) => {
                const isDeleting = deletingIds.has(itin.id);
                const isExpanded = expandedIds.has(itin.id);
                return (
                    <div
                        key={itin.id}
                        className={`rounded-xl border border-stone-200 bg-white shadow-sm ${
                            isDeleting ? "opacity-50 pointer-events-none" : ""
                        }`}
                    >
                        <div
                            // type="button"
                            onClick={() => toggleExpand(itin.id)}
                            className="flex w-full items-center justify-between p-5 text-left hover:cursor-pointer"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-stone-800 truncate">
                                        {itin.title}
                                    </h3>
                                    <p className="text-sm text-stone-500">
                                        {itin.items.length} destinasi
                                        {itin.city && ` • ${itin.city}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(itin.id);
                                    }}
                                    disabled={isDeleting}
                                    className="text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </Button>
                                {isExpanded ? (
                                    <ChevronUp className="h-5 w-5 text-stone-400" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-stone-400" />
                                )}
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="border-t border-stone-100 px-5 pb-5 pt-3">
                                <div className="space-y-3">
                                    {itin.items.map((item, idx) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-3 rounded-lg bg-stone-50 p-3"
                                        >
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                                                {item.orderIndex}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <a
                                                    href={`/destinasi/${item.destination.slug}`}
                                                    className="font-medium text-stone-800 hover:text-emerald-700 transition-colors"
                                                >
                                                    {item.destination.name}
                                                </a>
                                                {item.destination.city && (
                                                    <p className="text-xs text-stone-500">
                                                        {item.destination.city}
                                                    </p>
                                                )}
                                                {item.notes && (
                                                    <p className="mt-1 text-xs text-stone-600 italic">
                                                        {item.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
