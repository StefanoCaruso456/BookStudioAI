// ===========================================================================
// Server-only read loaders for Server Components (ADR-4). Reads go through
// here (plain async functions); mutations go through the "use server" actions
// in actions.ts. Both resolve the user from the session and scope by it.
// ===========================================================================
import "server-only";
import { auth } from "@/auth";
import * as repo from "./projects";
import type { BookProject } from "@/types/book";

export async function currentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function loadProjects(): Promise<BookProject[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  return repo.listProjects(userId);
}

export async function loadProject(
  projectId: string
): Promise<BookProject | null> {
  const userId = await currentUserId();
  if (!userId) return null;
  return repo.getProject(userId, projectId);
}
