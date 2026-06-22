"use client";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpgradeButton } from "@/components/billing/UpgradeButton";
import { cn } from "@/lib/utils";

// Free vs Pro (Phase 5, ADR-1). Free reaches the aha (blueprint); Pro unlocks
// the expensive value (AI chapter writing + export).
const FREE = {
  name: "Free",
  price: "$0",
  cadence: "forever",
  blurb: "Build a complete blueprint and feel the magic first.",
  features: [
    "Full book blueprint",
    "Title & chapter outline",
    "Organize your source material",
  ],
};

const PRO = {
  name: "Pro",
  price: "$30",
  cadence: "/month",
  blurb: "Write and publish the whole book with AI.",
  features: [
    "AI chapter drafting, rewriting & editing",
    "All AI edit modes",
    "Export to PDF, EPUB & DOCX",
    "Unlimited books",
    "Cancel anytime",
  ],
};

export function PricingCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Free */}
      <div className="relative flex flex-col rounded-2xl border border-line bg-card p-6 shadow-card">
        <div className="text-sm font-medium text-subtle">{FREE.name}</div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight">{FREE.price}</span>
          <span className="text-subtle">{FREE.cadence}</span>
        </div>
        <p className="mt-2 text-sm text-subtle">{FREE.blurb}</p>
        <ul className="mt-5 flex-1 space-y-2.5">
          {FREE.features.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm">
              <Check className="h-4 w-4 shrink-0 text-brand" />
              {f}
            </li>
          ))}
        </ul>
        <Link href="/builder" className="mt-6">
          <Button className="w-full" variant="secondary">
            Start Free
          </Button>
        </Link>
      </div>

      {/* Pro */}
      <div className="relative flex flex-col rounded-2xl border border-brand bg-card p-6 shadow-card ring-1 ring-brand/20">
        <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
          Most popular
        </span>
        <div className="text-sm font-medium text-subtle">{PRO.name}</div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight">{PRO.price}</span>
          <span className="text-subtle">{PRO.cadence}</span>
        </div>
        <p className="mt-2 text-sm text-subtle">{PRO.blurb}</p>
        <ul className="mt-5 flex-1 space-y-2.5">
          {PRO.features.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm">
              <Check className="h-4 w-4 shrink-0 text-brand" />
              {f}
            </li>
          ))}
        </ul>
        <UpgradeButton className="mt-6 w-full">Upgrade to Pro</UpgradeButton>
      </div>
    </div>
  );
}
