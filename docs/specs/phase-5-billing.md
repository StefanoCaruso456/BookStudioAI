# Phase 5 — Billing & Plan Gating · Spec

> Template: Research → Objective → Principles → ADRs → Data Model → Flow +
> Wireframes → Features → User Stories → Engineering Tasks → Non-functionals →
> Testing → Risks → DoD.
>
> **Status: DRAFT — awaiting product-owner approval (incl. the pricing model) before build.**

_Depends on: Phases 1–4 ✅. Needs a **Stripe account** + price(s) from the owner._

---

## 0. Research summary (why these choices)

Current best practice for Stripe subscriptions in Next.js:
- **Hosted Checkout + Customer Portal** — don't build card forms; Stripe handles PCI, tax, mobile, localization, cancel/upgrade.
- **Webhooks are the source of truth** — never trust the front-end success page; fulfill/grant access from verified webhook events (`checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.payment_succeeded/failed`).
- **Secrets server-only**; **verify the webhook signature**; **pin the Stripe API version**; one shared server Stripe client.
- **Entitlement is server-side** — gate features by reading the synced subscription, not a client flag.

**We already have scaffolding:** a `subscriptions` table (with `stripe_customer_id` / `stripe_subscription_id`), a `SubscriptionPlan` type, and a `SubscriptionGate` component the workspace already calls on chapter AI actions. Phase 5 makes it real.

Sources: Pedro Alonso (Stripe + Next.js 15 2025), DesignRevision (Stripe + Next.js webhooks), Medium guides — links in chat.

---

## 1. Objective

Let users **upgrade to a paid plan** and **gate the expensive value** behind it —
enforced server-side, synced from Stripe via webhooks — so the product earns
revenue without compromising the free funnel that drives activation.

**Recommended model (ADR-1):** **Free vs Pro subscription.**
- **Free:** sign up, onboard, and **build a full blueprint** (the "aha"), browse everything.
- **Pro:** **AI chapter drafting/rewriting/editing** + **export** (PDF/EPUB/DOCX).
- Pay at the moment of real value (writing/exporting), not before — protects activation.

**Out of scope (deferred):** usage-based credits/metering, multiple paid tiers, team/seats, proration UI, coupons (Stripe Checkout/Portal cover most), invoices UI.

---

## 2. Guiding principles (three lenses)

**Principal AI/product engineer**
- The free tier must still reach the aha (blueprint). Gate only the expensive, high-intent actions (chapter AI, export).
- Entitlement (`isPro`) is one server-side check reused everywhere; UI gating is cosmetic.

**Data engineer**
- The `subscriptions` row is a projection of Stripe state, written **only** by verified webhooks (idempotent upserts keyed by Stripe ids). The app reads, never guesses.

**DB / ops / payments admin**
- Stripe secret + webhook secret are server-only env. Webhook route verifies signatures, uses the **raw body**, is **Node runtime**, and is idempotent. Pin the API version.

---

## 3. Architecture Decision Records

**ADR-1 · Free vs Pro subscription (not credits).** Predictable revenue, simplest to ship, matches the existing scaffolding and the value-first funnel. Gate **chapter AI + export**; keep onboarding + blueprint free. _Rejected:_ usage credits (needs metering infra; revisit later) and multi-tier (premature).

**ADR-2 · Webhooks are the source of truth.** A verified webhook handler upserts the `subscriptions` row on `checkout.session.completed` + `customer.subscription.*` + `invoice.payment_*`. The success redirect grants nothing on its own. _Rejected:_ trusting the client/redirect.

**ADR-3 · Hosted Checkout + Customer Portal.** Server action creates a Checkout Session (Pro price) and a Billing Portal session (manage/cancel). No custom card UI. Secrets server-only; pinned API version; one shared `stripe` client. _Rejected:_ Stripe Elements/custom forms (PCI surface, more code).

