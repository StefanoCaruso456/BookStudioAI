"use client";
// ===========================================================================
// useAutosave (ADR-1, ADR-2) — the client glue around the pure save-state
// machine in autosave.ts. Responsibilities kept here (not in the pure module):
//
//   • ~800ms debounce: coalesce rapid edits into a single write.
//   • Single-flight: at most one save per key in flight. If content changed
//     while a save was running, fire exactly one follow-up once it returns.
//   • A real status (idle | saving | saved | error) + lastSavedAt timestamp.
//   • retry(): re-attempt the last failed write immediately.
//   • flush(): force any pending/dirty write now (unmount, visibilitychange).
//
// The caller owns the optimistic local state; this hook only owns persistence.
// `save` must be stable-ish (we read it via a ref so it never restarts timers).
// ===========================================================================
import { useCallback, useEffect, useRef, useState } from "react";
import {
  initialSaveState,
  nextSaveState,
  hasPendingWork,
  type SaveEvent,
  type SaveState,
  type SaveStatus,
} from "./autosave";

const DEBOUNCE_MS = 800;

export interface UseAutosave<T> {
  status: SaveStatus;
  dirty: boolean;
  lastSavedAt: Date | null;
  /** Queue a debounced save of `payload` (the latest call wins). */
  schedule: (payload: T) => void;
  /** Re-attempt the last (failed) write immediately. */
  retry: () => void;
  /** Persist any pending/dirty write right now (best-effort). */
  flush: () => void;
}

export function useAutosave<T>(
  save: (payload: T) => Promise<void>
): UseAutosave<T> {
  const [state, setState] = useState<SaveState>(initialSaveState);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Refs so the debounce/flush callbacks never go stale or restart needlessly.
  const saveRef = useRef(save);
  saveRef.current = save;

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);
  // The latest payload that still needs persisting (null = nothing pending).
  const pending = useRef<{ payload: T } | null>(null);

  const dispatch = useCallback((event: SaveEvent) => {
    setState((s) => nextSaveState(s, event));
  }, []);

  // Runs the actual write, enforcing single-flight + a re-save if the content
  // changed mid-flight. Reads `pending` fresh each time so it always saves the
  // newest payload, not the one captured when the timer was set.
  const run = useCallback(async () => {
    if (inFlight.current) return; // single-flight guard
    const next = pending.current;
    if (!next) return;

    pending.current = null;
    inFlight.current = true;
    dispatch({ type: "saveStart" });
    try {
      await saveRef.current(next.payload);
      setLastSavedAt(new Date());
      dispatch({ type: "saveSuccess" });
    } catch (err) {
      console.error("autosave failed", err);
      // Re-queue what we just tried so retry()/the next edit can re-send it.
      pending.current = pending.current ?? next;
      dispatch({ type: "saveError" });
    } finally {
      inFlight.current = false;
      // A new edit landed while we were saving → save again, once.
      if (pending.current) void run();
    }
  }, [dispatch]);

  const schedule = useCallback(
    (payload: T) => {
      pending.current = { payload };
      dispatch({ type: "edit" });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        void run();
      }, DEBOUNCE_MS);
    },
    [dispatch, run]
  );

  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (pending.current) void run();
  }, [run]);

  const retry = useCallback(() => {
    // The failed payload is still in `pending`; just try again immediately.
    flush();
  }, [flush]);

  // Flush on unmount so a debounce window that hasn't elapsed isn't dropped.
  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      if (pending.current) void run();
    };
  }, [run]);

  return {
    status: state.status,
    dirty: state.dirty,
    lastSavedAt,
    schedule,
    retry,
    flush,
  };
}

export { hasPendingWork };
