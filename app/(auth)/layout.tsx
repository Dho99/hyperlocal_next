import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col md:grid md:grid-cols-2">
            <div className="hidden md:flex flex-col justify-between p-8 bg-primary text-primary-foreground">
                <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
                    <div className="h-10 w-10 rounded-lg bg-primary-foreground flex items-center justify-center">
                        <span className="text-primary text-xl">H</span>
                    </div>
                    <span>HalalAdmin</span>
                </div>
                
                <div className="space-y-4">
                    <h2 className="text-4xl font-bold leading-tight">
                        Portal Manajemen<br />
                        Pariwisata Halal Indonesia
                    </h2>
                    <p className="text-primary-foreground/80 text-lg max-w-md">
                        Sistem terintegrasi untuk verifikasi UMKM, manajemen destinasi, 
                        dan pemantauan fasilitas halal di seluruh Indonesia.
                    </p>
                </div>

                <div className="text-sm opacity-70">
                    &copy; {new Date().getFullYear()} Hyperlocal Team. All rights reserved.
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-muted/20">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="md:hidden flex flex-col items-center gap-4 mb-8">
                        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                            <span className="text-primary-foreground text-2xl font-bold">H</span>
                        </div>
                        <h1 className="text-2xl font-bold text-primary">HalalAdmin</h1>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
