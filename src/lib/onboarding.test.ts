import { describe, it, expect } from "vitest";
import { shouldGateToOnboarding, shouldLeaveOnboarding } from "./onboarding";

describe("shouldGateToOnboarding", () => {
  it("gates a new authenticated user with no completed profile", () => {
    expect(
      shouldGateToOnboarding({ authenticated: true, onboardingCompletedAt: null })
    ).toBe(true);
  });

  it("lets a completed authenticated user through (date)", () => {
    expect(
      shouldGateToOnboarding({
        authenticated: true,
        onboardingCompletedAt: new Date(),
      })
    ).toBe(false);
  });

  it("lets a completed authenticated user through (iso string)", () => {
    expect(
      shouldGateToOnboarding({
        authenticated: true,
        onboardingCompletedAt: "2026-06-22T00:00:00.000Z",
      })
    ).toBe(false);
  });

  it("never gates an anonymous visitor (builder stays public)", () => {
    expect(
      shouldGateToOnboarding({ authenticated: false, onboardingCompletedAt: null })
    ).toBe(false);
    expect(
      shouldGateToOnboarding({
        authenticated: false,
        onboardingCompletedAt: new Date(),
      })
    ).toBe(false);
  });

  it("treats undefined completion as not-onboarded", () => {
    expect(
      shouldGateToOnboarding({
        authenticated: true,
        onboardingCompletedAt: undefined,
      })
    ).toBe(true);
  });
});

describe("shouldLeaveOnboarding", () => {
  it("sends a completed user away from /onboarding", () => {
    expect(shouldLeaveOnboarding(new Date())).toBe(true);
    expect(shouldLeaveOnboarding("2026-06-22T00:00:00.000Z")).toBe(true);
  });

  it("keeps an un-onboarded user on /onboarding", () => {
    expect(shouldLeaveOnboarding(null)).toBe(false);
    expect(shouldLeaveOnboarding(undefined)).toBe(false);
  });
});
