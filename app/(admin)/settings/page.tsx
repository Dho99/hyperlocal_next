import Link from "next/link";
import { Calculator, UserRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
    const settings = [
        { href: "/settings/profile", title: "Profil Admin", description: "Kelola nama, foto profil, dan kata sandi akun.", icon: UserRound },
        { href: "/settings/acesh", title: "Bobot Scoring ACES-H", description: "Atur bobot ACES, Hyperlocal, Evidence, dan komposisi skor akhir.", icon: Calculator },
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
            </div>
        </div>
    );
}
