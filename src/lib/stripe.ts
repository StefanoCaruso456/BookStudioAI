// ===========================================================================
// Stripe client — one shared, server-only instance (Phase 5, ADR-3).
//
// Import-safe like the DB client (src/lib/db/client.ts): constructing this
// module must NOT throw when STRIPE_SECRET_KEY is unset (CI, local dev, key-less
// previews all import it transitively). The secret is only required when a real
// Stripe call is made — `getStripe()` is the loud failure point, never module
// load. The API version is pinned (ADR-3) so Stripe's behaviour can't shift
// under us on their side.
//
// Secrets are server-only: this module is `server-only`, and STRIPE_* env vars
// are never `NEXT_PUBLIC_`, so nothing here can reach the client bundle.
// ===========================================================================
import "server-only";
import Stripe from "stripe";

// Pin to the version the installed SDK is generated against (ADR-3).
export const STRIPE_API_VERSION = "2025-02-24.acacia" as const;

const globalForStripe = globalThis as unknown as {
  __stripeClient?: Stripe;
};

/**
 * The shared Stripe client. Throws (loudly, once) only if invoked without
 * STRIPE_SECRET_KEY — callers that actually charge/sync need the key; importing
 * a module that merely references this one does not.
 */
export function getStripe(): Stripe {
  if (globalForStripe.__stripeClient) return globalForStripe.__stripeClient;

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set — Stripe is required for this operation."
    );
  }

  const client = new Stripe(secret, {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForStripe.__stripeClient = client;
  }
  return client;
}
