// ===========================================================================
// DOCX renderer (Phase 4, ADR-2) — `docx`, pure JS, serverless-safe. Consumes
// the assembled ExportBook and produces a Word document Buffer with a title
// page, a table of contents, then each chapter. Server-only: only the export
// route handler and tests import this; never a client component.
// ===========================================================================
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
} from "docx";
import type { ExportBook } from "./assemble";

/** Render the assembled book to a DOCX Buffer. */
export async function renderBookDocx(book: ExportBook): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Title page.
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 2400, after: 240 },
      children: [new TextRun({ text: book.title, bold: true, size: 56 })],
    })
  );
  if (book.subtitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 480 },
        children: [new TextRun({ text: book.subtitle, size: 32, color: "555555" })],
      })
    );
  }
  if (book.author) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `by ${book.author}`, size: 26, color: "777777" })],
      })
    );
  }

  // Table of contents.
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 240 },
      children: [new PageBreak(), new TextRun({ text: "Table of Contents" })],
    })
  );
  book.chapters.forEach((ch, i) => {
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: `${i + 1}. ${ch.title}` })],
      })
    );
  });

  // Chapters.
  book.chapters.forEach((ch, i) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 200 },
        children: [
          new PageBreak(),
          new TextRun({ text: `Chapter ${i + 1} — ${ch.title}` }),
        ],
      })
    );
    ch.paragraphs.forEach((p) => {
      children.push(
        new Paragraph({
          spacing: { after: 160 },
          children: [new TextRun({ text: p })],
        })
      );
    });
  });

  const doc = new Document({
    creator: book.author || "Book Studio AI",
    title: book.title,
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}
