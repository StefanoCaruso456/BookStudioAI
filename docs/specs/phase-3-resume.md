# Phase 3 — Resume & Workspace Reliability · Spec

> Same template: Research → Objective → Principles → ADRs → Data Model → Flow +
> Wireframes → Features → User Stories → Engineering Tasks → Non-functionals →
> Testing → Risks → Definition of Done.
>
> **Status: DRAFT — awaiting product-owner approval before build.**

_Depends on: Phase 1 (DB ✅) · Phase 2 (Onboarding ✅)_

---

## 0. Research summary (why these choices)

Current 2025 best practice for autosave / resume:
- **Optimistic UI** — reflect the edit instantly; show background save state (subtle, not blocking).
- **Debounce ~500–800ms** — never save on every keystroke; coalesce rapid edits into one write.
- **Server-confirmed status** — the indicator must track the *real* request: `Saving…` → `Saved HH:MM` → `Error` (with **retry**), not a fake timer.
- **Prevent data loss** — warn on navigation while a save is pending/dirty; retry failed saves; alert on persistent failure.

**Why this matters here:** today the workspace fires a server action **on every keystroke** (no debounce) and the "Saved" pill is a **500ms fake timer** unrelated to whether the write succeeded. So edits can silently fail and the UI still says "Saved." Phase 3 makes persistence trustworthy and lets users **leave and come back to finish** — the behavior that drives completion.

Sources: GitLab Pajamas (saving & feedback), UI-Patterns (autosave), Refine/React-admin AutoSave, Medium (debounce) — links in the chat summary.

---

## 1. Objective

Make saving **reliable and visible**, and make it effortless to **resume**:
1. Debounced, server-confirmed chapter autosave with a real status + retry + unsaved-changes guard.
2. Builder draft persisted **server-side** so an in-progress book survives across devices.
3. A **"Continue where you left off"** path from the dashboard into the exact chapter.

