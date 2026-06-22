import { notFound } from "next/navigation";
import { ChapterWorkspace } from "@/components/workspace/ChapterWorkspace";
import { loadProject, requireOnboarded } from "@/lib/data/loaders";
import { currentUserId } from "@/lib/data/loaders";
import { isPro } from "@/lib/data/subscriptions";

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  await requireOnboarded();
  const project = await loadProject(params.id);
  if (!project) notFound();
  // Server-resolved entitlement (Phase 5, ADR-4): the workspace gates the
  // chapter-AI actions on this — the real enforcement is server-side in the
  // actions/export route; this prop just drives the upgrade UX.
  const userId = await currentUserId();
  const pro = userId ? await isPro(userId) : false;
  return <ChapterWorkspace project={project} isPro={pro} />;
}
