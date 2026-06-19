"use client";
import { X, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import type { SubscriptionPlan } from "@/types/book";

const PLANS: {
  plan: Exclude<SubscriptionPlan, "free">;
  name: string;
  price: string;
  cadence: string;
  features: string[];
  highlight?: boolean;
}[] = [
  {
    plan: "weekly",
    name: "Weekly",
    price: "$8",
    cadence: "/week",
    features: ["1 active book", "Full chapter drafting", "Editing tools"],
  },
  {
    plan: "monthly",
    name: "Monthly",
    price: "$30",
    cadence: "/month",
    features: ["Unlimited books", "All editing modes", "Publishing kit + exports", "Priority generation"],
    highlight: true,
  },
];

/**
 * Placeholder subscription gate. In the MVP, "subscribing" simply flips the
 * local plan flag — no real Stripe charge. Wire `subscribe` to a Stripe
 * Checkout session when ready.
 */
export function SubscriptionGate({ onClose }: { onClose: () => void }) {
  const setPlan = useStore((s) => s.setPlan);

  function subscribe(plan: Exclude<SubscriptionPlan, "free">) {
    setPlan(plan); // TODO: replace with Stripe Checkout
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-line bg-card p-6 shadow-lift">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-subtle hover:bg-canvas hover:text-ink"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 text-brand">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-semibold">Unlock the full studio</span>
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">
          Upgrade to draft every chapter
        </h2>
        <p className="mt-1.5 text-sm text-subtle">
          Your blueprint is free. Subscribe to generate and edit full chapters and
          create your publishing kit.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {PLANS.map((p) => (
            <div
              key={p.plan}
              className={`flex flex-col rounded-xl border p-4 ${
                p.highlight ? "border-brand ring-1 ring-brand/20" : "border-line"
              }`}
            >
              <div className="text-sm font-medium text-subtle">{p.name}</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">{p.price}</span>
                <span className="text-sm text-subtle">{p.cadence}</span>
              </div>
              <ul className="mt-3 flex-1 space-y-1.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-3.5 w-3.5 shrink-0 text-brand" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-4 w-full"
                variant={p.highlight ? "primary" : "secondary"}
                onClick={() => subscribe(p.plan)}
              >
                Choose {p.name}
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-subtle">
          Demo mode — no payment required. This unlocks the studio instantly.
        </p>
      </div>
    </div>
  );
}
