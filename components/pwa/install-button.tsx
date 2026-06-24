"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import {
    type BeforeInstallPromptEvent,
    getCapturedInstallEvent,
} from "@/lib/pwa-install";

function isStandaloneDisplay() {
    const navigatorWithStandalone = window.navigator as Navigator & {
        standalone?: boolean;
    };

    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        navigatorWithStandalone.standalone === true
    );
}

export function InstallButton() {
    const [installEvent, setInstallEvent] =
        useState<BeforeInstallPromptEvent | null>(null);
    const listenerRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (isStandaloneDisplay()) {
            return;
        }

        if (window.localStorage.getItem("priangan-halal-install-dismissed") === "true") {
            return;
        }

        const captured = getCapturedInstallEvent();
        if (captured) {
            setInstallEvent(captured);
            return;
        }

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            if (window.localStorage.getItem("priangan-halal-install-dismissed") === "true") return;
            setInstallEvent(event as BeforeInstallPromptEvent);
        };

        const handleAppInstalled = () => {
            setInstallEvent(null);
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

    if (!installEvent) {
        return null;
    }

    const handleInstall = async () => {
        try {
            await installEvent.prompt();
            await installEvent.userChoice;
        } catch {
            // Prompt call may fail if previously used
        }
        setInstallEvent(null);
    };

    return (
        <button
            type="button"
            onClick={handleInstall}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold transition hover:opacity-90"
            style={{ backgroundColor: "#94D786", color: "#003A02" }}
        >
            <Download className="size-3.5" aria-hidden="true" />
            Install
        </button>
    );
}
