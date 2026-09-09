import { describe, it, expect, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/auth", () => ({
    auth: { api: { getSession: vi.fn(async () => null) } },
}));

import { requireAdmin } from "@/lib/auth-guard";
import { auth } from "@/lib/auth";

describe("requireAdmin", () => {
    it("returns null when no session", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any);
        expect(await requireAdmin()).toBeNull();
    });
    it("returns null when role is not admin", async () => {
        vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: "1", role: "user" } } as any);
        expect(await requireAdmin()).toBeNull();
    });
    it("returns session when admin", async () => {
        const sess = { user: { id: "1", role: "admin" } } as any;
        vi.mocked(auth.api.getSession).mockResolvedValueOnce(sess);
        expect(await requireAdmin()).toBe(sess);
    });
});
