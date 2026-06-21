"use client";

import { useRef } from "react";
import { Sparkles } from "lucide-react";
import { ContentChip } from "@/components/marketing/primitives/ContentChip";
import { GradientText } from "@/components/marketing/primitives/GradientText";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { CONTENT_ITEMS } from "@/lib/marketing";
import { gsap, useGSAP } from "@/lib/gsap";

export function NarrativeConverge() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduce) return;

      const mm = gsap.matchMedia();

      // Rich pinned scrollytelling only on large screens, where there's room
      // for the orbit to clear the headline. Smaller screens use the clean
      // stacked layout below.
      mm.add("(min-width: 1024px)", () => {
        const r = root.current;
        if (!r) return;
        const stage = r.querySelector<HTMLElement>(".nc-stage");
        const chips = gsap.utils.toArray<HTMLElement>(".nc-chip");
        const beat1 = r.querySelector(".nc-beat-1");
        const beat2 = r.querySelector(".nc-beat-2");
        const beat3 = r.querySelector(".nc-beat-3");
        const orb = r.querySelector(".nc-orb");
        const glow = r.querySelector(".nc-glow");
        const darken = r.querySelector(".nc-darken");
        if (!stage || !chips.length) return;

        // Geometry derived from the stage so it scales with the viewport.
        // - chips sit on an ellipse around the headline (22.5° offset keeps
        //   them off the horizontal axis, so none land on the text)
        // - the core crowns ABOVE the headline; chips converge up into it
        const heads = stage.querySelector<HTMLElement>(".nc-heads");
        const geom = () => {
          const sRect = stage.getBoundingClientRect();
          const w = sRect.width;
          const h = sRect.height;
          const rx = gsap.utils.clamp(300, 560, w * 0.48);
          const ry = gsap.utils.clamp(190, 300, h * 0.44);
          // Crown the core a fixed gap ABOVE the headline block (measured) so it
          // can never overlap the text, however the headline wraps.
          const ORB_RADIUS = 40;
          const GAP = 28;
          let orbY = -h * 0.34;
          if (heads) {
            const hRect = heads.getBoundingClientRect();
            orbY = hRect.top - sRect.top - h / 2 - GAP - ORB_RADIUS;
          }
          const n = chips.length;
          const ring = chips.map((_, i) => {
            const angle = ((-90 + 22.5 + (360 / n) * i) * Math.PI) / 180;
            return { x: Math.cos(angle) * rx, y: Math.sin(angle) * ry };
          });
          return { ring, orbY };
        };
        let { ring, orbY } = geom();

        // Readable default (also the no-JS state).
        gsap.set([beat2, beat3], { autoAlpha: 0 });
        gsap.set(beat1, { autoAlpha: 1 });
        gsap.set(darken, { opacity: 0 });
        gsap.set(glow, { autoAlpha: 0 });
        gsap.set(orb, { xPercent: -50, yPercent: -50, y: orbY, autoAlpha: 0, scale: 0.6 });
        gsap.set(chips, {
          xPercent: -50,
          yPercent: -50,
          x: (i) => ring[i].x,
          y: (i) => ring[i].y,
          rotate: 0,
          scale: 1,
          autoAlpha: 1,
        });

        const onResize = () => {
          ({ ring, orbY } = geom());
          gsap.set(orb, { y: orbY });
          gsap.set(chips, { x: (i) => ring[i].x, y: (i) => ring[i].y });
        };
        window.addEventListener("resize", onResize);

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: r,
            start: "top top",
            end: "+=2600",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        // Beat 1 → 2: chips drift outward and dim; headline crossfades.
        tl.to(beat1, { autoAlpha: 0, duration: 0.4 }, 0.6)
          .to(beat2, { autoAlpha: 1, duration: 0.4 }, 1.0)
          .to(
            chips,
            {
              x: (i) => ring[i].x * 1.45,
              y: (i) => ring[i].y * 1.45,
              opacity: 0.3,
              scale: 0.9,
              duration: 1.2,
              ease: "power1.out",
            },
            0.4
          );

        // Beat 2 → 3: background deepens to midnight, the core ignites above
        // the headline, and chips are pulled up into it.
        tl.to(darken, { opacity: 1, duration: 1.0 }, 1.8)
          .to(beat2, { autoAlpha: 0, duration: 0.4 }, 2.0)
          .to(beat3, { autoAlpha: 1, duration: 0.4 }, 2.4)
          .to(orb, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "back.out(1.6)" }, 2.2)
          .to(glow, { autoAlpha: 1, duration: 1.0, ease: "power1.inOut" }, 1.8)
          .to(
            chips,
            {
              x: 0,
              y: orbY,
              rotate: 0,
              opacity: 0,
              scale: 0.5,
              duration: 1.3,
              ease: "power3.inOut",
              stagger: { each: 0.045, from: "edges" },
            },
            2.0
          );

        return () => {
          window.removeEventListener("resize", onResize);
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
      className="relative isolate overflow-hidden bg-canvas py-24 text-ink sm:py-32"
    >
      {/* Soft radial glow that blooms as the story converges */}
      <div
        aria-hidden
        className="nc-glow pointer-events-none absolute inset-0 -z-10 bg-midnight-glow opacity-0"
      />
      {/* Midnight backdrop that fades in for the convergence so the white
          beat-3 text reads on a dark surface (animated by GSAP; on small
          screens / no-JS the dark card below carries the same role). */}
      <div
        aria-hidden
        className="nc-darken pointer-events-none absolute inset-0 bg-midnight opacity-0"
      />

      <div className="relative mx-auto max-w-content px-5 sm:px-8">
        {/* ───────────────────────── DESKTOP STAGE (lg+) ───────────────────── */}
        <div className="hidden lg:block">
          <div className="nc-stage relative mx-auto flex min-h-[72vh] max-w-5xl items-center justify-center">
            {/* Orbit field — sits behind the headline */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              {/* Luminous convergence core — crowns above the headline */}
              {/* Core transform is owned entirely by GSAP (positioning); the
                  pulse animation lives on the inner glow so its CSS transform
                  doesn't clobber the GSAP placement. */}
              <div className="nc-orb absolute left-1/2 top-1/2 flex h-20 w-20 items-center justify-center rounded-full bg-brand-gradient shadow-glow">
                <span className="absolute inset-0 rounded-full bg-brand-gradient opacity-60 blur-2xl animate-pulse-glow" />
                <Sparkles className="relative h-8 w-8 text-white" />
              </div>

              {CONTENT_ITEMS.map((item) => (
                <ContentChip
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  className="nc-chip absolute left-1/2 top-1/2 will-change-transform"
                />
              ))}
            </div>

            {/* Crossfading headline blocks, stacked on the same center */}
            <div className="nc-heads relative z-10 grid max-w-xl place-items-center text-center">
              <div className="nc-beat-1 col-start-1 row-start-1">
                <h2 className="font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">
                  Your book already exists.
                </h2>
                <p className="mx-auto mt-5 max-w-md text-pretty text-lg text-subtle">
                  It&apos;s hiding in notes, documents, emails, posts, recipes,
                  and years of experience.
                </p>
              </div>

              <div className="nc-beat-2 col-start-1 row-start-1">
                <h2 className="font-display text-4xl font-bold tracking-tight text-balance text-ink sm:text-5xl">
                  Most books never get written.
                </h2>
                <p className="mx-auto mt-5 max-w-md text-pretty text-lg text-subtle">
                  Scattered ideas drift apart, fade, and quietly disappear.
                </p>
              </div>

              <div className="nc-beat-3 col-start-1 row-start-1">
                <h2 className="font-display text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl">
                  Book Studio AI turns knowledge into{" "}
                  <GradientText animate>structure</GradientText>.
                </h2>
                <p className="mx-auto mt-5 max-w-md text-pretty text-lg text-white/75">
                  Every fragment is pulled into one luminous, ordered narrative.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────── SMALLER SCREENS (stacked) ───────────────────── */}
        <div className="space-y-24 lg:hidden">
          <Reveal direction="up">
            <div className="text-center">
              <h2 className="font-display text-4xl font-bold tracking-tight text-balance">
                Your book already exists.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-pretty text-base text-subtle">
                It&apos;s hiding in notes, documents, emails, posts, recipes, and
                years of experience.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                {CONTENT_ITEMS.map((item) => (
                  <ContentChip key={item.label} icon={item.icon} label={item.label} />
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
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-brand-gradient shadow-glow animate-pulse-glow">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h2 className="font-display text-4xl font-bold tracking-tight text-balance text-white">
                Book Studio AI turns knowledge into{" "}
                <GradientText animate>structure</GradientText>.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-pretty text-base text-white/75">
                Every fragment is pulled into one luminous, ordered narrative.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
