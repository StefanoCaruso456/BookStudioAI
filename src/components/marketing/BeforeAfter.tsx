"use client";
import { ArrowRight, Check, FileText, StickyNote, Hash, Utensils, FileType2 } from "lucide-react";
import { BookCover } from "./BookCover";
import { Reveal } from "./Reveal";

const BEFORE = [
  { label: "Scattered notes", icon: StickyNote, rotate: "-3deg" },
  { label: "Old PDFs", icon: FileText, rotate: "2deg" },
  { label: "Social posts", icon: Hash, rotate: "-1.5deg" },
  { label: "Recipes", icon: Utensils, rotate: "3deg" },
  { label: "Documents", icon: FileType2, rotate: "-2deg" },
];

const AFTER = ["Professional book cover", "Structured chapters", "Author bio", "Publishing kit"];

export function BeforeAfter() {
  return (
    <section className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          The transformation
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          What you have, into what you&rsquo;ve always wanted
        </h2>
      </Reveal>

      <div className="mt-14 grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
        {/* BEFORE */}
        <Reveal>
          <div className="rounded-2xl border border-line bg-canvas p-7 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-subtle">
              Before
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 py-4">
              {BEFORE.map((item) => (
                <div
                  key={item.label}
                  style={{ transform: `rotate(${item.rotate})` }}
                  className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm text-subtle shadow-sm grayscale"
                >
                  <item.icon className="h-4 w-4" strokeWidth={1.75} />
                  {item.label}
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-sm text-subtle">
              Valuable knowledge — stuck in fragments.
            </p>
          </div>
        </Reveal>

        {/* arrow */}
        <Reveal delay={0.1} className="flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lift lg:h-14 lg:w-14">
            <ArrowRight className="h-5 w-5 rotate-90 lg:rotate-0" />
          </span>
        </Reveal>

        {/* AFTER */}
        <Reveal delay={0.15}>
          <div className="rounded-2xl border border-line bg-card p-7 shadow-lift">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              After
            </p>
            <div className="mt-6 flex items-center gap-5">
              <div className="w-24 shrink-0 shadow-book">
                <BookCover
                  title="Nonna's Italian Kitchen"
                  eyebrow="Recipes & Family Stories"
                  author="Maria Conti"
                  color="#B97845"
                />
              </div>
              <ul className="space-y-2.5">
                {AFTER.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-medium">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-5 text-sm text-subtle">
              A finished, publish-ready book with your name on the cover.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
