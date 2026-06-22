import { SettingsForm } from "@/components/settings/SettingsForm";
import { requireOnboarded } from "@/lib/data/loaders";

// Gated + onboarded: editing your profile only makes sense after onboarding.
// Minimal for now (persona / goal / marketing opt-in) — foundation for the
// Phase 3 account page.
export default async function SettingsPage() {
  const profile = await requireOnboarded();
  return (
    <SettingsForm
      persona={profile.persona}
      primaryGoal={profile.primaryGoal}
      marketingOptIn={profile.marketingOptIn}
    />
  );
}
