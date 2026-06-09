"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if (!("serviceWorker" in navigator)) {
            return;
        }

        if (process.env.NODE_ENV === "development") {
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                for (const registration of registrations) {
                    registration.unregister();
                }
            });
            return;
        }

        const registerServiceWorker = () => {
            navigator.serviceWorker.register("/sw.js").catch(() => {
                // Service worker registration should not block the app.
            });
        };

        if (document.readyState === "complete") {
            registerServiceWorker();
            return;
        }

        window.addEventListener("load", registerServiceWorker);

        return () => {
            window.removeEventListener("load", registerServiceWorker);
        };
    }, []);

    return null;
}
