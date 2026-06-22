// ===========================================================================
// Server-only read loaders for Server Components (ADR-4). Reads go through
// here (plain async functions); mutations go through the "use server" actions
// in actions.ts. Both resolve the user from the session and scope by it.
// ===========================================================================
import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import * as repo from "./projects";
import * as profileRepo from "./profiles";
import type { ProfileRow } from "./profiles";
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

/**
 * The current user's profile, creating (backfilling) a stub if missing. Returns
 * null only for an unauthenticated request.
 */
export async function loadProfile(): Promise<ProfileRow | null> {
  const userId = await currentUserId();
  if (!userId) return null;
  return profileRepo.getOrCreateProfile(userId);
}

/**
 * Server-side onboarding gate (ADR-1): the DB is the source of truth, checked
 * per request. If the user hasn't finished onboarding, redirect them into it;
 * otherwise hand back the profile so the page can personalize. Call this at the
 * top of every gated, post-onboarding surface (/dashboard, /project/*).
 *
 * NOTE: middleware already guarantees a signed-in user on these routes, so a
 * missing profile here means "load it"; we never reach this unauthenticated.
 */
export async function requireOnboarded(): Promise<ProfileRow> {
  const profile = await loadProfile();
  if (!profile || profile.onboardingCompletedAt === null) {
    redirect("/onboarding");
  }
  return profile;
}
