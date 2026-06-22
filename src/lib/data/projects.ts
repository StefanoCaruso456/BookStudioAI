// ===========================================================================
// Projects repository (ADR-4, ADR-6) — the ONLY place that touches the books
// tables. Server-only. Every function takes a `userId` and scopes by it: a row
// that doesn't belong to the caller is invisible (returns null), never leaked.
//
// Maps Drizzle rows ↔ the domain types in src/types/book.ts so callers keep
// using the same shapes the Zustand store exposed.
// ===========================================================================
import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  bookProjects,
  bookBlueprints,
  chapters as chaptersTable,
  sourceContent as sourceContentTable,
  publishingKits,
} from "@/lib/db/schema";
import { uid, nowIso } from "@/lib/utils";
import type {
  Audience,
  BookBlueprint,
  BookGoal,
  BookProject,
  BookType,
  Chapter,
  ChapterStatus,
  ProjectStatus,
  PublishingKit,
  SourceContent,
  SourceContentType,
} from "@/types/book";

/** The AI blueprint draft (no persistence ids yet). */
export type BlueprintInput = Omit<
  BookBlueprint,
  "id" | "projectId" | "createdAt" | "updatedAt" | "approved"
>;

/** Everything the builder collected, needed to persist a project. */
export interface CreateProjectInput {
  bookType: BookType;
  goal?: BookGoal;
  audience: Audience;
  initialPrompt?: string;
  genreData: Record<string, string>;
  sourceContent: Omit<SourceContent, "projectId">[];
  blueprint: BlueprintInput;
}

// ───────────────────────────── helpers ────────────────────────────────────

const iso = (d: Date | null | undefined): string =>
  (d ?? new Date()).toISOString();

function parseAudience(raw: string | null): Audience {
  if (!raw) return { description: "" };
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "description" in parsed) {
      return parsed as Audience;
    }
  } catch {
    /* fall through — legacy plain-text audience */
  }
  return { description: raw };
}

type ProjectRow = typeof bookProjects.$inferSelect;
type BlueprintRow = typeof bookBlueprints.$inferSelect;
type ChapterRow = typeof chaptersTable.$inferSelect;
type SourceRow = typeof sourceContentTable.$inferSelect;
type KitRow = typeof publishingKits.$inferSelect;

function mapBlueprint(r: BlueprintRow): BookBlueprint {
  return {
    id: r.id,
    projectId: r.projectId,
    titleOptions: r.titleOptionsJson ?? [],
    subtitleOptions: r.subtitleOptionsJson ?? [],
    bookPromise: r.bookPromise ?? "",
    targetReader: r.targetReader ?? "",
    tone: r.tone ?? "",
    tableOfContents: r.tableOfContentsJson ?? [],
    chapterSummaries: r.chapterSummariesJson ?? [],
    estimatedLength: r.estimatedLength ?? "",
    nextSteps: r.nextStepsJson ?? [],
    approved: r.approved,
    createdAt: iso(r.createdAt),
    updatedAt: iso(r.updatedAt),
  };
}

function mapChapter(r: ChapterRow): Chapter {
  return {
    id: r.id,
    projectId: r.projectId,
    title: r.title,
    summary: r.summary ?? "",
    content: r.content ?? "",
    orderIndex: r.orderIndex,
    status: r.status as ChapterStatus,
    createdAt: iso(r.createdAt),
    updatedAt: iso(r.updatedAt),
  };
}

function mapSource(r: SourceRow): SourceContent {
  return {
    id: r.id,
    projectId: r.projectId,
    type: r.type as SourceContentType,
    title: r.title,
    content: r.content,
    metadata: r.metadataJson ?? undefined,
    createdAt: iso(r.createdAt),
  };
}

