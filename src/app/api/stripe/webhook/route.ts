// ===========================================================================
// Stripe webhook (Phase 5, ADR-2/-5) — the SOURCE OF TRUTH for entitlement.
//
// Node runtime (Stripe signature verification needs the raw body + Node crypto;
// never edge). We read the raw body with req.text(), verify it against
// STRIPE_WEBHOOK_SECRET, then project the subscription state onto our row via
// the userId-scoped repo. Idempotent: every relevant event re-derives the row
// from the latest Stripe state and upserts keyed by the user, so Stripe's
// at-least-once retries are safe.
//
// Return 400 on signature failure (so Stripe knows to resend a tampered/late
// event), 200 for everything we accept — including events we intentionally
// ignore — so Stripe stops retrying.
// ===========================================================================
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { findUserIdForSubscription, upsertFromStripe } from "@/lib/data/subscriptions";
import {
  subscriptionFieldsFromStripe,
  type StripeSubscriptionFields,
} from "@/lib/subscription-mapping";

export const runtime = "nodejs";

/** Pull the primitive fields the pure mapper needs off a Stripe Subscription. */
function fieldsOf(sub: Stripe.Subscription): StripeSubscriptionFields {
  return {
    status: sub.status,
    priceId: sub.items.data[0]?.price?.id ?? null,
    currentPeriodEnd: sub.current_period_end ?? null,
    cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
  };
}

/** Sync one verified Stripe subscription onto our row (idempotent). */
async function syncSubscription(sub: Stripe.Subscription): Promise<void> {
  const userId = await findUserIdForSubscription({
    userId:
      typeof sub.metadata?.userId === "string" ? sub.metadata.userId : undefined,
    customerId: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
  });
  if (!userId) {
    console.error("[stripe webhook] could not resolve userId for subscription", sub.id);
    return;
  }
  const mapped = subscriptionFieldsFromStripe(fieldsOf(sub));
  await upsertFromStripe(userId, {
    plan: mapped.plan,
    status: mapped.status,
    stripeCustomerId:
      typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
    stripeSubscriptionId: sub.id,
    priceId: mapped.priceId,
    currentPeriodEnd: mapped.currentPeriodEnd,
    cancelAtPeriodEnd: mapped.cancelAtPeriodEnd,
  });
}

export async function POST(req: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET is not set");
    return new Response("Webhook not configured", { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  // Raw body is required for signature verification — read it as text.
  const body = await req.text();

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Fetch the freshly-created subscription for full state, then sync.
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        // On deletion Stripe sends the subscription with status 'canceled',
        // which our mapper downgrades to free — no special case needed.
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncSubscription(sub);
        }
        break;
      }
      default:
        // Ignored event type — acknowledge so Stripe stops retrying.
        break;
    }
  } catch (err) {
    // A handler error: log and 500 so Stripe retries (the upsert is idempotent).
    console.error("[stripe webhook] handler error for", event.type, err);
    return new Response("Handler error", { status: 500 });
  }

  return new Response(null, { status: 200 });
}
