// ===========================================================================
// Pure autosave state machine (ADR-1, ADR-2). No timers, no I/O — just the
// transitions, so it's fully unit-testable. The `useAutosave` hook wraps this
// with the debounce + single-flight + retry plumbing.
//
// The indicator must track the REAL request lifecycle, never a fake timer:
//   idle  → (edit)        → idle but dirty (a write is queued)
//   *     → (saveStart)   → saving
//   saving→ (saveSuccess) → saved   (unless edited mid-flight: stays dirty)
//   saving→ (saveError)   → error
//   error → (retry/edit)  → re-attempt
// ===========================================================================

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type SaveEvent =
  | { type: "edit" } // user changed content (or an AI write landed)
  | { type: "saveStart" } // a debounced write began
  | { type: "saveSuccess" } // the server confirmed the write
  | { type: "saveError" }; // the write failed

export interface SaveState {
  status: SaveStatus;
  /** True when local content differs from the last confirmed server write. */
  dirty: boolean;
}

export const initialSaveState: SaveState = { status: "idle", dirty: false };

/**
 * The single, pure transition. Keep ALL timing out of here so it stays a
 * deterministic reducer the tests can drive event-by-event.
 */
export function nextSaveState(state: SaveState, event: SaveEvent): SaveState {
  switch (event.type) {
    case "edit":
      // Any edit makes us dirty. Leaving `error` returns us to a savable state
      // (we'll retry on the next debounce); otherwise `saving` keeps showing
      // its spinner while the in-flight write races the new edit.
      return {
        status: state.status === "error" ? "idle" : state.status,
        dirty: true,
      };

    case "saveStart":
      // The debounced write fired: it carries the current content, so once it
      // returns we're clean (single-flight) — unless a new edit arrives first.
      return { status: "saving", dirty: false };

    case "saveSuccess":
      // If the user typed while the write was in flight, we're dirty again and
      // owe another save — keep `saving` so the indicator doesn't flicker to
      // "Saved" while a follow-up is pending.
      return state.dirty
        ? { status: "saving", dirty: true }
        : { status: "saved", dirty: false };

    case "saveError":
      return { status: "error", dirty: true };

    default:
      return state;
  }
}

/** True when a write is owed (dirty) or one is currently in flight. */
export function hasPendingWork(state: SaveState): boolean {
  return state.dirty || state.status === "saving";
}
