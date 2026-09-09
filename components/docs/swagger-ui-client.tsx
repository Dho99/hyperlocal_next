"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
    ssr: false,
    loading: () => (
        <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground animate-pulse">Memuat Swagger UI...</p>
            </div>
        </div>
    ),
});

export function SwaggerUIClient({ spec }: { spec?: Record<string, unknown> }) {
    return (
        <div className="swagger-container bg-white p-4 dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            {spec ? (
                <SwaggerUI spec={spec} docExpansion="list" defaultModelsExpandDepth={1} />
            ) : (
                <SwaggerUI url="/api/openapi.json" docExpansion="list" defaultModelsExpandDepth={1} />
            )}
        </div>
    );
}
