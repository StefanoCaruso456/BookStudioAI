import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { editChapter, editModeLabel, EDIT_MODE_LIST } from "./editChapter";
import type { EditChapterInput, EditMode } from "./types";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

async function edit(over: Partial<EditChapterInput> & { mode: EditMode }) {
  const input: EditChapterInput = {
    content: "Some chapter content.",
    tone: "Warm",
    ...over,
  };
  const promise = editChapter(input);
  await vi.runAllTimersAsync();
  return promise;
}

describe("editChapter", () => {
  it("returns the mode and a summary for every edit mode", async () => {
    for (const mode of EDIT_MODE_LIST) {
      const result = await edit({ mode });
      expect(result.mode).toBe(mode);
      expect(result.summary.length, mode).toBeGreaterThan(0);
      expect(result.content.length, mode).toBeGreaterThan(0);
    }
  });

  it("annotates without dropping the original content for fact_check", async () => {
    const result = await edit({ mode: "fact_check", content: "The sky is blue." });
    expect(result.content).toContain("The sky is blue.");
    expect(result.content).toContain("Fact-check reminders");
  });

  it("applies grammar fixes (i -> I, collapsed whitespace, space before comma)", async () => {
    const result = await edit({
      mode: "grammar",
      content: "i went home , quickly  today",
    });
    expect(result.content).toContain("I went home");
    expect(result.content).toContain("home,");
    expect(result.content).not.toContain("  ");
  });

  it("references the provided tone in the tone_consistency pass", async () => {
    const result = await edit({ mode: "tone_consistency", tone: "Playful" });
    expect(result.content).toContain("Playful");
  });
});

describe("editModeLabel", () => {
  it("returns a label for each mode", () => {
    expect(editModeLabel("developmental")).toBe("Developmental edit");
    expect(editModeLabel("grammar")).toBe("Grammar edit");
  });
});

describe("EDIT_MODE_LIST", () => {
  it("lists every supported edit mode", () => {
    expect(EDIT_MODE_LIST).toEqual(
      expect.arrayContaining([
        "developmental",
        "clarity",
        "grammar",
        "tone_consistency",
        "fact_check",
      ])
    );
  });
});
