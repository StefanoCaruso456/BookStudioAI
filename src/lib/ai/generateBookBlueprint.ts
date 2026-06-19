import { getGenre } from "@/lib/genres";
import { simulateLatency, deriveTopic, audienceLabel, titleCase } from "./helpers";
import type { GenerateBlueprintInput, BlueprintDraft } from "./types";

const TONE_BY_GOAL: Record<string, string> = {
  build_authority: "Confident, credible, and clear",
  sell_to_audience: "Warm, persuasive, and benefit-driven",
  teach_skill: "Practical, step-by-step, and encouraging",
  share_story: "Intimate, honest, and reflective",
  generate_leads: "Helpful, generous, and lightly promotional",
  personal_legacy: "Heartfelt, vivid, and personal",
};

/**
 * Placeholder blueprint generator. Produces a tailored, genre-aware book plan
 * from the user's own inputs. Swap the body for a Vercel AI SDK call later —
 * the signature and return shape stay identical.
 */
export async function generateBookBlueprint(
  input: GenerateBlueprintInput
): Promise<BlueprintDraft> {
  await simulateLatency(900);

  const genre = getGenre(input.bookType);
  const topic = deriveTopic(input.initialPrompt, input.genreData, input.bookType);
  const topicTitle = titleCase(topic);
  const reader = audienceLabel(input.audience);
  const tone = input.goal ? TONE_BY_GOAL[input.goal] : "Clear, warm, and professional";

  const titleOptions = dedupe([
    `${topicTitle}`,
    `The ${topicTitle} Handbook`,
    `Mastering ${topicTitle}`,
    `${topicTitle}: A Practical Guide`,
    `The Art of ${topicTitle}`,
  ]);

  const subtitleOptions = dedupe([
    `A step-by-step guide for ${reader}`,
    `Everything ${reader} need to get started`,
    `Turn your experience into lasting results`,
    `Proven ideas, real stories, and clear next steps`,
    `The complete companion for ${reader}`,
  ]);

  const sections = genre.suggestedSections;
  const tableOfContents = sections;
  const chapterSummaries = sections.map((section, i) => ({
    title: `${section}`,
    summary: chapterSummaryFor(genre.type, section, topicTitle, reader, i),
  }));

  const estimatedLength = `${Math.max(120, sections.length * 26)}–${
    Math.max(150, sections.length * 32)
  } pages · ~${sections.length * 4500} words`;

  const nextSteps = [
    "Review and pick your favourite title and subtitle",
    "Adjust the table of contents to match your vision",
    "Approve the blueprint to unlock the chapter workspace",
    "Draft your first chapter with the AI assistant",
  ];

  return {
    titleOptions,
    subtitleOptions,
    bookPromise: `By the end of this book, ${reader} will ${promiseFor(
      genre.type,
      topicTitle
    )}.`,
    targetReader: reader,
    tone,
    tableOfContents,
    chapterSummaries,
    estimatedLength,
    nextSteps,
  };
}

function chapterSummaryFor(
  type: string,
  section: string,
  topic: string,
  reader: string,
  index: number
): string {
  const intros: Record<string, string> = {
    cookbook: `Recipes and stories for ${section.toLowerCase()}, written so ${reader} can cook them with confidence.`,
    fitness_diet: `The ${section.toLowerCase()} component of the program, with clear guidance and safety in mind.`,
    coaching_self_help: `How ${reader} can work through the ${section.toLowerCase()} stage of the framework.`,
    travel_guide: `Your practical guide to ${section.toLowerCase()}, packed with local detail.`,
    memoir_biography: `The ${section.toLowerCase()} chapter of the story, told with honesty and emotion.`,
    business_expert: `The ${section.toLowerCase()} of the argument, supported by examples and frameworks.`,
    other: `Exploring ${section.toLowerCase()} as part of the bigger picture of ${topic.toLowerCase()}.`,
  };
  return intros[type] ?? intros.other;
}

function promiseFor(type: string, topic: string): string {
  const promises: Record<string, string> = {
    cookbook: `be able to recreate your signature dishes and bring your food story to their own table`,
    fitness_diet: `have a clear, safe plan to reach their goals and the confidence to follow it`,
    coaching_self_help: `understand your framework and have concrete steps to transform their situation`,
    travel_guide: `be ready to plan and enjoy an unforgettable trip with insider confidence`,
    memoir_biography: `feel they truly know your story — and find meaning they can carry into their own lives`,
    business_expert: `understand your thesis and have a playbook they can apply immediately`,
    other: `have a clear, practical grasp of ${topic.toLowerCase()}`,
  };
  return promises[type] ?? promises.other;
}

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
}
