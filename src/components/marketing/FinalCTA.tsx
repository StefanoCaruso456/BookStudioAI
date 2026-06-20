import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { GradientText } from "@/components/marketing/primitives/GradientText";
import { CTAButton } from "@/components/marketing/primitives/CTAButton";

/** Dark, dramatic closing call-to-action section. */
export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-midnight py-28 sm:py-40">
      {/* Radial glow layer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-midnight-glow"
      />

      <div className="relative mx-auto max-w-content px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-glow">
              Your turn
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-4xl leading-[1.1] text-white text-balance sm:text-6xl">
              Your book is already{" "}
              <GradientText animate>inside you.</GradientText>
            </h2>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70 text-pretty">
              Bring what you already know. We'll shape it into a blueprint, draft
              every chapter in your voice, and ready it for the world.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <CTAButton href="/builder" variant="primary" size="lg">
                Start Your Book
                <ArrowRight aria-hidden className="h-4 w-4" />
              </CTAButton>
              <CTAButton
                href="#how-it-works"
                variant="secondary"
                size="lg"
                onDark
              >
                See How It Works
              </CTAButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
