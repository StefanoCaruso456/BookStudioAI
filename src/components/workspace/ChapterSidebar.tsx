"use client";
import Link from "next/link";
import { ArrowLeft, BookMarked, Rocket } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Chapter } from "@/types/book";

const STATUS_DOT: Record<Chapter["status"], string> = {
  not_started: "bg-line",
  drafting: "bg-brand",
  needs_review: "bg-amber-400",
  complete: "bg-emerald-500",
};

export function ChapterSidebar({
  projectId,
  bookTitle,
  chapters,
  selectedId,
  onSelect,
}: {
  projectId: string;
  bookTitle: string;
  chapters: Chapter[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const complete = chapters.filter((c) => c.status === "complete").length;
  const pct = chapters.length ? Math.round((complete / chapters.length) * 100) : 0;

  return (
    <aside className="flex flex-col border-b border-line bg-card lg:h-screen lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="border-b border-line p-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-subtle transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <div className="mt-3 flex items-start gap-2.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
            <BookMarked className="h-4 w-4" />
          </span>
          <h2 className="text-balance font-semibold leading-tight tracking-tight">
            {bookTitle}
          </h2>
        </div>
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-xs text-subtle">
            <span>Progress</span>
            <span>
              {complete}/{chapters.length} complete
            </span>
          </div>
          <Progress value={pct} />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {chapters.map((c, i) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
              c.id === selectedId ? "bg-brand-soft text-ink" : "hover:bg-canvas"
            )}
          >
            <span className="w-5 shrink-0 text-center text-xs font-medium text-subtle">
              {i + 1}
            </span>
            <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[c.status])} />
            <span className="truncate">{c.title}</span>
          </button>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <Link
          href={`/project/${projectId}/publishing`}
          className="flex items-center justify-center gap-2 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:border-brand/40 hover:bg-brand-soft/40"
        >
          <Rocket className="h-4 w-4 text-brand" />
          Publishing kit
        </Link>
      </div>
    </aside>
  );
}
