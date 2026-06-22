// ===========================================================================
// Pure onboarding-gate decisions (no server-only deps, so they're unit-testable).
//
// Acceptance rule: an AUTHENTICATED user who has NOT completed onboarding must
// be routed to /onboarding before any app experience. Anonymous visitors and
// already-onboarded users pass through. This is applied by every app route's
// server component (dashboard, project, publishing, settings, AND builder).
// ===========================================================================

/** True when the caller must be redirected to /onboarding. */
export function shouldGateToOnboarding(input: {
  authenticated: boolean;
  onboardingCompletedAt: Date | string | null | undefined;
}): boolean {
  return input.authenticated && !input.onboardingCompletedAt;
}

/** True when someone on /onboarding should be sent away (already finished). */
export function shouldLeaveOnboarding(
  onboardingCompletedAt: Date | string | null | undefined
): boolean {
  return !!onboardingCompletedAt;
}
