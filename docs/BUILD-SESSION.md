# Book Studio AI — Complete Engineering Build Session

**Live:** [book-studio-ai.vercel.app](https://book-studio-ai.vercel.app) · **June 2026** · Next.js 14 · TypeScript · Postgres · Stripe · OpenAI gpt-4o

> **Book Studio AI turns years of knowledge into a published book.** A guided AI
> publishing studio: bring notes, transcripts, recipes, and expertise → get a
> structured blueprint → AI-drafted chapters in your voice → a publish-ready book
> you can export and sell.

---

## TL;DR

In a single continuous session, Book Studio AI went from a **browser-only MVP** to
a **production SaaS** — a redesigned marketing site, real AI generation, a full
test + CI/CD pipeline, and then six platform phases (accounts, database,
onboarding, reliable editing, export, billing).

- **~25 pull requests / merges**, each test-gated, shipped to production
- **6 PM-first platform phases** (Auth → Database → Onboarding → Workspace reliability → Export → Billing)
- **131 automated tests** (project went 0 → 131); **5 DB migrations**, CI-applied
- **Spec → review → test-gated deploy → production acceptance test** on every change
- Verified in production with **live data**, not assumptions

---

## The product loop

```
Capture knowledge → AI Blueprint → AI-written chapters → Edit with AI → Publish (kit + export)
   notes/transcripts    title +        full drafts in       developmental,    PDF / EPUB / DOCX
   /recipes/posts       outline        your voice           clarity, tone     + KDP kit
```

Free reaches the **"aha"** (a complete blueprint); writing the whole book with AI
and exporting it is the paid moment.

---

## Part A — Foundation, product & polish

Before the platform work, we hardened the codebase and elevated the product:

| Work | What | Shipped |
|------|------|---------|
| **Test suite + CI gate** | Vitest + Testing Library; unit coverage for the store, AI layer, and core logic | #3 |
| **Test-gated CI/CD** | GitHub Actions → Vercel; deploys blocked unless typecheck + tests + build pass; visible deploy logs (solved a Vercel commit-status limitation by moving deploys into Actions) | #4 |
| **Premium marketing redesign** | Editorial scrollytelling landing (midnight + royal indigo, Playfair display), Framer Motion + GSAP ScrollTrigger; built via a swarm of parallel sub-agents on shared primitives | #2, #5 |
| **Design system** | A reusable design-system skill + vendored external skills (frontend/responsive) | #6, #7 |
| **Real AI** | Wired all four AI features (blueprint, chapter drafting, rewrite/edit, publishing kit) to **OpenAI gpt-4o** via server actions, with deterministic fallback when no key is set | #8 |
| **Audit + cleanup** | Accurate README from a line-by-line audit; fixed a Tailwind `bg-brand` token collision; removed dead code; deploy runbook | #9, #10 |
| **Scrollytelling polish** | Fixed converging-narrative chip overlap, dark-mode text contrast, and a glowing-core overlap — by reasoning about GSAP transforms vs CSS animations | #11, #14, #15 |
| **SEO + details** | Descriptive footer + metadata for search; hero "Images/Videos" stickers; builder step-bar spacing | #13, #16 |

---

## Part B — The platform (six PM-first phases)

Each phase: a written spec under `docs/specs/` (research → ADRs → data model →
flow → wireframes → user stories → tasks → DoD), **approval**, then a test-gated
build, then a **production acceptance test**.

### Phase 0 — Authentication ✅ live
Google sign-in (Auth.js / NextAuth v5), JWT sessions, edge/Node split intact.
**Action-gated conversion:** visitors build a blueprint freely and sign in at the
value moment — not a wall on the landing page.

### Phase 1 — Database ✅ live
PostgreSQL + Drizzle ORM + the Auth.js database adapter. Books moved off
localStorage to durable, per-account, cross-device storage behind a clean
server-only repository. **Migrations are committed SQL, applied in CI before
deploy** (never at app boot — serverless instances would race). Verified login
wrote a real user row by inspecting the live database.

### Phase 2 — Onboarding ✅ live · production-acceptance passed
Research-backed lean flow (persona self-segmentation + legal consent), a
server-side onboarding gate, profile auto-creation, and a personalized payoff into
a pre-filled builder. New tables: `profiles`, `consent_log` (versioned audit
trail), `events` (funnel). **A real production bug was caught here** — new signups
entered through an ungated route and skipped onboarding; diagnosed by route-path
analysis + live DB inspection, fixed, and re-verified against a brand-new
production signup (profile + consent + funnel events all confirmed).

### Phase 3 — Workspace reliability ✅ live
Replaced naive per-keystroke saving (and a fake "Saved" indicator) with a
**debounced, single-flight, server-confirmed autosave** (`Saving… → Saved 12:05 →
Error · Retry`), an unsaved-changes guard, **cross-device builder-draft resume**,
and a dashboard "continue where you left off" deep-link.

### Phase 4 — Export ✅ live
One-click **PDF / EPUB / DOCX** download — title page + table of contents +
chapters — from a single assembly model through pure-JS generators
(`@react-pdf/renderer`, `docx`, `epub-gen-memory`) in a gated, ownership-checked
**Node serverless route** (no headless Chromium, which exceeds the function size
limit).

### Phase 5 — Billing ✅ built · in review
Stripe **Free vs Pro**: hosted Checkout + Customer Portal, **signature-verified
webhooks as the source of truth**, and **server-enforced entitlement** on the
chapter-AI actions and export route. Free keeps the funnel (onboarding +
blueprint); Pro unlocks AI writing + export. (Pending live Stripe keys before
merge.)

---

## How we built it (the discipline)

1. **PM-first specs, approval before build** — every phase began as a reviewed
   spec with ADRs, data model, wireframes, user stories, and a definition of done.
2. **Research-grounded decisions** — onboarding modeled on the fastest AI products
   (value-first, light self-segmentation); autosave on optimistic-UI + truthful
   status; export on serverless PDF best practice; billing on webhooks-as-truth.
3. **Test-gated CI/CD** — no deploy ships unless typecheck + tests + build pass;
   DB migrations applied in CI before deploy.
4. **Branch → PR → review → merge → deploy → production acceptance test** — a
   change is "done" only when its production acceptance test passes, not when CI
   is green. Codified as a standing rule in `CLAUDE.md`.
5. **Production-grade architecture** — server-only, `userId`-scoped data access
   (no user can see another's data); committed, versioned migrations; secrets in
   the platform, never the repo.

---

## Tech stack

- **Framework:** Next.js 14 (App Router, Server Components + Server Actions), TypeScript (strict)
- **Data:** PostgreSQL + Drizzle ORM; CI-applied migrations (Railway)
- **Auth:** Auth.js (NextAuth v5), Google OAuth, JWT sessions
- **AI:** Vercel AI SDK + OpenAI gpt-4o, deterministic fallback
- **Billing:** Stripe (Checkout, Customer Portal, webhooks)
- **Export:** `@react-pdf/renderer`, `docx`, `epub-gen-memory` (serverless-safe)
- **UI:** Tailwind CSS, Framer Motion + GSAP, custom design system
- **Quality:** Vitest (131 tests), ESLint, end-to-end type safety
- **Infra:** GitHub Actions → Vercel, test-gated deploys

---

## Shipped timeline (production merges, in order)

```
MVP → editorial re-theme → CI + runbook → Vitest test gate (#3)
   → premium landing redesign (#2, #5) → design-system + skills (#6, #7)
   → test-gated Vercel deploys (#4) → real gpt-4o AI (#8)
   → README audit + cleanup (#9, #10) → scrollytelling fixes (#11, #14, #15)
   → SEO footer (#13) → hero stickers + builder spacing (#16)
   ── PLATFORM ──
   → Phase 0 Auth (Google sign-in) → product roadmap
   → Phase 1 Database (foundation + migrations in CI + localStorage cutover)
   → Phase 2 Onboarding (+ caught & fixed a real prod signup bug)
   → Phase 3 Workspace reliability (#20)
   → Phase 4 Export PDF/EPUB/DOCX (#22)
   → Phase 5 Billing (Stripe) — in review (#23)
```

---

## By the numbers

- **6** platform phases + a full product/marketing/AI/testing foundation
- **131** automated tests (project started at 0)
- **5** versioned DB migrations, CI-applied (never at app boot)
- **~25** test-gated production merges
- **0** secrets in the repo; **100%** of data queries scoped to the signed-in user

---

## What's next

- **Production hardening** — connection pooling, observability (Sentry), rate limiting (before real client load)
- **Ingestion** — uploads, transcription (audio/video → text), image understanding, social connectors (the "turn your content into a book" headline, end-to-end)
- **Re-engagement** — welcome + "finish your book" lifecycle email

---

*Built with a senior-engineering process — spec → review → test-gated build →
production acceptance. Velocity with rigor.*
