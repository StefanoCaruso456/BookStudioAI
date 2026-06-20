"use client";

import { BookOpen, Sparkles } from "lucide-react";

import { Book3D } from "@/components/marketing/primitives/Book3D";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { GradientText } from "@/components/marketing/primitives/GradientText";
import { CTAButton } from "@/components/marketing/primitives/CTAButton";

/** Invented, tasteful chapter titles for the example finished book. */
const CHAPTERS = [
  "The Morning You Decide",
  "Small Systems, Big Momentum",
  "Designing a Day That Holds",
  "When the Plan Meets Resistance",
  "Becoming the Person Who Finishes",
] as const;

/**
 * FeaturedBook — "See what's possible."
 *
 * A featured EXAMPLE result, clearly labelled as a sample output. A large
 * floating hero 3D book on the left; a mock "inside the finished book" panel
 * on the right with title, promise, chapter list, and back-cover blurb lines.
 */
export function FeaturedBook() {
  return (
    <section id="featured" className="bg-indigo-soft/40 py-24 sm:py-32">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo">
              The finished product
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-4 font-display text-4xl text-ink text-balance sm:text-5xl">
              See what&apos;s <GradientText>possible</GradientText>.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 text-lg text-subtle text-pretty">
              Here&apos;s an example of where a single idea can land — a complete,
              polished book with a title, a promise, and chapters that actually
              hang together.
            </p>
          </Reveal>
        </div>

        {/* Two-column showcase */}
        <div className="mt-16 grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — hero 3D book, floating & angled */}
          <Reveal direction="right" className="flex justify-center lg:justify-end">
            <div className="perspective">
              <div
                className="preserve-3d animate-float"
                style={{ transform: "rotateY(-26deg) rotateX(8deg)" }}
              >
                <Book3D
                  cover="from-indigo to-indigo-deep"
                  spine="bg-indigo-deep"
                  className="h-[26rem] w-72 sm:h-[30rem] sm:w-80"
                >
                  <div className="flex h-1.5 w-10 rounded-full bg-white/70" />
                  <div className="flex flex-1 items-center justify-center">
                    <BookOpen
                      aria-hidden
                      className="h-14 w-14 text-white/85"
                      strokeWidth={1.25}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/65">
                      A Book Studio AI Original
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-bold leading-tight text-white">
                      The Quiet Discipline
                    </h3>
                    <p className="mt-2 text-xs text-white/75">
                      How ordinary days build an extraordinary life
                    </p>
                  </div>
                </Book3D>
              </div>
            </div>
          </Reveal>

          {/* Right — "inside the finished book" panel */}
          <Reveal direction="left" delay={0.1}>
            <div className="relative rounded-3xl border border-line bg-white p-8 shadow-lift sm:p-10">
              {/* Example tag */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-indigo">
                <Sparkles aria-hidden className="h-3.5 w-3.5" />
                Example output
              </span>

              <h3 className="mt-5 font-display text-3xl text-ink">
                The Quiet Discipline
              </h3>
              <p className="mt-2 text-base text-subtle text-pretty">
                How ordinary days build an extraordinary life.
              </p>

              {/* Chapter list */}
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-subtle">
                  Table of contents
                </p>
                <ol className="mt-4 space-y-3">
                  {CHAPTERS.map((chapter, i) => (
                    <li key={chapter} className="flex items-baseline gap-4">
                      <span className="font-display text-sm tabular-nums text-indigo/70">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[15px] text-ink">{chapter}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Back-cover blurb */}
              <div className="mt-8 rounded-2xl bg-canvas p-5">
                <p className="text-sm leading-relaxed text-subtle text-pretty">
                  &ldquo;You don&apos;t need a dramatic transformation. You need a
                  day that quietly works — and the willingness to live it again
                  tomorrow.&rdquo;
                </p>
                <p className="mt-3 text-sm leading-relaxed text-subtle text-pretty">
                  A warm, practical guide to building momentum from the small,
                  repeatable choices most people overlook.
                </p>
              </div>

              <div className="mt-8">
                <CTAButton href="/builder" size="lg">
                  Start Your Book
                </CTAButton>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
