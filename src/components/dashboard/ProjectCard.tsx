"use client";
import Link from "next/link";
import { Trash2, ArrowRight, BookText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getGenre } from "@/lib/genres";
import { relativeTime } from "@/lib/utils";
import type { BookProject } from "@/types/book";

const STATUS_LABEL: Record<BookProject["status"], string> = {
  draft: "Draft",
  blueprint: "Blueprint ready",
  writing: "Writing",
  editing: "Editing",
  publishing: "Publishing",
};

export function ProjectCard({
  project,
  onDelete,
}: {
  project: BookProject;
  onDelete: (id: string) => void;
}) {
  const genre = getGenre(project.bookType);
  const complete = project.chapters.filter((c) => c.status === "complete").length;
  const total = project.chapters.length;
  const pct = total ? Math.round((complete / total) * 100) : 0;

  return (
    <div className="group flex flex-col rounded-2xl border border-line bg-card p-5 shadow-card transition-shadow hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-copper-soft text-copper-dark">
          <BookText className="h-5 w-5" />
        </span>
        <button
          onClick={() => {
            if (confirm(`Delete "${project.title}"? This cannot be undone.`)) {
              onDelete(project.id);
            }
          }}
          className="rounded-lg p-1.5 text-subtle opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
          aria-label="Delete project"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <h3 className="mt-4 text-balance font-semibold leading-snug tracking-tight">
        {project.title}
      </h3>
      <div className="mt-1 flex items-center gap-2 text-sm text-subtle">
        <span>{genre.label}</span>
        <span className="h-1 w-1 rounded-full bg-line" />
        <span>{STATUS_LABEL[project.status]}</span>
      </div>

      {total > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-subtle">
            <span>
              {complete}/{total} chapters
            </span>
            <span>{pct}%</span>
          </div>
          <Progress value={pct} />
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <span className="text-xs text-subtle">
          Updated {relativeTime(project.updatedAt)}
        </span>
        <Link
          href={`/project/${project.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-copper-dark transition-colors hover:text-copper"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
