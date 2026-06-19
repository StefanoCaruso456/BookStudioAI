# Book Studio AI

**Turn Content Into Books.**

Book Studio AI helps creators, chefs, coaches, fitness professionals, doctors,
travel creators, founders, and experts turn their content, knowledge, and life
experiences into professionally structured books — through a guided publishing
studio, not a generic chatbot.

---

## What's in this MVP

A complete, runnable end-to-end flow:

1. **Landing page** → prompt bar + six genre tiles (`/`)
2. **Book Builder Wizard** → book type → goal → audience → source content →
   genre-specific details → AI blueprint (`/builder`)
3. **Blueprint** → titles, subtitles, promise, tone, editable table of contents;
   approve to create chapters
4. **Chapter workspace** → sidebar TOC, editor, AI assistant, editing modes,
   chapter statuses (`/project/[id]`)
5. **Publishing kit** → title, bio, description, back-cover copy, keywords,
   categories, cover concepts, KDP checklist, export placeholders
   (`/project/[id]/publishing`)
6. **Dashboard** → manage and continue projects (`/dashboard`)
7. **Subscription gate** → pricing + upgrade modal (placeholder, no real charge)

### Runs with zero secrets

The MVP persists to the browser (`localStorage`) and uses **placeholder AI
functions** that produce genre-aware, professional output deterministically from
your own inputs. No database, auth, or API keys are required to run it.

## Tech stack

| Layer    | Choice                                   |
| -------- | ---------------------------------------- |
| Frontend | Next.js (App Router) + TypeScript        |
| Styling  | Tailwind CSS + Lucide icons              |
| State    | Zustand (localStorage persistence)       |
| AI       | Placeholder layer in `src/lib/ai/*`      |
| DB       | Drizzle schema in `src/lib/db/schema.ts` |

## Getting started

```bash
npm install
npm run dev
# open http://localhost:3000
```

Other scripts: `npm run build`, `npm run typecheck`, `npm run lint`.

## Wiring up real services (later)

Everything is structured so production services drop in without touching the UI.
Copy `.env.example` → `.env.local` and fill in keys as you go.

- **Database (Railway Postgres + Drizzle):** schema already lives in
  `src/lib/db/schema.ts` and mirrors the store shapes. Set `DATABASE_URL`, run
  `npm run db:push`, then replace the actions in `src/lib/store.ts` with server
  actions that query these tables.
- **Auth (Clerk):** wrap the app in `<ClerkProvider>`, add `/sign-in` and
  `/sign-up`, protect `/dashboard`, `/builder`, and `/project/[id]`, and map the
  Clerk user to the `users` table.
- **AI (Vercel AI SDK → OpenAI/Anthropic):** each function in `src/lib/ai/*` has
  a typed input/output contract. Swap the placeholder body for a real model call;
  the components don't change.
- **Payments (Stripe):** replace `setPlan` in
  `src/components/common/SubscriptionGate.tsx` with a Stripe Checkout session.

## Project structure

```
src/
  app/                     # routes (landing, builder, project, publishing, dashboard, pricing)
  components/
    landing/  builder/  workspace/  publishing/  dashboard/  ui/  layout/  common/
  lib/
    ai/                    # placeholder AI functions + typed interfaces
    db/schema.ts           # Drizzle schema (production data model)
    genres.ts              # genre-specific config (the "studio" brain)
    store.ts               # Zustand store (MVP source of truth)
    utils.ts
  types/book.ts            # core domain types
docs/PRESEARCH.md          # product engineering / stack rationale
```

## Design system

**Modern Editorial** — premium, calm, publishing-grade (think Notion × Substack ×
Apple Books, not a neon AI tool). Warm white canvas `#FAFAF7`, near-black ink
`#111111`, deep editorial slate-blue brand `#2F4A5A` with a soft `#EEF3F6`
highlight, borders `#E7E3DA`. Geist Sans headings + Inter body, 12–16px radii,
whisper-light shadows, and elegant monochrome line icons.

---

© 2026 Book Studio AI.
