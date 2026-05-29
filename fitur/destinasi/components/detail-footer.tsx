import Link from "next/link";

export function DetailFooter() {
    return (
        <footer className="mt-8 bg-card w-full rounded-t-xl border-t border-border/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
                <div className="space-y-3">
                    <h3 className="font-heading text-xl font-bold text-[#4f378a]">
                        HyperLocal
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Platform penemuan destinasi halal terpercaya untuk
                        perjalanan yang menenangkan.
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold tracking-widest text-[#4f378a]">
                        PERUSAHAAN
                    </h4>
                    <Link
                        href="#"
                        className="text-sm text-muted-foreground hover:text-primary underline underline-offset-2 opacity-80"
                    >
                        Tentang Kami
                    </Link>
                    <Link
                        href="#"
                        className="text-sm text-muted-foreground hover:text-primary underline underline-offset-2 opacity-80"
                    >
                        Bantuan
                    </Link>
                </div>
                <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold tracking-widest text-[#4f378a]">
                        LEGAL
                    </h4>
                    <Link
                        href="#"
                        className="text-sm text-muted-foreground hover:text-primary underline underline-offset-2 opacity-80"
                    >
                        Kebijakan Privasi
                    </Link>
                    <Link
                        href="#"
                        className="text-sm text-muted-foreground hover:text-primary underline underline-offset-2 opacity-80"
                    >
                        Syarat &amp; Ketentuan
                    </Link>
                </div>
                <div className="flex items-end text-sm text-muted-foreground">
                    <p>
                        &copy; {new Date().getFullYear()} HyperLocal. Semua Hak
                        Dilindungi.
                    </p>
                </div>
            </div>
        </footer>
    );
}
