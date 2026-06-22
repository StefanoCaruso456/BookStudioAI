# Phase 4 — Export ("Become an Author") · Spec

> Template: Research → Objective → Principles → ADRs → Data Model → Flow +
> Wireframes → Features → User Stories → Engineering Tasks → Non-functionals →
> Testing → Risks → DoD.
>
> **Status: DRAFT — awaiting product-owner approval before build.**

_Depends on: Phase 1 (DB ✅) · Phase 2 (Onboarding ✅) · Phase 3 (Workspace ✅)_

---

## 0. Research summary (why these choices)

Generating files in **Vercel serverless** has one hard constraint: **avoid headless
Chromium**. The Chromium binary is ~100 MB vs Vercel's ~50 MB function size limit,
and serverless lacks the OS/fonts a browser needs — so Puppeteer-based PDF is
fragile/oversized there. Current best practice:
- **PDF → `@react-pdf/renderer`** — pure JS, bundle < 2 MB, generation < 500ms,
  runs in any Node serverless function; declarative layout + custom fonts.
- **DOCX → `docx`** — pure-JS Word document builder.
- **EPUB → `epub-gen-memory`** — in-memory EPUB (a zip of XHTML), no filesystem
  writes (serverless-safe).

**Translation:** generate all three with pure-JS libraries in a **Node runtime
Route Handler** and stream the file as a download. No headless browser, no Blob
storage needed for v1 (on-demand).

Sources: DEV (Puppeteer vs @react-pdf production comparison), Nutrient (JS PDF
libraries 2025), techresolve (Next.js server-side PDF) — links in chat.

---

## 1. Objective

Let an author **download their finished book** as **PDF, EPUB, and DOCX** — a
title page, table of contents, and all chapters in order, assembled from the DB.
This completes the "become an author" promise the product makes.

**Out of scope (deferred):**
- Paywalling export by plan → **Phase 5 (Billing)**; export is free for onboarded users now.
- Rich formatting / markdown in chapter bodies, custom cover image upload, print-ready KDP trim sizes → later polish.
- Stored/emailed exports, background generation for huge books → future (Blob + queue).

---

## 2. Guiding principles (three lenses)

**Principal AI/product engineer**
- One server-side **assembly** step produces a normalized `ExportBook`; each
  format renderer consumes the same structure (no per-format data plumbing).
- Plain-text chapter content → paragraphs; deterministic, fast, testable assembly.

**Data engineer**
- Export is **read-only**; no new tables for v1. Log an `export` row in the
  existing `events` table for the funnel.
- Assembly is a single `userId`-scoped project read (reuse `getProject`).

**DB / ops / serverless admin**
- **Node runtime** Route Handler (not edge — generators need Node). Pure-JS libs
  only (no Chromium). Ownership enforced server-side. Filenames sanitized.
- Mindful of function time/memory limits; v1 targets normal book sizes.

---

## 3. Architecture Decision Records

**ADR-1 · On-demand generation via a gated Node Route Handler.**
`GET /api/export/[projectId]?format=pdf|epub|docx` (`export const runtime = "nodejs"`),
auth + onboarded + **ownership** checked; generates in-memory and streams the file
with `Content-Type` + `Content-Disposition: attachment`. _Rejected:_ server action
(awkward for binary downloads) and pre-generating/storing files (unneeded for v1).

**ADR-2 · Pure-JS generators, no Chromium.** `@react-pdf/renderer` (PDF),
`docx` (DOCX), `epub-gen-memory` (EPUB). _Rejected:_ Puppeteer/Chromium
(>50 MB, fragile fonts on serverless).

**ADR-3 · Single assembly model.** A server-only `assembleExportBook(project)` →
`{ title, subtitle, author, chapters: [{ title, paragraphs }] }`, built from the
publishing kit (final title/subtitle/author) falling back to the blueprint/project.
All three renderers consume it. Pure + unit-testable.

**ADR-4 · Export is free now; plan-gating is Phase 5.** Available to any onboarded
owner; emit an `export` event (format) for analytics. _Rejected:_ gating here
(couples to billing prematurely).

**ADR-5 · Plain-text → paragraphs; generated title page + TOC.** Split chapter
content on blank lines into paragraphs. Title page + auto TOC. _Rejected:_ rich
markdown rendering (future polish).

---

## 4. Data model
No schema changes. Reads via `getProject` (userId-scoped). Export usage recorded
in the existing `events` table: `name='export'`, `props={ projectId, format }`.

---

## 5. Flow + wireframes

```
Publishing kit page  ── "Export" section ──────────────┐
  [ Download PDF ]  [ Download EPUB ]  [ Download DOCX ] │  (was: "coming soon")
        │ click → GET /api/export/<id>?format=pdf        │
        ▼                                                │
  Route Handler (node):                                  │
    auth + onboarded + owns project?  ── no → 403/redirect│
    getProject(userId, id) → assembleExportBook → render  │
    stream: Content-Disposition: attachment; filename=<book>.pdf
        │
        ▼  browser download ; emit events('export',{format})
```

