"use server";
// ===========================================================================
// Server actions for the books domain (ADR-4). The ONLY client-facing entry
// to the repository. Each action resolves the authenticated user from the
// session and scopes the repository call by it — clients never pass a userId.
// ===========================================================================
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as repo from "./projects";
import * as profileRepo from "./profiles";
import * as builderDraftRepo from "./builderDraft";
import type { BookProject, Chapter } from "@/types/book";
import type {
  CreateProjectInput,
  PublishingKitInput,
  BlueprintInput,
} from "./projects";
import type {
  CompleteOnboardingInput,
  ProfilePatch,
  ProfileRow,
} from "./profiles";

async function requireUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) throw new Error("Not authenticated");
  return id;
}

export async function listProjectsAction(): Promise<BookProject[]> {
  return repo.listProjects(await requireUserId());
}

export async function getProjectAction(
  projectId: string
): Promise<BookProject | null> {
  return repo.getProject(await requireUserId(), projectId);
}

export async function createProjectAction(
  input: CreateProjectInput
): Promise<BookProject> {
  const userId = await requireUserId();
  const project = await repo.createProjectFromBlueprint(userId, input);
  revalidatePath("/dashboard");
  return project;
}

export async function deleteProjectAction(projectId: string): Promise<void> {
  await repo.deleteProject(await requireUserId(), projectId);
  revalidatePath("/dashboard");
}

export async function patchProjectAction(
  projectId: string,
  patch: Partial<Pick<BookProject, "title" | "status">>
): Promise<void> {
  await repo.patchProject(await requireUserId(), projectId, patch);
  revalidatePath(`/project/${projectId}`);
  revalidatePath("/dashboard");
}

export async function patchChapterAction(
  projectId: string,
  chapterId: string,
  patch: Partial<Pick<Chapter, "title" | "summary" | "content" | "status">>
): Promise<void> {
  await repo.patchChapter(await requireUserId(), projectId, chapterId, patch);
  revalidatePath(`/project/${projectId}`);
}

export async function updateBlueprintAction(
  projectId: string,
  patch: Partial<BlueprintInput>
): Promise<void> {
  await repo.updateBlueprint(await requireUserId(), projectId, patch);
  revalidatePath(`/project/${projectId}`);
}

export async function setPublishingKitAction(
  projectId: string,
  kit: PublishingKitInput
): Promise<void> {
  await repo.setPublishingKit(await requireUserId(), projectId, kit);
  revalidatePath(`/project/${projectId}`);
  revalidatePath(`/project/${projectId}/publishing`);
}

export async function importProjectsAction(
  projects: BookProject[]
): Promise<number> {
  const userId = await requireUserId();
  const n = await repo.importProjects(userId, projects);
  revalidatePath("/dashboard");
  return n;
}

// ───────────────────────────── Builder draft (Phase 3) ────────────────────

export async function saveBuilderDraftAction(
  draft: Record<string, unknown> | null,
  blueprint: Record<string, unknown> | null
): Promise<void> {
  const userId = await requireUserId();
  await builderDraftRepo.saveBuilderDraft(userId, draft, blueprint);
}

// ───────────────────────────── Profile / onboarding (Phase 2) ─────────────

export async function completeOnboardingAction(
  input: CompleteOnboardingInput
): Promise<ProfileRow> {
  const userId = await requireUserId();
  const profile = await profileRepo.completeOnboarding(userId, input);
  // The gate reads the profile per request; revalidate the gated surfaces so
  // the freshly-onboarded user isn't bounced back to /onboarding.
  revalidatePath("/dashboard");
  return profile;
}

export async function updateProfileAction(patch: ProfilePatch): Promise<void> {
  const userId = await requireUserId();
  await profileRepo.updateProfile(userId, patch);
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function logEventAction(
  name: string,
  props?: Record<string, unknown>
): Promise<void> {
  // Not gated to a signed-in user: 'onboarding_started' may fire mid-session.
  const session = await auth();
  await profileRepo.logEvent(session?.user?.id ?? null, name, props);
}
