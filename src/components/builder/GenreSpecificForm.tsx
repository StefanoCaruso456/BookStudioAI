"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { GenreConfig } from "@/lib/genres";

export function GenreSpecificForm({
  genre,
  values,
  onChange,
}: {
  genre: GenreConfig;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {genre.fields.map((field) => {
        const isWide = field.type === "textarea";
        return (
          <div
            key={field.key}
            className={isWide ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}
          >
            <label className="block text-sm font-medium">{field.label}</label>
            {field.type === "textarea" ? (
              <Textarea
                value={values[field.key] ?? ""}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            ) : (
              <Input
                value={values[field.key] ?? ""}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
