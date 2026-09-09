import { Metadata } from "next";
import { SwaggerUIClient } from "@/components/docs/swagger-ui-client";
import { generateOpenApiDocument } from "@/lib/openapi/spec";
import Link from "next/link";
import { ChevronLeft, FileCode, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "API Documentation | Hyperlocal Halal Ecosystem",
    description: "Interactive OpenAPI / Swagger documentation for Hyperlocal Halal Ecosystem APIs.",
};

export default function ApiDocsPage() {
    const spec = generateOpenApiDocument() as unknown as Record<string, unknown>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/" passHref>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                Hyperlocal API Documentation
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Interactive OpenAPI 3.1 Specification & Testing Interface
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href="/api/openapi.json"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <FileCode className="h-4 w-4 text-primary" />
                            Raw OpenAPI Spec (JSON)
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
                <SwaggerUIClient spec={spec} />
            </main>
        </div>
    );
}
