"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Bookmark } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SaveButton({
    onClick,
    saving,
}: {
    onClick: () => void;
    saving: boolean;
}) {
    const { data: session, isPending } = authClient.useSession();

    const handleClick = () => {
        if (!session) {
            toast.error(
                "Silakan login terlebih dahulu untuk menyimpan rencana",
            );
            return;
        }
        onClick();
    };

    return (
        <Button
            onClick={handleClick}
            disabled={saving || isPending}
            className="h-12 bg-emerald-700 px-8 text-base font-bold text-white shadow-lg shadow-emerald-900/25 hover:bg-emerald-800"
        >
            {saving ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Menyimpan...
                </>
            ) : (
                <>
                    <Bookmark className="mr-2 h-5 w-5" />
                    Simpan ke Rencana Perjalanan Saya
                </>
            )}
        </Button>
    );
}
