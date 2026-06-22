# Book Studio AI — Product Roadmap

> The complete system breakdown and phased build plan. Book Studio AI isn't
> "an app with login" — it's ~6 systems that interlock. This doc is the source
> of truth we track against, phase by phase.

_Last updated: 2026-06-22_

---

## Status at a glance

| Phase | Theme | State |
| ----- | ----- | ----- |
| 0 | Auth (Google sign-in) | ✅ **Shipped** |
| 1 | Database & Identity foundation | ▶️ **Next (keystone)** |
| 2 | Profile & Onboarding | Planned |
| 3 | Resume, Workspace & Re-engagement | Planned |
| 4 | Export & "become an author" | Planned |
| 5 | Billing & Gates | Planned |
| 6 | Ingestion (uploads + connectors) | Planned |
| — | Cross-cutting (legal, analytics, observability, security) | Seeded early, matured throughout |

---

## The core insight

Everything below — profile, onboarding, resume-your-book, payments, gates —
shares one prerequisite: **durable per-user storage**. Auth today is JWT-only:
a signed cookie that proves *who* you are but stores *nothing*. There is
nowhere to save a profile, a role answer, or a book yet. So the database isn't
one feature among many — it's the root of the dependency tree.

```
Auth (DONE) ──► Database + Identity ──► Profile + Onboarding ──► Resume/Workspace ──► Export
                       │                        │
                       ├──► Billing + Gates     └──► (data feeds) Analytics
                       └──► Ingestion (uploads/connectors)
```

---

## The full product catalog

### Foundation layer
| # | Product | What it is | Size |
|---|---------|------------|------|
| 1 | **Identity & Auth** ✅ | Google now; later Apple + email magic-link. Sessions, gating, sign-in UI | done / extend |
| 2 | **Database & Data Access Layer** | Postgres (Railway) + Drizzle; server actions as the data API behind a stable interface | L |
| 3 | **User Profiles** | 1:1 per user — role/persona, goals, company, locale, avatar, author bio | M |
| 4 | **Onboarding** | First-run flow; collects persona/goal/use-case/attribution/consent; segments + pre-fills builder | M |

### Core product (the studio)
| # | Product | What it is | Size |
|---|---------|------------|------|
| 5 | **Book Builder / Blueprint** ✅ | 6-step wizard → AI blueprint; needs server-side draft persistence + resume | extend |
| 6 | **Chapter Workspace** ✅ | Generate / edit / rewrite chapters; needs autosave + version history | extend |
| 7 | **Publishing Kit + Export** | Cover/blurb/keywords/KDP checklist **+ export to PDF/EPUB/DOCX** | M |
| 8 | **Project Dashboard** | List, resume, status, recent activity | S |

### Content ingestion (the original promise)
| # | Product | What it is | Size |
|---|---------|------------|------|
| 9 | **Uploads & Storage** | Vercel Blob; docs/images/audio/video; per-user quota | M |
| 10 | **Transcription** | Audio/video → text (Whisper / gpt-4o-transcribe) | M |
| 11 | **Vision / Image** | Images → extracted content (gpt-4o vision) | S |
| 12 | **Social Connectors** | Instagram (Meta Graph) first; OAuth import of posts/captions | L |
| 13 | **Ingestion pipeline** | Normalize all sources into `source_content`, feed blueprint/chapters | M |

### Monetization & governance
| # | Product | What it is | Size |
|---|---------|------------|------|
| 14 | **Billing & Subscriptions** | Stripe customer / checkout / portal / webhooks; plans; trial | L |
| 15 | **Usage Metering & Credits** | Meter AI calls; credits or quota; entitlements per plan | M |
| 16 | **Paywall / Upgrade UI** | Limit prompts, pricing → checkout | S |

### Trust, growth & ops (cross-cutting)
| # | Product | What it is | Size |
|---|---------|------------|------|
| 17 | **Account & Settings** | Edit profile, manage subscription, connected accounts, **delete account**, data export | M |
| 18 | **Legal & Consent** | ToS/Privacy acceptance + log, cookie consent, privacy policy page | S |
| 19 | **Transactional Email** | Resend — welcome, receipts, "finish your book" nudges | S |
| 20 | **Analytics & Funnel** | Events (signup→onboard→first book→publish→pay); PostHog or `events` table | M |
| 21 | **Re-engagement / Notifications** | In-app + email nudges to come back and finish | S |
| 22 | **Rate limiting & Abuse** | On AI endpoints, tied to plan | S |
| 23 | **Observability** | Sentry + structured logging | S |
| 24 | **Admin / Internal tools** | Support views, feature flags (later) | M |
| 25 | **Security baseline** | Every query scoped by `userId`; secrets hygiene; session mgmt | ongoing |

---

## Phased plan

### Phase 0 — Auth ✅ (shipped)
Google sign-in (Auth.js / NextAuth v5), JWT sessions, action gate at
"Approve & Start Writing," route protection for `/dashboard` and `/project/*`,
header sign-in / avatar menu. Sign-in/sign-up triggers:
1. Header "Sign in" button (explicit)
2. "Approve & Start Writing" while logged out (action gate — the conversion moment)
3. Visiting `/dashboard` or `/project/*` while logged out (auto-redirect)

