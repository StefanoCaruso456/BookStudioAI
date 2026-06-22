"use server";
// ===========================================================================
// Server actions for the books domain (ADR-4). The ONLY client-facing entry
// to the repository. Each action resolves the authenticated user from the
// session and scopes the repository call by it — clients never pass a userId.
// ===========================================================================
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as repo from "./projects";
import type { BookProject, Chapter } from "@/types/book";
import type {
  CreateProjectInput,
  PublishingKitInput,
  BlueprintInput,
} from "./projects";

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
