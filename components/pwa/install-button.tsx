"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandaloneDisplay() {
    const navigatorWithStandalone = window.navigator as Navigator & {
        standalone?: boolean;
    };

    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        navigatorWithStandalone.standalone === true
    );
}

export function InstallButton() {
    const [installEvent, setInstallEvent] =
        useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        if (isStandaloneDisplay()) {
            return;
        }

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setInstallEvent(event as BeforeInstallPromptEvent);
        };

        const handleAppInstalled = () => {
            setInstallEvent(null);
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

    if (!installEvent) {
        return null;
    }

    const handleInstall = async () => {
        await installEvent.prompt();
        await installEvent.userChoice;
        setInstallEvent(null);
    };

    return (
        <button
            type="button"
            onClick={handleInstall}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-emerald-100 px-3 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-200"
        >
            <Download className="size-3.5" aria-hidden="true" />
            Install
        </button>
    );
}
