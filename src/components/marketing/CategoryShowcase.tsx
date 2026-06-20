"use client";

import { motion, useReducedMotion } from "framer-motion";

import { Book3D } from "@/components/marketing/primitives/Book3D";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { GradientText } from "@/components/marketing/primitives/GradientText";
import { CATEGORIES } from "@/lib/marketing";

/**
 * CategoryShowcase — "A book for your kind of expertise."
 *
 * A premium grid of the six book categories, each rendered as a CSS 3D book
 * angled in perspective, with its title, blurb, and icon beneath. Books lift
 * and tilt on hover (desktop) and sit gracefully static on touch / reduced
 * motion.
 */
export function CategoryShowcase() {
  const reduce = useReducedMotion();

  return (
    <section id="categories" className="bg-canvas py-24 sm:py-32">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo">
              Every kind of book
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-4 font-display text-4xl text-ink text-balance sm:text-5xl">
              A book for your kind of{" "}
              <GradientText>expertise</GradientText>.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 text-lg text-subtle text-pretty">
              Whatever you know best, there&apos;s a form built for it. Each genre
              is shaped with its own structure, voice, and craft — so your book
              reads like it was always meant to exist.
            </p>
          </Reveal>
        </div>

        {/* Grid */}
        <ul className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 sm:gap-y-16 lg:grid-cols-3">
          {CATEGORIES.map((category, i) => {
            const Icon = category.icon;

            return (
              <Reveal
                as="li"
                key={category.title}
                delay={i * 0.08}
                className="flex flex-col items-center text-center"
              >
                {/* Book — perspective parent, motion child for hover tilt */}
                <div className="perspective">
                  <motion.div
                    className="preserve-3d"
                    initial={false}
                    style={{
                      transform: reduce
                        ? undefined
                        : "rotateY(-22deg) rotateX(6deg)",
                    }}
                    whileHover={
                      reduce
                        ? undefined
                        : {
                            y: -10,
                            scale: 1.03,
                            rotateY: -14,
                            rotateX: 4,
                          }
                    }
                    transition={{
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Book3D
                      cover={category.cover}
                      spine={category.spine}
                      className="h-64 w-44"
                    >
                      <div className="flex h-1.5 w-8 rounded-full bg-white/70" />
                      <div className="flex items-center justify-center">
                        <Icon
                          aria-hidden
                          className="h-9 w-9 text-white/90"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold leading-tight text-white">
                          {category.title}
                        </h3>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/65">
                          Book Studio AI
                        </p>
                      </div>
                    </Book3D>
                  </motion.div>
                </div>

                {/* Caption */}
                <div className="mt-9 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-soft text-indigo">
                    <Icon aria-hidden className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <h3 className="font-display text-xl text-ink">
                    {category.title}
                  </h3>
                </div>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-subtle text-pretty">
                  {category.blurb}
                </p>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
