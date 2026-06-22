import { SettingsForm } from "@/components/settings/SettingsForm";
import { BillingSection } from "@/components/settings/BillingSection";
import { requireOnboarded, currentUserId } from "@/lib/data/loaders";
import { getSubscription } from "@/lib/data/subscriptions";
import { computeIsPro } from "@/lib/entitlement";

// Gated + onboarded: editing your profile only makes sense after onboarding.
// Minimal for now (persona / goal / marketing opt-in) — foundation for the
// Phase 3 account page.
export default async function SettingsPage() {
  const profile = await requireOnboarded();
  const userId = await currentUserId();
  const subscription = userId ? await getSubscription(userId) : null;
  const pro = subscription
    ? computeIsPro({ plan: subscription.plan, status: subscription.status })
    : false;
  return (
    <SettingsForm
      persona={profile.persona}
      primaryGoal={profile.primaryGoal}
      marketingOptIn={profile.marketingOptIn}
    >
      <BillingSection
        isPro={pro}
        plan={subscription?.plan ?? "free"}
        status={subscription?.status ?? "inactive"}
        cancelAtPeriodEnd={subscription?.cancelAtPeriodEnd ?? false}
      />
    </SettingsForm>
  );
}
