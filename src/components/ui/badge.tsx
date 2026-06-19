import * as React from "react";
import { cn } from "@/lib/utils";
import type { ChapterStatus } from "@/types/book";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        className
      )}
      {...props}
    />
  );
}

const STATUS_STYLES: Record<ChapterStatus, string> = {
  not_started: "bg-line/40 text-subtle",
  drafting: "bg-brand-soft text-brand-dark",
  needs_review: "bg-amber-100 text-amber-700",
  complete: "bg-emerald-100 text-emerald-700",
};

export const STATUS_LABELS: Record<ChapterStatus, string> = {
  not_started: "Not started",
  drafting: "Drafting",
  needs_review: "Needs review",
  complete: "Complete",
};

export function StatusBadge({ status }: { status: ChapterStatus }) {
  return (
    <Badge className={STATUS_STYLES[status]}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status]}
    </Badge>
  );
}
