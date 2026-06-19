import { getGenre } from "@/lib/genres";
import { simulateLatency } from "./helpers";
import type { GeneratePublishingKitInput, PublishingKitDraft } from "./types";

const KEYWORDS_BY_TYPE: Record<string, string[]> = {
  cookbook: ["cookbook", "recipes", "home cooking", "easy meals", "family recipes", "food gift"],
  fitness_diet: ["fitness", "workout plan", "weight loss", "nutrition", "home workout", "healthy habits"],
  coaching_self_help: ["self help", "personal growth", "mindset", "motivation", "coaching", "habits"],
  travel_guide: ["travel guide", "itinerary", "budget travel", "vacation planning", "city guide", "tips"],
  memoir_biography: ["memoir", "true story", "biography", "inspirational", "life story", "resilience"],
  business_expert: ["business", "entrepreneurship", "leadership", "strategy", "productivity", "career"],
  other: ["nonfiction", "guide", "how to", "reference", "practical", "expert"],
};

const CATEGORIES_BY_TYPE: Record<string, string[]> = {
  cookbook: ["Cookbooks, Food & Wine > Regional & International", "Cooking by Ingredient", "Quick & Easy"],
  fitness_diet: ["Health, Fitness & Dieting > Exercise & Fitness", "Diets & Weight Loss", "Nutrition"],
  coaching_self_help: ["Self-Help > Personal Transformation", "Motivational", "Success"],
  travel_guide: ["Travel > Guidebooks", "Travel Tips", "Specialty Travel"],
  memoir_biography: ["Biographies & Memoirs > Memoirs", "Personal Memoirs", "Inspirational"],
  business_expert: ["Business & Money > Entrepreneurship", "Leadership", "Skills"],
  other: ["Nonfiction > Reference", "Education & Teaching", "How-To"],
};

export async function generatePublishingKit(
  input: GeneratePublishingKitInput
): Promise<PublishingKitDraft> {
  await simulateLatency(1000);
  const genre = getGenre(input.bookType);
  const author = input.authorName?.trim() || "the author";

  return {
    finalTitle: input.title,
    subtitle: input.subtitle,
    authorBio: `${capitalize(author)} is a ${genre.label.toLowerCase().replace(" / ", " and ")} creator who turns real-world experience into practical, inspiring books. ${capitalize(
      author
    )} wrote this book to help ${input.targetReader} achieve meaningful results — drawing on years of hands-on knowledge and a genuine desire to make this subject accessible to everyone.`,
    bookDescription: `${input.bookPromise}\n\nWritten in a ${input.tone.toLowerCase()} voice for ${input.targetReader}, "${input.title}" turns hard-won experience into a clear, structured path. Inside, you'll find practical guidance, real examples, and the kind of insight that only comes from doing the work — organised so you can start today and keep going.\n\nWhether you're just beginning or looking to go deeper, this book meets you where you are and takes you somewhere better.`,
    backCoverCopy: `Have you ever wanted to ${verbFor(
      input.bookType
    )} — but didn't know where to start?\n\n"${input.title}" is your guide. ${input.bookPromise} Clear, warm, and refreshingly practical, it's the companion ${input.targetReader} have been waiting for.\n\n"A book that finally makes this feel possible."`,
    keywords: KEYWORDS_BY_TYPE[input.bookType] ?? KEYWORDS_BY_TYPE.other,
    categorySuggestions: CATEGORIES_BY_TYPE[input.bookType] ?? CATEGORIES_BY_TYPE.other,
    coverConcepts: coverConcepts(input.bookType, input.title),
    kdpChecklist: [
      { label: "Final manuscript proofread and exported", done: false },
      { label: "Cover designed (1.6:1 ratio, 300 DPI)", done: false },
      { label: "Title and subtitle finalised", done: false },
      { label: "Book description formatted with HTML", done: false },
      { label: "7 keywords selected", done: false },
      { label: "2 categories chosen", done: false },
      { label: "Pricing and royalty plan set", done: false },
      { label: "AI-content disclosure reviewed (per Amazon KDP policy)", done: false },
      { label: "ISBN assigned (free via KDP or your own)", done: false },
    ],
  };
}

function coverConcepts(type: string, title: string): string[] {
  const base: Record<string, string[]> = {
    cookbook: [
      `Warm overhead photo of a finished dish on a rustic table, serif title "${title}" at top`,
      `Minimal cream cover with a single hand-drawn ingredient illustration and elegant typography`,
      `Bold editorial layout with a close-up food texture and a brand accent band`,
    ],
    fitness_diet: [
      `High-energy athletic photo with a strong sans-serif title and a bold accent color`,
      `Clean, motivational cover with a bold number ("8 Weeks") and minimal imagery`,
      `Before/after transformation concept with confident typography`,
    ],
    travel_guide: [
      `Iconic destination photo at golden hour with a clean title overlay`,
      `Illustrated map-style cover with playful hand-lettered title`,
      `Minimal postcard aesthetic with a single striking landmark`,
    ],
    coaching_self_help: [
      `Bold single-color cover with a powerful one-word concept and the title beneath`,
      `Calm, premium layout with abstract shape representing transformation`,
      `Confident author-forward design with a short, punchy subtitle`,
    ],
    memoir_biography: [
      `Evocative personal photograph with understated serif typography`,
      `Atmospheric, emotional image with the title in a quiet, literary style`,
      `Symbolic object cover representing the heart of the story`,
    ],
    business_expert: [
      `Clean, authoritative cover with a strong geometric mark and confident title`,
      `Minimal premium design with the framework name featured prominently`,
      `Bold two-color cover that signals expertise and clarity`,
    ],
    other: [
      `Clean, modern cover with strong typography and a single accent color`,
      `Minimal editorial layout with generous white space`,
      `Concept-driven cover featuring one memorable visual idea`,
    ],
  };
  return base[type] ?? base.other;
}

function verbFor(type: string): string {
  const verbs: Record<string, string> = {
    cookbook: "cook like this at home",
    fitness_diet: "get in the best shape of your life",
    coaching_self_help: "finally make the change you've been putting off",
    travel_guide: "plan the perfect trip",
    memoir_biography: "tell a story that lasts",
    business_expert: "build real authority in your field",
    other: "master this subject",
  };
  return verbs[type] ?? verbs.other;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
