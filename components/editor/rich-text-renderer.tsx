"use client";
import { generateHTML } from "@tiptap/html";
import { extensions } from "@/lib/editor/extensions";
import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";
import type { JsonValue } from "@/lib/generated/prisma/runtime/client";

function escapeHtml(s: string) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function RichTextRenderer({ content, className }: { content: JsonValue; className?: string }) {
  const html = useMemo(() => {
    let raw = "";
    if (!content) return "";
    if (typeof content === "string") raw = `<p>${escapeHtml(content)}</p>`;
    else if (typeof content !== "object" || content === null) raw = `<p>${escapeHtml(String(content))}</p>`;
    else try { raw = generateHTML(content as any, extensions); } catch { return ""; }
    return DOMPurify.sanitize(raw);
  }, [content]);
  return <div className={cn("prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-primary", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