### Phase 1 — Database & Identity foundation ▶️ (keystone)
- Wire Drizzle → Railway Postgres (`DATABASE_URL` in Vercel).
- Add the Auth.js **Drizzle adapter**; persist `users` / `accounts` / `sessions` /
  `verification_tokens`; drop the legacy `clerkUserId` column.
- **Session strategy: keep JWT + adapter.** Adapter persists durable identity
  (cross-device); JWT keeps middleware fast (no DB hit per request). Inject
  `userId` and an `onboarded` flag into the token.
- **Migrate books off localStorage → Postgres** via server actions, behind the
  *same interface the Zustand store already exposes* (`createProject`,
  `getProject`, `patchChapter`, `approveBlueprint`…). Components don't change.
- One-time client-side import of any in-progress localStorage draft on first login.

**Migration approach: full cutover (not dual-write).** Dual-write is best
practice only when migrating a *populated, live* system with zero-downtime
needs. We have no real user data yet (localStorage holds disposable test
books), so dual-write would be tech debt protecting data that doesn't exist.
The safety comes from the stable interface seam + existing CI gates
(typecheck → tests → preview), not from running two stores in parallel.

*Unlock: accounts are real; books survive across devices and cache clears.*

### Phase 2 — Profile & Onboarding
- `profiles` table (1:1 with user).
- First-login-only onboarding wizard (`onboarded=false` → `/onboarding` →
  dashboard). 2–3 short steps collecting: role/persona, what they want to
  write, primary goal, "how'd you hear about us," + ToS/marketing consent.
- Pre-fill the builder from their answers.
- Capture consent (#18) and seed funnel events (#20). Minimal settings (#17)
  so users can edit their profile.

*Unlock: trust + segmentation data + attribution — the overlooked, high-value layer.*

### Phase 3 — Resume, Workspace & Re-engagement
- Server-side autosave of in-progress builder drafts and chapters; version history.
- Dashboard shows "continue where you left off" vs published.
- Transactional email (#19): welcome + "finish your book" nudges (#21).

*Unlock: people actually return and complete their book.*

### Phase 4 — Export & "become an author"
- Export the finished book to PDF / EPUB / DOCX; polish the publishing kit.

*Unlock: completes the core promise; small build, high emotional payoff. May be
pulled ahead of Phase 3 if desired.*

### Phase 5 — Billing & Gates
- Stripe customer / checkout / portal / webhooks → `subscriptions`.
- Usage metering (`usage_events`) + credits/quota entitlements.
- Paywall/upgrade UI; pricing → checkout. Rate limiting (#22). Mature
  observability (#23). Extend settings to manage subscription.

*Unlock: revenue + cost control. Deliberately AFTER resume + export so we're
charging for an experience that's already sticky.*

### Phase 6 — Ingestion (uploads + connectors)
- **6a:** Uploads & storage (#9), transcription (#10), vision (#11), pipeline (#13).
- **6b:** Social connectors (#12) — Instagram via Meta Graph first.

*Unlock: the "turn your content into a book" headline becomes literally true.
Heaviest lift — sequenced last. Until it ships, marketing copy for
upload/connectors should read "coming soon."*

### Ongoing / cross-cutting
Legal & consent (#18), analytics (#20), observability (#23), admin (#24),
security baseline (#25) — seeded early and matured every phase.

---

## Data model (target)

Builds on the existing `src/lib/db/schema.ts` (already mirrors the domain types).

| Domain | Tables |
|--------|--------|
| **Auth / Identity** | `users`, `accounts`, `sessions`, `verification_tokens` |
| **Profile / Onboarding** | `profiles` (role, primary_goal, use_case, company, referral_source, tos_accepted_at, marketing_opt_in, onboarding_completed_at, timezone) |
| **Books** | `book_projects`, `book_blueprints`, `chapters`, `source_content`, `publishing_kits` (add `user_id` FKs + relations) |
| **Resume state** | `book_projects.status="draft"` + `builder_drafts` (in-progress wizard answers) |
| **Billing / Gates** | `subscriptions`, `usage_events`, `entitlements`/credits |
| **Trust / Ops** | `consent_log`, `events` (analytics), optional `feature_flags` |

---

## Sequencing principles

1. **Minimum trustworthy, monetizable product** = Phases 1→5 + legal (#18) +
   export (#7): sign up → onboarded → build → return → export → pay, with data
   safe. Treat this as the v1 target.
2. **Ingestion is the headline but the heaviest lift.** A book studio that
   can't yet save a book to an account is the more urgent gap, so ingestion is
   sequenced last; soften the landing copy to "coming soon" until it ships.
3. **Billing doesn't jump the line.** Gating AI behind payment before the
   create→resume→export loop feels good is premature. Bill at Phase 5, after
   resume + export make it worth paying for.
