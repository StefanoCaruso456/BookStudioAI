import { describe, it, expect } from "vitest";
import {
  initialSaveState,
  nextSaveState,
  hasPendingWork,
  type SaveState,
} from "./autosave";

describe("nextSaveState", () => {
  it("starts idle and clean", () => {
    expect(initialSaveState).toEqual({ status: "idle", dirty: false });
  });

  it("edit marks the state dirty", () => {
    expect(nextSaveState(initialSaveState, { type: "edit" })).toEqual({
      status: "idle",
      dirty: true,
    });
  });

  it("saveStart moves to saving and clears dirty (the write carries current content)", () => {
    const dirty: SaveState = { status: "idle", dirty: true };
    expect(nextSaveState(dirty, { type: "saveStart" })).toEqual({
      status: "saving",
      dirty: false,
    });
  });

  it("saveSuccess moves saving → saved when no edit happened mid-flight", () => {
    const saving: SaveState = { status: "saving", dirty: false };
    expect(nextSaveState(saving, { type: "saveSuccess" })).toEqual({
      status: "saved",
      dirty: false,
    });
  });

  it("saveError moves saving → error and keeps dirty", () => {
    const saving: SaveState = { status: "saving", dirty: false };
    expect(nextSaveState(saving, { type: "saveError" })).toEqual({
      status: "error",
      dirty: true,
    });
  });

  it("edit during saving stays saving but flags dirty (single-flight owes a re-save)", () => {
    const saving: SaveState = { status: "saving", dirty: false };
    const edited = nextSaveState(saving, { type: "edit" });
    expect(edited).toEqual({ status: "saving", dirty: true });
  });

  it("saveSuccess after a mid-flight edit re-arms saving instead of flickering to saved", () => {
    const editedWhileSaving: SaveState = { status: "saving", dirty: true };
    expect(
      nextSaveState(editedWhileSaving, { type: "saveSuccess" })
    ).toEqual({ status: "saving", dirty: true });
  });

  it("edit after an error returns to a savable (idle, dirty) state for retry", () => {
    const errored: SaveState = { status: "error", dirty: true };
    expect(nextSaveState(errored, { type: "edit" })).toEqual({
      status: "idle",
      dirty: true,
    });
  });

  it("a full happy-path round trip ends saved + clean", () => {
    let s = initialSaveState;
    s = nextSaveState(s, { type: "edit" });
    s = nextSaveState(s, { type: "saveStart" });
    s = nextSaveState(s, { type: "saveSuccess" });
    expect(s).toEqual({ status: "saved", dirty: false });
  });
});

describe("hasPendingWork", () => {
  it("is false when idle and clean", () => {
    expect(hasPendingWork({ status: "idle", dirty: false })).toBe(false);
  });

  it("is true while dirty", () => {
    expect(hasPendingWork({ status: "idle", dirty: true })).toBe(true);
  });

  it("is true while a save is in flight", () => {
    expect(hasPendingWork({ status: "saving", dirty: false })).toBe(true);
  });

  it("is true in the error state (a write is still owed)", () => {
    expect(hasPendingWork({ status: "error", dirty: true })).toBe(true);
  });
});
