import { describe, expect, it } from "vitest";
import { GENRES, PRIMARY_GENRES, BOOK_GOALS, getGenre } from "./genres";
import type { BookType } from "@/types/book";

describe("GENRES data integrity", () => {
  it("has a unique type for every genre", () => {
    const types = GENRES.map((g) => g.type);
    expect(new Set(types).size).toBe(types.length);
  });

  it("includes an 'other' fallback genre", () => {
    expect(GENRES.some((g) => g.type === "other")).toBe(true);
  });

  it("gives every genre non-empty sections, audience examples, and fields", () => {
    for (const g of GENRES) {
      expect(g.suggestedSections.length, `${g.type} sections`).toBeGreaterThan(0);
      expect(g.audienceExamples.length, `${g.type} audience`).toBeGreaterThan(0);
      expect(g.fields.length, `${g.type} fields`).toBeGreaterThan(0);
      expect(g.label.length, `${g.type} label`).toBeGreaterThan(0);
    }
  });

  it("gives every genre unique field keys", () => {
    for (const g of GENRES) {
      const keys = g.fields.map((f) => f.key);
      expect(new Set(keys).size, `${g.type} field keys`).toBe(keys.length);
    }
  });
});

describe("PRIMARY_GENRES", () => {
  it("excludes the 'other' genre", () => {
    expect(PRIMARY_GENRES.some((g) => g.type === "other")).toBe(false);
  });

  it("contains every genre except 'other'", () => {
    expect(PRIMARY_GENRES.length).toBe(GENRES.length - 1);
  });
});

describe("BOOK_GOALS", () => {
  it("has a unique value for every goal", () => {
    const values = BOOK_GOALS.map((goal) => goal.value);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe("getGenre", () => {
  it("returns the matching genre config", () => {
    expect(getGenre("cookbook").type).toBe("cookbook");
    expect(getGenre("memoir_biography").label).toBe("Memoir / Biography");
  });

  it("falls back to 'other' for an unknown book type", () => {
    expect(getGenre("nonsense" as BookType).type).toBe("other");
  });
});
