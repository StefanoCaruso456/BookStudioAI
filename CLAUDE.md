# Working rules for Book Studio AI

## Communication
- **After EVERY merge to `main`, report it clearly and concisely as:**
  **What · Why · Purpose · Outcome · Value** (one block per merge). This is a
  standing rule — no exceptions.

## Git process
- **No direct commits to `main`** unless the user explicitly approves it as an
  emergency production hotfix. Normal flow is:
  **branch → validated fix → PR → review → merge → deploy → production
  acceptance test.**
- A change isn't "done" until its **production acceptance test passes**, not
  just when CI is green.

## Engineering conventions
- Plan PM-first per phase: spec under `docs/specs/` (research → ADRs → data model
  → flow → wireframes → user stories → tasks → DoD) and get approval before build.
- Every change must pass **typecheck + tests + build** before merge.
- Migrations are committed SQL (`/drizzle`, tracked) and applied in CI before
  deploy — never at app boot.
- Data access is server-only and `userId`-scoped; keep the Auth.js edge/Node
  split intact (no DB imports in `auth.config.ts` / `middleware.ts`).
- Deploys go through GitHub Actions → Vercel (test-gated). Roadmap: `ROADMAP.md`.
