"use client";
import { useRouter } from "next/navigation";
import {
  Utensils,
  Dumbbell,
  Compass,
  Map,
  BookOpen,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { BookCover } from "./BookCover";
import { Reveal, RevealGroup, RevealItem } from "./Reveal";
import { SAMPLE_BOOKS } from "@/lib/sampleBooks";
import { getGenre } from "@/lib/genres";
import { useStore } from "@/lib/store";
import type { BookType } from "@/types/book";

const ICONS: Record<BookType, LucideIcon> = {
  cookbook: Utensils,
  fitness_diet: Dumbbell,
  coaching_self_help: Compass,
  travel_guide: Map,
  memoir_biography: BookOpen,
  business_expert: Briefcase,
  other: BookOpen,
};

export function GenreShowcase() {
  const router = useRouter();
  const setDraft = useStore((s) => s.setDraft);
  const resetDraft = useStore((s) => s.resetDraft);

  function open(type: BookType) {
    resetDraft(type);
    setDraft({ bookType: type, initialPrompt: "" });
    router.push("/builder");
  }

  return (
    <section className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Built for your craft
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Every kind of book, done beautifully
        </h2>
        <p className="mt-4 text-lg text-subtle">
          Pick your genre and we tailor the entire studio — structure, prompts,
          and output — to it.
        </p>
      </Reveal>

      <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_BOOKS.map((book) => {
          const genre = getGenre(book.bookType);
          const Icon = ICONS[book.bookType];
          return (
            <RevealItem key={book.bookType}>
              <button
                onClick={() => open(book.bookType)}
                className="group flex h-full w-full items-center gap-4 overflow-hidden rounded-2xl border border-line bg-card p-5 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-lift"
              >
                <div className="min-w-0 flex-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-canvas text-ink transition-colors group-hover:border-accent/40 group-hover:text-accent">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 font-semibold tracking-tight">{genre.label}</h3>
                  {/* cross-fade tagline → sample on hover */}
                  <div className="relative mt-1 h-10">
                    <p className="absolute inset-0 text-sm text-subtle transition-all duration-300 group-hover:-translate-y-1 group-hover:opacity-0">
                      {genre.tagline}
                    </p>
                    <div className="absolute inset-0 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="truncate text-sm font-medium text-ink">{book.title}</p>
                      <p className="text-xs font-medium text-accent">
                        {book.pages} Page {book.genreLabel}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-20 shrink-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.04] group-hover:shadow-book">
                  <BookCover
                    title={book.title}
                    eyebrow={book.eyebrow}
                    author={book.author}
                    color={book.color}
                  />
                </div>
              </button>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
