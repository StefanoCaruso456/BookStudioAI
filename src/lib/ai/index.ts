// Public surface of the AI layer. Import from "@/lib/ai".
//
// The async generation functions are server actions (real OpenAI when
// OPENAI_API_KEY is set, deterministic fallback otherwise — see actions.ts).
// The label/constant helpers stay sync so client components can use them.
export * from "./types";
export {
  generateBookBlueprint,
  generateChapterDraft,
  rewriteChapter,
  editChapter,
  generatePublishingKit,
} from "./actions";
export { chapterActionLabel } from "./chapterActions";
export { editModeLabel, EDIT_MODE_LIST } from "./editChapter";
