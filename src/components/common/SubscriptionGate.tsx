"use client";
import { useState } from "react";
import { X, Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCheckoutSessionAction } from "@/lib/data/billing";

const PRO_FEATURES = [
  "AI chapter drafting, rewriting & editing",
  "Export to PDF, EPUB & DOCX",
  "Unlimited books & all editing modes",
  "Cancel anytime",
];

/**
 * Upgrade gate (Phase 5). UX only — the real entitlement check is server-side
 * (the chapter-AI actions throw UPGRADE_REQUIRED; export returns 402). The
 * "Upgrade" CTA starts a real Stripe Checkout Session and redirects to it.
 */
export function SubscriptionGate({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upgrade() {
    setLoading(true);
    setError(null);
    try {
      const { url } = await createCheckoutSessionAction();
      window.location.href = url;
    } catch (err) {
      console.error("Failed to start checkout", err);
      setError("Couldn't start checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-lift">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-subtle hover:bg-canvas hover:text-ink"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 text-brand">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-semibold">Upgrade to Pro</span>
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">
          Write & export with AI
        </h2>
        <p className="mt-1.5 text-sm text-subtle">
          Your blueprint is free. Go Pro to draft and edit full chapters with AI
          and export your finished book.
        </p>

        <ul className="mt-5 space-y-2.5">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm">
              <Check className="h-4 w-4 shrink-0 text-brand" />
              {f}
            </li>
          ))}
        </ul>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <Button className="mt-6 w-full" onClick={upgrade} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upgrade to Pro"}
        </Button>
        <p className="mt-3 text-center text-xs text-subtle">
          Secure checkout powered by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
