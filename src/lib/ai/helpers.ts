// Small shared helpers for the placeholder AI layer.
import type { Audience, SourceContent, BookType } from "@/types/book";

export function simulateLatency(ms = 600): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DEFAULT_TOPIC: Record<BookType, string> = {
  cookbook: "Home Cooking",
  fitness_diet: "Your Fitness Program",
  coaching_self_help: "Personal Transformation",
  travel_guide: "Your Next Trip",
  memoir_biography: "My Story",
  business_expert: "Your Field",
  other: "Your Big Idea",
};

/** Pull a concise topic phrase from the user's prompt / genre answers. */
export function deriveTopic(
  initialPrompt: string | undefined,
  genreData: Record<string, string>,
  bookType: BookType = "other"
): string {
  const fromGenre =
    genreData.topic ||
    genreData.destination ||
    genreData.thesis ||
    genreData.recipeName ||
    genreData.framework ||
    genreData.goals;
  if (fromGenre) return fromGenre.split(/[.\n]/)[0].trim();
  if (initialPrompt && initialPrompt.trim()) {
    const cleaned = initialPrompt
      .replace(/^(i'?m|i am|i want to|help me|create|write|turn)\b/i, "")
      .trim();
    return (cleaned || initialPrompt).split(/[.\n]/)[0].trim();
  }
  return DEFAULT_TOPIC[bookType];
}

export function audienceLabel(audience: Audience): string {
  return audience.description?.trim() || "your readers";
}

export function sourceSummary(sources: SourceContent[]): string {
  if (!sources.length) return "";
  const titles = sources.map((s) => s.title || s.type).slice(0, 4);
  return titles.join(", ");
}

export function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
