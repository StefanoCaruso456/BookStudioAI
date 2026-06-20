"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { GradientText } from "@/components/marketing/primitives/GradientText";
import { CTAButton } from "@/components/marketing/primitives/CTAButton";
import { JOURNEY_STEPS } from "@/lib/marketing";

/**
 * PublishingJourney — "The publishing studio."
 *
 * A vertical, editorial walk through the five JOURNEY_STEPS. Each step is a
 * near-full-viewport panel with a huge gradient step number, title, detail and
 * a tasteful indigo icon treatment. On desktop a sticky left rail tracks scroll
 * progress and highlights the active step. transform/opacity only; reduced
 * motion is honoured (Reveal renders statically and the rail still works as a
 * plain static index).
 */
export function PublishingJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Drive the sticky rail from the section's scroll position. We track the
  // section from when its top reaches the viewport center to when its bottom
  // does, mapping that 0→1 range onto the five steps.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative overflow-hidden bg-canvas py-24 text-ink sm:py-32"
    >
      <div className="mx-auto max-w-content px-5 sm:px-8">
        {/* Intro */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo">
            The publishing studio
          </p>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl">
            From scattered notes to a{" "}
            <GradientText>finished book</GradientText>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-subtle text-pretty">
            Five deliberate steps. Each one moves your raw material a little
            closer to the shelf — no blank page, no guesswork.
          </p>
        </Reveal>

        {/* Journey grid: sticky rail + stacked panels */}
        <div className="mt-16 grid gap-x-12 sm:mt-24 lg:grid-cols-[14rem_minmax(0,1fr)]">
          {/* DESKTOP sticky progress rail */}
          <div className="hidden lg:block" aria-hidden="true">
            <div className="sticky top-32">
              <ProgressRail progress={scrollYProgress} reduce={!!reduce} />
            </div>
          </div>

          {/* Steps */}
          <ol className="space-y-20 sm:space-y-28 lg:space-y-0">
            {JOURNEY_STEPS.map((step, i) => (
              <JourneyPanel
                key={step.n}
                index={i}
                total={JOURNEY_STEPS.length}
                step={step}
              />
            ))}
          </ol>
        </div>

        {/* Closing CTA */}
        <Reveal className="mt-20 flex flex-col items-center text-center sm:mt-28">
          <h3 className="font-display text-3xl tracking-tight text-balance sm:text-4xl">
            Your book is five steps away.
          </h3>
          <p className="mt-4 max-w-md text-base text-subtle text-pretty">
            Start with whatever you already have. We&rsquo;ll shape the rest.
          </p>
          <div className="mt-8">
            <CTAButton href="/builder" size="lg">
              Start Your Book
              <ArrowRight className="h-4 w-4" />
            </CTAButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Sticky desktop rail. A column of five labelled dots; the active one is
 * derived from scroll progress. A soft indigo bead glides down the spine.
 */
function ProgressRail({
  progress,
  reduce,
}: {
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const total = JOURNEY_STEPS.length;

  // Bead travels the full height of the rail as progress goes 0→1.
  const beadTop = useTransform(progress, [0, 1], ["0%", "100%"]);

  return (
    <div className="relative pl-1">
      {/* Spine */}
      <div className="absolute bottom-2 left-[0.4375rem] top-2 w-px bg-line" />
      {!reduce && (
        <motion.div
          style={{ top: beadTop }}
          className="absolute left-[0.1875rem] h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-indigo shadow-glow"
        />
      )}

      <ul className="relative space-y-9">
        {JOURNEY_STEPS.map((step, i) => (
          <RailItem
            key={step.n}
            progress={progress}
            index={i}
            total={total}
            n={step.n}
            title={step.title}
            reduce={reduce}
          />
        ))}
      </ul>
    </div>
  );
}

function RailItem({
  progress,
  index,
  total,
  n,
  title,
  reduce,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  n: string;
  title: string;
  reduce: boolean;
}) {
  // The window of progress "owned" by this step, with a little bleed so the
  // active state lights up slightly before the panel is dead-center.
  const segment = 1 / total;
  const start = Math.max(0, index * segment - segment * 0.4);
  const end = Math.min(1, (index + 1) * segment - segment * 0.1);

  const dotOpacity = useTransform(progress, [start, end], [0.25, 1]);
  const dotScale = useTransform(progress, [start, end], [1, 1.35]);
  const labelOpacity = useTransform(progress, [start, end], [0.45, 1]);

  return (
    <li className="flex items-center gap-3">
      <motion.span
        style={reduce ? undefined : { opacity: dotOpacity, scale: dotScale }}
        className="relative z-10 h-3 w-3 flex-none rounded-full bg-indigo"
      />
      <motion.span
        style={reduce ? undefined : { opacity: labelOpacity }}
        className="font-display text-sm tracking-tight text-ink"
      >
        <span className="mr-2 tabular-nums text-faint">{n}</span>
        {title}
      </motion.span>
    </li>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

/**
 * A single near-full-viewport step panel. Alternates the icon/number column
 * left↔right on desktop for an editorial rhythm.
 */
function JourneyPanel({
  index,
  total,
  step,
}: {
  index: number;
  total: number;
  step: (typeof JOURNEY_STEPS)[number];
}) {
  const Icon = step.icon;
  const flip = index % 2 === 1;
  const isLast = index === total - 1;

  return (
    <li
      className={[
        "flex flex-col justify-center lg:min-h-[80vh]",
        // Tighter spacing for the first/last so the sticky rail aligns nicely.
        index === 0 ? "lg:pt-0" : "",
      ].join(" ")}
    >
      <Reveal direction="up" className="w-full">
        <div
          className={[
            "grid items-center gap-8 sm:gap-12 lg:grid-cols-2",
            flip ? "lg:[&>*:first-child]:order-2" : "",
          ].join(" ")}
        >
          {/* Visual / number side */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-line bg-white p-8 shadow-soft sm:p-12">
              {/* Soft indigo wash */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-soft blur-2xl"
              />

              <div className="relative flex items-start justify-between">
                {/* Huge step number */}
                <span className="font-display text-7xl leading-none tracking-tight text-gradient sm:text-8xl">
                  {step.n}
                </span>

                {/* Icon treatment */}
                <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl border border-indigo/15 bg-indigo-soft text-indigo">
                  <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
                </span>
              </div>

              {/* Micro progress accent: a row of segment bars */}
              <div className="relative mt-10 flex items-center gap-1.5">
                {Array.from({ length: total }).map((_, j) => (
                  <span
                    key={j}
                    className={[
                      "h-1 flex-1 rounded-full transition-colors",
                      j <= index ? "bg-indigo" : "bg-line",
                    ].join(" ")}
                  />
                ))}
              </div>
              <p className="relative mt-3 text-xs font-medium uppercase tracking-[0.18em] text-faint">
                Step {step.n} of {String(total).padStart(2, "0")}
              </p>
            </div>
          </div>

          {/* Copy side */}
          <div className={flip ? "lg:pr-4" : "lg:pl-4"}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo">
              {isLast ? "Ship it" : `Phase ${step.n}`}
            </p>
            <h3 className="mt-4 font-display text-3xl leading-tight tracking-tight text-balance sm:text-4xl md:text-5xl">
              {step.title}
            </h3>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-subtle text-pretty">
              {step.detail}
            </p>
          </div>
        </div>
      </Reveal>
    </li>
  );
}
