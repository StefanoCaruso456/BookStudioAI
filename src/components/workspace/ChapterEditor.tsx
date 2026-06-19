"use client";
import { Check, Cloud } from "lucide-react";
import { STATUS_LABELS } from "@/components/ui/badge";
import type { Chapter, ChapterStatus } from "@/types/book";
import { cn } from "@/lib/utils";

const STATUSES: ChapterStatus[] = ["not_started", "drafting", "needs_review", "complete"];

export function ChapterEditor({
  chapter,
  index,
  total,
  saved,
  onChangeTitle,
  onChangeContent,
  onChangeStatus,
}: {
  chapter: Chapter;
  index: number;
  total: number;
  saved: boolean;
  onChangeTitle: (v: string) => void;
  onChangeContent: (v: string) => void;
  onChangeStatus: (s: ChapterStatus) => void;
}) {
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-subtle">
          Chapter {index + 1} of {total}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-subtle">
          {saved ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              Saved
            </>
          ) : (
            <>
              <Cloud className="h-3.5 w-3.5" />
              Saving…
            </>
          )}
        </span>
      </div>

      <input
        value={chapter.title}
        onChange={(e) => onChangeTitle(e.target.value)}
        className="w-full bg-transparent text-2xl font-bold tracking-tight text-ink placeholder:text-subtle/50 focus:outline-none"
        placeholder="Chapter title"
      />

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => onChangeStatus(s)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              chapter.status === s
                ? "bg-ink text-white"
                : "bg-line/40 text-subtle hover:text-ink"
            )}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <textarea
        value={chapter.content}
        onChange={(e) => onChangeContent(e.target.value)}
        placeholder="Start writing, or use the AI assistant to generate a first draft…"
        className="mt-4 min-h-[320px] flex-1 resize-none rounded-2xl border border-line bg-card p-5 font-sans text-[15px] leading-7 text-ink placeholder:text-subtle/60 focus:border-copper/50 focus:outline-none focus:ring-2 focus:ring-copper/15"
      />
    </div>
  );
}
