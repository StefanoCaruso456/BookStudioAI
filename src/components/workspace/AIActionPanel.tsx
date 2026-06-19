"use client";
import {
  Wand2,
  RefreshCw,
  Heart,
  Briefcase,
  Lightbulb,
  BookOpen,
  ListChecks,
  ChefHat,
  Dumbbell,
  Map,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChapterAction } from "@/lib/ai";
import type { BookType } from "@/types/book";

const ACTIONS: { action: ChapterAction; label: string; icon: typeof Wand2 }[] = [
  { action: "rewrite", label: "Rewrite", icon: RefreshCw },
  { action: "make_more_personal", label: "More personal", icon: Heart },
  { action: "make_more_professional", label: "More professional", icon: Briefcase },
  { action: "add_examples", label: "Add examples", icon: Lightbulb },
  { action: "add_story", label: "Add story", icon: BookOpen },
  { action: "add_action_steps", label: "Add action steps", icon: ListChecks },
];

const GENRE_ACTION: Partial<Record<BookType, { label: string; icon: typeof Wand2 }>> = {
  cookbook: { label: "Add recipe", icon: ChefHat },
  fitness_diet: { label: "Add workout", icon: Dumbbell },
  travel_guide: { label: "Add itinerary", icon: Map },
};

export function AIActionPanel({
  bookType,
  hasContent,
  busyLabel,
  onGenerate,
  onAction,
}: {
  bookType: BookType;
  hasContent: boolean;
  busyLabel: string | null;
  onGenerate: () => void;
  onAction: (action: ChapterAction) => void;
}) {
  const genreAction = GENRE_ACTION[bookType];

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand-dark">
          <Sparkles className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-semibold">AI assistant</h3>
      </div>

      <Button
        className="mt-4 w-full"
        onClick={onGenerate}
        disabled={!!busyLabel}
      >
        {busyLabel === "Generating draft" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="h-4 w-4" />
        )}
        {hasContent ? "Regenerate draft" : "Generate draft"}
      </Button>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {ACTIONS.map((a) => (
          <ActionButton
            key={a.action}
            label={a.label}
            icon={a.icon}
            busy={busyLabel === a.label}
            disabled={!!busyLabel}
            onClick={() => onAction(a.action)}
          />
        ))}
        {genreAction && (
          <ActionButton
            label={genreAction.label}
            icon={genreAction.icon}
            busy={busyLabel === "Add genre content"}
            disabled={!!busyLabel}
            onClick={() => onAction("add_genre_content")}
            className="col-span-2"
          />
        )}
      </div>

      <p className="mt-3 text-xs text-subtle">
        Actions build on the current chapter text. Generate a draft first, then
        refine.
      </p>
    </div>
  );
}

function ActionButton({
  label,
  icon: Icon,
  busy,
  disabled,
  onClick,
  className,
}: {
  label: string;
  icon: typeof Wand2;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="secondary"
      size="sm"
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
      {label}
    </Button>
  );
}
