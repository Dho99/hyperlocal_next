import { describe, expect, it } from "vitest";
import {
    getDestinationOrderBy,
    type DestinationSort,
} from "@/lib/utils/destination-order";

const sorts: DestinationSort[] = ["newest", "rating", "score", "reviews", "name"];

describe("getDestinationOrderBy", () => {
    it.each(sorts)("prioritises destinations with images for %s", (sort) => {
        const orderBy = getDestinationOrderBy(sort);

        expect(orderBy[0]).toEqual({ images: { _count: "desc" } });
    });

    it.each(sorts)("keeps the id tie-breaker for stable pagination on %s", (sort) => {
        const orderBy = getDestinationOrderBy(sort);

        expect(orderBy.at(-1)).toHaveProperty("id");
    });

    it("falls back to the newest sort", () => {
        expect(getDestinationOrderBy()).toEqual(getDestinationOrderBy("newest"));
    });
});
