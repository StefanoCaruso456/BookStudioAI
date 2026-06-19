"use client";
import {
  ChefHat,
  Dumbbell,
  Sparkles,
  Map,
  BookHeart,
  Briefcase,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GenreConfig } from "@/lib/genres";

const ICONS: Record<string, LucideIcon> = {
  ChefHat,
  Dumbbell,
  Sparkles,
  Map,
  BookHeart,
  Briefcase,
  BookOpen,
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
  const Icon = ICONS[genre.icon] ?? BookOpen;
  return (
    <button
      type="button"
      onClick={() => onSelect(genre)}
      aria-pressed={selected}
      className={cn(
        "group flex flex-col items-start gap-3 rounded-2xl border bg-card p-5 text-left shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lift",
        selected
          ? "border-copper ring-2 ring-copper/25"
          : "border-line hover:border-copper/40"
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
          selected
            ? "bg-copper text-white"
            : "bg-copper-soft text-copper-dark group-hover:bg-copper group-hover:text-white"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="font-semibold tracking-tight">{genre.label}</div>
        <div className="text-sm text-subtle">{genre.tagline}</div>
      </div>
    </button>
  );
}
