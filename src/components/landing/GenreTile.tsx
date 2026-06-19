"use client";
import {
  Utensils,
  Dumbbell,
  Compass,
  Map,
  BookOpen,
  Briefcase,
  BookText,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GenreConfig } from "@/lib/genres";

const ICONS: Record<string, LucideIcon> = {
  Utensils,
  Dumbbell,
  Compass,
  Map,
  BookOpen,
  Briefcase,
  BookText,
};

export function GenreTile({
  genre,
  selected,
  onSelect,
}: {
  genre: GenreConfig;
  selected?: boolean;
  onSelect: (genre: GenreConfig) => void;
}) {
  const Icon = ICONS[genre.icon] ?? BookText;
  return (
    <button
      type="button"
      onClick={() => onSelect(genre)}
      aria-pressed={selected}
      className={cn(
        "group flex flex-col items-start gap-3.5 rounded-xl border bg-card p-5 text-left shadow-card transition-all duration-150 hover:shadow-lift",
        selected
          ? "border-brand ring-1 ring-brand/20"
          : "border-line hover:border-brand/40"
      )}
    >
      {/* elegant monochrome line icon in an outlined square */}
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
          selected
            ? "border-brand/30 bg-brand-soft text-brand"
            : "border-line bg-canvas text-ink group-hover:border-brand/30 group-hover:text-brand"
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div>
        <div className="font-semibold tracking-tight">{genre.label}</div>
        <div className="text-sm text-subtle">{genre.tagline}</div>
      </div>
    </button>
  );
}
