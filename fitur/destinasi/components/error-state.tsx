import { AlertCircle, ArrowLeft } from "lucide-react";

interface ErrorStateProps {
    error: string;
    onBack: () => void;
}

export function ErrorState({ error, onBack }: ErrorStateProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="max-w-md text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                <h2 className="mt-4 text-xl font-bold text-foreground">
                    Gagal Memuat Data
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
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
