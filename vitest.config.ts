import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["tests/**/*.test.ts"],
        exclude: ["node_modules/**", ".next/**"],
        coverage: {
            provider: "v8",
            include: ["lib/services/acesh/**", "lib/utils/haversine-distance.ts"],
            reporter: ["text", "json-summary"],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "."),
        },
    },
});
