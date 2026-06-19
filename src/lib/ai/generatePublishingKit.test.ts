import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generatePublishingKit } from "./generatePublishingKit";
import type { GeneratePublishingKitInput } from "./types";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

async function generate(over: Partial<GeneratePublishingKitInput> = {}) {
  const input: GeneratePublishingKitInput = {
    bookType: "cookbook",
    title: "Sunday Suppers",
    subtitle: "Recipes for the whole family",
    bookPromise: "You'll cook with confidence.",
    targetReader: "home cooks",
    tone: "Warm",
    authorName: "Maria",
    goal: undefined,
    ...over,
  };
  const promise = generatePublishingKit(input);
  await vi.runAllTimersAsync();
  return promise;
}

describe("generatePublishingKit", () => {
  it("carries the title and subtitle through unchanged", async () => {
    const kit = await generate();
    expect(kit.finalTitle).toBe("Sunday Suppers");
    expect(kit.subtitle).toBe("Recipes for the whole family");
  });

  it("uses genre-specific keywords and categories", async () => {
    const kit = await generate({ bookType: "cookbook" });
    expect(kit.keywords).toContain("cookbook");
    expect(kit.categorySuggestions.join(" ")).toMatch(/Cookbooks/);
  });

  it("falls back to 'other' keywords for an unknown book type", async () => {
    const kit = await generate({ bookType: "mystery" as GeneratePublishingKitInput["bookType"] });
    expect(kit.keywords).toContain("nonfiction");
  });

  it("includes the author name in the bio and capitalizes it", async () => {
    const kit = await generate({ authorName: "maria" });
    expect(kit.authorBio).toContain("Maria");
  });

  it("falls back to a generic author when none is given", async () => {
    const kit = await generate({ authorName: undefined });
    expect(kit.authorBio).toContain("The author");
  });

  it("provides cover concepts and an unchecked KDP checklist", async () => {
    const kit = await generate();
    expect(kit.coverConcepts.length).toBeGreaterThan(0);
    expect(kit.kdpChecklist.length).toBeGreaterThan(0);
    expect(kit.kdpChecklist.every((item) => item.done === false)).toBe(true);
  });

  it("weaves the book promise into the description and back-cover copy", async () => {
    const kit = await generate({ bookPromise: "You'll travel like a local." });
    expect(kit.bookDescription).toContain("You'll travel like a local.");
    expect(kit.backCoverCopy).toContain("You'll travel like a local.");
  });
});
