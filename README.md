# Book Studio AI

> Turn years of knowledge into a published book.

Book Studio AI is a guided **publishing studio** — not a chatbot — that turns a
creator's raw material (notes, documents, recipes, podcasts, newsletters,
expertise) into a professionally structured, publish-ready book. Built for
creators, coaches, chefs, consultants, founders, and experts.

Working end-to-end MVP, deployed to production. AI generation is live; data
persistence is client-side for now (see [Roadmap](#roadmap)).

## How it works

1. **Landing** (`/`) — premium scroll-driven marketing site.
2. **Builder wizard** (`/builder`) — book type → goal → audience → source
   content → genre details → AI **blueprint**.
3. **Blueprint** — title/subtitle options, promise, tone, and an editable table
   of contents; approve it to generate chapters.
4. **Chapter workspace** (`/project/[id]`) — TOC sidebar, editor, and an AI
   assistant (draft, rewrite actions, edit passes) with per-chapter statuses.
5. **Publishing kit** (`/project/[id]/publishing`) — author bio, description,
   back-cover copy, keywords, categories, cover concepts, and a KDP checklist.
6. **Dashboard** (`/dashboard`) to manage projects · **Pricing** (`/pricing`).

## Tech stack

| Layer       | Choice                                                              |
| ----------- | ------------------------------------------------------------------ |
| Framework   | Next.js 14 (App Router) · TypeScript (strict)                      |
| Styling     | Tailwind CSS · Lucide icons                                         |
| Animation   | Framer Motion · GSAP ScrollTrigger (marketing site)                |
| State       | Zustand, persisted to `localStorage`                               |
| AI          | Vercel AI SDK + OpenAI **gpt-4o** (server actions) + fallback      |
| Data model  | Drizzle ORM schema (`src/lib/db/schema.ts`) — defined, not wired   |
| Testing     | Vitest + Testing Library (76 tests)                                |
| CI/CD       | GitHub Actions → Vercel (test-gated)                               |

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Runs with **zero secrets**: the AI layer falls back to deterministic,
genre-aware output and state persists to the browser.

### Enable real AI (optional)

Copy `.env.example` → `.env.local` and set a server-side key:

```bash
OPENAI_API_KEY=sk-...   # server-side only — never prefix with NEXT_PUBLIC_
```

With a key present, all generation (blueprint, chapters, edits, publishing kit)
runs on **gpt-4o**; without one, the deterministic fallback is used. The key is
read on the server and never reaches the client.

## Scripts

| Script                              | Purpose                                  |
| ----------------------------------- | ---------------------------------------- |
| `npm run dev`                       | Development server                       |
| `npm run build` / `npm start`       | Production build / serve                 |
| `npm test` · `npm run test:watch`   | Vitest suite                             |
| `npm run typecheck`                 | `tsc --noEmit`                           |
| `npm run lint`                      | Next.js ESLint                           |
| `npm run db:generate` · `db:push`   | Drizzle migrations (once `DATABASE_URL`) |

## Architecture

- **AI layer (`src/lib/ai/`)** — the public surface
  (`generateBookBlueprint`, `generateChapterDraft`, `rewriteChapter`,
  `editChapter`, `generatePublishingKit`) is exposed as **server actions**
  (`actions.ts`). Each branches on `OPENAI_API_KEY`: present → gpt-4o
  (`openai.ts`, server-only); absent or on error → deterministic placeholder.
- **State (`src/lib/store.ts`)** — a Zustand store persisted to `localStorage`
  is the current source of truth. Its action shapes mirror the Drizzle schema,
  so swapping to Postgres + server actions later is a drop-in.
- **Genres (`src/lib/genres.ts`)** — the "studio brain": each genre's sections,
  audience hints, structured fields, and prompt flavor are config-driven.
- **Design** — two intentional surfaces (brand rules live in
  `.claude/skills/book-studio-design-system`):
  - **Marketing** (`/`): premium **midnight + royal indigo + Playfair Display**,
    scroll-driven with Framer Motion + GSAP.
  - **In-app studio**: a calmer **editorial slate** palette with Inter.

## Project structure

```
src/
  app/                 # routes: / · /builder · /project/[id] · /project/[id]/publishing · /dashboard · /pricing
  components/
    marketing/         # scrollytelling landing (+ primitives/)
    builder/ workspace/ publishing/ dashboard/   # the studio
    ui/ layout/ common/
  lib/
    ai/                # server actions + OpenAI (gpt-4o) + deterministic fallback (+ tests)
    db/schema.ts       # Drizzle schema (production data model)
    genres.ts          # genre configuration
    store.ts           # Zustand + localStorage (current source of truth)
    utils.ts marketing.ts gsap.ts
  types/book.ts        # core domain types
```

## CI / CD

- **`.github/workflows/ci.yml`** — on every PR to `main`:
  `typecheck → test → build`.
- **`.github/workflows/deploy.yml`** — on push to `main`: re-runs
  `typecheck → test`, then `vercel build` + `vercel deploy --prod`. A failing
  test blocks the deploy, and the outcome is visible in the Actions tab.
  Requires the `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` repo secrets.
- **`vercel.json`** disables Vercel's native `main` auto-deploy so it doesn't
  race the Actions deploy. PR preview deploys are unaffected.

## Roadmap

- **Persistence** — set `DATABASE_URL` (Railway Postgres) and replace the store
  actions with server actions over the existing Drizzle schema.
- **Auth** — Google sign-in, mapped to the `users` table.
- **Payments** — Stripe checkout behind the subscription gate.
- **Streaming** — stream gpt-4o output token-by-token in the wizard and editor.

---

© 2026 Book Studio AI
