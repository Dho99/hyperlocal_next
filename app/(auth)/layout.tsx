export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col md:grid md:grid-cols-2">
            <div className="hidden md:flex flex-col justify-between p-8 bg-primary text-primary-foreground">
                <div />
                
                <div className="space-y-4">
                    <h2 className="text-4xl font-bold leading-tight">
                        Eksplorasi Pariwisata<br />
                        Halal Indonesia
                    </h2>
                    <p className="text-primary-foreground/80 text-lg max-w-md">
                        Platform terintegrasi untuk menemukan destinasi terverifikasi,
                        manajemen pariwisata, dan pemantauan fasilitas halal.
                    </p>
                </div>

                <div className="text-sm opacity-70">
                    &copy; {new Date().getFullYear()}. All rights reserved.
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-muted/20">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </div>
        </div>
    );
}