**ADR-4 · Server-side entitlement enforcement.** A server-only `isPro(userId)` (reads the synced subscription) guards the **chapter AI server actions** and the **export route**; blocked → a typed "needs upgrade" result / `402`. The `SubscriptionGate` modal is UX only. _Rejected:_ client-store `plan` as the gate (trivially bypassed).

**ADR-5 · Webhook handler: Node runtime, raw body, signature-verified, idempotent.** `/api/stripe/webhook` reads the raw body, verifies `STRIPE_WEBHOOK_SECRET`, and upserts keyed by `stripe_subscription_id` so retries are safe.

---

## 4. Data model

Extend the existing `subscriptions` table (one row per user, written by webhooks):
```
subscriptions  (ALTER — add)
  price_id              text   null   -- which Stripe price
  current_period_end    timestamp null
  cancel_at_period_end  boolean default false
  -- existing: id, user_id (FK, indexed), plan ('free'|'pro'),
  --           status ('active'|'trialing'|'past_due'|'canceled'|'inactive'),
  --           stripe_customer_id, stripe_subscription_id, timestamps
```
`SubscriptionPlan` type updated to `'free' | 'pro'` (was `free|weekly|monthly`). Entitlement = `status in ('active','trialing') && plan='pro'`.

---

## 5. Flow + wireframes

```
FREE user hits a gated action (write/edit chapter, or export)
        │  server isPro() = false → 402 / needs-upgrade
        ▼
  SubscriptionGate modal: "Upgrade to Pro to write & export"  [ Upgrade ]
        │ Upgrade → server action: create Checkout Session (Pro price)
        ▼
  Stripe Hosted Checkout  ── pays ──►  redirect /dashboard?upgraded=1
        │
        └─► (async, authoritative) Stripe → /api/stripe/webhook
                 verify sig → upsert subscriptions(plan=pro, status, period_end)
        ▼
  isPro() = true → chapter AI + export unlocked

Manage/cancel:  Settings → "Manage billing" → Billing Portal session → Stripe Portal
```

Pricing page (`/pricing`): Free vs Pro cards; Pro CTA → Checkout (or sign-in first).
Settings: subscription status + "Manage billing" (Portal).

---

## 6. Features (epics)
- **E1 — Stripe core:** shared client (pinned version), env, `subscriptions` schema update + migration.
- **E2 — Checkout & Portal:** server actions to start Checkout (Pro) and open the Billing Portal; ensure/create the Stripe customer.
- **E3 — Webhook sync:** verified Node webhook upserting the subscription (source of truth).
- **E4 — Entitlement gate:** `isPro(userId)`; enforce in chapter AI actions + export route; wire the `SubscriptionGate` "Upgrade" + pricing/settings CTAs.

---

## 7. User stories (with acceptance criteria)

**US-1 — Upgrade.** _As a free user, I can subscribe to Pro._
- AC: "Upgrade" → Stripe Checkout for the Pro price → on success I'm Pro.

**US-2 — Real gating.** _As the business, paid features require Pro (server-enforced)._
- AC: a free user calling a chapter-AI action or the export route is blocked server-side (not just hidden).
- AC: a Pro user passes.

**US-3 — Authoritative sync.** _As the system, access reflects Stripe, even on Portal changes._
- AC: subscribe / cancel / payment-failed via Stripe update the `subscriptions` row via webhook; entitlement follows.
- AC: webhook signature is verified; replays are idempotent.

**US-4 — Manage billing.** _As a subscriber, I can manage or cancel._
- AC: Settings "Manage billing" opens the Stripe Billing Portal for my account.

**US-5 — Free funnel intact.** _As a free user, I can still onboard + build a blueprint._
- AC: onboarding + blueprint generation remain free; the wall appears at chapter writing/export.

---