function mapKit(r: KitRow): PublishingKit {
  return {
    id: r.id,
    projectId: r.projectId,
    finalTitle: r.finalTitle ?? "",
    subtitle: r.subtitle ?? "",
    authorBio: r.authorBio ?? "",
    bookDescription: r.bookDescription ?? "",
    backCoverCopy: r.backCoverCopy ?? "",
    keywords: r.keywordsJson ?? [],
    categorySuggestions: r.categorySuggestionsJson ?? [],
    coverConcepts: r.coverConceptsJson ?? [],
    kdpChecklist: r.kdpChecklistJson ?? [],
    createdAt: iso(r.createdAt),
    updatedAt: iso(r.updatedAt),
  };
}

function mapProject(
  p: ProjectRow,
  rel: {
    blueprint?: BlueprintRow | null;
    chapters?: ChapterRow[];
    sourceContent?: SourceRow[];
    publishingKit?: KitRow | null;
  }
): BookProject {
  return {
    id: p.id,
    userId: p.userId,
    title: p.title,
    bookType: p.bookType as BookType,
    goal: (p.goal as BookGoal | null) ?? undefined,
    audience: parseAudience(p.audience),
    initialPrompt: p.initialPrompt ?? undefined,
    status: p.status as ProjectStatus,
    genreData: p.genreData ?? {},
    sourceContent: (rel.sourceContent ?? []).map(mapSource),
    blueprint: rel.blueprint ? mapBlueprint(rel.blueprint) : undefined,
    chapters: (rel.chapters ?? [])
      .map(mapChapter)
      .sort((a, b) => a.orderIndex - b.orderIndex),
    publishingKit: rel.publishingKit ? mapKit(rel.publishingKit) : undefined,
    createdAt: iso(p.createdAt),
    updatedAt: iso(p.updatedAt),
  };
}

