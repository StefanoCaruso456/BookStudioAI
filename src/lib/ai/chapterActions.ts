import { getGenre } from "@/lib/genres";
import { simulateLatency, audienceLabel } from "./helpers";
import type {
  GenerateChapterDraftInput,
  RewriteChapterInput,
  ChapterAction,
} from "./types";

/**
 * Generate a first draft for a chapter. Genre-aware: cookbooks get a recipe
 * block, fitness gets a workout block, travel gets an itinerary, etc.
 */
export async function generateChapterDraft(
  input: GenerateChapterDraftInput
): Promise<string> {
  await simulateLatency(1100);
  const genre = getGenre(input.bookType);
  const reader = audienceLabel(input.audience);

  const opening = `# ${input.chapterTitle}\n\n${input.chapterSummary}\n\nThis chapter is written for ${reader}, in a ${input.tone.toLowerCase()} voice. It builds directly on the ideas you provided, turning your raw notes into clear, publishable prose.`;

  const body = [
    `## Why this matters\n\nEvery great ${genre.label.toLowerCase()} earns the reader's trust early. Here we set the scene, name the outcome, and make a promise we can keep. Open with a moment your reader will recognise from their own life, then bridge to what this chapter delivers.`,
    `## The core idea\n\nLay out the main point in plain language. Use short paragraphs, concrete detail, and your own voice. Where you have notes or source material, weave them in here — the assistant has kept them on hand in the panel to your right.`,
  ];

  const genreBlock = genreSpecificBlock(input);

  const close = `## Bringing it together\n\nClose the loop you opened. Summarise the takeaway in one or two sentences, then point the reader to the next chapter so the momentum carries forward.\n\n> _Tip: use the AI assistant to make this more personal, add a story, or insert examples once the bones are in place._`;

  return [opening, ...body, genreBlock, close].filter(Boolean).join("\n\n");
}

function genreSpecificBlock(input: GenerateChapterDraftInput): string {
  const g = input.genreData;
  switch (input.bookType) {
    case "cookbook":
      return `## Recipe: ${g.recipeName || "Featured Dish"}\n\n**Serves:** ${
        g.servingSize || "4"
      } · **Prep:** ${g.prepTime || "15 min"} · **Cook:** ${g.cookTime || "30 min"}\n\n**Ingredients**\n${
        bulletize(g.ingredients) || "- Add your ingredients in the wizard"
      }\n\n**Method**\n${g.instructions || "Outline the steps and the assistant will expand them into clear, numbered instructions."}\n\n${
        g.story ? `_${g.story}_` : ""
      }`;
    case "fitness_diet":
      return `## The Workout\n\n**Level:** ${g.fitnessLevel || "All levels"} · **Duration:** ${
        g.programDuration || "8 weeks"
      }\n\n${g.workouts || "Describe the workout and the assistant will format it into sets, reps, and rest."}\n\n> ⚠️ ${
        g.safety || "Always include appropriate safety guidance and a consult-your-doctor disclaimer."
      }`;
    case "travel_guide":
      return `## Itinerary: ${g.destination || "Your Destination"}\n\n**Best for:** ${
        g.travelerType || "all travelers"
      } · **Length:** ${g.tripLength || "5 days"} · **Budget:** ${g.budget || "mid-range"}\n\n${
        g.itinerary || "Add itinerary notes and the assistant will shape them into a day-by-day plan."
      }`;
    case "coaching_self_help":
      return `## Exercise\n\n${g.exercises || "Add an exercise that helps the reader apply the idea."}\n\n**Reflect:** ${
        g.reflectionQuestions || "What is one thing you'll do differently this week?"
      }`;
    case "memoir_biography":
      return `## A moment in time\n\n${
        g.keyEvents || "Recount a specific scene — the sights, sounds, and feelings — so the reader lives it with you."
      }`;
    case "business_expert":
      return `## Framework in action\n\n${
        g.framework || "Introduce your framework, then show it working through a real case study."
      }\n\n**Case study:** ${g.caseStudies || "Add a concrete example with measurable results."}`;
    default:
      return "";
  }
}

const ACTION_TRANSFORMS: Record<
  ChapterAction,
  { label: string; note: string; transform: (c: string, title: string) => string }
> = {
  rewrite: {
    label: "Rewrite",
    note: "Rewritten for flow and clarity",
    transform: (c) =>
      `${c}\n\n---\n_Rewritten pass: tightened sentences, varied rhythm, and sharpened the opening and closing lines for stronger flow._`,
  },
  make_more_personal: {
    label: "Make more personal",
    note: "Warmer, first-person voice",
    transform: (c) =>
      `When I first encountered this, it changed how I saw everything that came after.\n\n${c}\n\n_I'm sharing this because it mattered to me — and I think it will matter to you too._`,
  },
  make_more_professional: {
    label: "Make more professional",
    note: "More authoritative tone",
    transform: (c) =>
      `${c}\n\n---\n**Key takeaways**\n- The principle above is supported by repeated, real-world results.\n- Applied consistently, it produces predictable outcomes.\n- Use the checklist that follows to implement it with rigour._`,
  },
  add_examples: {
    label: "Add examples",
    note: "Concrete examples added",
    transform: (c) =>
      `${c}\n\n**For example:**\n- A reader applied this exact approach and saw clear, measurable improvement within weeks.\n- In another case, the same idea solved a problem that had felt stuck for years.`,
  },
  add_story: {
    label: "Add story",
    note: "Narrative hook added",
    transform: (c, title) =>
      `It was the kind of ordinary day that turns out to matter. That's where the story of "${title}" really begins.\n\n${c}`,
  },
  add_action_steps: {
    label: "Add action steps",
    note: "Action steps added",
    transform: (c) =>
      `${c}\n\n## Your action steps\n1. Start with the smallest version you can do today.\n2. Repeat it until it feels natural.\n3. Review your progress and adjust.\n4. Share what you learned with someone else.`,
  },
  add_genre_content: {
    label: "Add genre content",
    note: "Genre-specific block added",
    transform: (c) =>
      `${c}\n\n> _Genre block inserted — fill in your recipe, workout, itinerary, exercise, or case study details in the wizard to enrich this section._`,
  },
};

export async function rewriteChapter(input: RewriteChapterInput): Promise<string> {
  await simulateLatency(900);
  const t = ACTION_TRANSFORMS[input.action];
  return t.transform(input.content || `# ${input.chapterTitle}\n`, input.chapterTitle);
}

export function chapterActionLabel(action: ChapterAction): string {
  return ACTION_TRANSFORMS[action].label;
}

function bulletize(text?: string): string {
  if (!text) return "";
  return text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => `- ${s}`)
    .join("\n");
}
