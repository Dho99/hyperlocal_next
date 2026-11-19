import Link from "next/link";
import { Calculator, ScrollText, UserRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExifValidationSetting } from "@/components/admin/settings/exif-validation-setting";
import { getExifValidationEnabled } from "@/lib/services/photo-validation-settings-service";

export default async function SettingsPage() {
    const isExifValidationEnabled = await getExifValidationEnabled();
    const settings = [
        { href: "/settings/profile", title: "Profil Admin", description: "Kelola nama, foto profil, dan kata sandi akun.", icon: UserRound },
        { href: "/settings/acesh", title: "Bobot Scoring ACES-H", description: "Atur bobot ACES, Hyperlocal, Evidence, dan komposisi skor akhir.", icon: Calculator },
        { href: "/settings/ai-logs", title: "Log AI", description: "Lihat provider, model, status, dan latency setiap request AI.", icon: ScrollText },
    ];

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Pengaturan</h1><p className="mt-1 text-muted-foreground">Kelola akun dan konfigurasi sistem SAFAR.</p></div>
            <div className="grid gap-4 md:grid-cols-2">
                {settings.map((item) => (
                    <Link href={item.href} key={item.href}>
                        <Card className="h-full transition-colors hover:border-primary/50">
                            <CardHeader className="flex-row items-start gap-4"><div className="rounded-lg bg-primary/10 p-3 text-primary"><item.icon className="size-5" /></div><div><CardTitle>{item.title}</CardTitle><CardDescription className="mt-2">{item.description}</CardDescription></div></CardHeader>
                            <CardContent className="text-sm font-medium text-primary">Buka pengaturan →</CardContent>
                        </Card>
                    </Link>
                ))}
                <ExifValidationSetting initialEnabled={isExifValidationEnabled} />
            </div>
        </div>
    );
}
