// ===========================================================================
// Builder-draft repository (Phase 3, ADR-3) — the ONLY place that touches the
// builder_drafts table. Server-only. 1:1 with users; every function takes a
// `userId` and scopes by it. Last-write-wins upsert (single-user app).
// ===========================================================================
import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { builderDrafts } from "@/lib/db/schema";

export type BuilderDraftRow = typeof builderDrafts.$inferSelect;

/** The current user's persisted wizard draft, or null if none yet. */
export async function getBuilderDraft(
  userId: string
): Promise<BuilderDraftRow | null> {
  const row = await db.query.builderDrafts.findFirst({
    where: eq(builderDrafts.userId, userId),
  });
  return row ?? null;
}

/**
 * Upsert the user's draft (and last-generated blueprint). Last-write-wins on
 * conflict — single user, possibly two devices; future merge is noted in the
 * spec's Risks. `blueprint` may be null until they reach the review step.
 */
export async function saveBuilderDraft(
  userId: string,
  draft: Record<string, unknown> | null,
  blueprint: Record<string, unknown> | null
): Promise<void> {
  const now = new Date();
  await db
    .insert(builderDrafts)
    .values({ userId, draft, blueprint, updatedAt: now })
    .onConflictDoUpdate({
      target: builderDrafts.userId,
      set: { draft, blueprint, updatedAt: now },
    });
}
