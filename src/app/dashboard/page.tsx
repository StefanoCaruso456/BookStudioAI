import { DashboardView } from "@/components/dashboard/DashboardView";
import { loadProjects, requireOnboarded } from "@/lib/data/loaders";

// Reads the signed-in user's books from Postgres (route is gated by
// middleware, so a user is always present here). requireOnboarded() redirects
// to /onboarding until the profile is complete (ADR-1), and hands back the
// profile so we can greet the user by persona.
export default async function DashboardPage() {
  const profile = await requireOnboarded();
  const projects = await loadProjects();
  return <DashboardView projects={projects} persona={profile.persona} />;
}
