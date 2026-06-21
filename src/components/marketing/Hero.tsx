"use client";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { CTAButton } from "./primitives/CTAButton";
import { GradientText } from "./primitives/GradientText";
import { ContentChip } from "./primitives/ContentChip";
import { Book3D } from "./primitives/Book3D";
import { HERO_ITEMS } from "@/lib/marketing";

// Chips positioned around the floating book (desktop). Order matches HERO_ITEMS.
const CHIP_POS = [
  "left-[-6%] top-[12%]", // Notes
  "right-[-8%] top-[6%]", // Documents
  "left-[-10%] top-[54%]", // Instagram
  "right-[-6%] top-[48%]", // Podcasts
  "left-[8%] top-[88%]", // Newsletters
  "right-[12%] top-[90%]", // Recipes
  "left-[-2%] top-[33%]", // Images
  "right-[2%] top-[72%]", // Videos
];

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-canvas pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* ambient background */}
      <div aria-hidden className="absolute inset-0 bg-grid opacity-60" />
      <div
        aria-hidden
        className="absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-indigo/20 blur-[120px]"
      />

      <div className="relative mx-auto grid max-w-content items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        {/* copy */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-1.5 text-sm text-subtle shadow-soft backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo" />
            A guided publishing studio — not a chatbot
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="font-display mt-6 text-balance text-5xl font-bold leading-[1.04] tracking-tight text-ink sm:text-6xl lg:text-7xl"
          >
            Turn Years of Knowledge Into a{" "}
            <GradientText animate>Published Book</GradientText>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-subtle lg:mx-0"
          >
            Transform notes, documents, recipes, podcasts, newsletters, and
            expertise into a professionally written book — structured, drafted,
            and ready to publish.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
          >
            <CTAButton href="/builder" size="lg">
              Start Your Book
              <ArrowRight className="h-4 w-4" />
            </CTAButton>
            <CTAButton href="#how-it-works" variant="secondary" size="lg">
              See How It Works
            </CTAButton>
          </motion.div>
        </div>

        {/* living book */}
        <div className="relative mx-auto h-[420px] w-full max-w-md sm:h-[480px]">
          <motion.div
            className="perspective absolute inset-0 flex items-center justify-center"
            animate={reduce ? undefined : { y: [0, -14, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <div
              className="h-[340px] w-[250px] sm:h-[380px] sm:w-[280px]"
              style={{ transform: "rotateY(-22deg) rotateX(6deg)" }}
            >
              <Book3D
                title="Your Story, Structured"
                subtitle="Book Studio AI"
                cover="from-indigo to-indigo-deep"
                spine="bg-indigo-deep"
                className="h-full w-full"
              />
            </div>
          </motion.div>

          {/* drifting content chips */}
          {HERO_ITEMS.map((item, i) => (
            <motion.div
              key={item.label}
              className={`absolute hidden lg:block ${CHIP_POS[i]}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.12 }}
            >
              <motion.div
                animate={reduce ? undefined : { y: [0, i % 2 ? 10 : -10, 0] }}
                transition={{
                  duration: 5 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ContentChip icon={item.icon} label={item.label} />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
