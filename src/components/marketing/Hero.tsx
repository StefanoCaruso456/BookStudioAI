"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PromptBar } from "@/components/landing/PromptBar";
import { Book3D } from "./BookCover";
import { useStore } from "@/lib/store";
import { EASE_OUT } from "@/lib/motion";

export function Hero() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const setDraft = useStore((s) => s.setDraft);
  const resetDraft = useStore((s) => s.resetDraft);
  const [prompt, setPrompt] = useState("");

  function start() {
    resetDraft("cookbook");
    setDraft({ bookType: "cookbook", initialPrompt: prompt });
    router.push("/builder");
  }

  const fade = {
    hidden: { opacity: 0, y: reduce ? 0 : 22 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: EASE_OUT, delay: 0.05 * i },
    }),
  };

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-32 h-[26rem] bg-gradient-to-b from-accent-soft/50 to-transparent" />
      <div className="relative mx-auto grid max-w-content items-center gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pt-28">
        {/* copy */}
        <div className="text-center lg:text-left">
          <motion.span
            custom={0}
            variants={fade}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-subtle shadow-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            A guided publishing studio
          </motion.span>

          <motion.h1
            custom={1}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-5 text-balance text-[2.6rem] font-extrabold leading-[1.04] tracking-tight sm:text-6xl"
          >
            Turn Your Content Into a{" "}
            <span className="text-accent">Published Book</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mx-auto mt-6 max-w-xl text-balance text-lg leading-relaxed text-subtle lg:mx-0"
          >
            Book Studio AI helps creators, chefs, coaches, and experts transform
            their knowledge into professionally structured books.
          </motion.p>

          <motion.div
            custom={3}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mx-auto mt-8 max-w-xl lg:mx-0"
          >
            <PromptBar value={prompt} onChange={setPrompt} onSubmit={start} />
          </motion.div>
        </div>

        {/* hero book */}
        <motion.div
          initial={{ opacity: 0, scale: reduce ? 1 : 0.92, y: reduce ? 0 : 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.2 }}
          className="mx-auto w-full max-w-[19rem] sm:max-w-[21rem]"
        >
          <Book3D
            title="Nonna's Italian Kitchen"
            eyebrow="Recipes & Family Stories"
            author="Maria Conti"
            color="#B97845"
          />
        </motion.div>
      </div>
    </section>
  );
}
