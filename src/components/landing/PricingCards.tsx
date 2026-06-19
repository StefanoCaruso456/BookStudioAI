"use client";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Weekly",
    price: "$8",
    cadence: "/week",
    blurb: "Perfect for finishing one book fast.",
    features: ["1 active book", "Full chapter drafting", "Editing tools", "Publishing kit"],
    highlight: false,
  },
  {
    name: "Monthly",
    price: "$30",
    cadence: "/month",
    blurb: "For creators building a library of books.",
    features: [
      "Unlimited books",
      "Full chapter drafting",
      "All editing modes",
      "Publishing kit + exports",
      "Priority AI generation",
    ],
    highlight: true,
  },
];

export function PricingCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {PLANS.map((plan) => (
        <div
          key={plan.name}
          className={cn(
            "relative flex flex-col rounded-2xl border bg-card p-6 shadow-card",
            plan.highlight ? "border-brand ring-1 ring-brand/20" : "border-line"
          )}
        >
          {plan.highlight && (
            <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
              Most popular
            </span>
          )}
          <div className="text-sm font-medium text-subtle">{plan.name}</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
            <span className="text-subtle">{plan.cadence}</span>
          </div>
          <p className="mt-2 text-sm text-subtle">{plan.blurb}</p>
          <ul className="mt-5 space-y-2.5">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <Check className="h-4 w-4 shrink-0 text-brand" />
                {f}
              </li>
            ))}
          </ul>
          <Link href="/builder" className="mt-6">
            <Button
              className="w-full"
              variant={plan.highlight ? "primary" : "secondary"}
            >
              Start My Book
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
