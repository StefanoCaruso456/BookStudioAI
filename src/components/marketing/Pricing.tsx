import { Check } from "lucide-react";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { GradientText } from "@/components/marketing/primitives/GradientText";
import { CTAButton } from "@/components/marketing/primitives/CTAButton";

interface Tier {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  badge?: string;
}

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "Blueprint + preview, so you can feel the magic first.",
    features: [
      "Full book blueprint",
      "Title & chapter outline",
      "Preview your first chapter",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Weekly",
    price: "$8",
    cadence: "/ week",
    description: "For an active writing sprint, start to finish.",
    features: [
      "Unlimited chapter generation",
      "All AI edit modes",
      "Complete publishing kit",
    ],
    cta: "Start Weekly",
    highlighted: false,
  },
  {
    name: "Monthly",
    price: "$30",
    cadence: "/ month",
    description: "Everything in Weekly, framed as your best value.",
    features: [
      "Unlimited chapter generation",
      "All AI edit modes",
      "Complete publishing kit",
      "Cancel anytime",
    ],
    cta: "Go Monthly",
    highlighted: true,
    badge: "Best value",
  },
];

/** Light pricing section with three premium tiers. */
export function Pricing() {
  return (
    <section id="pricing" className="bg-canvas py-24 sm:py-32">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        {/* Eyebrow + heading + intro */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo">
            Pricing
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-ink text-balance sm:text-5xl">
            One price away from <GradientText>becoming an author</GradientText>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-subtle text-pretty">
            Start free with a complete blueprint. Upgrade only when you're ready
            to write the whole thing.
          </p>
        </Reveal>

        {/* Tiers */}
        <div className="mt-16 grid items-start gap-6 lg:grid-cols-3">
          {TIERS.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.1} className="h-full">
              <div
                className={
                  tier.highlighted
                    ? "relative flex h-full flex-col rounded-3xl bg-brand-dark p-8 text-white shadow-glow ring-1 ring-indigo/40 lg:-mt-4 lg:scale-[1.03]"
                    : "relative flex h-full flex-col rounded-3xl border border-line bg-white p-8 text-ink shadow-soft"
                }
              >
                {tier.badge && (
                  <span className="absolute right-6 top-6 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                    {tier.badge}
                  </span>
                )}

                <h3
                  className={
                    tier.highlighted
                      ? "font-display text-2xl font-semibold text-white"
                      : "font-display text-2xl font-semibold text-ink"
                  }
                >
                  {tier.name}
                </h3>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl font-semibold tracking-tight">
                    {tier.price}
                  </span>
                  <span
                    className={
                      tier.highlighted
                        ? "text-sm text-white/70"
                        : "text-sm text-subtle"
                    }
                  >
                    {tier.cadence}
                  </span>
                </div>

                <p
                  className={
                    tier.highlighted
                      ? "mt-4 text-sm leading-relaxed text-white/70 text-pretty"
                      : "mt-4 text-sm leading-relaxed text-subtle text-pretty"
                  }
                >
                  {tier.description}
                </p>

                <ul className="mt-7 flex-1 space-y-3.5">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span
                        className={
                          tier.highlighted
                            ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15"
                            : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-soft"
                        }
                      >
                        <Check
                          aria-hidden
                          strokeWidth={2.5}
                          className={
                            tier.highlighted
                              ? "h-3 w-3 text-white"
                              : "h-3 w-3 text-indigo"
                          }
                        />
                      </span>
                      <span
                        className={
                          tier.highlighted
                            ? "text-sm leading-snug text-white/90"
                            : "text-sm leading-snug text-ink"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <CTAButton
                    href="/builder"
                    variant={tier.highlighted ? "primary" : "secondary"}
                    size="lg"
                    onDark={tier.highlighted}
                    className="w-full"
                  >
                    {tier.cta}
                  </CTAButton>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
