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

        const showInstallPrompt = (event: BeforeInstallPromptEvent) => {
            setInstallEvent(event);
            if (window.sessionStorage.getItem(NANTI_KEY) === "true") {
                setFabVisible(true);
            } else {
                setBannerOpen(true);
            }
        };

        const captured = getCapturedInstallEvent();
        if (captured) {
            window.setTimeout(() => showInstallPrompt(captured), 0);
            return;
        }

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            if (window.localStorage.getItem(DISMISSED_KEY) === "true") return;
            showInstallPrompt(event as BeforeInstallPromptEvent);
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
                <aside className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-xs rounded-lg border border-border bg-card p-3 text-card-foreground shadow-xl shadow-accent/10 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 md:inset-x-auto md:right-5 md:w-[320px]">
                    <button
                        type="button"
                        onClick={handleNanti}
                        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        aria-label="Tutup"
                    >
                        <X className="size-4" />
                    </button>

                    <div className="flex gap-2.5 pr-5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary dark:bg-accent/15 dark:text-accent">
                            <Download className="size-4" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-sm font-semibold text-card-foreground">
                                Install Aplikasi
                            </h2>
                            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                                Buka lebih cepat dari beranda HP.
                            </p>

                            <div className="mt-2 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleInstall}
                                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/85 dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent/85"
                                >
                                    <Download className="size-4" />
                                    Install
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNanti}
                                    className="inline-flex h-8 items-center justify-center rounded-md px-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                >
                                    Nanti
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handlePermanentDismiss}
                                className="mt-1 text-xs text-muted-foreground/75 underline underline-offset-2 transition hover:text-foreground"
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
