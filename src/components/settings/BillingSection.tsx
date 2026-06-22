"use client";
// ===========================================================================
// Billing section of Settings (Phase 5) — shows the current plan/status and a
// "Manage billing" button that opens the Stripe Customer Portal (manage/cancel).
// Non-Pro users see an "Upgrade to Pro" link to /pricing instead.
// ===========================================================================
import { useState } from "react";
import Link from "next/link";
import { Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createBillingPortalAction } from "@/lib/data/billing";
import type { SubscriptionPlan, SubscriptionStatus } from "@/types/book";

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  active: "Active",
  trialing: "Trial",
  past_due: "Payment past due",
  canceled: "Canceled",
  inactive: "Inactive",
};

export function BillingSection({
  isPro,
  plan,
  status,
  cancelAtPeriodEnd,
}: {
  isPro: boolean;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function manage() {
    setLoading(true);
    try {
      const { url } = await createBillingPortalAction();
      window.location.href = url;
    } catch (err) {
      console.error("Failed to open billing portal", err);
      setLoading(false);
    }
  }

  return (
    <Card className="mt-6 space-y-4 p-6">
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-brand" />
        <h2 className="text-lg font-semibold tracking-tight">Billing</h2>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-line bg-canvas/40 p-4">
        <div>
          <div className="text-sm font-medium text-ink">
            {plan === "pro" ? "Pro plan" : "Free plan"}
          </div>
          <div className="mt-0.5 text-sm text-subtle">
            {STATUS_LABEL[status] ?? status}
            {cancelAtPeriodEnd && status !== "canceled"
              ? " · cancels at period end"
              : ""}
          </div>
        </div>
      </div>

      {isPro ? (
        <Button onClick={manage} disabled={loading} variant="secondary">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Manage billing"
          )}
        </Button>
      ) : (
        <div className="flex items-center gap-3">
          <Link href="/pricing">
            <Button>Upgrade to Pro</Button>
          </Link>
          <span className="text-sm text-subtle">
            Unlock AI chapter writing & export.
          </span>
        </div>
      )}
    </Card>
  );
}
