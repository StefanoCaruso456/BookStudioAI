import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { loadProfile } from "@/lib/data/loaders";

// The one surface that is NOT gated by requireOnboarded() — gating it would
// loop. Instead we run the inverse check: if there is no signed-in user, send
// them to sign in; if they've already onboarded, send them on to the dashboard
// (US-5, no repeat). Otherwise render the wizard.
export default async function OnboardingPage() {
  const profile = await loadProfile();
  if (!profile) redirect("/api/auth/signin");
  if (profile.onboardingCompletedAt !== null) redirect("/dashboard");
  return <OnboardingWizard />;
}
