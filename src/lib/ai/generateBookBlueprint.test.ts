import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateBookBlueprint } from "./generateBookBlueprint";
import { getGenre } from "@/lib/genres";
import type { GenerateBlueprintInput } from "./types";

// The generator awaits simulateLatency (a real setTimeout). Fake timers let us
// resolve it instantly instead of sleeping ~900ms per test.
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

async function generate(input: Partial<GenerateBlueprintInput> = {}) {
  const full: GenerateBlueprintInput = {
    bookType: "cookbook",
    goal: undefined,
    audience: { description: "home cooks" },
    sourceContent: [],
    genreData: {},
    initialPrompt: undefined,
    ...input,
  };
  const promise = generateBookBlueprint(full);
  await vi.runAllTimersAsync();
  return promise;
}

describe("generateBookBlueprint", () => {
  it("derives titles from the topic and dedupes them", async () => {
    const bp = await generate({ genreData: { recipeName: "Sunday Ragù" } });
    expect(bp.titleOptions[0]).toBe("Sunday Ragù");
    expect(bp.titleOptions).toContain("The Sunday Ragù Handbook");
    // no duplicates
    expect(new Set(bp.titleOptions).size).toBe(bp.titleOptions.length);
  });

  it("uses the audience description as the target reader", async () => {
    const bp = await generate({ audience: { description: "busy parents" } });
    expect(bp.targetReader).toBe("busy parents");
    expect(bp.subtitleOptions[0]).toContain("busy parents");
  });

  it("derives one chapter summary per suggested section", async () => {
    const sections = getGenre("cookbook").suggestedSections;
    const bp = await generate({ bookType: "cookbook" });
    expect(bp.chapterSummaries).toHaveLength(sections.length);
    expect(bp.tableOfContents).toEqual(sections);
    expect(bp.chapterSummaries.map((c) => c.title)).toEqual(sections);
  });

  it("selects tone from the goal, with a default when goal is absent", async () => {
    const withGoal = await generate({ goal: "build_authority" });
    expect(withGoal.tone).toBe("Confident, credible, and clear");
    const withoutGoal = await generate({ goal: undefined });
    expect(withoutGoal.tone).toBe("Clear, warm, and professional");
  });

  it("produces a non-empty estimated length and next steps", async () => {
    const bp = await generate();
    expect(bp.estimatedLength).toMatch(/pages/);
    expect(bp.estimatedLength).toMatch(/words/);
    expect(bp.nextSteps.length).toBeGreaterThan(0);
  });

  it("builds a book promise that names the reader", async () => {
    const bp = await generate({ audience: { description: "first-time founders" } });
    expect(bp.bookPromise).toContain("first-time founders");
  });
});