**Out of scope (deferred):**
- **Re-engagement email** (welcome / "finish your book") → **Phase 3b**, depends on a Resend API key (external dependency; carved out so it can't block this build — same pattern as DB/auth).
- Real-time multi-device collaboration / conflict merge (single-user app for now).
- Export (Phase 4), billing (Phase 5).

---

## 2. Guiding principles (three lenses)

**Principal AI/product engineer**
- Optimistic local state; the DB is the source of truth, reconciled by a confirmed save.
- AI generations and manual edits go through the same single save path (no divergent writes).
- Coalesce: one in-flight save at a time; re-run if the content changed while saving.

**Data engineer**
- One write per debounce window, not per keystroke. Indexed lookups for resume.
- Builder draft is 1:1 with the user; revisions (if built) are capped to bound growth.
- Migrations committed + applied in CI (ADR-3 from Phase 1).

**DB / ops admin**
- All reads/writes `userId`-scoped. No data loss: pending saves flushed/guarded on unload.
- Failures observable (console + status surface; full observability is the hardening track).

---

## 3. Architecture Decision Records

**ADR-1 · Debounced, single-flight autosave.** Replace per-keystroke fire-and-forget with a debounce (~800ms) + single in-flight save; if content changed during a save, re-save once it returns. _Rejected:_ save-on-every-change (API spam) and interval polling (saves stale/no-op writes).

**ADR-2 · Save status reflects the real request lifecycle.** Status = `idle | saving | saved(at) | error`. Driven by the actual server-action promise, not a timer. `error` shows a **Retry**. A `beforeunload` guard warns while `dirty || saving`. _Rejected:_ the current fake 500ms "Saved" timer (lies on failure).

**ADR-3 · Builder draft persisted server-side (`builder_drafts`, 1:1 user).** The in-progress wizard (answers + generated blueprint) is saved to Postgres (debounced), so resume works on any device. localStorage stays as a fast cache; DB is source of truth; one-time import of an existing local draft. _Rejected:_ localStorage-only (single-device, lost on cache clear).

**ADR-4 · Resume = most-recently-updated in-progress project + last-edited chapter.** Store `last_edited_chapter_id` on `book_projects` (updated on chapter save) for a precise deep link; dashboard surfaces a "Continue" card. _Rejected:_ guessing from `chapters.updated_at` each load (works but less precise/indexed).

**ADR-5 · (Stretch) Chapter revisions snapshots.** `chapter_revisions` capturing content before each AI generation + on manual "save version", with restore; retention capped (e.g. last 20/chapter). Clearly optional — ship core first.

**ADR-6 · Re-engagement email is Phase 3b.** Excluded here to avoid an external-dependency (Resend) blocker; specced separately when a key is provided.

---

## 4. Data model

```
builder_drafts                         -- 1:1 with user; server-persisted wizard
  user_id      text PK, FK users.id (cascade)
  draft        jsonb        -- bookType, goal, audience, genreData, sources, initialPrompt
  blueprint    jsonb        -- last generated blueprint (nullable)
  updated_at   timestamp default now()

book_projects  (ALTER)
  last_edited_chapter_id  text  null   -- precise resume deep-link target

chapter_revisions  (STRETCH — ADR-5)
  id          text PK
  chapter_id  text FK chapters.id (cascade)
  content     text
  reason      text          -- 'pre_ai' | 'manual'
  created_at  timestamp default now()
  index (chapter_id, created_at)
```

---

## 5. Flow + wireframes

**Save status (in the chapter editor header):**
```
 ┌──────────────────────────────────────────────┐
 │ Chapter title…                  ● Saving…     │   (debounced write in flight)
 │                                 ✓ Saved 12:05 │   (server confirmed)
 │                                 ⚠ Save failed · Retry │  (error → retry)
 └──────────────────────────────────────────────┘
   leaving while pending → browser "unsaved changes" prompt
```

**Resume (dashboard):**
```
 ┌─────────────────────────────────────────────┐
 │  Continue where you left off                 │
 │  “Weeknight Dinners”  ·  Ch. 4 — Sauces      │
 │  edited 2h ago                 [ Continue → ]│ → /project/<id>?chapter=<id>
 └─────────────────────────────────────────────┘
```
Builder resume: returning to `/builder` rehydrates the server-persisted draft (and blueprint), cross-device.

---

## 6. Features (epics)
- **E1 — Reliable autosave:** debounced single-flight writes + real status + retry + unload guard.
- **E2 — Builder draft persistence:** `builder_drafts` table + load/save + localStorage import.
- **E3 — Resume:** `last_edited_chapter_id`, dashboard "Continue" card, `?chapter=` deep link.
- **E4 — (Stretch) Version history:** `chapter_revisions` + snapshot + restore.

---

## 7. User stories (with acceptance criteria)

**US-1 (E1) — Trustworthy save.** _As a writer, I can see exactly when my work is saved._
- AC: editing shows `Saving…`, then `Saved <time>` only after the server confirms.
- AC: a failed save shows an error + **Retry**; succeeds on retry.

**US-2 (E1) — No save spam.** _As the system, rapid typing makes one write, not one per keystroke._
- AC: continuous typing triggers a single debounced save (~800ms after the last change).

**US-3 (E1) — No lost edits.** _As a writer, I'm warned before leaving with unsaved changes._
- AC: navigating away while a save is pending/dirty prompts a confirmation.

**US-4 (E2) — Cross-device builder resume.** _As a user, an unfinished book setup follows me._
- AC: starting the builder on one device and returning (any device) rehydrates my answers + blueprint.

**US-5 (E3) — One-click resume.** _As a returning user, I can jump straight back to where I stopped._
- AC: dashboard shows a "Continue" card for my most-recently-edited in-progress book.
- AC: it deep-links to the exact last-edited chapter.

**US-6 (E4, stretch) — Restore a version.** _As a writer, I can undo an AI rewrite I dislike._
- AC: a snapshot is taken before each AI generation; I can restore it.

---

## 8. Engineering tasks (ordered)
1. **T1 — Autosave engine.** A `useAutosave` hook (or refactor `ChapterWorkspace.patchChapter`): debounce, single-flight, dirty re-save, status (`idle|saving|saved|error`), retry. Remove the fake `markSaved` timer.
2. **T2 — Save status UI.** `ChapterEditor` shows the real status + timestamp + Retry (replace the `saved` boolean prop with a status object).
3. **T3 — Unsaved-changes guard.** `beforeunload` while `dirty||saving`.
4. **T4 — Builder draft persistence.** `builder_drafts` table + migration; `loadBuilderDraft` / `saveBuilderDraftAction` (debounced); wire `BookBuilderWizard` to hydrate from server + persist; one-time localStorage import.
5. **T5 — Resume.** Add `last_edited_chapter_id` (migration) updated on chapter save; dashboard "Continue" card; `ChapterWorkspace` honors `?chapter=` to preselect.
6. **T6 — (Stretch) Revisions.** `chapter_revisions` + snapshot-before-AI + restore UI.
7. **T7 — Tests + validate.** Pure-logic tests for the debounce/status state machine; committed migration; `lint + typecheck + test + build` green.

---

## 9. Non-functional requirements
- **Reliability:** at most one in-flight save per chapter; no silent failures; no data loss on navigation.
- **Performance:** ≤1 write per debounce window; resume is an indexed lookup.
- **Security:** every save/load `userId`-scoped; server actions auth-guarded.
- **UX:** status is subtle but truthful; resume is one click.

## 10. Testing strategy
- Unit: debounce/single-flight/status state machine (pure, vitest); persona-style isolation where DB-touching is wrapped.
- Integration (manual, prod): type → see Saving→Saved; kill network → Error→Retry; reload mid-edit → no loss; build on device A, resume on device B; dashboard Continue → correct chapter.
- Gate: lint + typecheck + test + build (+ CI migrate on deploy).

## 11. Risks & mitigations
| Risk | Mitigation |
|---|---|
| Debounce drops the final edit on unload | Flush pending save on `beforeunload`/`visibilitychange` |
| Two devices editing the same draft | Last-write-wins on `builder_drafts` (single-user); note for future merge |
| Revisions table growth | Cap retention per chapter (stretch only) |
| Save indicator flicker | Min display time for `Saving…`; debounce status transitions |

## 12. Definition of Done
- [ ] Chapter autosave debounced + single-flight; status reflects the real request; Retry works
- [ ] Unsaved-changes guard prevents silent loss
- [ ] Builder draft persists server-side and resumes cross-device (+ local import)
- [ ] Dashboard "Continue" deep-links to the last-edited chapter
- [ ] Committed migration(s) applied in CI; `lint + typecheck + test + build` green
- [ ] Verified on production; ROADMAP Phase 3 marked ✅
- [ ] (Stretch) revisions + restore, if approved

## 13. Required from product owner (before build)
- **Approve scope** — core = reliable autosave + builder-draft persistence + resume; **stretch** = version history; **deferred** = re-engagement email (Phase 3b, needs a Resend key).
- Confirm whether to **include the version-history stretch** now or split it out.
