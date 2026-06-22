// ===========================================================================
// EPUB renderer (Phase 4, ADR-2) — `epub-gen-memory`, pure JS, in-memory (no
// filesystem writes), serverless-safe. Consumes the assembled ExportBook and
// produces an EPUB Buffer: title/author metadata + one XHTML section per
// chapter (plus a leading title section). epub-gen-memory builds its own TOC.
// Server-only: only the export route handler and tests import this; never a
// client component.
// ===========================================================================
import epub, { type Chapter, type Options } from "epub-gen-memory";
import type { ExportBook } from "./assemble";

/** Escape text for safe interpolation into XHTML. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Render the assembled book to an EPUB Buffer. */
export async function renderBookEpub(book: ExportBook): Promise<Buffer> {
  const options: Options = {
    title: book.title,
    author: book.author || undefined,
    description: book.subtitle || undefined,
    // We render the chapter title as our own <h2>; don't double it up.
    prependChapterTitles: false,
  };

  // A leading title section (title / subtitle / by author), excluded from the
  // auto TOC since it isn't a chapter.
  const titleSection: Chapter = {
    title: book.title,
    excludeFromToc: true,
    beforeToc: true,
    content:
      `<h1>${escapeHtml(book.title)}</h1>` +
      (book.subtitle ? `<h2>${escapeHtml(book.subtitle)}</h2>` : "") +
      (book.author ? `<p>by ${escapeHtml(book.author)}</p>` : ""),
  };

  const chapterSections: Chapter[] = book.chapters.map((ch, i) => ({
    title: `Chapter ${i + 1} — ${ch.title}`,
    content:
      `<h2>Chapter ${i + 1} — ${escapeHtml(ch.title)}</h2>` +
      ch.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join(""),
  }));

  return epub(options, [titleSection, ...chapterSections]);
}
