// ===========================================================================
// Pure Stripe-event → subscription-row mapping (Phase 5, ADR-2/-5).
//
// No server-only / Stripe SDK deps, so it's unit-testable in isolation. The
// webhook handler extracts the few primitive fields it needs from a verified
// Stripe Subscription and calls this to derive the columns we persist:
//   • plan: 'pro' while the subscription is paying (active/trialing), else
//     downgraded to 'free' (canceled / past_due / etc.).
//   • status / price_id / current_period_end / cancel_at_period_end mirror Stripe.
// Idempotency lives in the repo (upsert keyed by stripe_subscription_id); this
// is a deterministic projection of one event's state.
// ===========================================================================
import type { SubscriptionPlan, SubscriptionStatus } from "@/types/book";

/** The Stripe subscription status strings we care about; others map to inactive. */
const KNOWN_STATUSES: ReadonlySet<string> = new Set([
  "active",
  "trialing",
  "past_due",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "unpaid",
  "paused",
]);

/** The minimal primitives the mapping needs (pulled from a Stripe Subscription). */
export interface StripeSubscriptionFields {
  status: string;
  priceId: string | null;
  currentPeriodEnd: number | null; // Stripe sends seconds since epoch
  cancelAtPeriodEnd: boolean;
}

/** The columns we persist on the subscriptions row. */
export interface MappedSubscriptionFields {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  priceId: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

/** Normalize a raw Stripe status to our stored status enum. */
function normalizeStatus(raw: string): SubscriptionStatus {
  if (raw === "active" || raw === "trialing" || raw === "past_due" || raw === "canceled") {
    return raw;
  }
  // incomplete / unpaid / paused / anything unknown → no access.
  return "inactive";
}

/**
 * Project a verified Stripe subscription onto our row. Pro access follows the
 * paying statuses (active/trialing); anything else downgrades to free.
 */
export function subscriptionFieldsFromStripe(
  s: StripeSubscriptionFields
): MappedSubscriptionFields {
  void KNOWN_STATUSES; // documented set; normalizeStatus is the source of truth
  const status = normalizeStatus(s.status);
  const paying = status === "active" || status === "trialing";
  return {
    plan: paying ? "pro" : "free",
    status,
    priceId: s.priceId,
    currentPeriodEnd:
      s.currentPeriodEnd != null ? new Date(s.currentPeriodEnd * 1000) : null,
    cancelAtPeriodEnd: s.cancelAtPeriodEnd,
  };
}
