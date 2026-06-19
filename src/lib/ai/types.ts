// ===========================================================================
// AI function interfaces.
//
// For the MVP these resolve to high-quality, genre-aware *placeholder* output
// generated deterministically from the user's own inputs — no API key needed.
// Each function has a clean input/output contract so it can later be backed by
// the Vercel AI SDK (OpenAI / Anthropic) without touching the UI.
// ===========================================================================
import type {
  BookType,
  BookGoal,
  Audience,
  SourceContent,
  BookBlueprint,
  PublishingKit,
} from "@/types/book";

export interface GenerateBlueprintInput {
  bookType: BookType;
  goal?: BookGoal;
  audience: Audience;
  sourceContent: SourceContent[];
  genreData: Record<string, string>;
  initialPrompt?: string;
}

export type BlueprintDraft = Omit<
  BookBlueprint,
  "id" | "projectId" | "createdAt" | "updatedAt" | "approved"
>;

export interface GenerateChapterDraftInput {
  chapterTitle: string;
  chapterSummary: string;
  bookType: BookType;
  tone: string;
  audience: Audience;
  genreData: Record<string, string>;
  sourceContent: SourceContent[];
}

export type ChapterAction =
  | "rewrite"
  | "make_more_personal"
  | "make_more_professional"
  | "add_examples"
  | "add_story"
  | "add_action_steps"
  | "add_genre_content";

export interface RewriteChapterInput {
  action: ChapterAction;
  content: string;
  chapterTitle: string;
  bookType: BookType;
}

export type EditMode =
  | "developmental"
  | "clarity"
  | "grammar"
  | "tone_consistency"
  | "fact_check";

export interface EditChapterInput {
  mode: EditMode;
  content: string;
  tone: string;
}

export interface EditChapterResult {
  mode: EditMode;
  summary: string;
  content: string;
}

export interface GeneratePublishingKitInput {
  bookType: BookType;
  title: string;
  subtitle: string;
  bookPromise: string;
  targetReader: string;
  tone: string;
  authorName?: string;
  goal?: BookGoal;
}

export type PublishingKitDraft = Omit<
  PublishingKit,
  "id" | "projectId" | "createdAt" | "updatedAt"
>;