## 8. Engineering tasks (ordered)
1. **T1 — Stripe client + env + schema.** Add `stripe`; `src/lib/stripe.ts` (pinned API version, server-only). Add `price_id`/`current_period_end`/`cancel_at_period_end` to `subscriptions`; `SubscriptionPlan → 'free'|'pro'`. Generate + commit migration. Env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` (+ optional yearly).
2. **T2 — Subscription repo + entitlement.** `src/lib/data/subscriptions.ts`: `getSubscription(userId)`, `upsertFromStripe(...)`, `isPro(userId)`. Server-only, userId-scoped.
3. **T3 — Checkout + Portal actions.** `createCheckoutSessionAction()` (ensure Stripe customer, Pro price, success/cancel URLs) and `createBillingPortalAction()`.
4. **T4 — Webhook.** `src/app/api/stripe/webhook/route.ts` (`runtime="nodejs"`, raw body, `constructEvent` signature verify, idempotent upsert for `checkout.session.completed` + `customer.subscription.*` + `invoice.payment_*`).
5. **T5 — Enforce entitlement.** `isPro` guard in the chapter AI server actions (`generateChapterDraft`/`rewriteChapter`/`editChapter`) and the export route → blocked → typed needs-upgrade / `402`.
6. **T6 — UI.** Wire `SubscriptionGate` "Upgrade" → checkout; real `/pricing` Free/Pro CTAs; Settings "Manage billing" → Portal; reflect status. Replace the client-store `plan` placeholder with server entitlement.
7. **T7 — Tests + validate.** Pure tests for the entitlement rule + webhook event→row mapping; `lint + typecheck + test + build` green.

---

## 9. Non-functional requirements
- **Security:** Stripe secrets server-only; webhook signature verified; raw body; entitlement server-enforced; never trust client/redirect.
- **Reliability:** idempotent webhook upserts; pinned API version; handle payment-failed/canceled → downgrade.
- **UX:** free funnel reaches the aha; the wall is honest and one-click to upgrade; manage/cancel self-serve.

## 10. Testing strategy
- Unit: entitlement predicate (`status×plan → isPro`); webhook event → subscription-row mapping (pure).
- Integration (Stripe test mode): Checkout test card → webhook (Stripe CLI `stripe listen`) → row upserted → gated action unlocks; cancel in Portal → downgrade.
- Gate: lint + typecheck + test + build (+ CI migrate on deploy).

## 11. Risks & mitigations
| Risk | Mitigation |
|---|---|
| Webhook missed/retried | Idempotent upsert keyed by `stripe_subscription_id`; Stripe auto-retries |
| Treating redirect as payment | Grant access **only** from webhook (ADR-2) |
| Raw-body parsing in Next route | Read `req.text()` + `stripe.webhooks.constructEvent`; Node runtime |
| Secrets exposure | Server-only; never `NEXT_PUBLIC_` the secret; verify env present |
| Free funnel accidentally walled | Gate only chapter-AI + export; keep onboarding + blueprint free (US-5 test) |

## 12. Definition of Done
- [ ] Free user can upgrade via Stripe Checkout; webhook grants Pro
- [ ] Chapter AI + export are **server-enforced** Pro-only; free funnel (onboarding+blueprint) intact
- [ ] Cancel/payment-failed via webhook downgrades entitlement
- [ ] Manage-billing (Portal) works; pricing page CTAs live
- [ ] Committed migration; `lint+typecheck+test+build` green; verified in Stripe **test mode** then production
- [ ] ROADMAP Phase 5 ✅

## 13. Required from product owner (before build)
- **Confirm the pricing MODEL** — recommended: **Free vs Pro subscription** (gate chapter-AI + export). Alternative: usage credits (more infra).
- **Confirm what's gated** — recommended: free = onboarding + blueprint; Pro = write chapters with AI + export.
- **Provide Stripe** — a Stripe account + a **Pro Price** (monthly, and/or yearly), then the env vars (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`). I can build everything against Stripe **test mode** first; you flip to live keys.