**Generated document structure (all formats):**
```
┌ Title page:  <Title>  /  <Subtitle>  /  by <Author>
├ Table of contents:  1. Ch title … n. Ch title
└ Chapters:  "Chapter k — <title>"  then paragraphs…
```

Button states: idle → `Generating…` (disabled, spinner) → triggers download →
back to idle; error → inline message + retry.

---

## 6. Features (epics)
- **E1 — Assembly:** `assembleExportBook(project)` normalized model + tests.
- **E2 — Renderers:** PDF (`@react-pdf/renderer`), DOCX (`docx`), EPUB (`epub-gen-memory`).
- **E3 — Delivery:** gated Node Route Handler streaming the download + event log.
- **E4 — UI:** wire the publishing-kit Export buttons (enable, loading, error).

---

## 7. User stories (with acceptance criteria)

**US-1 — Download my book.** _As an author, I can download my book as PDF, EPUB, or DOCX._
- AC: each button downloads a valid file named after the book.
- AC: the file opens in standard readers (PDF viewer / e-reader / Word).

**US-2 — Complete & ordered.** _As an author, the export has everything in order._
- AC: title page (title/subtitle/author), a TOC, and every chapter in `orderIndex` order.
- AC: chapter text is split into readable paragraphs.

**US-3 — Only mine.** _As a user, I can only export books I own._
- AC: requesting another user's `projectId` returns 403/redirect; never the file.

**US-4 — Clear feedback.** _As an author, I see progress and errors._
- AC: the button shows `Generating…` while working; failure shows an error + retry.

**US-5 — Author name.** _As an author, my name appears on the title page._
- AC: uses the publishing kit's author/title; falls back to blueprint/project title.

---

## 8. Engineering tasks (ordered)
1. **T1 — Deps.** Add `@react-pdf/renderer`, `docx`, `epub-gen-memory` (runtime deps).
2. **T2 — Assembly.** `src/lib/export/assemble.ts` (`assembleExportBook`) + `assemble.test.ts` (paragraph splitting, ordering, title/author fallback, empty chapters).
3. **T3 — PDF renderer.** `src/lib/export/pdf.tsx` → Buffer.
4. **T4 — DOCX renderer.** `src/lib/export/docx.ts` → Buffer.
5. **T5 — EPUB renderer.** `src/lib/export/epub.ts` → Buffer.
6. **T6 — Route handler.** `src/app/api/export/[projectId]/route.ts` (`runtime="nodejs"`): auth + onboarded + ownership; `?format=`; assemble → render → stream with sanitized filename; emit `export` event; 400 on bad format, 403/redirect on not-owner.
7. **T7 — UI.** Enable the publishing-kit Export buttons (PDF/EPUB/DOCX) with loading + error; trigger the download.
8. **T8 — Validate.** `lint + typecheck + test + build` green; confirm the route is `ƒ` (node), not edge.

---

## 9. Non-functional requirements
- **Serverless-safe:** pure-JS generators; Node runtime; no Chromium; bundle within limits.
- **Security:** ownership enforced server-side; sanitized `Content-Disposition` filename; auth + onboarded.
- **Performance:** typical book generates in a few seconds within function limits.
- **Correctness:** files validate in standard readers; chapters complete + ordered.

## 10. Testing strategy
- Unit: `assembleExportBook` (ordering, paragraph split, fallbacks) — pure, vitest.
- Smoke: each renderer returns a non-empty Buffer for a sample book (no network).
- Manual (prod): download all 3 formats from a real book; open in a viewer; confirm title page + TOC + chapters; try a non-owned id → blocked.
- Gate: lint + typecheck + test + build (+ CI migrate no-op).

## 11. Risks & mitigations
| Risk | Mitigation |
|---|---|
| Very large book exceeds function time/memory | v1 targets normal sizes; note background-gen + Blob for future; cap/paginate if needed |
| A generator pulls a non-serverless dep | Verified pure-JS set; route pinned to `nodejs` runtime; smoke test in CI build |
| Filename injection from title | Sanitize to a safe slug for `Content-Disposition` |
| `@react-pdf` font/runtime quirks | Use built-in fonts for v1; add custom fonts later if needed |

## 12. Definition of Done
- [ ] PDF, EPUB, DOCX all download from the publishing kit and open in standard readers
- [ ] Title page + TOC + all chapters in order; author/title correct
- [ ] Ownership enforced (non-owner blocked); `export` events logged
- [ ] Node-runtime route; `lint + typecheck + test + build` green
- [ ] Verified on production; ROADMAP Phase 4 marked ✅

## 13. Required from product owner (before build)
- **Approve scope** — three formats, on-demand, free-for-now (plan-gating in Phase 5).
- Confirm v1 keeps **plain-text → paragraphs** (no markdown/rich formatting yet) and **no cover-image upload** (generated title page only).
