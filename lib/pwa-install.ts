"use client";

export type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
    interface Window {
        __pwaInstallEvent?: BeforeInstallPromptEvent | null;
    }
}

export function getCapturedInstallEvent(): BeforeInstallPromptEvent | null {
    return window.__pwaInstallEvent ?? null;
}

export function clearCapturedInstallEvent(): void {
    window.__pwaInstallEvent = null;
}
