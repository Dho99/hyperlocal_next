"use client";

import { generateHTML } from "@tiptap/html";
import { extensions } from "@/lib/editor/extensions";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface RichTextRendererProps {
  content: any;
  className?: string;
}

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  const html = useMemo(() => {
    if (!content) return "";
    
    // Fallback for plain text if migration data is still raw string
    if (typeof content === "string") {
      return `<p>${content}</p>`;
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
