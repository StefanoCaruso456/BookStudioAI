import "server-only";
// ===========================================================================
// Real AI implementations (OpenAI via the Vercel AI SDK, gpt-4o).
//
// SERVER-ONLY. Reached only through src/lib/ai/actions.ts when OPENAI_API_KEY
// is set. The key is read from the environment by the AI SDK — it is never
// referenced by value here and never reaches the client.
// ===========================================================================
import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import { getGenre } from "@/lib/genres";
import { audienceLabel } from "./helpers";
import type {
  GenerateBlueprintInput,
  BlueprintDraft,
  GenerateChapterDraftInput,
  RewriteChapterInput,
  ChapterAction,
  EditChapterInput,
  EditChapterResult,
  EditMode,
  GeneratePublishingKitInput,
  PublishingKitDraft,
} from "./types";
import type { SourceContent } from "@/types/book";

const model = openai("gpt-4o");

// --- prompt context helpers ------------------------------------------------
function fmtGenreData(data: Record<string, string>): string {
  const entries = Object.entries(data).filter(([, v]) => v && v.trim());
  return entries.length
    ? entries.map(([k, v]) => `- ${k}: ${v}`).join("\n")
    : "(none provided)";
}

function fmtSources(sources: SourceContent[]): string {
  if (!sources.length) return "(none provided)";
  return sources
    .map((s) => `- ${s.title || s.type}: ${s.content.slice(0, 800)}`)
    .join("\n")
    .slice(0, 6000);
}

// --- 1. Book blueprint -----------------------------------------------------
const blueprintSchema = z.object({
  titleOptions: z.array(z.string()).min(3).max(6),
  subtitleOptions: z.array(z.string()).min(3).max(6),
  bookPromise: z.string(),
  targetReader: z.string(),
  tone: z.string(),
  tableOfContents: z.array(z.string()).min(4).max(12),
  chapterSummaries: z
    .array(z.object({ title: z.string(), summary: z.string() }))
    .min(4)
    .max(12),
  estimatedLength: z.string(),
  nextSteps: z.array(z.string()).min(2).max(6),
});

export async function openaiBlueprint(
  input: GenerateBlueprintInput
): Promise<BlueprintDraft> {
  const genre = getGenre(input.bookType);
  const { object } = await generateObject({
    model,
    schema: blueprintSchema,
    system:
      "You are an elite nonfiction book strategist and developmental editor who turns a creator's raw knowledge into a clear, commercial, publishable book blueprint. Be specific and warm. Tailor everything to the genre, goal, and audience — never generic.",
    prompt: `Create a book blueprint.

Genre: ${genre.label}
Author goal: ${input.goal ?? "not specified"}
Target audience: ${audienceLabel(input.audience)}
Author's prompt: ${input.initialPrompt?.trim() || "(none)"}
Genre details:
${fmtGenreData(input.genreData)}
Source material:
${fmtSources(input.sourceContent)}

Produce: 3-5 title options; 3-5 subtitle options; a one-sentence book promise; the target reader; a short tone descriptor; a tailored table of contents (chapter titles specific to THIS book); a one-paragraph summary for each chapter (titles must match the table of contents); an estimated length string (pages and approx words); and 3-4 concrete next steps for the author.`,
  });
  return object;
}

// --- 2. Chapter first draft ------------------------------------------------
export async function openaiChapterDraft(
  input: GenerateChapterDraftInput
): Promise<string> {
  const genre = getGenre(input.bookType);
  const { text } = await generateText({
    model,
    system: `You are a professional ${genre.label.toLowerCase()} ghostwriter. Write publishable, well-structured chapter prose in Markdown, in the author's voice. Use clear headings, short paragraphs, and concrete detail. No meta commentary about being an AI.`,
    prompt: `Write a full first draft of this chapter in Markdown.

Book type: ${genre.label}
Chapter title: ${input.chapterTitle}
Chapter summary: ${input.chapterSummary}
Tone: ${input.tone}
Audience: ${audienceLabel(input.audience)}
Genre details:
${fmtGenreData(input.genreData)}
Source material to weave in:
${fmtSources(input.sourceContent)}

Open with a level-1 heading of the chapter title. Aim for roughly 800-1200 words.`,
  });
  return text;
}

