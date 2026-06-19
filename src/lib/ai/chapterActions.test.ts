import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateChapterDraft,
  rewriteChapter,
  chapterActionLabel,
} from "./chapterActions";
import type {
  ChapterAction,
  GenerateChapterDraftInput,
  RewriteChapterInput,
} from "./types";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

async function resolve<T>(promise: Promise<T>): Promise<T> {
  await vi.runAllTimersAsync();
  return promise;
}

const draftInput = (
  over: Partial<GenerateChapterDraftInput> = {}
): GenerateChapterDraftInput => ({
  chapterTitle: "Getting Started",
  chapterSummary: "An intro chapter.",
  bookType: "cookbook",
  tone: "Warm",
  audience: { description: "home cooks" },
  genreData: {},
  sourceContent: [],
  ...over,
});

describe("generateChapterDraft", () => {
  it("includes the title, summary, and audience", async () => {
    const out = await resolve(generateChapterDraft(draftInput()));
    expect(out).toContain("# Getting Started");
    expect(out).toContain("An intro chapter.");
    expect(out).toContain("home cooks");
  });

  it("emits a cookbook recipe block with provided genre data", async () => {
    const out = await resolve(
      generateChapterDraft(
        draftInput({
          genreData: { recipeName: "Ragù", ingredients: "beef, tomato", servingSize: "6" },
        })
      )
    );
    expect(out).toContain("## Recipe: Ragù");
    expect(out).toContain("**Serves:** 6");
    expect(out).toContain("- beef");
    expect(out).toContain("- tomato");
  });

  it("emits a genre-appropriate block for fitness books", async () => {
    const out = await resolve(
      generateChapterDraft(draftInput({ bookType: "fitness_diet" }))
    );
    expect(out).toContain("## The Workout");
  });

  it("omits a genre block for the generic 'other' type", async () => {
    const out = await resolve(generateChapterDraft(draftInput({ bookType: "other" })));
    expect(out).not.toContain("## Recipe");
    expect(out).not.toContain("## The Workout");
  });
});

describe("rewriteChapter", () => {
  const actions: ChapterAction[] = [
    "rewrite",
    "make_more_personal",
    "make_more_professional",
    "add_examples",
    "add_story",
    "add_action_steps",
    "add_genre_content",
  ];

  it("returns a non-empty transform for every action", async () => {
    for (const action of actions) {
      const input: RewriteChapterInput = {
        action,
        content: "Original body.",
        chapterTitle: "My Chapter",
        bookType: "other",
      };
      const out = await resolve(rewriteChapter(input));
      expect(out.length, action).toBeGreaterThan(0);
    }
  });

  it("preserves the original content for additive actions", async () => {
    const out = await resolve(
      rewriteChapter({
        action: "add_action_steps",
        content: "Original body.",
        chapterTitle: "My Chapter",
        bookType: "other",
      })
    );
    expect(out).toContain("Original body.");
    expect(out).toContain("## Your action steps");
  });

  it("interpolates the chapter title for add_story", async () => {
    const out = await resolve(
      rewriteChapter({
        action: "add_story",
        content: "Body.",
        chapterTitle: "The Turning Point",
        bookType: "other",
      })
    );
    expect(out).toContain('"The Turning Point"');
  });

  it("synthesizes a heading from the title when content is empty", async () => {
    const out = await resolve(
      rewriteChapter({
        action: "rewrite",
        content: "",
        chapterTitle: "Fresh Start",
        bookType: "other",
      })
    );
    expect(out).toContain("# Fresh Start");
  });
});

describe("chapterActionLabel", () => {
  it("returns human-readable labels", () => {
    expect(chapterActionLabel("rewrite")).toBe("Rewrite");
    expect(chapterActionLabel("add_story")).toBe("Add story");
  });
});
