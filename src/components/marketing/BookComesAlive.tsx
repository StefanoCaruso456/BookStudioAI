"use client";

import { useRef } from "react";
import { BookOpen, Check, FileText, List } from "lucide-react";

import { Book3D } from "@/components/marketing/primitives/Book3D";
import { GradientText } from "@/components/marketing/primitives/GradientText";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { gsap, useGSAP } from "@/lib/gsap";

const CHAPTERS = [
  "Introduction",
  "The Core Idea",
  "Foundations",
  "Putting It to Work",
  "Going Deeper",
  "Conclusion",
] as const;

/**
 * "Watch a book come alive." A dark, dramatic section where — as the reader
 * scrolls through it — a book assembles in five stages around a central
 * Book3D: cover → typography → chapter list → draft pages → published stamp.
 *
 * Robustness: the fully assembled state is the default (no-JS / reduced-motion)
 * render. The scrubbed entrance only *hides* elements from inside the GSAP
 * effect via gsap.set, so without JS everything is visible and readable.
 * On small screens the choreography degrades to simple staggered <Reveal>s.
 */
export function BookComesAlive() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (
        typeof window === "undefined" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      // Only orchestrate on desktop where the scene plays out horizontally.
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const scope = root.current;
        if (!scope) return;

        const cover = scope.querySelector<HTMLElement>("[data-stage='cover']");
        const type = scope.querySelector<HTMLElement>("[data-stage='type']");
        const chapters = scope.querySelector<HTMLElement>("[data-stage='chapters']");
        const pages = scope.querySelector<HTMLElement>("[data-stage='pages']");
        const stamp = scope.querySelector<HTMLElement>("[data-stage='stamp']");
        const typeLines = gsap.utils.toArray<HTMLElement>(
          scope.querySelectorAll("[data-type-line]")
        );
        const chapterItems = gsap.utils.toArray<HTMLElement>(
          scope.querySelectorAll("[data-chapter]")
        );

        // Hidden starting states live INSIDE the effect so the markup renders
        // fully assembled when JS is absent.
        gsap.set(cover, { opacity: 0, y: 40, rotateY: 0 });
        gsap.set(typeLines, { opacity: 0, y: 12 });
        gsap.set(chapters, { opacity: 0, x: 48 });
        gsap.set(chapterItems, { opacity: 0, x: 24 });
        gsap.set(pages, { opacity: 0, y: 40 });
        gsap.set(stamp, { opacity: 0, scale: 0.4, rotate: -16 });

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: scope,
            start: "top 75%",
            end: "bottom 70%",
            scrub: 1,
          },
        });

        // Stage 1 — the plain cover floats in, angled.
        tl.to(cover, { opacity: 1, y: 0, rotateY: -22, duration: 1.2 });
        // Stage 2 — typography resolves onto the cover.
        tl.to(
          typeLines,
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.18 },
          ">-0.2"
        );
        // Stage 3 — chapter panel slides in, items cascade.
        tl.to(chapters, { opacity: 1, x: 0, duration: 0.9 }, ">-0.1");
        tl.to(
          chapterItems,
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.12 },
          "<0.15"
        );
        // Stage 4 — draft pages stack in below.
        tl.to(pages, { opacity: 1, y: 0, duration: 0.9 }, ">-0.1");
        // Stage 5 — the published stamp snaps in.
        tl.to(
          stamp,
          { opacity: 1, scale: 1, rotate: -8, duration: 0.7, ease: "back.out(2.2)" },
          ">-0.05"
        );

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-midnight py-24 text-white sm:py-32"
    >
      {/* Ambient radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-midnight-glow"
      />

      <div className="relative mx-auto max-w-content px-5 sm:px-8">
        {/* Heading block */}
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-glow">
              From blank page to bound book
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 font-display text-4xl text-balance text-white sm:text-5xl">
              Watch a book <GradientText animate>come alive</GradientText>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-white/70 sm:text-lg">
              Scroll, and the pieces assemble themselves — a cover, a title, a
              table of contents, the first drafted pages, and the moment it ships.
            </p>
          </Reveal>
        </div>

        {/* Scene */}
        <div className="perspective mt-16 sm:mt-24">
          <div className="flex flex-col items-center gap-12 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:items-center md:gap-16">
            {/* Left — the assembling book */}
            <div className="flex w-full items-center justify-center">
              <div
                data-stage="cover"
                className="animate-float preserve-3d"
                style={{ transform: "rotateY(-22deg)" }}
              >
                <Book3D
                  cover="from-indigo to-indigo-deep"
                  spine="bg-indigo-deep"
                  className="h-[320px] w-[228px] sm:h-[380px] sm:w-[272px]"
                >
                  <div data-type-line className="h-1.5 w-10 rounded-full bg-white/70" />
                  <div>
                    <p
                      data-type-line
                      className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70"
                    >
                      Book Studio AI
                    </p>
                    <h3
                      data-type-line
                      className="mt-2 font-display text-2xl font-bold leading-tight text-white sm:text-3xl"
                    >
                      The Art of the Possible
                    </h3>
                    <p
                      data-type-line
                      className="mt-3 text-sm text-white/70"
                    >
                      A working manuscript
                    </p>
                  </div>
                </Book3D>
              </div>
            </div>

            {/* Right — chapter panel, draft pages, stamp */}
            <div className="relative w-full">
              {/* Stage 3 — chapter list */}
              <div
                data-stage="chapters"
                className="rounded-3xl border border-midnight-line bg-midnight-soft/70 p-6 shadow-book backdrop-blur sm:p-7"
              >
                <div className="flex items-center gap-2 text-indigo-glow">
                  <List className="h-4 w-4" aria-hidden />
                  <span className="text-xs font-semibold uppercase tracking-widest">
                    Contents
                  </span>
                </div>
                <ul className="mt-5 space-y-3">
                  {CHAPTERS.map((chapter, i) => (
                    <li
                      key={chapter}
                      data-chapter
                      className="flex items-center justify-between gap-4 border-b border-midnight-line/60 pb-3 last:border-0 last:pb-0"
                    >
                      <span className="flex items-center gap-3">
                        <span className="font-display text-sm text-indigo-glow/90 tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm text-white/90">{chapter}</span>
                      </span>
                      <BookOpen
                        className="h-4 w-4 text-white/30"
                        aria-hidden
                      />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stage 4 — draft pages */}
              <div
                data-stage="pages"
                className="mt-6 grid grid-cols-2 gap-4"
              >
                {[0, 1].map((page) => (
                  <div
                    key={page}
                    className="rounded-2xl border border-midnight-line bg-midnight-soft/50 p-5 shadow-soft"
                  >
                    <div className="flex items-center gap-2 text-white/50">
                      <FileText className="h-3.5 w-3.5" aria-hidden />
                      <span className="text-[10px] font-semibold uppercase tracking-widest">
                        Draft
                      </span>
                    </div>
                    <div className="mt-4 space-y-2.5">
                      {[
                        "w-full",
                        "w-[88%]",
                        "w-[94%]",
                        "w-[70%]",
                        "w-[82%]",
                      ].map((w, line) => (
                        <span
                          key={line}
                          className={`block h-2 rounded-full bg-white/15 ${w}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Stage 5 — published stamp */}
              <div
                data-stage="stamp"
                className="absolute -right-2 -top-5 sm:-right-5 sm:-top-7"
                style={{ transform: "rotate(-8deg)" }}
              >
                <div className="flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 shadow-glow ring-1 ring-white/20">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                    <Check className="h-3.5 w-3.5 text-white" aria-hidden />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-white">
                    Published
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
