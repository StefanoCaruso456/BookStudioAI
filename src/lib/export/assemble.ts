// ===========================================================================
// Export assembly (Phase 4, ADR-3) — the single, pure model every renderer
// consumes. Takes a userId-scoped BookProject (already orderIndex-sorted by the
// repository) and normalizes it to an ExportBook: title page fields + chapters
// whose plain-text content is split into paragraphs. Pure + unit-testable;
// no I/O, no DB, no rendering libs.
// ===========================================================================
import type { BookProject } from "@/types/book";

/** Normalized, format-agnostic book the PDF/EPUB/DOCX renderers consume. */
export interface ExportBook {
  title: string;
  subtitle: string;
  author: string;
  chapters: { title: string; paragraphs: string[] }[];
}

/**
 * Split plain-text chapter content into paragraphs on blank lines. Trims each
 * paragraph and drops empties. Text with no blank lines but real content
 * becomes a single paragraph; empty/whitespace-only text becomes [].
 */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Build the export model. Title/subtitle fall back from the publishing kit →
 * blueprint → project; author comes from the caller (the signed-in user's
 * name), defaulting to empty.
 */
export function assembleExportBook(
  project: BookProject,
  opts?: { authorName?: string }
): ExportBook {
  const title =
    project.publishingKit?.finalTitle ||
    project.blueprint?.titleOptions[0] ||
    project.title;
  const subtitle =
    project.publishingKit?.subtitle ||
    project.blueprint?.subtitleOptions[0] ||
    "";
  const author = opts?.authorName || "";

  const chapters = project.chapters.map((c) => ({
    title: c.title,
    paragraphs: splitParagraphs(c.content),
  }));

  return { title, subtitle, author, chapters };
}
