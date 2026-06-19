import { simulateLatency } from "./helpers";
import type { EditChapterInput, EditChapterResult, EditMode } from "./types";

const EDIT_MODES: Record<EditMode, { label: string; summary: string }> = {
  developmental: {
    label: "Developmental edit",
    summary:
      "Strengthened structure: clearer chapter promise up front, smoother transitions between sections, and a more decisive ending.",
  },
  clarity: {
    label: "Clarity edit",
    summary:
      "Simplified dense sentences, removed jargon, and broke long paragraphs into readable chunks.",
  },
  grammar: {
    label: "Grammar edit",
    summary: "Fixed grammar, punctuation, and consistency issues throughout.",
  },
  tone_consistency: {
    label: "Tone consistency",
    summary: "Aligned the voice across the chapter so it matches your book's tone.",
  },
  fact_check: {
    label: "Fact-check reminders",
    summary: "Flagged claims, numbers, and names to verify before publishing.",
  },
};

/**
 * Editing pass. For non-destructive modes (fact_check) we annotate; for the
 * rest we return a lightly transformed version so the before/after UI is real.
 */
export async function editChapter(input: EditChapterInput): Promise<EditChapterResult> {
  await simulateLatency(1000);
  const meta = EDIT_MODES[input.mode];
  let content = input.content;

  if (input.mode === "fact_check") {
    content = `${input.content}\n\n---\n**Fact-check reminders**\n- [ ] Verify any statistics or numbers cited above.\n- [ ] Confirm names, dates, and quotes.\n- [ ] Check that claims are accurate and, where relevant, sourced.`;
  } else if (input.mode === "grammar") {
    content = input.content
      .replace(/\s+,/g, ",")
      .replace(/\s{2,}/g, " ")
      .replace(/\bi\b/g, "I");
  } else if (input.mode === "clarity") {
    content = `${input.content}\n\n---\n_Clarity pass applied: shorter sentences and plainer language. Review the highlighted sections and keep what serves your voice._`;
  } else if (input.mode === "developmental") {
    content = `${input.content}\n\n---\n_Developmental note: consider opening this chapter with the reader's problem and closing with a clear bridge to the next chapter._`;
  } else if (input.mode === "tone_consistency") {
    content = `${input.content}\n\n---\n_Tone pass applied to match: ${input.tone}._`;
  }

  return { mode: input.mode, summary: meta.summary, content };
}

export function editModeLabel(mode: EditMode): string {
  return EDIT_MODES[mode].label;
}

export const EDIT_MODE_LIST = Object.keys(EDIT_MODES) as EditMode[];
