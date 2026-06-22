// ===========================================================================
// PDF renderer (Phase 4, ADR-2) — @react-pdf/renderer, pure JS, serverless-safe
// (no Chromium). Consumes the assembled ExportBook and produces a Buffer with a
// title page, a table of contents, then each chapter. Server-only: only the
// export route handler and tests import this; never a client component.
// ===========================================================================
import * as React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { ExportBook } from "./assemble";

const styles = StyleSheet.create({
  page: {
    paddingTop: 72,
    paddingBottom: 72,
    paddingHorizontal: 64,
    fontSize: 11,
    lineHeight: 1.5,
    fontFamily: "Times-Roman",
    color: "#1a1a1a",
  },
  titlePage: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  title: { fontSize: 30, marginBottom: 16 },
  subtitle: { fontSize: 16, color: "#444444", marginBottom: 40 },
  byline: { fontSize: 13, color: "#666666" },
  tocHeading: { fontSize: 20, marginBottom: 20 },
  tocItem: { fontSize: 12, marginBottom: 8 },
  chapterHeading: { fontSize: 18, marginBottom: 16 },
  paragraph: { marginBottom: 10, textAlign: "justify" },
});

/** Render the assembled book to a PDF Buffer. */
export async function renderBookPdf(book: ExportBook): Promise<Buffer> {
  const doc = (
    <Document title={book.title} author={book.author || undefined}>
      {/* Title page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.titlePage}>
          <Text style={styles.title}>{book.title}</Text>
          {book.subtitle ? (
            <Text style={styles.subtitle}>{book.subtitle}</Text>
          ) : null}
          {book.author ? (
            <Text style={styles.byline}>by {book.author}</Text>
          ) : null}
        </View>
      </Page>

      {/* Table of contents */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.tocHeading}>Table of Contents</Text>
        {book.chapters.map((ch, i) => (
          <Text key={i} style={styles.tocItem}>
            {i + 1}. {ch.title}
          </Text>
        ))}
      </Page>

      {/* Chapters */}
      {book.chapters.map((ch, i) => (
        <Page key={i} size="A4" style={styles.page}>
          <Text style={styles.chapterHeading}>
            Chapter {i + 1} — {ch.title}
          </Text>
          {ch.paragraphs.map((p, j) => (
            <Text key={j} style={styles.paragraph}>
              {p}
            </Text>
          ))}
        </Page>
      ))}
    </Document>
  );

  return renderToBuffer(doc);
}
