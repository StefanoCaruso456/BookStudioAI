import { ChapterWorkspace } from "@/components/workspace/ChapterWorkspace";

export default function ProjectPage({ params }: { params: { id: string } }) {
  return <ChapterWorkspace projectId={params.id} />;
}
