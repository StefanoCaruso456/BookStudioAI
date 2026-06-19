"use client";
import { Textarea } from "@/components/ui/textarea";

export function AudienceInput({
  value,
  examples,
  onChange,
}: {
  value: string;
  examples: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe who this book is for…"
        className="min-h-[88px]"
      />
      <div>
        <p className="mb-2 text-sm font-medium text-subtle">
          Suggested for your genre — tap to use
        </p>
        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => onChange(ex)}
              className="rounded-full border border-line bg-card px-3 py-1.5 text-sm text-subtle transition-colors hover:border-copper/40 hover:text-ink"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
