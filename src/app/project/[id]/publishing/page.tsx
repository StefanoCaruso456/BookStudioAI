import { PublishingKit } from "@/components/publishing/PublishingKit";

export default function PublishingPage({ params }: { params: { id: string } }) {
  return <PublishingKit projectId={params.id} />;
}
