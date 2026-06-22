// ===========================================================================
// Profiles repository (Phase 2) — the ONLY place that touches profiles /
// consent_log / events. Server-only. Every function takes a `userId` and scopes
// by it. profiles is 1:1 with users; we lazily backfill a stub on first read so
// legacy users (created before the events.createUser hook existed) still get a
// row (see Risks in the Phase 2 spec).
// ===========================================================================
import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { profiles, consentLog, events } from "@/lib/db/schema";
import { uid } from "@/lib/utils";
import { CONSENT_VERSION } from "@/lib/consent";
import { personaToBookType, type PersonaKey } from "@/lib/personas";
import type { BookGoal } from "@/types/book";

export type ProfileRow = typeof profiles.$inferSelect;

/** What the onboarding wizard collects (everything but consent rows/events). */
export interface CompleteOnboardingInput {
  persona: PersonaKey;
  referralSource?: string;
  marketingOptIn: boolean;
}

/** Fields a user can edit later from settings. */
export type ProfilePatch = Partial<{
  persona: PersonaKey;
  primaryGoal: BookGoal;
  marketingOptIn: boolean;
}>;

// ───────────────────────────── reads ──────────────────────────────────────

/**
 * Returns the user's profile, creating an empty stub if none exists. The insert
 * is conflict-safe so concurrent first-loads (or a race with events.createUser)
 * can't blow up — we just re-read afterwards.
 */
export async function getOrCreateProfile(userId: string): Promise<ProfileRow> {
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  if (existing) return existing;

  await db.insert(profiles).values({ userId }).onConflictDoNothing();

  const row = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  if (!row) throw new Error("Failed to load profile after creation");
  return row;
}

// ───────────────────────────── writes ─────────────────────────────────────

/** Append a row to the events funnel. Never throws into the caller's path. */
export async function logEvent(
  userId: string | null,
  name: string,
  props?: Record<string, unknown>
): Promise<void> {
  try {
    await db.insert(events).values({ id: uid("evt"), userId, name, props });
  } catch (err) {
    // Analytics must never break a user flow.
    console.error("logEvent failed", name, err);
  }
}

/** Append consent rows (terms/privacy/marketing) at the current version. */
export async function recordConsent(
  userId: string,
  types: ("terms" | "privacy" | "marketing")[]
): Promise<void> {
  if (!types.length) return;
  await db.insert(consentLog).values(
    types.map((type) => ({
      id: uid("consent"),
      userId,
      type,
      version: CONSENT_VERSION,
    }))
  );
}

/**
 * The onboarding commit: update the profile (persona, use_case derived from
 * persona, referral, marketing opt-in, onboarding_completed_at = now), append
 * the legal consent rows, and emit the funnel event — one logical operation.
 */
export async function completeOnboarding(
  userId: string,
  input: CompleteOnboardingInput
): Promise<ProfileRow> {
  // Ensure the row exists first (legacy users may not have one yet).
  await getOrCreateProfile(userId);
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(profiles)
      .set({
        persona: input.persona,
        useCase: personaToBookType[input.persona],
        referralSource: input.referralSource,
        marketingOptIn: input.marketingOptIn,
        onboardingCompletedAt: now,
        updatedAt: now,
      })
      .where(eq(profiles.userId, userId));

    const consentTypes: ("terms" | "privacy" | "marketing")[] = [
      "terms",
      "privacy",
    ];
    if (input.marketingOptIn) consentTypes.push("marketing");
    await tx.insert(consentLog).values(
      consentTypes.map((type) => ({
        id: uid("consent"),
        userId,
        type,
        version: CONSENT_VERSION,
      }))
    );

    await tx.insert(events).values({
      id: uid("evt"),
      userId,
      name: "onboarding_completed",
      props: { persona: input.persona },
    });
  });

  const row = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  if (!row) throw new Error("Failed to load profile after onboarding");
  return row;
}

/** Edit persona / primary goal / marketing opt-in from settings. */
export async function updateProfile(
  userId: string,
  patch: ProfilePatch
): Promise<void> {
  await getOrCreateProfile(userId);
  await db
    .update(profiles)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(profiles.userId, userId));
}
