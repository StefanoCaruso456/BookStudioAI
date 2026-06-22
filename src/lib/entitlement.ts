// ===========================================================================
// Pure entitlement predicate (Phase 5, ADR-4) — no server-only deps, so it's
// unit-testable in isolation. The ONE rule that decides Pro access, reused by
// the server-side `isPro(userId)` and any UI that derives entitlement.
//
// Rule: a user is Pro iff their synced subscription is paying (active or in a
// trial) AND on the Pro plan. Everything else (canceled, past_due, inactive,
// or the free plan) is NOT Pro. The subscriptions row is a projection of Stripe
// state written only by verified webhooks — this just reads it.
// ===========================================================================
import type { SubscriptionPlan, SubscriptionStatus } from "@/types/book";

/** Statuses that grant access while the subscription is live. */
const PAYING_STATUSES: ReadonlySet<string> = new Set(["active", "trialing"]);

export function computeIsPro(input: {
  plan: SubscriptionPlan | string | null | undefined;
  status: SubscriptionStatus | string | null | undefined;
}): boolean {
  return input.plan === "pro" && PAYING_STATUSES.has(input.status ?? "");
}
