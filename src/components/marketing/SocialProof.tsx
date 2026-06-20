import { Quote } from "lucide-react";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { GradientText } from "@/components/marketing/primitives/GradientText";
import { AnimatedCounter } from "@/components/marketing/primitives/AnimatedCounter";
import { METRICS, TESTIMONIALS, AUDIENCES } from "@/lib/marketing";

/** Light social-proof section: metrics, audience line, and role-based testimonials. */
export function SocialProof() {
  return (
    <section className="bg-canvas py-24 sm:py-32">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        {/* Eyebrow + heading */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo">
            Loved by early creators
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-ink text-balance sm:text-5xl">
            Proof that your story <GradientText>belongs</GradientText> in print
          </h2>
        </Reveal>

        {/* (a) Metrics row */}
        <div className="mt-16 grid grid-cols-2 gap-y-12 gap-x-6 sm:gap-x-10 lg:grid-cols-4">
          {METRICS.map((metric, i) => (
            <Reveal
              key={metric.label}
              delay={i * 0.08}
              className="text-center"
            >
              <AnimatedCounter
                value={metric.value}
                suffix={metric.suffix}
                decimals={metric.value % 1 !== 0 ? 1 : 0}
                className="font-display text-5xl font-semibold text-ink sm:text-6xl"
              />
              <p className="mt-3 text-sm text-subtle text-pretty">{metric.label}</p>
            </Reveal>
          ))}
        </div>

        {/* (b) Audience line */}
        <Reveal delay={0.1} className="mt-20 text-center">
          <p className="font-display text-2xl leading-relaxed text-ink text-balance sm:text-3xl">
            Built for{" "}
            {AUDIENCES.map((audience, i) => (
              <span key={audience}>
                <span className="text-indigo">{audience}</span>
                {i < AUDIENCES.length - 2
                  ? ", "
                  : i === AUDIENCES.length - 2
                    ? ", and "
                    : "."}
              </span>
            ))}
          </p>
        </Reveal>

        {/* (c) Testimonials */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, i) => (
            <Reveal key={testimonial.initials} delay={i * 0.1}>
              <figure className="flex h-full flex-col rounded-3xl border border-line bg-white p-7 shadow-soft transition-shadow duration-300 hover:shadow-lift">
                <Quote
                  aria-hidden
                  className="h-7 w-7 text-indigo-glow"
                  strokeWidth={1.5}
                />
                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-ink text-pretty">
                  {testimonial.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-soft font-display text-sm font-semibold text-indigo"
                  >
                    {testimonial.initials}
                  </span>
                  <span className="text-sm font-medium text-subtle">
                    {testimonial.role}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-8 text-center">
          <p className="text-xs text-subtle text-pretty">
            Reflections from early creators building their first books with Book
            Studio AI.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
