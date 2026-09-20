"use client";

import React from "react";

interface MapErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface MapErrorBoundaryState {
    hasError: boolean;
}

export class MapErrorBoundary extends React.Component<
    MapErrorBoundaryProps,
    MapErrorBoundaryState
> {
    constructor(props: MapErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): MapErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: unknown) {
        console.error("[MapErrorBoundary] Peta gagal dirender:", error);
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback ?? (
                    <div className="flex h-full min-h-[200px] w-full items-center justify-center rounded-md bg-muted px-4 text-center text-sm text-muted-foreground">
                        Peta tidak dapat dimuat. Coba muat ulang halaman.
                    </div>
                )
            );
        }
        return this.props.children;
    }
}
