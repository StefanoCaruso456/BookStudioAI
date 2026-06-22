"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { personaLabel } from "@/lib/personas";

export function DashboardHeader({
  count,
  persona,
}: {
  count: number;
  persona?: string | null;
}) {
  // Tasteful persona greeting (US-4) — null-safe; falls through to "Your books".
  const label = personaLabel(persona);
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {label && (
          <p className="text-sm font-medium text-brand">Welcome, {label}</p>
        )}
        <h1 className="text-3xl font-bold tracking-tight">Your books</h1>
        <p className="mt-1 text-subtle">
          {count === 0
            ? "Start your first book in minutes."
            : `${count} ${count === 1 ? "book" : "books"} in progress.`}
        </p>
      </div>
      <Link href="/builder">
        <Button>
          <Plus className="h-4 w-4" />
          New book
        </Button>
      </Link>
    </div>
  );
}
