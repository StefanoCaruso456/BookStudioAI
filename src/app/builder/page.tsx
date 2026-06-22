import { redirect } from "next/navigation";
import { BookBuilderWizard } from "@/components/builder/BookBuilderWizard";
import { loadProfile, loadBuilderDraft } from "@/lib/data/loaders";
import { shouldGateToOnboarding } from "@/lib/onboarding";
import type { BuilderDraft } from "@/lib/store";
import type { BlueprintDraft } from "@/lib/ai";

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

  // Server-persisted draft (ADR-3): rehydrate the wizard cross-device. Anonymous
  // visitors get null (no DB hit) and fall back to their localStorage cache.
  const row = await loadBuilderDraft();
  const serverDraft = (row?.draft as Partial<BuilderDraft> | null) ?? null;
  const serverBlueprint = (row?.blueprint as BlueprintDraft | null) ?? null;

  return (
    <main>
      <BookBuilderWizard
        serverDraft={serverDraft}
        serverBlueprint={serverBlueprint}
      />
    </main>
  );
}
