"use client";
import Link from "next/link";
import { ArrowRight, History } from "lucide-react";
import { relativeTime } from "@/lib/utils";
import type { BookProject } from "@/types/book";

/**
 * "Continue where you left off" (Phase 3, ADR-4). Deep-links to the most
 * recently edited chapter of the user's most-recently-updated in-progress book.
 * Renders nothing when there's no in-progress work to resume.
 */
export function ContinueCard({ project }: { project: BookProject }) {
  const chapter =
    project.chapters.find((c) => c.id === project.lastEditedChapterId) ??
    project.chapters[0];

  const href = chapter
    ? `/project/${project.id}?chapter=${chapter.id}`
    : `/project/${project.id}`;

  const chapterIndex = chapter
    ? project.chapters.findIndex((c) => c.id === chapter.id)
    : -1;

  return (
    <Link
      href={href}
      className="group mt-8 flex flex-col gap-4 rounded-2xl border border-line bg-gradient-to-br from-brand-soft/50 to-card p-5 shadow-card transition-shadow hover:shadow-lift sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
          <History className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-dark">
            Continue where you left off
          </p>
          <h2 className="mt-1 truncate font-semibold tracking-tight text-ink">
            {project.title}
            {chapter && (
              <span className="font-normal text-subtle">
                {" · "}
                Ch. {chapterIndex + 1} — {chapter.title}
              </span>
            )}
          </h2>
          <p className="mt-0.5 text-sm text-subtle">
            Edited {relativeTime(project.updatedAt)}
          </p>
        </div>
      </div>

      <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors group-hover:bg-ink/90 sm:self-auto">
        Continue
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
