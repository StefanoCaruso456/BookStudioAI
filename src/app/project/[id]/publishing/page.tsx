import { notFound } from "next/navigation";
import { PublishingKit } from "@/components/publishing/PublishingKit";
import { loadProject } from "@/lib/data/loaders";

export default async function PublishingPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await loadProject(params.id);
  if (!project) notFound();
  return <PublishingKit project={project} />;
}
