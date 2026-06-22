# Book Studio AI — Engineering Build Session

**Live:** [book-studio-ai.vercel.app](https://book-studio-ai.vercel.app) · **Date:** June 2026 · **Stack:** Next.js 14 · TypeScript · Postgres · Stripe · OpenAI

> **Book Studio AI turns years of knowledge into a published book.** A guided AI
> publishing studio: bring notes, transcripts, recipes, and expertise → get a
> structured blueprint → AI-drafted chapters in your voice → a publish-ready
> book you can export and sell.

---

## TL;DR

In this session we took Book Studio AI from a browser-only prototype to a
**production SaaS** — real accounts, a real database, onboarding, reliable
editing, multi-format export, and Stripe billing — shipped as **six PM-first
phases**, each test-gated through CI/CD with a **production acceptance test**
before it counted as done.

- **6 phases** shipped (Auth → Database → Onboarding → Workspace reliability → Export → Billing)
- **131 automated tests** (0 → 131 over the project), green on every deploy
- **Test-gated CI/CD** → typecheck + tests + build + DB migration all pass before any production deploy
- **Verified in production** with live data, not assumptions

---

## The product loop

```
Capture knowledge → AI Blueprint → AI-written chapters → Edit with AI → Publish (kit + export)
   notes/transcripts    title +        full drafts in       developmental,    PDF / EPUB / DOCX
   /recipes/posts       outline        your voice           clarity, tone     + KDP kit
```

The free tier reaches the **"aha"** (a complete blueprint); writing the whole
book with AI and exporting it is the paid moment.

---

## What we shipped this session

| Phase | What | Status |
|------:|------|--------|
| **0 · Auth** | Google sign-in (Auth.js / NextAuth v5), JWT sessions, action-gated conversion (build first, sign in at the value moment) | ✅ Live |
| **1 · Database** | Postgres + Drizzle ORM; the Auth.js adapter; books persist per-account, cross-device; CI-applied migrations | ✅ Live |
| **2 · Onboarding** | Persona self-segmentation + legal consent + funnel events; server-side gate; personalized payoff into a pre-filled builder | ✅ Live · **prod acceptance passed** |
| **3 · Workspace reliability** | Debounced, single-flight, **server-confirmed** autosave (replacing per-keystroke writes + a fake "saved" indicator); cross-device draft resume; "continue where you left off" | ✅ Live |
| **4 · Export** | One-click **PDF / EPUB / DOCX** download — title page + TOC + chapters — pure-JS generators in a serverless Node route (no headless Chromium) | ✅ Live |
| **5 · Billing** | Stripe **Free vs Pro** — hosted Checkout + Customer Portal, signature-verified **webhooks as the source of truth**, server-enforced entitlement | ✅ Built · in review (pending Stripe keys) |

---

## How we built it (the discipline, not just the features)

This wasn't vibe-coding. Every phase followed the same engineering process:

**1. PM-first specs.** Each phase began with a written spec under `docs/specs/`:
research (with cited current best practice) → architecture decision records →
data model → user/data flow → wireframes → user stories with acceptance criteria
→ engineering tasks → definition of done. **Built only after approval.**

**2. Research-grounded decisions.** Choices were grounded in current best
practice, e.g.:
- Onboarding modeled on how the fastest AI products onboard (value-first, light self-segmentation).
- Autosave: optimistic UI + debounce + a *truthful* server-confirmed status.
- Export: pure-JS generators because Chromium (~100 MB) exceeds the serverless function limit.
- Billing: webhooks as the source of truth; never trust the redirect.

**3. Test-gated CI/CD.** GitHub Actions → Vercel. No deploy ships unless
**typecheck + tests + build** pass, and **DB migrations are applied in CI before
deploy** (never at app boot — serverless instances would race).

**4. Branch → PR → review → merge → deploy → production acceptance test.**
A change isn't "done" when CI is green — it's done when its **production
acceptance test passes**. (We caught a real onboarding bug exactly this way:
a gated route the deploy went green on, but a fresh-user signup didn't hit —
diagnosed by route-path analysis + live DB inspection, fixed, and re-verified
against a brand-new production signup.)

**5. Production-grade architecture.**
- Server-only, `userId`-scoped data access — a user can never see another's data.
- Auth.js edge/Node split kept intact (no DB in the edge middleware bundle).
- Migrations are committed SQL, reviewed and versioned.
- Secrets in the platform, never in the repo.

---

## Tech stack

- **Framework:** Next.js 14 (App Router, Server Components + Server Actions), TypeScript (strict)
- **Data:** PostgreSQL + Drizzle ORM, migrations applied in CI
- **Auth:** Auth.js (NextAuth v5), Google OAuth, JWT sessions
- **AI:** Vercel AI SDK + OpenAI gpt-4o (blueprint, chapter drafting, editing, publishing kit), deterministic fallback
- **Billing:** Stripe (hosted Checkout, Customer Portal, webhooks)
- **Export:** `@react-pdf/renderer` (PDF), `docx` (DOCX), `epub-gen-memory` (EPUB) — all serverless-safe
- **UI:** Tailwind CSS, Framer Motion + GSAP scrollytelling, a custom design system
- **Quality:** Vitest (131 tests), ESLint, type-safe end to end
- **Infra:** GitHub Actions → Vercel (test-gated deploys), Railway Postgres

---

## By the numbers

- **6** product phases shipped this session
- **131** automated tests (started the project at 0)
- **5** database migrations, versioned + CI-applied
- **0** secrets in the repo; **100%** of data queries scoped to the signed-in user
- **Multiple** test-gated production deploys, each verified green end-to-end

---

## What's next

- **Production hardening** — connection pooling, observability (Sentry), rate limiting (before real client load)
- **Ingestion** — file uploads, transcription (audio/video → text), image understanding, social connectors (the "turn your content into a book" headline, end-to-end)
- **Re-engagement** — welcome + "finish your book" lifecycle email

---

*Built with a senior-engineering process: spec → review → test-gated build →
production acceptance. Velocity with rigor.*
