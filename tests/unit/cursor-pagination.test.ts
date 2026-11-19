import { describe, expect, it } from "vitest";
import { withCursorPagination } from "@/lib/pagination/cursorPagination";

describe("withCursorPagination limit handling", () => {
    it.each([
        [-5, 1],
        [0, 1],
        [1.8, 1],
        [10, 10],
        [500, 100],
        [Number.NaN, 20],
        [Number.POSITIVE_INFINITY, 20],
    ])("normalizes requested limit %s to %s", async (requested, expected) => {
        let requestedTake = 0;
        await withCursorPagination(
            async (take) => {
                requestedTake = take;
                return [];
            },
            { limit: requested },
        );
        expect(requestedTake).toBe(expected + 1);
    });
});
