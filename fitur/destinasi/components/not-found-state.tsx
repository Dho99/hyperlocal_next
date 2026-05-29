import { MapPin, ArrowLeft } from "lucide-react";

interface NotFoundStateProps {
    onBack: () => void;
}

export function NotFoundState({ onBack }: NotFoundStateProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="max-w-md text-center">
                <MapPin className="mx-auto h-12 w-12 text-border" />
                <h2 className="mt-4 text-xl font-bold text-foreground">
                    Destinasi Tidak Ditemukan
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Destinasi yang Anda cari tidak tersedia atau telah dihapus.
                </p>
                <button
                    type="button"
                    onClick={onBack}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke Beranda
                </button>
            </div>
        </div>
    );
}
