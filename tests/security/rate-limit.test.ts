import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/security/rate-limit";

describe("rateLimit in-memory", () => {
    it("allows up to limit then blocks", () => {
        const key = `test-${Date.now()}-${Math.random()}`;
        for (let i = 0; i < 5; i++) expect(rateLimit(key, 5, 60_000).allowed).toBe(true);
        expect(rateLimit(key, 5, 60_000).allowed).toBe(false);
    });
    it("returns Retry-After compatible resetAt", () => {
        const key = `test2-${Date.now()}-${Math.random()}`;
        const r = rateLimit(key, 1, 10_000);
        expect(r.resetAt).toBeGreaterThan(Date.now());
        expect(r.allowed).toBe(true);
        expect(rateLimit(key, 1, 10_000).allowed).toBe(false);
    });
});
