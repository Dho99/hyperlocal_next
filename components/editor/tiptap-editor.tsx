"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { extensions } from "@/lib/editor/extensions";
import { TiptapToolbar } from "./tiptap-toolbar";
import { useEffect } from "react";

interface TiptapEditorProps {
  value?: any;
  onChange: (value: any) => void;
}

export function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions,
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm md:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[250px] px-4 py-3",
      },
    },
  });

  // Sync external value changes (e.g. form reset)
  useEffect(() => {
    if (editor && value !== editor.getJSON()) {
      // Basic check to avoid infinite loops
      const currentJson = JSON.stringify(editor.getJSON());
      const newJson = JSON.stringify(value);
      if (currentJson !== newJson) {
        editor.commands.setContent(value || "");
      }
    }
  }, [value, editor]);

  return (
    <div className="w-full border rounded-md shadow-sm focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary transition-all bg-background">
      <TiptapToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
