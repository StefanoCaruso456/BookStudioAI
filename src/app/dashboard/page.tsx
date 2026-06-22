import { DashboardView } from "@/components/dashboard/DashboardView";
import { loadProjects } from "@/lib/data/loaders";

// Reads the signed-in user's books from Postgres (route is gated by
// middleware, so a user is always present here).
export default async function DashboardPage() {
  const projects = await loadProjects();
  return <DashboardView projects={projects} />;
}
