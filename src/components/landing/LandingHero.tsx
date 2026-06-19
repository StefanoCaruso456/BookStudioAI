"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { PromptBar } from "./PromptBar";
import { GenreTile } from "./GenreTile";
import { PRIMARY_GENRES, getGenre, type GenreConfig } from "@/lib/genres";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function LandingHero() {
  const router = useRouter();
  const setDraft = useStore((s) => s.setDraft);
  const resetDraft = useStore((s) => s.resetDraft);
  const [prompt, setPrompt] = useState("");
  const [selected, setSelected] = useState<GenreConfig | null>(null);

  function startBuilder(genre?: GenreConfig) {
    const bookType = genre?.type ?? selected?.type ?? "other";
    resetDraft(bookType);
    setDraft({ bookType, initialPrompt: prompt });
    router.push("/builder");
  }

  return (
    <section className="relative overflow-hidden">
      {/* soft ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-gradient-to-b from-brand-soft/60 to-transparent blur-2xl"
      />
      <div className="relative mx-auto max-w-content px-5 pb-8 pt-16 sm:px-8 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-subtle shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Turn Content Into Books
          </span>
          <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Turn Your Content Into a{" "}
            <span className="text-brand">Published Book</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-subtle">
            Book Studio AI helps creators, coaches, chefs, and experts transform
            their ideas, notes, videos, recipes, and content into professionally
            structured books.
          </p>
        </div>

        <div className="mx-auto mt-9 max-w-2xl">
          <PromptBar
            value={prompt}
            onChange={setPrompt}
            onSubmit={() => startBuilder()}
          />
        </div>

        <div className="mx-auto mt-12 max-w-5xl">
          <p className="mb-4 text-center text-sm font-medium text-subtle">
            Or pick the kind of book you want to create
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {PRIMARY_GENRES.map((genre) => (
              <GenreTile
                key={genre.type}
                genre={genre}
                selected={selected?.type === genre.type}
                onSelect={(g) => {
                  setSelected(g);
                  startBuilder(g);
                }}
              />
            ))}
          </div>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => startBuilder(getGenre("other"))}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border border-dashed border-line bg-card/60 px-4 py-2.5 text-sm font-medium text-subtle transition-colors hover:border-brand/40 hover:text-ink"
              )}
            >
              <Plus className="h-4 w-4" />
              Other book type
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
