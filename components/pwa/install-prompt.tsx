"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISSED_KEY = "priangan-halal-install-dismissed";

function isStandaloneDisplay() {
    const navigatorWithStandalone = window.navigator as Navigator & {
        standalone?: boolean;
    };

    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        navigatorWithStandalone.standalone === true
    );
}

export function InstallPrompt() {
    const [installEvent, setInstallEvent] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isStandaloneDisplay()) {
            return;
        }

        const dismissed = window.localStorage.getItem(DISMISSED_KEY) === "true";

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();

            if (dismissed) {
                return;
            }

            setInstallEvent(event as BeforeInstallPromptEvent);
            setVisible(true);
        };

        const handleAppInstalled = () => {
            setVisible(false);
            setInstallEvent(null);
            window.localStorage.setItem(DISMISSED_KEY, "true");
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt,
            );
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    if (!visible || !installEvent) {
        return null;
    }

    const handleInstall = async () => {
        await installEvent.prompt();
        const choice = await installEvent.userChoice;

        if (choice.outcome === "accepted") {
            window.localStorage.setItem(DISMISSED_KEY, "true");
        }

        setVisible(false);
        setInstallEvent(null);
    };

    const handleDismiss = () => {
        window.localStorage.setItem(DISMISSED_KEY, "true");
        setVisible(false);
    };

    return (
        <aside className="fixed inset-x-4 bottom-20 z-[60] mx-auto max-w-md rounded-lg border border-emerald-100 bg-white p-4 shadow-xl shadow-emerald-950/10 md:inset-x-auto md:right-6 md:bottom-6 md:w-[360px]">
            <button
                type="button"
                onClick={handleDismiss}
                className="absolute right-3 top-3 rounded-md p-1 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
                aria-label="Tutup banner install"
            >
                <X className="size-4" aria-hidden="true" />
            </button>

            <div className="flex gap-3 pr-6">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-800">
                    <Download className="size-5" aria-hidden="true" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-neutral-950">
                        Install Priangan Halal Tourism
                    </h2>
                    <p className="mt-1 text-sm leading-5 text-neutral-600">
                        Buka lebih cepat dari beranda HP dan akses halaman
                        tersimpan saat koneksi terbatas.
                    </p>
                    <button
                        type="button"
                        onClick={handleInstall}
                        className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900"
                    >
                        <Download className="size-4" aria-hidden="true" />
                        Install
                    </button>
                </div>
            </div>
        </aside>
    );
}
