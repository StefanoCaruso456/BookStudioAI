# Phase 2 — Profile & Onboarding · Spec

> Same template as Phase 1: Research → Objective → Principles → ADRs → Data Model
> → User Flow + Wireframes → Data Flow → Features → User Stories → Engineering
> Tasks → Non-functionals → Testing → Risks → Definition of Done.
>
> **Status: DRAFT — awaiting product-owner approval before build.**

_Depends on: Phase 1 (Database & Identity ✅)_

---

## 0. Research summary (why these choices)

Grounded in current (2025–26) SaaS onboarding best practice:

- **2–4 questions is the sweet spot.** Collect essentials now, defer the rest
  (progressive profiling). More than that tanks completion.
- **Self-segmentation welcome survey.** Ask role + goal immediately after
  signup, then **personalize** the next screen (Canva: "What will you use this
  for?"; Airtable: self-select role). One input reshapes the whole experience.
- **Time-to-value < 2 minutes.** Don't bury the "aha" behind a long form.
  Onboarding should *funnel into* the first valuable action, not delay it.
- **Onboarding is a deciding factor for ~63% of buyers; ~8/10 users abandon
  products they don't understand.** It's retention infrastructure, not a form.
- **Personalize to the persona's "aha".** Different segments activate on
  different actions; route each toward theirs.

**Fastest-growing AI products (Claude, ChatGPT, Base44, Lovable):** they onboard
*minimally* — "value before explanation" (one teardown: +53% Day‑1 retention by
prioritizing immediate value), with **one light self-segmentation question** and
learn-by-doing. Base44/Lovable: a single "which role fits you best?" + consent,
then into the product. Claude/ChatGPT: accept terms → straight to the chat.

**Translation to Book Studio AI — what to add vs exclude (key platform call):**
our builder *already* asks **book type** (step 1) and **goal** (step 2), so
re-asking them in onboarding violates "don't ask twice."
- **ADD:** persona/role (a *new* signal → personalization + segmentation),
  legal consent (ToS/Privacy), optional "how did you hear about us" (attribution).
- **EXCLUDE:** book type + goal (the builder owns them), company/team size
  (B2C, single-user), long product tours.

→ Our "aha" is **the first blueprint**. So onboarding is the *leanest* useful
slice — **one persona tap + consent** — that pre-fills the builder's book type
and drops the user straight into it: trust + segmentation data captured while
*shortening* time-to-aha.

Sources: ProductLed, Appcues, Userpilot, Chameleon, Candu, Maven (Claude vs
ChatGPT onboarding teardown), WorkOS — see links in the chat summary.

---

## 1. Objective

After first sign-up, give every user a lightweight, personalized onboarding that
(a) captures who they are and what they want, (b) records legal consent, and
(c) routes them into a **pre-filled builder** for a fast first win — while
persisting a `profile` we can build on (personalization, segmentation,
attribution, email permission).

**Out of scope (deferred):** full account/settings management (Phase 3+),
billing prefs (Phase 5), multi-step product tours / checklists (later),
email sending itself (Phase 3).

---

## 2. Guiding principles (three lenses)

**Principal AI/product engineer**
- Onboarding *accelerates* the aha (pre-fill builder), never blocks it.
- Personalization is data-driven: persona → default book type, tailored copy.
- Idempotent: re-visiting `/onboarding` after completion just redirects out.

**Data engineer**
- `profiles` is 1:1 with `users` (FK, cascade). Consent is an **append-only log**
  (auditable, versioned) — never overwritten.
- Analytics events are first-party, minimal, and structured (jsonb props).
- Enumerated values (persona, goal) stored as text with app-level enums.

**DB / ops / compliance admin**
- Collect only what we use; every field has a documented purpose.
- Legal consent (ToS/Privacy) captured with **version + timestamp** for audit.
- Profile auto-created on user creation (no orphaned users).
- All reads/writes scoped by `userId`.

---

## 3. Architecture Decision Records

**ADR-1 · Onboarding gate is server-side (per-request DB check), not edge/JWT.**
Onboarding status changes *mid-session*; the DB is the source of truth. A small
server check in the authenticated surfaces (`/dashboard`, `/project/*`) redirects
to `/onboarding` when `onboarding_completed_at IS NULL`. _Rejected:_ stuffing an
`onboarded` flag in the JWT (goes stale the moment they finish; needs token
refresh gymnastics).

**ADR-2 · Profile row auto-created on user creation.**
Use the Auth.js `events.createUser` hook to insert an empty `profiles` row
(`onboarding_completed_at = NULL`) when a user first signs in. Guarantees a 1:1
profile, no lazy-creation races.

**ADR-3 · Consent is an append-only `consent_log`, not a profile column.**
ToS/Privacy acceptance is a legal record: store `(user_id, type, version,
accepted_at)` immutably. Marketing opt-in (a *preference*, not a legal record)
lives on `profiles` and can change.

**ADR-4 · Leanest useful flow: persona + consent (NOT goal/book-type).**
Two beats: (1) persona/role self-segmentation, (2) consent (+ optional
attribution). We deliberately **exclude book type and goal** because the builder
already collects them (no double-asking), matching the minimal onboarding of the
fastest AI products. _Rejected:_ a 3–4 step survey (duplicates the builder, hurts
completion) and consent-only (wastes the one cheap segmentation signal).

**ADR-5 · Onboarding completion routes to a pre-filled builder.**
On finish, redirect to `/builder` with the persona's book type pre-selected
(skip builder step 1), optimizing time-to-aha. _Rejected:_ dropping them on an
empty dashboard.

**ADR-6 · First-party `events` table for the funnel (PostHog-ready later).**
Minimal `events(user_id, name, props, created_at)` to track
signup → onboarding_started → onboarding_completed → first_blueprint. Swappable
for PostHog in the hardening track without changing call sites.

---

## 4. Data model (new tables)

```
profiles
  user_id                 text  PK, FK -> users.id (cascade)   -- 1:1
  persona                 text  null   -- chef|coach|creator|consultant|founder|author|other
  primary_goal            text  null   -- reuse BookGoal enum
  use_case                text  null   -- intended book type (BookType)
  referral_source         text  null   -- attribution: how they heard
  company                 text  null   -- optional
  marketing_opt_in        bool  default false
  onboarding_completed_at timestamp null  -- NULL = not onboarded (the gate)
  locale                  text  null
  created_at / updated_at timestamp

consent_log  (append-only)
  id            text PK
  user_id       text FK -> users.id (cascade)
  type          text     -- 'terms' | 'privacy' | 'marketing'
  version       text     -- e.g. '2026-06-01'
  accepted_at   timestamp default now()
  index (user_id)

events  (first-party funnel)
  id          text PK
  user_id     text FK -> users.id (cascade), nullable
  name        text     -- 'onboarding_started' | 'onboarding_completed' | ...
  props       jsonb    -- arbitrary structured context
  created_at  timestamp default now()
  index (user_id), index (name, created_at)
```

**What each field is for (data minimization):**
| Field | Purpose |
|---|---|
| `persona` | Personalize builder default + dashboard copy; segment users |
| `primary_goal` | Shape blueprint tone/CTA (already used by AI layer) |
| `use_case` | Pre-select book type in the builder (fast aha) |
| `referral_source` | Growth: which channels actually convert |
| `marketing_opt_in` | Permission to send re-engagement email (Phase 3) |
| `onboarding_completed_at` | The gate; also activation analytics |
| `consent_log` | Legal audit trail (ToS/Privacy), required for OAuth verification |
| `events` | Funnel measurement so we can improve activation |

---

## 5. User flow + wireframes

```
Google sign-in (first time)
        │  events.createUser -> insert empty profile
        ▼
 ┌─────────────────────────────────────────────┐
 │  /onboarding  (gate: profile incomplete)     │
 │                                              │
 │  STEP 1 — "Which best describes you?"        │
 │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐     │
 │  │ Chef  │ │ Coach │ │Creator│ │Consult│     │
 │  └───────┘ └───────┘ └───────┘ └───────┘     │
 │  ┌───────┐ ┌───────┐ ┌───────┐               │
 │  │Founder│ │Author │ │ Other │      ● ○      │
 │  └───────┘ └───────┘ └───────┘               │
 │                            (single tap → next) │
 │                                              │
 │  STEP 2 — "One last thing"                   │
 │   [ ] I agree to the Terms & Privacy Policy  │  (required)
 │   [ ] Email me product tips (optional)       │
 │   (optional) How did you hear about us? [▼]  │
 │                              [ Start my book ]   ○ ●  │
 └─────────────────────────────────────────────┘
        │  save profile + consent_log + events('onboarding_completed')
        ▼
 /builder?type=<persona→bookType>   (step 1 pre-selected → fast blueprint = AHA)
        (book type + goal are collected by the builder, not onboarding)
```

Re-entry: visiting `/onboarding` when already completed → redirect `/dashboard`.
Visiting `/dashboard` or `/project/*` when **not** completed → redirect
`/onboarding`.

Design: reuse the existing design system (persona grid mirrors the marketing
GenreTile aesthetic; dark gradient hero like the NarrativeConverge beat). Mobile:
single column, sticky CTA.

---

## 6. Data flow

```
Client (onboarding wizard, client component)
   │  collects persona/goal/use_case/referral/consent (local state)
   ▼
completeOnboardingAction("use server")   ── auth() -> userId
   │  ├─ profiles: UPDATE (persona, goal, use_case, referral,
   │  │             marketing_opt_in, onboarding_completed_at = now())
   │  ├─ consent_log: INSERT terms+privacy (+marketing if opted in)
   │  └─ events: INSERT 'onboarding_completed'
   ▼
redirect /builder?type=<use_case>   (revalidate dashboard)
```

Reads: a server-only `loadProfile()` (like `loadProject`) used by the gate.

---

## 7. Features (epics)

- **E1 — Schema & profile lifecycle:** profiles/consent_log/events tables,
  migration, auto-create profile on user creation.
- **E2 — Onboarding gate:** server-side redirect logic + `loadProfile`.
- **E3 — Onboarding wizard UI:** 3-step flow, design-system styled, mobile-first.
- **E4 — Persistence:** `completeOnboardingAction` (profile + consent + event).
- **E5 — Personalization payoff:** builder reads `?type=` / profile to pre-select
  book type; dashboard greets by persona.
- **E6 — Minimal settings:** read-only profile view + edit persona/goal + manage
  marketing opt-in (foundation for Phase 3 account page).

---

## 8. User stories (with acceptance criteria)

**US-1 (E2) — First-time gate.** _As a new user, the first time I sign in I'm taken to onboarding._
- AC: signing in with `onboarding_completed_at = NULL` → `/onboarding`.
- AC: `/dashboard` and `/project/*` redirect to `/onboarding` until complete.

**US-2 (E3/E4) — Self-segmentation.** _As a user, I pick who I am and what I want, in under a minute._
- AC: persona + goal + use_case captured; ToS/Privacy required to finish.
- AC: marketing opt-in + referral are optional; can finish without them.

**US-3 (E4) — Consent recorded.** _As the business, every acceptance is auditable._
- AC: finishing inserts `consent_log` rows for terms + privacy with version + timestamp.
- AC: marketing opt-in recorded only if checked.

**US-4 (E5) — Personalized payoff.** _As a user, after onboarding the product already knows my goal._
- AC: redirected to `/builder` with my book type pre-selected (builder skips step 1).
- AC: dashboard greeting references my persona.

**US-5 (E2) — No repeat.** _As a returning user, I never see onboarding again._
- AC: visiting `/onboarding` when complete → `/dashboard`.

**US-6 (E6) — Editable later.** _As a user, I can change my persona/goal and email preference._
- AC: a settings view shows my profile and lets me update it + toggle marketing opt-in.

**US-7 (E1) — Clean lifecycle.** _As an engineer, every user has exactly one profile._
- AC: a new Google sign-in creates one `profiles` row automatically.

---

## 9. Engineering task specs (ordered)

1. **T1 — Schema.** Add `profiles`, `consent_log`, `events` to Drizzle schema + relations + indexes. `drizzle-kit generate`, commit migration.
2. **T2 — Auto-create profile.** Auth.js `events.createUser` → insert empty profile. (Edge-safe: lives in `auth.ts`, Node side.)
3. **T3 — Profile data layer.** `loadProfile()` loader + `completeOnboardingAction` + `updateProfileAction` (server actions, userId-scoped) + a tiny `logEvent` helper.
4. **T4 — Gate.** Server check helper `requireOnboarded()` used by `/dashboard` + `/project/*`; `/onboarding` redirects out if already complete.
5. **T5 — Wizard UI.** 3-step client component (persona grid, goal/use-case, consent), design-system styled, progress dots, mobile sticky CTA.
6. **T6 — Persistence wiring.** Submit → `completeOnboardingAction` → redirect `/builder?type=…`.
7. **T7 — Personalization.** Builder honors `?type=`/profile to preselect; dashboard persona greeting.
8. **T8 — Settings (minimal).** `/settings` (or section) reading profile, editing persona/goal + marketing opt-in via `updateProfileAction`.
9. **T9 — Events + hardening.** Emit funnel events; empty/edge states; tests.

---

## 10. Non-functional requirements
- **Privacy/compliance:** consent versioned + auditable; data minimization; deletion cascades with the user.
- **Security:** all profile/consent/event access `userId`-scoped; actions auth-guarded.
- **Performance:** profile is a single indexed PK lookup; gate adds one cheap query to authed pages.
- **Accessibility:** keyboard-navigable persona grid, labeled inputs, focus states.
- **UX:** completion in < 60s; < 2 min to first blueprint.

## 11. Testing strategy
- Unit: profile repo (create/read/update, isolation); consent insert; gate logic.
- Integration: new-user → gated → complete → redirected → not re-gated.
- Manual (prod): fresh Google account → onboarding → builder pre-filled → DB inspector shows profile + consent rows.
- Gate: typecheck → tests → build, as always.

## 12. Risks & mitigations
| Risk | Mitigation |
|---|---|
| Gate redirect loops | `/onboarding` itself is never gated; explicit complete-check |
| Profile missing for legacy user (you) | `events.createUser` only fires for new users → backfill: create profile on first `loadProfile` miss |
| Onboarding friction hurts conversion | 3 short steps, optional fields, value-forward CTA; measured via events |
| Consent version drift | Single `CONSENT_VERSION` constant referenced everywhere |

## 13. Definition of Done
- [ ] `profiles` / `consent_log` / `events` migrated (committed SQL, applied in CI)
- [ ] New sign-in auto-creates a profile; legacy users backfilled on first load
- [ ] First-time users gated into `/onboarding`; never re-gated after completion
- [ ] 3-step wizard persists profile + consent + event; routes to pre-filled builder
- [ ] Dashboard personalizes by persona; settings can edit profile + opt-in
- [ ] typecheck + tests + build green; verified on production via DB inspector
- [ ] ROADMAP Phase 2 marked ✅

## 14. Required from product owner (before build)
- **Approve this spec** (esp. ADR-4 depth: 3 lean steps, and ADR-5 route-to-builder).
- Confirm the **persona list** (Chef / Coach / Creator / Consultant / Founder / Author / Other) — these map to book types.
- Provide/confirm **Terms & Privacy** pages exist (or stub them) since onboarding records consent to them.
