import { describe, it, expect } from "vitest";
import DOMPurify from "isomorphic-dompurify";

describe("DOMPurify sanitize", () => {
    it("strips script tag", () => {
        expect(DOMPurify.sanitize('<p>hi</p><script>alert(1)</script>')).not.toContain("<script");
    });
    it("strips javascript: href", () => {
        const out = DOMPurify.sanitize('<a href="javascript:alert(1)">x</a>');
        expect(out).not.toContain("javascript:");
    });
    it("keeps safe html", () => {
        expect(DOMPurify.sanitize("<p>hello <strong>world</strong></p>")).toContain("<p>hello");
    });
});
