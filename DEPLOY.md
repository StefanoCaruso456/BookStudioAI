# Deploy & CI/CD — Book Studio AI

The goal: **open a PR → automatic preview deploy → merge to `main` → automatic
production deploy.** This is Vercel's native Git integration plus a GitHub
Actions quality gate. Set it up once; after that every PR ships itself.

---

## The pipeline at a glance

```
feature branch ──PR──▶  GitHub Actions CI (typecheck + build)
                         + Vercel Preview Deploy  (unique URL on the PR)
                              │
                            merge
                              ▼
                          main  ──▶  Vercel Production Deploy
```

- **App** runs on **Vercel** (the only place that builds/serves Next.js).
- **Postgres** lives on **Railway** (always-on database; not a per-PR deploy).

---

## One-time setup

### 1. Vercel — import the repo (the deploy engine)

1. Go to **vercel.com/new** → **Import** `StefanoCaruso456/BookStudioAI`.
2. **Framework Preset → `Next.js`** ⚠️ (do NOT leave it on "Other" — the build
   will be wrong otherwise).
3. **Root Directory → `./`** (the app is the repo root; `package.json` is at top
   level).
4. **Environment Variables →** leave empty for now. The MVP runs with zero
   secrets. Add these later as you wire services in:
   - `DATABASE_URL` (from Railway)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
   - `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`
   - `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. Click **Deploy**.

**That's the automation.** From now on, Vercel's GitHub app does this with no
extra config:

| Action | Result |
| --- | --- |
| Open a PR to `main` | **Preview deployment** — Vercel bot comments the URL on the PR |
| New commit on the PR | Preview redeploys |
| Merge / push to `main` | **Production deployment** |

### 2. Railway — Postgres only

1. In your Railway project: if a `book-studio-ai` **app** service exists, delete
   it (the app belongs on Vercel, not here — running it both places = double
   cost).
2. **+ New → Database → Add PostgreSQL.**
3. Copy the connection string from the DB's **Variables → `DATABASE_URL`**.
4. Paste it into **Vercel → Project → Settings → Environment Variables** as
   `DATABASE_URL`, then redeploy.

> Railway's Postgres is always-on. (Optional, later: Project → Settings →
> Environments → enable **PR environments** if you ever want throwaway DBs per
> PR for a worker service.)

### 3. GitHub — make the checks required (recommended)

So nothing merges to `main` unless CI is green:

1. Repo → **Settings → Branches → Add branch ruleset** (or "Add rule") for
   `main`.
2. Enable **Require a pull request before merging**.
3. Enable **Require status checks to pass** → select **`Typecheck & build`**
   (the job from `.github/workflows/ci.yml`) — it appears after the first PR
   runs once.

---

## The everyday workflow

```bash
git checkout -b feature/my-change
# ...edit...
git commit -am "Describe the change"
git push -u origin feature/my-change
gh pr create --fill          # opens the PR
```

Then on the PR you automatically get:
- ✅ **CI** — typecheck + build (GitHub Actions)
- 🔍 **Preview URL** — the live change to click through (Vercel)

Merge when both are green → production deploys itself.

---

## What's already in the repo

- **`.github/workflows/ci.yml`** — runs `npm ci`, `npm run typecheck`,
  `npm run build` on every PR and push to `main`.
- **`.env.example`** — the full list of env vars for when you wire up services.
- **`src/lib/db/schema.ts`** — Drizzle schema, ready for `npm run db:push` once
  `DATABASE_URL` is set.
