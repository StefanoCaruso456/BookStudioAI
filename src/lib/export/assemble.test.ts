import { describe, expect, it } from "vitest";
import { assembleExportBook, splitParagraphs } from "./assemble";
import type { BookProject, Chapter } from "@/types/book";

// ── fixtures ─────────────────────────────────────────────────────────────────

function chapter(partial: Partial<Chapter>): Chapter {
  return {
    id: "ch_1",
    projectId: "proj_1",
    title: "Untitled",
    summary: "",
    content: "",
    orderIndex: 0,
    status: "complete",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

function project(partial: Partial<BookProject>): BookProject {
  return {
    id: "proj_1",
    userId: "user_1",
    title: "Project Title",
    bookType: "business_expert",
    status: "publishing",
    genreData: {},
    sourceContent: [],
    chapters: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

// ── splitParagraphs ──────────────────────────────────────────────────────────

describe("splitParagraphs", () => {
  it("splits on blank lines and trims", () => {
    expect(splitParagraphs("One.\n\nTwo.\n\n  Three.  ")).toEqual([
      "One.",
      "Two.",
      "Three.",
    ]);
  });

  it("treats text with no blank lines as a single paragraph", () => {
    expect(splitParagraphs("A single line of prose.")).toEqual([
      "A single line of prose.",
    ]);
  });

  it("returns [] for empty or whitespace-only content", () => {
    expect(splitParagraphs("")).toEqual([]);
    expect(splitParagraphs("   \n\n   ")).toEqual([]);
  });

  it("drops empty paragraphs between content", () => {
    expect(splitParagraphs("A.\n\n\n\nB.")).toEqual(["A.", "B."]);
  });
});

// ── assembleExportBook ───────────────────────────────────────────────────────

describe("assembleExportBook", () => {
  it("preserves chapter ordering from the (pre-sorted) project", () => {
    const p = project({
      chapters: [
        chapter({ id: "a", title: "First", orderIndex: 0, content: "x" }),
        chapter({ id: "b", title: "Second", orderIndex: 1, content: "y" }),
        chapter({ id: "c", title: "Third", orderIndex: 2, content: "z" }),
      ],
    });
    expect(assembleExportBook(p).chapters.map((c) => c.title)).toEqual([
      "First",
      "Second",
      "Third",
    ]);
  });

  it("splits each chapter's content into paragraphs", () => {
    const p = project({
      chapters: [chapter({ content: "Para one.\n\nPara two." })],
    });
    expect(assembleExportBook(p).chapters[0].paragraphs).toEqual([
      "Para one.",
      "Para two.",
    ]);
  });

  it("handles an empty chapter (no content)", () => {
    const p = project({ chapters: [chapter({ content: "" })] });
    expect(assembleExportBook(p).chapters[0].paragraphs).toEqual([]);
  });

  it("prefers the publishing kit title/subtitle", () => {
    const p = project({
      title: "Project Title",
      blueprint: {
        id: "bp",
        projectId: "proj_1",
        titleOptions: ["Blueprint Title"],
        subtitleOptions: ["Blueprint Subtitle"],
        bookPromise: "",
        targetReader: "",
        tone: "",
        tableOfContents: [],
        chapterSummaries: [],
        estimatedLength: "",
        nextSteps: [],
        approved: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      publishingKit: {
        id: "kit",
        projectId: "proj_1",
        finalTitle: "Final Title",
        subtitle: "Final Subtitle",
        authorBio: "",
        bookDescription: "",
        backCoverCopy: "",
        keywords: [],
        categorySuggestions: [],
        coverConcepts: [],
        kdpChecklist: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });
    const book = assembleExportBook(p);
    expect(book.title).toBe("Final Title");
    expect(book.subtitle).toBe("Final Subtitle");
  });

  it("falls back to the blueprint when the kit is absent", () => {
    const p = project({
      title: "Project Title",
      blueprint: {
        id: "bp",
        projectId: "proj_1",
        titleOptions: ["Blueprint Title"],
        subtitleOptions: ["Blueprint Subtitle"],
        bookPromise: "",
        targetReader: "",
        tone: "",
        tableOfContents: [],
        chapterSummaries: [],
        estimatedLength: "",
        nextSteps: [],
        approved: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });
    const book = assembleExportBook(p);
    expect(book.title).toBe("Blueprint Title");
    expect(book.subtitle).toBe("Blueprint Subtitle");
  });

  it("falls back to the project title and an empty subtitle", () => {
    const book = assembleExportBook(project({ title: "Project Title" }));
    expect(book.title).toBe("Project Title");
    expect(book.subtitle).toBe("");
  });

  it("uses the provided author name, defaulting to empty", () => {
    const p = project({});
    expect(assembleExportBook(p).author).toBe("");
    expect(assembleExportBook(p, { authorName: "Ada Lovelace" }).author).toBe(
      "Ada Lovelace"
    );
  });
});
