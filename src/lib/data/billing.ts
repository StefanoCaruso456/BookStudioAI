"use server";
// ===========================================================================
// Billing server actions (Phase 5, ADR-3) — start a Stripe Checkout Session
// for Pro and open the Customer Portal. Hosted Checkout + Portal means no card
// UI here; we only mint session URLs and hand them back for the client to
// redirect to. Secrets stay server-only (src/lib/stripe.ts).
//
// The Stripe customer is created/reused once and stored on the subscriptions
// row (stripe_customer_id) so Checkout, Portal, and webhooks all key off the
// same customer. Access itself is granted ONLY by the verified webhook
// (ADR-2) — these actions never write the plan.
// ===========================================================================
import { headers } from "next/headers";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import {
  getSubscriptionRow,
  upsertFromStripe,
} from "@/lib/data/subscriptions";

async function requireUser(): Promise<{ id: string; email?: string | null }> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) throw new Error("Not authenticated");
  return { id, email: session.user?.email };
}

/** Absolute base URL for Stripe redirect URLs, from the incoming request host. */
function baseUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.AUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  if (explicit) return explicit.replace(/\/$/, "");
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Ensure the user has a Stripe customer, creating one (and persisting its id on
 * the subscriptions row) on first use. Returns the customer id.
 */
async function ensureCustomer(
  userId: string,
  email?: string | null
): Promise<string> {
  const existing = await getSubscriptionRow(userId);
  if (existing?.stripeCustomerId) return existing.stripeCustomerId;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: email ?? undefined,
    // Lets the webhook resolve our user even if the event lacks our metadata.
    metadata: { userId },
  });

  // Persist the customer id (additive upsert — doesn't touch plan/status).
  await upsertFromStripe(userId, { stripeCustomerId: customer.id });
  return customer.id;
}

/**
 * Create a subscription Checkout Session for the Pro price and return its URL.
 * Success → /dashboard?upgraded=1 (the webhook is what actually grants Pro);
 * cancel → back to /pricing.
 */
export async function createCheckoutSessionAction(): Promise<{ url: string }> {
  const { id: userId, email } = await requireUser();

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) throw new Error("STRIPE_PRICE_ID is not set");

  const customerId = await ensureCustomer(userId, email);
  const stripe = getStripe();
  const origin = baseUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    // Carried onto the subscription so the webhook can always resolve our user.
    subscription_data: { metadata: { userId } },
    client_reference_id: userId,
    allow_promotion_codes: true,
    success_url: `${origin}/dashboard?upgraded=1`,
    cancel_url: `${origin}/pricing`,
  });

  if (!session.url) throw new Error("Stripe did not return a Checkout URL");
  return { url: session.url };
}

/**
 * Open the Stripe Billing Portal for the user's customer (manage/cancel) and
 * return its URL. return_url → /settings.
 */
export async function createBillingPortalAction(): Promise<{ url: string }> {
  const { id: userId, email } = await requireUser();
  const customerId = await ensureCustomer(userId, email);
  const stripe = getStripe();
  const origin = baseUrl();

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/settings`,
  });
  return { url: portal.url };
}
