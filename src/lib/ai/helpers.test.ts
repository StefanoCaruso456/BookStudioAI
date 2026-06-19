import { describe, expect, it } from "vitest";
import {
  deriveTopic,
  audienceLabel,
  sourceSummary,
  titleCase,
} from "./helpers";
import type { Audience, SourceContent } from "@/types/book";

describe("deriveTopic", () => {
  it("prefers genreData fields in priority order", () => {
    // `topic` wins over everything else.
    expect(
      deriveTopic("ignored prompt", { topic: "Sourdough", destination: "Rome" }, "other")
    ).toBe("Sourdough");
    // `destination` is used when `topic` is absent.
    expect(deriveTopic(undefined, { destination: "Rome" }, "travel_guide")).toBe("Rome");
    // `recipeName` is used when higher-priority fields are absent.
    expect(deriveTopic(undefined, { recipeName: "Sunday Ragù" }, "cookbook")).toBe(
      "Sunday Ragù"
    );
  });

  it("takes only the first sentence/line of a genre field", () => {
    expect(deriveTopic(undefined, { topic: "Bread baking. And more" }, "other")).toBe(
      "Bread baking"
    );
    expect(deriveTopic(undefined, { topic: "Line one\nLine two" }, "other")).toBe("Line one");
  });

  it("cleans leading filler phrases from the prompt", () => {
    expect(deriveTopic("I want to write about gardening", {}, "other")).toBe(
      "write about gardening"
    );
    expect(deriveTopic("Help me cook Thai food", {}, "other")).toBe("cook Thai food");
    expect(deriveTopic("Create a budgeting guide", {}, "other")).toBe("a budgeting guide");
  });

  it("falls back to the per-book-type default when nothing is provided", () => {
    expect(deriveTopic(undefined, {}, "cookbook")).toBe("Home Cooking");
    expect(deriveTopic("   ", {}, "memoir_biography")).toBe("My Story");
  });

  it("defaults the book type to 'other' when omitted", () => {
    expect(deriveTopic(undefined, {})).toBe("Your Big Idea");
  });
});

describe("audienceLabel", () => {
  it("returns the trimmed description", () => {
    expect(audienceLabel({ description: "  home cooks  " } as Audience)).toBe("home cooks");
  });

  it("falls back to 'your readers' when empty", () => {
    expect(audienceLabel({ description: "" } as Audience)).toBe("your readers");
    expect(audienceLabel({ description: "   " } as Audience)).toBe("your readers");
  });
});

describe("sourceSummary", () => {
  const src = (title: string, type = "note"): SourceContent =>
    ({ id: "x", projectId: "p", type, title, content: "", createdAt: "" } as SourceContent);

  it("returns an empty string with no sources", () => {
    expect(sourceSummary([])).toBe("");
  });

  it("joins source titles", () => {
    expect(sourceSummary([src("A"), src("B")])).toBe("A, B");
  });

  it("falls back to the source type when title is empty", () => {
    expect(sourceSummary([src("", "link")])).toBe("link");
  });

  it("caps the summary at four sources", () => {
    const many = ["a", "b", "c", "d", "e", "f"].map((t) => src(t));
    expect(sourceSummary(many)).toBe("a, b, c, d");
  });
});

describe("titleCase", () => {
  it("capitalizes the first letter of every word", () => {
    expect(titleCase("home cooking")).toBe("Home Cooking");
    expect(titleCase("a practical guide")).toBe("A Practical Guide");
  });
});
