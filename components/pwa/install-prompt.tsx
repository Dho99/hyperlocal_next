"use client";

import { useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import {
    type BeforeInstallPromptEvent,
    getCapturedInstallEvent,
} from "@/lib/pwa-install";

const DISMISSED_KEY = "priangan-halal-install-dismissed";
const NANTI_KEY = "priangan-halal-install-nanti";

function isStandaloneDisplay() {
    const n = window.navigator as Navigator & { standalone?: boolean };
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        n.standalone === true
    );
}

export function InstallPrompt() {
    const [installEvent, setInstallEvent] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [bannerOpen, setBannerOpen] = useState(false);
    const [fabVisible, setFabVisible] = useState(false);
    const listenerRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (isStandaloneDisplay()) return;

        if (window.localStorage.getItem(DISMISSED_KEY) === "true") return;

        const captured = getCapturedInstallEvent();
        if (captured) {
            setInstallEvent(captured);
            if (window.sessionStorage.getItem(NANTI_KEY) === "true") {
                setFabVisible(true);
            } else {
                setBannerOpen(true);
            }
            return;
        }

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            if (window.localStorage.getItem(DISMISSED_KEY) === "true") return;
            setInstallEvent(event as BeforeInstallPromptEvent);
            if (window.sessionStorage.getItem(NANTI_KEY) === "true") {
                setFabVisible(true);
            } else {
                setBannerOpen(true);
            }
        };

        const handleAppInstalled = () => {
            setBannerOpen(false);
            setFabVisible(false);
            setInstallEvent(null);
            window.localStorage.setItem(DISMISSED_KEY, "true");
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("appinstalled", handleAppInstalled);

        listenerRef.current = () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt,
            );
            window.removeEventListener("appinstalled", handleAppInstalled);
        };

        return () => {
            listenerRef.current?.();
        };
    }, []);

    const handleInstall = async () => {
        if (!installEvent) return;
        try {
            await installEvent.prompt();
            const choice = await installEvent.userChoice;
            if (choice.outcome === "accepted") {
                window.localStorage.setItem(DISMISSED_KEY, "true");
            }
        } catch {}

        setBannerOpen(false);
        setFabVisible(false);
        setInstallEvent(null);
    };

    const handleNanti = () => {
        window.sessionStorage.setItem(NANTI_KEY, "true");
        setBannerOpen(false);
        setFabVisible(true);
    };

    const handlePermanentDismiss = () => {
        window.localStorage.setItem(DISMISSED_KEY, "true");
        window.sessionStorage.removeItem(NANTI_KEY);
        setBannerOpen(false);
        setFabVisible(false);
        setInstallEvent(null);
    };

    return (
        <>
            {bannerOpen && installEvent && (
                <aside className="fixed inset-x-4 bottom-20 z-[60] mx-auto max-w-md rounded-lg border border-accent/30 bg-card p-4 shadow-xl shadow-accent/10 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 md:inset-x-auto md:right-6 md:bottom-6 md:w-[360px]">
                    <button
                        type="button"
                        onClick={handleNanti}
                        className="absolute right-3 top-3 rounded-md p-1 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
                        aria-label="Tutup"
                    >
                        <X className="size-4" />
                    </button>

                    <div className="flex gap-3 pr-6">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-800">
                            <Download className="size-5" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-sm font-semibold text-neutral-950">
                                Install Aplikasi
                            </h2>
                            <p className="mt-1 text-sm leading-5 text-neutral-600">
                                Buka lebih cepat dari beranda HP dan akses halaman
                                tersimpan saat koneksi terbatas.
                            </p>

                            <div className="mt-3 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleInstall}
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900"
                                >
                                    <Download className="size-4" />
                                    Install
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNanti}
                                    className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100"
                                >
                                    Nanti
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handlePermanentDismiss}
                                className="mt-1.5 text-xs text-neutral-400 underline underline-offset-2 transition hover:text-neutral-600"
                            >
                                Jangan tampilkan lagi
                            </button>
                        </div>
                    </div>
                </aside>
            )}

            {fabVisible && installEvent && (
                <button
                    type="button"
                    onClick={() => {
                        setFabVisible(false);
                        setBannerOpen(true);
                    }}
                    className="fixed bottom-6 right-6 z-[60] inline-flex h-10 animate-in fade-in items-center gap-1.5 rounded-full bg-emerald-800 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-900 active:scale-95"
                >
                    <Download className="size-4" />
                    Install
                </button>
            )}
        </>
    );
}
