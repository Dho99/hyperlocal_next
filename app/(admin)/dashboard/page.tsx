import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import { 
    MapPin, 
    Store, 
    Users, 
    TrendingUp, 
    CheckCircle2, 
    Clock, 
    AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    const stats = [
        {
            title: "Total Destinasi",
            value: "128",
            description: "+4 bulan ini",
            icon: MapPin,
            color: "text-blue-600",
            bg: "bg-blue-100/50",
        },
        {
            title: "UMKM Terdaftar",
            value: "452",
            description: "+12 bulan ini",
            icon: Store,
            color: "text-green-600",
            bg: "bg-green-100/50",
        },
        {
            title: "Total Pengunjung",
            value: "12.4k",
            description: "+18% dari bulan lalu",
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-100/50",
        },
        {
            title: "Validasi Pending",
            value: "23",
            description: "Membutuhkan perhatian",
            icon: AlertCircle,
            color: "text-amber-600",
            bg: "bg-amber-100/50",
        },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Ringkasan</h1>
                <p className="text-muted-foreground">
                    Selamat datang kembali, Admin. Berikut adalah statistik pariwisata halal hari ini.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="overflow-hidden border-none shadow-sm ring-1 ring-border/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <div className={`rounded-full p-2 ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-none shadow-sm ring-1 ring-border/50">
                    <CardHeader>
                        <CardTitle>Aktivitas Terbaru</CardTitle>
                        <CardDescription>
                            Daftar validasi dan pembaruan data terakhir.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="mt-1 rounded-full bg-primary/10 p-2">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            Validasi Sertifikasi Halal: Warung Nasi Padang Sederhana
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> 2 jam yang lalu oleh Admin Budi
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-6 text-primary hover:text-primary hover:bg-primary/5">
                            Lihat Semua Aktivitas
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm ring-1 ring-border/50 bg-primary/5">
                    <CardHeader>
                        <CardTitle>Statistik Validasi</CardTitle>
                        <CardDescription>
                            Performa validasi UMKM bulan ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[200px] flex items-center justify-center border-2 border-dashed border-primary/20 rounded-lg m-4">
                        <p className="text-sm text-muted-foreground italic">
                            Grafik statistik akan muncul di sini
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
