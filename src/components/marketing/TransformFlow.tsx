"use client";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { BookCover } from "./BookCover";
import { Reveal } from "./Reveal";
import { EASE_OUT } from "@/lib/motion";

const SOURCES = [
  "Instagram Posts",
  "YouTube Videos",
  "Recipes",
  "Travel Notes",
  "Frameworks",
  "Documents",
];

const TOC = ["Introduction", "The Foundations", "Core Method", "In Practice", "Going Further"];

export function TransformFlow() {
  const reduce = useReducedMotion();
  const stageVariant = {
    hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 16 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASE_OUT, delay: i * 0.12 },
    }),
  };

  return (
    <section className="border-y border-line bg-white/60">
      <div className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            How it comes together
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            From scattered content to a finished book
          </h2>
          <p className="mt-4 text-lg text-subtle">
            Everything you&rsquo;ve already created becomes the raw material for a
            professionally structured book.
          </p>
        </Reveal>

        <div className="mt-16 flex flex-col items-stretch gap-5 lg:flex-row lg:items-center">
          {/* 1. Content */}
          <motion.div
            custom={0}
            variants={stageVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="flex-1"
          >
            <StageLabel n="01" title="Your content" />
            <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-card p-5 shadow-card">
              {SOURCES.map((s) => (
                <span
                  key={s}
                  className="rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs font-medium text-subtle"
                >
                  {s}
                </span>
              ))}
            </div>
          </motion.div>

          <Connector />

          {/* 2. Blueprint */}
          <motion.div
            custom={1}
            variants={stageVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="flex-1"
          >
            <StageLabel n="02" title="Book blueprint" />
            <div className="rounded-2xl border border-line bg-card p-5 shadow-card">
              <div className="h-2.5 w-2/3 rounded bg-brand/80" />
              <div className="mt-1.5 h-2 w-1/2 rounded bg-line" />
              <div className="mt-4 space-y-2">
                {TOC.map((t, i) => (
                  <div key={t} className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-accent">{i + 1}</span>
                    <span className="text-xs text-subtle">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <Connector />

          {/* 3. Chapters */}
          <motion.div
            custom={2}
            variants={stageVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="flex-1"
          >
            <StageLabel n="03" title="Chapters" />
            <div className="space-y-2">
              {["Drafting", "Needs review", "Complete"].map((status, i) => (
                <div
                  key={status}
                  className="flex items-center gap-3 rounded-xl border border-line bg-card p-3.5 shadow-card"
                  style={{ marginLeft: `${i * 6}px` }}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-soft text-[10px] font-bold text-brand">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 w-3/4 rounded bg-line" />
                  </div>
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                </div>
              ))}
            </div>
          </motion.div>

          <Connector />

          {/* 4. Published book */}
          <motion.div
            custom={3}
            variants={stageVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="flex flex-1 flex-col items-center"
          >
            <StageLabel n="04" title="Published book" />
            <div className="w-32 shadow-book sm:w-36">
              <BookCover
                title="The Method"
                eyebrow="A Practical Guide"
                author="Your Name"
                color="#223A4A"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StageLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="font-heading text-sm font-bold text-accent">{n}</span>
      <span className="text-sm font-semibold">{title}</span>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex shrink-0 items-center justify-center text-subtle/50 lg:px-1">
      <ArrowRight className="hidden h-5 w-5 lg:block" />
      <ArrowRight className="h-5 w-5 rotate-90 lg:hidden" />
    </div>
  );
}