/** Confirms the project exists AND belongs to the user. Returns the row or null. */
async function ownedProject(
  userId: string,
  projectId: string
): Promise<ProjectRow | null> {
  const rows = await db
    .select()
    .from(bookProjects)
    .where(and(eq(bookProjects.id, projectId), eq(bookProjects.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

// ───────────────────────────── reads ──────────────────────────────────────

export async function listProjects(userId: string): Promise<BookProject[]> {
  const rows = await db.query.bookProjects.findMany({
    where: eq(bookProjects.userId, userId),
    orderBy: [desc(bookProjects.updatedAt)],
    with: {
      blueprint: true,
      chapters: true,
      sourceContent: true,
      publishingKit: true,
    },
  });
  return rows.map((r) =>
    mapProject(r, {
      blueprint: r.blueprint,
      chapters: r.chapters,
      sourceContent: r.sourceContent,
      publishingKit: r.publishingKit,
    })
  );
}

export async function getProject(
  userId: string,
  projectId: string
): Promise<BookProject | null> {
  const r = await db.query.bookProjects.findFirst({
    where: and(
      eq(bookProjects.id, projectId),
      eq(bookProjects.userId, userId)
    ),
    with: {
      blueprint: true,
      chapters: true,
      sourceContent: true,
      publishingKit: true,
    },
  });
  if (!r) return null;
  return mapProject(r, {
    blueprint: r.blueprint,
    chapters: r.chapters,
    sourceContent: r.sourceContent,
    publishingKit: r.publishingKit,
  });
}

// ───────────────────────────── writes ─────────────────────────────────────

/**
 * Creates and approves a project in one transaction: the project row, its
 * blueprint (approved), a chapter per summary, and any source content. This is
 * the "Approve & Start Writing" commit. Idempotent per call (fresh ids).
 */
export async function createProjectFromBlueprint(
  userId: string,
  input: CreateProjectInput
): Promise<BookProject> {
  const projectId = uid("proj");
  const ts = new Date();
  const bp = input.blueprint;

  await db.transaction(async (tx) => {
    await tx.insert(bookProjects).values({
      id: projectId,
      userId,
      title: bp.titleOptions[0] ?? "Untitled Book",
      bookType: input.bookType,
      goal: input.goal,
      audience: JSON.stringify(input.audience),
      initialPrompt: input.initialPrompt,
      status: "writing",
      genreData: input.genreData,
      createdAt: ts,
      updatedAt: ts,
    });

    await tx.insert(bookBlueprints).values({
      id: uid("bp"),
      projectId,
      titleOptionsJson: bp.titleOptions,
      subtitleOptionsJson: bp.subtitleOptions,
      bookPromise: bp.bookPromise,
      targetReader: bp.targetReader,
      tone: bp.tone,
      tableOfContentsJson: bp.tableOfContents,
      chapterSummariesJson: bp.chapterSummaries,
      estimatedLength: bp.estimatedLength,
      nextStepsJson: bp.nextSteps,
      approved: true,
      createdAt: ts,
      updatedAt: ts,
    });

    if (bp.chapterSummaries.length) {
      await tx.insert(chaptersTable).values(
        bp.chapterSummaries.map((c, i) => ({
          id: uid("ch"),
          projectId,
          title: c.title,
          summary: c.summary,
          content: "",
          orderIndex: i,
          status: "not_started" as ChapterStatus,
          createdAt: ts,
          updatedAt: ts,
        }))
      );
    }

    if (input.sourceContent.length) {
      await tx.insert(sourceContentTable).values(
        input.sourceContent.map((s) => ({
          id: s.id || uid("src"),
          projectId,
          type: s.type,
          title: s.title,
          content: s.content,
          metadataJson: s.metadata,
          createdAt: ts,
        }))
      );
    }
  });

  const created = await getProject(userId, projectId);
  if (!created) throw new Error("Failed to load project after creation");
  return created;
}

export async function deleteProject(
  userId: string,
  projectId: string
): Promise<void> {
  // Scoped delete; children cascade. No-op if not owned.
  await db
    .delete(bookProjects)
    .where(
      and(eq(bookProjects.id, projectId), eq(bookProjects.userId, userId))
    );
}

export async function patchProject(
  userId: string,
  projectId: string,
  patch: Partial<Pick<BookProject, "title" | "status">>
): Promise<void> {
  if (!(await ownedProject(userId, projectId))) return;
  await db
    .update(bookProjects)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(bookProjects.id, projectId));
}

export async function patchChapter(
  userId: string,
  projectId: string,
  chapterId: string,
  patch: Partial<Pick<Chapter, "title" | "summary" | "content" | "status">>
): Promise<void> {
  if (!(await ownedProject(userId, projectId))) return;
  await db
    .update(chaptersTable)
    .set({ ...patch, updatedAt: new Date() })
    .where(
      and(
        eq(chaptersTable.id, chapterId),
        eq(chaptersTable.projectId, projectId)
      )
    );
  await db
    .update(bookProjects)
    .set({ updatedAt: new Date() })
    .where(eq(bookProjects.id, projectId));
}

export async function updateBlueprint(
  userId: string,
  projectId: string,
  patch: Partial<BlueprintInput>
): Promise<void> {
  if (!(await ownedProject(userId, projectId))) return;
  await db
    .update(bookBlueprints)
    .set({
      titleOptionsJson: patch.titleOptions,
      subtitleOptionsJson: patch.subtitleOptions,
      bookPromise: patch.bookPromise,
      targetReader: patch.targetReader,
      tone: patch.tone,
      tableOfContentsJson: patch.tableOfContents,
      chapterSummariesJson: patch.chapterSummaries,
      estimatedLength: patch.estimatedLength,
      nextStepsJson: patch.nextSteps,
      updatedAt: new Date(),
    })
    .where(eq(bookBlueprints.projectId, projectId));
}

export type PublishingKitInput = Omit<
  PublishingKit,
  "id" | "projectId" | "createdAt" | "updatedAt"
>;

export async function setPublishingKit(
  userId: string,
  projectId: string,
  kit: PublishingKitInput
): Promise<void> {
  if (!(await ownedProject(userId, projectId))) return;
  const ts = new Date();
  const existing = await db
    .select({ id: publishingKits.id })
    .from(publishingKits)
    .where(eq(publishingKits.projectId, projectId))
    .limit(1);

  const values = {
    finalTitle: kit.finalTitle,
    subtitle: kit.subtitle,
    authorBio: kit.authorBio,
    bookDescription: kit.bookDescription,
    backCoverCopy: kit.backCoverCopy,
    keywordsJson: kit.keywords,
    categorySuggestionsJson: kit.categorySuggestions,
    coverConceptsJson: kit.coverConcepts,
    kdpChecklistJson: kit.kdpChecklist,
    updatedAt: ts,
  };

  if (existing[0]) {
    await db
      .update(publishingKits)
      .set(values)
      .where(eq(publishingKits.projectId, projectId));
  } else {
    await db
      .insert(publishingKits)
      .values({ id: uid("kit"), projectId, createdAt: ts, ...values });
  }
  await db
    .update(bookProjects)
    .set({ status: "publishing", updatedAt: ts })
    .where(eq(bookProjects.id, projectId));
}

/**
 * One-time migration of a visitor's localStorage projects into their account
 * (T10). Each project is re-created under fresh ids (so re-running can't
 * collide), preserving chapter content/status, blueprint, sources, and kit.
 * Returns the number of projects imported.
 */
export async function importProjects(
  userId: string,
  projects: BookProject[]
): Promise<number> {
  let imported = 0;
  for (const p of projects) {
    const projectId = uid("proj");
    const createdAt = new Date(p.createdAt);
    const ts = new Date();
    const valid = (d: Date) => (Number.isNaN(d.getTime()) ? ts : d);

    await db.transaction(async (tx) => {
      await tx.insert(bookProjects).values({
        id: projectId,
        userId,
        title: p.title || "Untitled Book",
        bookType: p.bookType,
        goal: p.goal,
        audience: JSON.stringify(p.audience ?? { description: "" }),
        initialPrompt: p.initialPrompt,
        status: p.status,
        genreData: p.genreData ?? {},
        createdAt: valid(createdAt),
        updatedAt: ts,
      });

      if (p.blueprint) {
        const b = p.blueprint;
        await tx.insert(bookBlueprints).values({
          id: uid("bp"),
          projectId,
          titleOptionsJson: b.titleOptions,
          subtitleOptionsJson: b.subtitleOptions,
          bookPromise: b.bookPromise,
          targetReader: b.targetReader,
          tone: b.tone,
          tableOfContentsJson: b.tableOfContents,
          chapterSummariesJson: b.chapterSummaries,
          estimatedLength: b.estimatedLength,
          nextStepsJson: b.nextSteps,
          approved: b.approved,
          createdAt: ts,
          updatedAt: ts,
        });
      }

      if (p.chapters?.length) {
        await tx.insert(chaptersTable).values(
          p.chapters.map((c, i) => ({
            id: uid("ch"),
            projectId,
            title: c.title,
            summary: c.summary,
            content: c.content,
            orderIndex: c.orderIndex ?? i,
            status: c.status,
            createdAt: ts,
            updatedAt: ts,
          }))
        );
      }

      if (p.sourceContent?.length) {
        await tx.insert(sourceContentTable).values(
          p.sourceContent.map((s) => ({
            id: uid("src"),
            projectId,
            type: s.type,
            title: s.title,
            content: s.content,
            metadataJson: s.metadata,
            createdAt: ts,
          }))
        );
      }

      if (p.publishingKit) {
        const k = p.publishingKit;
        await tx.insert(publishingKits).values({
          id: uid("kit"),
          projectId,
          finalTitle: k.finalTitle,
          subtitle: k.subtitle,
          authorBio: k.authorBio,
          bookDescription: k.bookDescription,
          backCoverCopy: k.backCoverCopy,
          keywordsJson: k.keywords,
          categorySuggestionsJson: k.categorySuggestions,
          coverConceptsJson: k.coverConcepts,
          kdpChecklistJson: k.kdpChecklist,
          createdAt: ts,
          updatedAt: ts,
        });
      }
    });
    imported += 1;
  }
  return imported;
}
