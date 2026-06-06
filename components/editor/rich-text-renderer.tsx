"use client";

import { generateHTML } from "@tiptap/html";
import { extensions } from "@/lib/editor/extensions";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { JsonValue } from "@/lib/generated/prisma/runtime/client";

interface ProseMirrorNode {
    type: string;
    content?: ProseMirrorNode[];
    marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
    text?: string;
    attrs?: Record<string, unknown>;
}

interface ProseMirrorDoc {
    type: "doc";
    content: ProseMirrorNode[];
}

interface RichTextRendererProps {
  content: JsonValue;
  className?: string;
}

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  const html = useMemo(() => {
    if (!content) return "";

    if (typeof content === "string") {
      return `<p>${content}</p>`;
    }

    if (typeof content !== "object" || content === null) {
      return `<p>${String(content)}</p>`;
    }

    try {
      return generateHTML(content, extensions);
    } catch (error) {
      console.error("Failed to generate HTML from JSON content", error);
      return "";
    }
  }, [content]);

  return (
    <div 
      className={cn(
        "prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-primary",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
