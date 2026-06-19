"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Reveal } from "./Reveal";

const STEPS = [
  { title: "Add your content", body: "Connect posts, videos, recipes, notes, and documents — or just start with an idea." },
  { title: "Build the blueprint", body: "Get titles, a table of contents, and chapter summaries. Edit anything, then approve." },
  { title: "Generate chapters", body: "Draft your book chapter by chapter, written in your own voice." },
  { title: "Edit & refine", body: "Developmental, clarity, grammar, and tone passes — like an editor on call." },
  { title: "Publish", body: "Cover concepts, description, keywords, and a KDP-ready checklist — done." },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 65%", "end 60%"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.6 });

  return (
    <section className="border-y border-line bg-white/60">
      <div className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            The process
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Five steps to a finished book
          </h2>
          <p className="mt-4 text-lg text-subtle">
            You always know where you are, what to do next, and how close you are
            to publishing.
          </p>
        </Reveal>

        <div ref={ref} className="relative mx-auto mt-16 max-w-2xl">
          {/* progress track + fill */}
          <div className="absolute bottom-3 left-[23px] top-3 w-px bg-line" />
          <motion.div
            style={{ scaleY }}
            className="absolute bottom-3 left-[23px] top-3 w-px origin-top bg-accent"
          />

          <div className="space-y-12">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={0.04 * i} className="relative flex gap-6">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-card font-heading text-lg font-bold text-brand shadow-card">
                  {i + 1}
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-bold tracking-tight">{step.title}</h3>
                  <p className="mt-1.5 max-w-md text-subtle">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
