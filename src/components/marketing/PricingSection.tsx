"use client";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Weekly",
    price: "$8",
    cadence: "per week",
    blurb: "Finish one book, start to shelf.",
    features: ["1 active book", "Full chapter drafting", "All editing modes", "Publishing kit"],
    highlight: false,
  },
  {
    name: "Monthly",
    price: "$30",
    cadence: "per month",
    blurb: "For authors building a catalog.",
    features: [
      "Unlimited books",
      "Full chapter drafting",
      "All editing modes",
      "Publishing kit + exports",
      "Priority generation",
    ],
    highlight: true,
  },
];

export function PricingSection() {
  return (
    <section className="mx-auto max-w-content px-5 py-24 sm:px-8 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Pricing
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Build your blueprint free. Publish when you&rsquo;re ready.
        </h2>
      </Reveal>

      <div className="mx-auto mt-14 grid max-w-3xl gap-5 sm:grid-cols-2">
        {PLANS.map((plan, i) => (
          <Reveal key={plan.name} delay={0.08 * i}>
            <div
              className={cn(
                "relative flex h-full flex-col rounded-2xl border bg-card p-7 shadow-card",
                plan.highlight ? "border-brand ring-1 ring-brand/15" : "border-line"
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <div className="text-sm font-semibold text-subtle">{plan.name}</div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading text-5xl font-extrabold tracking-tight">
                  {plan.price}
                </span>
                <span className="text-subtle">{plan.cadence}</span>
              </div>
              <p className="mt-2 text-sm text-subtle">{plan.blurb}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/builder" className="mt-7">
                <Button className="w-full" size="lg" variant={plan.highlight ? "primary" : "secondary"}>
                  Start My Book
                </Button>
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mx-auto mt-6 max-w-md text-center text-sm text-subtle">
        Cancel anytime. Your blueprint and outline are always free to create.
      </p>
    </section>
  );
}
