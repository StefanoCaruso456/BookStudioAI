import { redirect } from "next/navigation";
import { BookBuilderWizard } from "@/components/builder/BookBuilderWizard";
import { loadProfile } from "@/lib/data/loaders";
import { shouldGateToOnboarding } from "@/lib/onboarding";

// The builder is PUBLIC for anonymous visitors (build-before-signup converts
// best). But an authenticated user who hasn't completed onboarding must be
// routed there first — this is the primary post-signup route, so the gate has
// to live here too, not only on /dashboard etc. `loadProfile()` returns null
// for anonymous visitors (no DB hit), so they pass straight through.
export default async function BuilderPage() {
  const profile = await loadProfile();
  if (
    profile &&
    shouldGateToOnboarding({
      authenticated: true,
      onboardingCompletedAt: profile.onboardingCompletedAt,
    })
  ) {
    redirect("/onboarding");
  }

  return (
    <main>
      <BookBuilderWizard />
    </main>
  );
}
