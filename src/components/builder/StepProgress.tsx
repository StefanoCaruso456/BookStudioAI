"use client";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepProgress({
  steps,
  current,
  onJump,
}: {
  steps: string[];
  current: number;
  onJump?: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const reachable = i <= current;
        return (
          <div key={label} className="flex flex-1 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              disabled={!reachable || !onJump}
              onClick={() => reachable && onJump?.(i)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap",
                reachable && onJump ? "cursor-pointer" : "cursor-default"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  done && "bg-brand text-white",
                  active && "bg-ink text-white",
                  !done && !active && "bg-line/60 text-subtle"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  active ? "text-ink" : "text-subtle"
                )}
              >
                {label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 transition-colors",
                  done ? "bg-brand/50" : "bg-line"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
