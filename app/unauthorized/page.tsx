import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
            <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="mx-auto h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
                    <ShieldAlert className="h-10 w-10 text-destructive" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Akses Ditolak</h1>
                    <p className="text-muted-foreground">
                        Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. 
                        Hanya administrator yang dapat mengakses area manajemen.
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <Button asChild className="w-full">
                        <Link href="/">
                            Kembali ke Beranda
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full gap-2">
                        <Link href="/login">
                            <ArrowLeft className="h-4 w-4" />
                            Masuk dengan Akun Lain
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
