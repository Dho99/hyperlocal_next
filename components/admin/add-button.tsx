"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function AddButton({ href, title }: { href: string, title: string }) {
  const router = useRouter();

  return (
    <Button
      type="button"
      onClick={() => router.push(href)}
      className="bg-primary text-primary-foreground"
    >
      <Plus className="mr-2 h-4 w-4" />
      {title}
    </Button>
  );
}
