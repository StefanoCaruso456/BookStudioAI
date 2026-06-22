"use client";
import { Check, Cloud, AlertTriangle, Loader2 } from "lucide-react";
import { STATUS_LABELS } from "@/components/ui/badge";
import type { Chapter, ChapterStatus } from "@/types/book";
import type { SaveStatus } from "@/lib/autosave";
import { cn } from "@/lib/utils";

const STATUSES: ChapterStatus[] = ["not_started", "drafting", "needs_review", "complete"];

function formatTime(at: Date | null): string {
  if (!at) return "";
  return at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** The truthful save indicator — driven by the real request, not a timer. */
function SaveIndicator({
  status,
  lastSavedAt,
  onRetry,
}: {
  status: SaveStatus;
  lastSavedAt: Date | null;
  onRetry: () => void;
}) {
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-red-600">
        <AlertTriangle className="h-3.5 w-3.5" />
        Save failed
        <span className="text-subtle/60">·</span>
        <button
          onClick={onRetry}
          className="font-medium underline-offset-2 hover:underline"
        >
          Retry
        </button>
      </span>
    );
  }

  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-subtle">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving…
      </span>
    );
  }

  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-subtle">
        <Check className="h-3.5 w-3.5 text-emerald-500" />
        Saved{lastSavedAt ? ` ${formatTime(lastSavedAt)}` : ""}
      </span>
    );
  }

  // idle — nothing written yet this session.
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-subtle">
      <Cloud className="h-3.5 w-3.5" />
      All changes saved
    </span>
  );
}

export function ChapterEditor({
  chapter,
  index,
  total,
  saveStatus,
  lastSavedAt,
  onRetry,
  onChangeTitle,
  onChangeContent,
  onChangeStatus,
}: {
  chapter: Chapter;
  index: number;
  total: number;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  onRetry: () => void;
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
        <SaveIndicator
          status={saveStatus}
          lastSavedAt={lastSavedAt}
          onRetry={onRetry}
        />
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
        className="mt-4 min-h-[320px] flex-1 resize-none rounded-2xl border border-line bg-card p-5 font-sans text-[15px] leading-7 text-ink placeholder:text-subtle/60 focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/15"
      />
    </div>
  );
}