// --- 3. Chapter rewrite actions --------------------------------------------
const ACTION_INSTRUCTION: Record<ChapterAction, string> = {
  rewrite:
    "Rewrite the chapter to improve flow, clarity, and rhythm while preserving meaning and the author's voice.",
  make_more_personal:
    "Rewrite in a warmer, first-person voice with genuine personal reflection, keeping the substance intact.",
  make_more_professional:
    "Rewrite in a more authoritative, polished, professional tone. Tighten the structure and claims.",
  add_examples:
    "Keep the chapter and enrich it with concrete, realistic examples that illustrate the key points.",
  add_story:
    "Open the chapter with a vivid narrative hook or anecdote, then keep the rest, weaving the story through it.",
  add_action_steps:
    "Keep the chapter and add a clear, numbered 'Your action steps' section the reader can follow.",
  add_genre_content:
    "Keep the chapter and add a genre-appropriate practical block (recipe, workout, itinerary, exercise, framework, or case study) that fits naturally.",
};

export async function openaiRewrite(input: RewriteChapterInput): Promise<string> {
  const { text } = await generateText({
    model,
    system:
      "You are a skilled book editor. Return ONLY the revised chapter in Markdown — no preamble, no explanation.",
    prompt: `${ACTION_INSTRUCTION[input.action]}

Chapter title: ${input.chapterTitle}

Current chapter:
${input.content || `# ${input.chapterTitle}\n`}`,
  });
  return text;
}

// --- 4. Editing passes -----------------------------------------------------
const EDIT_INSTRUCTION: Record<EditMode, string> = {
  developmental:
    "Perform a developmental edit: strengthen structure, the opening promise, transitions between sections, and the ending.",
  clarity:
    "Perform a clarity edit: simplify dense sentences, remove jargon, and break long paragraphs into readable chunks.",
  grammar:
    "Perform a grammar and consistency edit: fix grammar, punctuation, and consistency. Keep stylistic changes minimal.",
  tone_consistency:
    "Align the chapter's voice so it is consistent throughout and matches the book's tone.",
  fact_check:
    "Do NOT rewrite the prose. Instead, return the original content with an appended 'Fact-check reminders' section listing the specific claims, numbers, names, and dates that should be verified.",
};

const editSchema = z.object({
  summary: z.string(),
  content: z.string(),
});

export async function openaiEdit(
  input: EditChapterInput
): Promise<EditChapterResult> {
  const { object } = await generateObject({
    model,
    schema: editSchema,
    system:
      "You are a meticulous book editor. Return the edited chapter content in Markdown plus a one-sentence summary of what you changed.",
    prompt: `${EDIT_INSTRUCTION[input.mode]}
Book tone: ${input.tone}

Chapter:
${input.content}`,
  });
  return { mode: input.mode, summary: object.summary, content: object.content };
}

// --- 5. Publishing kit -----------------------------------------------------
const kitSchema = z.object({
  finalTitle: z.string(),
  subtitle: z.string(),
  authorBio: z.string(),
  bookDescription: z.string(),
  backCoverCopy: z.string(),
  keywords: z.array(z.string()).min(5).max(7),
  categorySuggestions: z.array(z.string()).min(2).max(3),
  coverConcepts: z.array(z.string()).min(2).max(4),
  kdpChecklist: z.array(z.object({ label: z.string() })).min(5).max(12),
});

export async function openaiPublishingKit(
  input: GeneratePublishingKitInput
): Promise<PublishingKitDraft> {
  const genre = getGenre(input.bookType);
  const { object } = await generateObject({
    model,
    schema: kitSchema,
    system:
      "You are a self-publishing (Amazon KDP) expert and book marketer. Produce compelling, conversion-focused metadata.",
    prompt: `Create a complete publishing kit for this book.

Title: ${input.title}
Subtitle: ${input.subtitle}
Book type: ${genre.label}
Book promise: ${input.bookPromise}
Target reader: ${input.targetReader}
Tone: ${input.tone}
Author name: ${input.authorName?.trim() || "the author"}

Include: a final title and subtitle; a 2-3 sentence author bio; a persuasive ~150-word book description; punchy back-cover copy; 5-7 KDP keywords; 2-3 KDP category suggestions; 2-3 cover design concepts; and a KDP launch checklist of 7-10 concrete items.`,
  });
  return {
    ...object,
    kdpChecklist: object.kdpChecklist.map((i) => ({ label: i.label, done: false })),
  };
}
