"use client";

import { useRef } from "react";
import {
  Lightbulb,
  Type,
  ListTree,
  LayoutList,
  PenLine,
  BookCheck,
  type LucideIcon,
} from "lucide-react";

import { Reveal } from "@/components/marketing/primitives/Reveal";
import { GradientText } from "@/components/marketing/primitives/GradientText";
import { CTAButton } from "@/components/marketing/primitives/CTAButton";
import { BLUEPRINT_STAGES } from "@/lib/marketing";
import { gsap, useGSAP } from "@/lib/gsap";

/** One icon per blueprint stage, in the same order as BLUEPRINT_STAGES. */
const STAGE_ICONS: readonly LucideIcon[] = [
  Lightbulb, // Idea
  Type, // Title
  ListTree, // Outline
  LayoutList, // Chapters
  PenLine, // Draft
  BookCheck, // Published Book
];

export function BlueprintBuild() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (
        typeof window === "undefined" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      const root = ref.current;
      if (!root) return;

      const spine = root.querySelector<HTMLElement>("[data-spine]");
      const nodes = gsap.utils.toArray<HTMLElement>("[data-node]", root);
      if (!spine || nodes.length === 0) return;

      // Hidden starting states live INSIDE the effect, so a no-JS render keeps
      // the timeline fully drawn and readable.
      gsap.set(spine, { scaleY: 0, transformOrigin: "top center" });
      gsap.set(nodes, { autoAlpha: 0, y: 36 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: root,
          start: "top 72%",
          end: "bottom 70%",
          scrub: 1,
        },
      });

      tl.to(spine, { scaleY: 1, duration: nodes.length, ease: "none" }, 0);

      nodes.forEach((node, i) => {
        tl.to(
          node,
          { autoAlpha: 1, y: 0, duration: 0.6 },
          // Stagger each node along the same scrubbed timeline so it appears
          // as the spine draws past it.
          i * 0.92,
        );
      });
    },
    { scope: ref },
  );

  return (
    <section id="blueprint" className="bg-canvas py-24 sm:py-32">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo">
              The Blueprint
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-4 font-display text-4xl text-ink text-balance sm:text-5xl">
              From a spark of an idea to a{" "}
              <GradientText>finished book</GradientText>.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 text-lg text-subtle text-pretty">
              Watch your raw knowledge take shape, one deliberate step at a time —
              every stage building on the last until a real, publishable book
              stands complete.
            </p>
          </Reveal>
        </div>

        {/* Timeline */}
        <div ref={ref} className="relative mx-auto mt-16 max-w-2xl sm:mt-20">
          {/* The spine: a static base line with an animated indigo overlay that
              draws downward. Positioned to run through the node icons. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-6 top-6 left-6 w-px sm:left-7"
          >
            <div className="absolute inset-0 bg-line" />
            <div
              data-spine
              className="absolute inset-0 bg-gradient-to-b from-indigo-glow via-indigo to-indigo-deep"
            />
          </div>

          <ol className="space-y-10 sm:space-y-12">
            {BLUEPRINT_STAGES.map((stage, i) => {
              const Icon = STAGE_ICONS[i] ?? BookCheck;
              const number = String(i + 1).padStart(2, "0");
              const isLast = i === BLUEPRINT_STAGES.length - 1;

              return (
                <li
                  key={stage.label}
                  data-node
                  className="relative flex items-start gap-5 sm:gap-7"
                >
                  {/* Node marker */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={
                        "flex h-12 w-12 items-center justify-center rounded-full ring-4 ring-canvas sm:h-14 sm:w-14 " +
                        (isLast
                          ? "bg-brand-gradient text-white shadow-glow"
                          : "bg-indigo-soft text-indigo shadow-soft")
                      }
                    >
                      <Icon
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* Card */}
                  <div
                    className={
                      "flex-1 rounded-2xl border border-line bg-white px-5 py-4 transition-shadow duration-300 hover:shadow-lift sm:px-6 sm:py-5 " +
                      (isLast ? "shadow-lift" : "shadow-soft")
                    }
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-sm font-semibold text-indigo-glow">
                        {number}
                      </span>
                      <h3 className="font-display text-xl text-ink sm:text-2xl">
                        {isLast ? (
                          <GradientText>{stage.label}</GradientText>
                        ) : (
                          stage.label
                        )}
                      </h3>
                    </div>
                    <p className="mt-1.5 text-sm text-subtle text-pretty sm:text-base">
                      {stage.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* CTA */}
        <Reveal className="mt-16 flex flex-col items-center gap-4 text-center sm:mt-20">
          <p className="font-display text-2xl text-ink sm:text-3xl">
            Your book is closer than you think.
          </p>
          <CTAButton href="/builder" variant="primary" size="lg">
            Start Your Book
          </CTAButton>
        </Reveal>
      </div>
    </section>
  );
}
