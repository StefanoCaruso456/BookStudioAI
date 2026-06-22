// ===========================================================================
// Subscriptions repository (Phase 5, ADR-2/-4) — the ONLY place that touches
// the subscriptions table. Server-only. The row is a projection of Stripe state
// written exclusively by verified webhooks (upsertFromStripe), and read by the
// server-side entitlement check (isPro). Every function is userId-scoped.
//
// `isPro` is the single gate reused across the chapter-AI actions and the
// export route; the rule itself lives in the pure src/lib/entitlement.ts.
// ===========================================================================
import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { subscriptions } from "@/lib/db/schema";
import { uid } from "@/lib/utils";
import { computeIsPro } from "@/lib/entitlement";
import type { Subscription } from "@/types/book";

export type SubscriptionRow = typeof subscriptions.$inferSelect;

const iso = (d: Date | null | undefined): string | undefined =>
  d ? d.toISOString() : undefined;

function mapSubscription(r: SubscriptionRow): Subscription {
  return {
    id: r.id,
    userId: r.userId,
    plan: r.plan as Subscription["plan"],
    status: r.status as Subscription["status"],
    stripeCustomerId: r.stripeCustomerId ?? undefined,
    stripeSubscriptionId: r.stripeSubscriptionId ?? undefined,
    priceId: r.priceId ?? undefined,
    currentPeriodEnd: iso(r.currentPeriodEnd),
    cancelAtPeriodEnd: r.cancelAtPeriodEnd,
    createdAt: (r.createdAt ?? new Date()).toISOString(),
    updatedAt: (r.updatedAt ?? new Date()).toISOString(),
  };
}

// ───────────────────────────── reads ──────────────────────────────────────

/** The user's subscription row (mapped), or null if they've never had one. */
export async function getSubscription(
  userId: string
): Promise<Subscription | null> {
  const row = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });
  return row ? mapSubscription(row) : null;
}

/** The raw row (server-internal) — used by the billing actions to find/reuse
 *  the Stripe customer id. */
export async function getSubscriptionRow(
  userId: string
): Promise<SubscriptionRow | null> {
  const row = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });
  return row ?? null;
}

/**
 * Resolve our userId for a Stripe subscription event. We set userId in the
 * subscription metadata at Checkout, so that's the primary key; if it's absent
 * (e.g. a subscription created directly in the Dashboard) we fall back to the
 * stored stripe_customer_id. Returns null if we can't map the event to a user.
 */
export async function findUserIdForSubscription(opts: {
  userId?: string | null;
  customerId?: string | null;
}): Promise<string | null> {
  if (opts.userId) return opts.userId;
  if (opts.customerId) {
    const row = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.stripeCustomerId, opts.customerId),
    });
    if (row) return row.userId;
  }
  return null;
}

/**
 * Server-side entitlement (ADR-4): true iff the synced subscription is paying
 * and on the Pro plan. The single source of truth for gating.
 */
export async function isPro(userId: string): Promise<boolean> {
  const row = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });
  if (!row) return false;
  return computeIsPro({ plan: row.plan, status: row.status });
}

// ───────────────────────────── writes ─────────────────────────────────────

/** The fields a webhook (or checkout flow) writes onto the subscription row. */
export interface UpsertSubscriptionInput {
  plan?: Subscription["plan"];
  status?: Subscription["status"];
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  priceId?: string | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}

/**
 * Idempotent upsert of the user's subscription projection from Stripe. One row
 * per user (subscriptions.userId is the logical key); webhook retries are safe
 * because we always overwrite with the latest verified state. Only the provided
 * fields are written (undefined leaves a column untouched), so e.g. attaching a
 * customer id on checkout doesn't clobber later status updates.
 */
export async function upsertFromStripe(
  userId: string,
  data: UpsertSubscriptionInput
): Promise<void> {
  const now = new Date();
  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });

  // Build a patch of only the defined fields (so partial updates are additive).
  const patch: Partial<typeof subscriptions.$inferInsert> = { updatedAt: now };
  if (data.plan !== undefined) patch.plan = data.plan;
  if (data.status !== undefined) patch.status = data.status;
  if (data.stripeCustomerId !== undefined)
    patch.stripeCustomerId = data.stripeCustomerId;
  if (data.stripeSubscriptionId !== undefined)
    patch.stripeSubscriptionId = data.stripeSubscriptionId;
  if (data.priceId !== undefined) patch.priceId = data.priceId;
  if (data.currentPeriodEnd !== undefined)
    patch.currentPeriodEnd = data.currentPeriodEnd;
  if (data.cancelAtPeriodEnd !== undefined)
    patch.cancelAtPeriodEnd = data.cancelAtPeriodEnd;

  if (existing) {
    await db
      .update(subscriptions)
      .set(patch)
      .where(eq(subscriptions.userId, userId));
    return;
  }

  await db.insert(subscriptions).values({
    id: uid("sub"),
    userId,
    plan: data.plan ?? "free",
    status: data.status ?? "inactive",
    stripeCustomerId: data.stripeCustomerId ?? null,
    stripeSubscriptionId: data.stripeSubscriptionId ?? null,
    priceId: data.priceId ?? null,
    currentPeriodEnd: data.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
    createdAt: now,
    updatedAt: now,
  });
}
