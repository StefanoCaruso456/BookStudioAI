import { describe, expect, it } from "vitest";
import type { ExportBook } from "./assemble";
import { renderBookPdf } from "./pdf";
import { renderBookDocx } from "./docx";
import { renderBookEpub } from "./epub";

// A small, network-free sample exercising the title page, TOC, and chapters.
const sample: ExportBook = {
  title: "The Sample Book",
  subtitle: "A Short Demonstration",
  author: "Ada Lovelace",
  chapters: [
    { title: "Beginnings", paragraphs: ["First paragraph.", "Second paragraph."] },
    { title: "An Empty Chapter", paragraphs: [] },
  ],
};

describe("renderers (smoke)", () => {
  it("renderBookPdf returns a non-empty Buffer", async () => {
    const buf = await renderBookPdf(sample);
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(0);
  });

  it("renderBookDocx returns a non-empty Buffer", async () => {
    const buf = await renderBookDocx(sample);
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(0);
  });

  it("renderBookEpub returns a non-empty Buffer", async () => {
    const buf = await renderBookEpub(sample);
    expect(buf.length).toBeGreaterThan(0);
  });
});
