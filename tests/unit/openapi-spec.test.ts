import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
extendZodWithOpenApi(z);

import { describe, it, expect } from "vitest";
import { generateOpenApiDocument } from "@/lib/openapi/spec";

describe("OpenAPI Spec Generation", () => {
    it("generates valid OpenAPI 3.1 document structure", () => {
        const doc = generateOpenApiDocument();

        expect(doc).toBeDefined();
        expect(doc.openapi).toBe("3.1.0");
        expect(doc.info.title).toContain("Hyperlocal Halal Ecosystem API Docs");
        expect(doc.info.version).toBe("0.1.0");
        expect(doc.paths).toBeDefined();

        // Check required path registrations
        expect(doc.paths?.["/api/auth/sign-in/email"]).toBeDefined();
        expect(doc.paths?.["/api/validations"]).toBeDefined();
        expect(doc.paths?.["/api/validations/{id}"]).toBeDefined();
        expect(doc.paths?.["/api/admin/ai-test"]).toBeDefined();
        expect(doc.paths?.["/api/admin/acesh/dashboard"]).toBeDefined();
        expect(doc.paths?.["/api/explore"]).toBeDefined();
        expect(doc.paths?.["/api/upload"]).toBeDefined();

        // Check security schemes
        expect(doc.components?.securitySchemes?.cookieAuth).toBeDefined();
    });
});
