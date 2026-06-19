"use client";
import { Check } from "lucide-react";
import { BOOK_GOALS } from "@/lib/genres";
import type { BookGoal } from "@/types/book";
import { cn } from "@/lib/utils";

export function BookGoalSelector({
  value,
  onChange,
}: {
  value?: BookGoal;
  onChange: (goal: BookGoal) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {BOOK_GOALS.map((goal) => {
        const selected = value === goal.value;
        return (
          <button
            key={goal.value}
            type="button"
            onClick={() => onChange(goal.value)}
            className={cn(
              "flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:border-copper/40",
              selected ? "border-copper ring-2 ring-copper/20" : "border-line"
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                selected ? "border-copper bg-copper text-white" : "border-line"
              )}
            >
              {selected && <Check className="h-3 w-3" />}
            </span>
            <span>
              <span className="block font-medium">{goal.label}</span>
              <span className="block text-sm text-subtle">{goal.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
