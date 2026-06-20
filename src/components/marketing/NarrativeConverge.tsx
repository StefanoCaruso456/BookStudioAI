"use client";

import { useRef } from "react";
import { Sparkles } from "lucide-react";
import { ContentChip } from "@/components/marketing/primitives/ContentChip";
import { GradientText } from "@/components/marketing/primitives/GradientText";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { CONTENT_ITEMS } from "@/lib/marketing";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Scatter positions (in % of the stage box) for each content chip in beat 1.
 * Hand-placed so the eight chips orbit the headline without overlapping it.
 * x/y are the chip CENTER expressed as a percentage offset from stage center.
 */
const SCATTER: { x: number; y: number; r: number }[] = [
  { x: -34, y: -30, r: -7 },
  { x: 33, y: -34, r: 6 },
  { x: -42, y: 2, r: -4 },
  { x: 41, y: -4, r: 5 },
  { x: -30, y: 31, r: 5 },
  { x: 30, y: 33, r: -6 },
  { x: -8, y: -40, r: -3 },
  { x: 9, y: 40, r: 4 },
];

export function NarrativeConverge() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduce) return;

      const mm = gsap.matchMedia();

      // ── DESKTOP: pin + scrub through the three emotional beats ──────────
      mm.add("(min-width: 768px)", () => {
        const r = root.current;
        if (!r) return;
        const chips = gsap.utils.toArray<HTMLElement>(".nc-chip");
        const beat1 = r.querySelector(".nc-beat-1");
        const beat2 = r.querySelector(".nc-beat-2");
        const beat3 = r.querySelector(".nc-beat-3");
        const orb = r.querySelector(".nc-orb");
        const glow = r.querySelector(".nc-glow");

        // Starting (readable) state set here so non-JS users keep the final
        // layout. Beat 1 visible, chips scattered, orb hidden.
        gsap.set([beat2, beat3], { autoAlpha: 0 });
        gsap.set(beat1, { autoAlpha: 1 });
        gsap.set(orb, { autoAlpha: 0, scale: 0.6 });
        gsap.set(glow, { autoAlpha: 0 });
        chips.forEach((chip, i) => {
          const p = SCATTER[i % SCATTER.length];
          gsap.set(chip, {
            xPercent: p.x,
            yPercent: p.y,
            rotate: p.r,
            scale: 1,
            autoAlpha: 1,
          });
        });

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=2600",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        // Beat 1 → Beat 2: chips drift apart + dim, headline crossfades.
        tl.to(beat1, { autoAlpha: 0, duration: 0.4 }, 0.6)
          .to(beat2, { autoAlpha: 1, duration: 0.4 }, 1.0)
          .to(
            chips,
            {
              xPercent: (i) => SCATTER[i % SCATTER.length].x * 1.7,
              yPercent: (i) => SCATTER[i % SCATTER.length].y * 1.7,
              opacity: 0.28,
              scale: 0.92,
              duration: 1.2,
              ease: "power1.out",
            },
            0.4
          );

        // Beat 2 → Beat 3: chips pulled to center, orb ignites, order returns.
        tl.to(beat2, { autoAlpha: 0, duration: 0.4 }, 2.0)
          .to(beat3, { autoAlpha: 1, duration: 0.4 }, 2.4)
          .to(
            orb,
            { autoAlpha: 1, scale: 1, duration: 0.8, ease: "back.out(1.6)" },
            2.2
          )
          .to(glow, { autoAlpha: 1, duration: 1.0, ease: "power1.inOut" }, 1.8)
          .to(
            chips,
            {
              xPercent: 0,
              yPercent: 0,
              rotate: 0,
              opacity: 0.9,
              scale: 0.78,
              duration: 1.3,
              ease: "power3.inOut",
              stagger: { each: 0.04, from: "edges" },
            },
            2.0
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
      className="relative isolate overflow-hidden bg-canvas py-24 text-ink transition-colors sm:py-32"
    >
      {/* Background wash that deepens toward midnight as the story converges */}
      <div
        aria-hidden
        className="nc-glow pointer-events-none absolute inset-0 -z-10 bg-midnight-glow opacity-0"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-b from-canvas via-canvas to-midnight/95"
      />

      <div className="mx-auto max-w-content px-5 sm:px-8">
        {/* ───────────────────────── DESKTOP STAGE ───────────────────────── */}
        <div className="hidden md:block">
          <div className="relative mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center">
            {/* Chip field — absolutely centered, driven by GSAP transforms */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              {/* Luminous convergence engine */}
              <div className="nc-orb absolute flex h-28 w-28 items-center justify-center rounded-full bg-brand shadow-glow animate-pulse-glow">
                <span className="absolute inset-0 rounded-full bg-brand blur-2xl opacity-60" />
                <Sparkles className="relative h-9 w-9 text-white" />
              </div>

              {CONTENT_ITEMS.map((item) => (
                <ContentChip
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  className="nc-chip absolute will-change-transform"
                />
              ))}
            </div>

            {/* Crossfading headline blocks, stacked on the same center */}
            <div className="relative z-10 grid place-items-center text-center">
              <div className="nc-beat-1 col-start-1 row-start-1 max-w-2xl">
                <h2 className="font-display text-4xl font-bold tracking-tight text-balance sm:text-6xl">
                  Your book already exists.
                </h2>
                <p className="mx-auto mt-5 max-w-md text-pretty text-lg text-subtle">
                  It&apos;s hiding in notes, documents, emails, posts, recipes,
                  and years of experience.
                </p>
              </div>

              <div className="nc-beat-2 col-start-1 row-start-1 max-w-2xl">
                <h2 className="font-display text-4xl font-bold tracking-tight text-balance text-ink sm:text-6xl">
                  Most books never get written.
                </h2>
                <p className="mx-auto mt-5 max-w-md text-pretty text-lg text-subtle">
                  Scattered ideas drift apart, fade, and quietly disappear.
                </p>
              </div>

              <div className="nc-beat-3 col-start-1 row-start-1 max-w-2xl">
                <h2 className="font-display text-4xl font-bold tracking-tight text-balance text-white sm:text-6xl">
                  Book Studio AI turns knowledge into{" "}
                  <GradientText animate>structure</GradientText>.
                </h2>
                <p className="mx-auto mt-5 max-w-md text-pretty text-lg text-white/70">
                  Every fragment is pulled into one luminous, ordered narrative.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ───────────────────────── MOBILE (stacked) ────────────────────── */}
        <div className="space-y-24 md:hidden">
          <Reveal direction="up">
            <div className="text-center">
              <h2 className="font-display text-4xl font-bold tracking-tight text-balance">
                Your book already exists.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-pretty text-base text-subtle">
                It&apos;s hiding in notes, documents, emails, posts, recipes,
                and years of experience.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                {CONTENT_ITEMS.map((item) => (
                  <ContentChip
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                  />
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.05}>
            <div className="text-center">
              <h2 className="font-display text-4xl font-bold tracking-tight text-balance">
                Most books never get written.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-pretty text-base text-subtle">
                Scattered ideas drift apart, fade, and quietly disappear.
              </p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.05}>
            <div className="rounded-3xl bg-midnight px-6 py-12 text-center shadow-book">
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-brand shadow-glow animate-pulse-glow">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h2 className="font-display text-4xl font-bold tracking-tight text-balance text-white">
                Book Studio AI turns knowledge into{" "}
                <GradientText animate>structure</GradientText>.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-pretty text-base text-white/70">
                Every fragment is pulled into one luminous, ordered narrative.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
