# Book Studio AI — Pre-Search / Product Engineering Plan

**Core positioning:** Turn Content Into Books.
The product should feel like a guided publishing studio (Canva + Notion +
Substack), **not** a generic AI chatbot.

---

## Recommended stack

| Layer           | Tool                    | Why |
| --------------- | ----------------------- | --- |
| Frontend        | Next.js + TypeScript    | Best for full-stack React SaaS — landing pages, routing, app flows. |
| Hosting         | Vercel                  | Zero-config Next.js hosting, preview deployments, fast UI shipping. |
| Database        | Railway Postgres        | Simple managed Postgres, zero-config provisioning, strong MVP fit. |
| ORM             | Drizzle                 | Lightweight, TypeScript-first ORM with PostgreSQL support. |
| Auth            | Clerk                   | Fastest Next.js auth — prebuilt sign-in/up, profile, hooks. |
| AI              | Vercel AI SDK           | Streaming output, structured generation, Next.js AI workflows. |
| Payments        | Stripe                  | Weekly and monthly subscriptions. |
| Storage         | UploadThing or S3 later | PDFs, images, manuscripts, recipes, uploads. |
| Background jobs | Railway later           | Long-running generation, parsing, exports, publishing. |

> Build instruction: **Next.js + TypeScript + Tailwind + Vercel + Railway
> Postgres + Drizzle + Clerk + Stripe + Vercel AI SDK.** Do not use Supabase
> for this version.

## Why Vercel + Railway

**Vercel runs the app** (landing, prompt bar, genre tiles, wizard, chapter
workspace, API routes / server actions, AI streaming UI). **Railway runs backend
infrastructure** (Postgres now; worker service, queue, long-running jobs, and an
export service later). Vercel is optimised for Next.js deployment; Railway is
better for backend services and the database.

## System modules

1. Landing page
2. Auth
3. Book project creation
4. Book builder wizard
5. Book blueprint generator
6. Chapter workspace
7. AI action panel
8. Publishing kit
9. Stripe subscription gate
10. Admin/debug dashboard (later)

## Core database tables

`users` · `book_projects` · `source_content` · `book_blueprints` · `chapters`
· `publishing_kits` · `subscriptions`

(Implemented in `src/lib/db/schema.ts`.)

## MVP architecture

- Next.js app deployed on Vercel
- Railway Postgres as source of truth (Drizzle ORM)
- Clerk for login
- Stripe for $8/week and $30/month
- Vercel AI SDK for AI workflows
- Placeholder upload/export systems first

## Design system

Editorial and premium: warm-white background `#FAFAF7`, near-black text
`#111111`, secondary text `#5F5F5F`, white cards, border `#E7E3DA`, copper accent
`#C47A3A` / dark `#9A5827`, soft accent `#F6E9DC`. Inter / Geist Sans. Large
headings, generous spacing, soft rounded cards, minimal shadows. One primary
action per screen; clear step-by-step progress; the user always knows where they
are, what to do next, and how close they are to a finished book.

## Implementation order

1. Project setup → 2. Theme/design system → 3. Landing page → 4. Routing →
5. Types → 6. DB schema → 7. Auth → 8. Book Builder Wizard →
9. Blueprint generation → 10. Chapter workspace → 11. Editing workflow →
12. Publishing kit → 13. Dashboard → 14. Subscription gate → 15. Polish & QA.

## Definition of done

A user can: land → select book type → enter a prompt → continue into the builder
→ complete the guided wizard → generate a blueprint → edit & approve it → enter
the chapter workspace → generate & edit chapter drafts → use editing modes →
generate a publishing kit → see pricing/subscription gate → return to the
dashboard and continue.

## Product rule

Do **not** build a generic chatbot. Build a guided publishing workflow. The user
should always know where they are, what step they're on, what to do next, and how
close they are to having a book.

### Sources

- Next.js — https://nextjs.org/docs
- Next.js on Vercel — https://vercel.com/frameworks/nextjs
- Railway Postgres — https://docs.railway.com/databases/postgresql
- Drizzle ORM (Postgres) — https://orm.drizzle.team/docs/get-started-postgresql
- Clerk Next.js quickstart — https://clerk.com/docs/nextjs/getting-started/quickstart
