"use client";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PromptBar({
  value,
  onChange,
  onSubmit,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-col gap-2 rounded-2xl border border-line bg-card p-2 shadow-card sm:flex-row sm:items-center sm:gap-2 focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/15">
        <div className="flex flex-1 items-center gap-2 px-2">
          <Sparkles className="h-4 w-4 shrink-0 text-brand" />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
            placeholder="What book do you want to create?"
            className="h-11 w-full bg-transparent text-[15px] text-ink placeholder:text-subtle/70 focus:outline-none"
          />
        </div>
        <Button size="lg" onClick={onSubmit} className="shrink-0">
          Start My Book
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-2.5 pl-2 text-sm text-subtle">
        Example: I&rsquo;m a chef and want to turn my Italian family recipes into a cookbook.
      </p>
    </div>
  );
}
