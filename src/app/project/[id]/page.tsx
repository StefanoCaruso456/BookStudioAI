import { notFound } from "next/navigation";
import { ChapterWorkspace } from "@/components/workspace/ChapterWorkspace";
import { loadProject, requireOnboarded } from "@/lib/data/loaders";

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  await requireOnboarded();
  const project = await loadProject(params.id);
  if (!project) notFound();
  return <ChapterWorkspace project={project} />;
}
