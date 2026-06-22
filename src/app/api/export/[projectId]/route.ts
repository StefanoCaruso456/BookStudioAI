// ===========================================================================
// Export route handler (Phase 4, ADR-1) — gated, Node-runtime GET that streams
// a finished book as PDF / EPUB / DOCX. Read-only: auth + userId-scoped read
// (ownership enforced by getProject) + in-memory generation. No Chromium, no
// Blob storage. Emits a best-effort `export` event for the funnel.
// ===========================================================================
import { auth } from "@/auth";
import { getProject } from "@/lib/data/projects";
import { isPro } from "@/lib/data/subscriptions";
import { logEvent } from "@/lib/data/profiles";
import { assembleExportBook } from "@/lib/export/assemble";
import { renderBookPdf } from "@/lib/export/pdf";
import { renderBookDocx } from "@/lib/export/docx";
import { renderBookEpub } from "@/lib/export/epub";

// Generators need Node APIs (Buffer, streams) — never edge.
export const runtime = "nodejs";

type Format = "pdf" | "epub" | "docx";

const FORMATS: Record<Format, { contentType: string; ext: string }> = {
  pdf: { contentType: "application/pdf", ext: "pdf" },
  docx: {
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ext: "docx",
  },
  epub: { contentType: "application/epub+zip", ext: "epub" },
};

/** Sanitize a book title to a safe ascii slug for Content-Disposition. */
function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining marks after NFKD decomposition
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "book";
}

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Export is a Pro feature (Phase 5, ADR-4) — server-enforced, not just hidden.
  if (!(await isPro(userId))) {
    return new Response("Upgrade required", { status: 402 });
  }

  // getProject is userId-scoped: a non-owned (or missing) id returns null.
  const project = await getProject(userId, params.projectId);
  if (!project) {
    return new Response("Not found", { status: 404 });
  }

  const format = new URL(req.url).searchParams.get("format");
  if (!format || !(format in FORMATS)) {
    return new Response("Invalid format", { status: 400 });
  }
  const { contentType, ext } = FORMATS[format as Format];

  const authorName = session.user?.name ?? "";
  const book = assembleExportBook(project, { authorName });

  let body: Buffer;
  switch (format as Format) {
    case "pdf":
      body = await renderBookPdf(book);
      break;
    case "docx":
      body = await renderBookDocx(book);
      break;
    case "epub":
      body = await renderBookEpub(book);
      break;
  }

  // Best-effort funnel event; analytics must never break the download.
  void logEvent(userId, "export", { projectId: project.id, format });

  const filename = `${slugify(book.title)}.${ext}`;
  // Response wants a BodyInit; a Buffer is a Uint8Array view over its bytes.
  return new Response(new Uint8Array(body), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(body.length),
    },
  });
}
