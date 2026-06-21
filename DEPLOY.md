# Deploy & CI/CD — Book Studio AI

Production deploys run through **GitHub Actions → Vercel**, gated on tests.
Pull requests get a quality check plus a Vercel preview; merging to `main`
triggers a test-gated production deploy whose pass/fail (and full build logs)
are visible in the **Actions** tab.

---

## Pipeline at a glance

```
feature branch ──PR──▶  CI (.github/workflows/ci.yml): typecheck → test → build
                         + Vercel preview deployment (URL commented on the PR)
                              │
                            merge to main
                              ▼
        Deploy (.github/workflows/deploy.yml):
        typecheck → test → vercel build → vercel deploy --prod
```

- **App** is built and served on **Vercel**.
- **`vercel.json`** disables Vercel's *native* auto-deploy for `main`, so it
  doesn't race the Actions deploy. PR preview deploys are unaffected.
- A failing test **blocks** the production deploy.

---

## Workflows

| File | Trigger | Does |
| --- | --- | --- |
| `.github/workflows/ci.yml` | PR to `main` | `npm ci` → `typecheck` → `test` → `build` |
| `.github/workflows/deploy.yml` | push to `main` | `typecheck` → `test` → `vercel build --prod` → `vercel deploy --prebuilt --prod` |

---

## Required configuration

### GitHub Actions secrets (for the deploy)
Repo → **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
| --- | --- |
| `VERCEL_TOKEN` | Vercel access token the deploy authenticates with (scoped to the project's team) |
| `VERCEL_ORG_ID` | Vercel team/org ID (`team_…`) |
| `VERCEL_PROJECT_ID` | Vercel project ID (`prj_…`) |

> `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` come from `.vercel/project.json` after
> running `vercel link`, or from the Vercel project settings. Never commit these
> or paste secret values anywhere public.

### Vercel project environment variables (for the running app)
Vercel → Project → **Settings → Environment Variables** (mark secrets as
*Sensitive*; the Actions deploy pulls them via `vercel pull`):

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Enables real **gpt-4o** generation. Server-side only — never `NEXT_PUBLIC_`. |
| `DATABASE_URL` | (Later) Railway Postgres, once persistence is wired. |

---

## Runs without any secrets

The app is designed to run with **zero secrets**:

- **No `OPENAI_API_KEY`** → the AI layer falls back to deterministic,
  genre-aware placeholder output (see `src/lib/ai/`).
- **No database** → state persists to the browser (`localStorage`) via the
  Zustand store.

So previews and local dev work out of the box; add `OPENAI_API_KEY` when you
want live AI.

---

## Everyday workflow

```bash
git checkout -b feature/my-change
# ...edit...
npm run typecheck && npm test && npm run build   # match CI locally
git commit -am "Describe the change"
git push -u origin feature/my-change
# open a PR → CI + Vercel preview run automatically
```

Merge when CI is green → production deploys itself, verifiable in the Actions tab.

---

## Recommended: protect `main`

So nothing merges unless CI passes: Repo → **Settings → Branches** → add a rule
for `main` → **Require a pull request** and **Require status checks to pass**,
selecting the **`Typecheck, test & build`** check from `ci.yml`.
