// ===========================================================================
// Persona self-segmentation (Phase 2, ADR-4). The single light question we ask
// in onboarding: "Which best describes you?". Each persona maps to a default
// BookType so we can pre-fill the builder's step 1 (the payoff, ADR-5) — the
// builder still owns book type + goal, so we never re-ask them here.
//
// `icon` is a lucide-react icon name resolved by the wizard's icon map (same
// indirection the marketing GenreTile uses, so this file stays free of JSX).
// ===========================================================================
import type { BookType } from "@/types/book";

export type PersonaKey =
  | "chef"
  | "coach"
  | "creator"
  | "consultant"
  | "founder"
  | "author"
  | "other";

export interface Persona {
  key: PersonaKey;
  label: string;
  /** lucide-react icon name (resolved in OnboardingWizard's ICONS map) */
  icon: string;
  /** the book type we pre-select in the builder for this persona */
  bookType: BookType;
}

/** persona → default book type. Drives the pre-filled builder route. */
export const personaToBookType: Record<PersonaKey, BookType> = {
  chef: "cookbook",
  coach: "coaching_self_help",
  consultant: "business_expert",
  founder: "business_expert",
  author: "memoir_biography",
  creator: "other",
  other: "other",
};

export const PERSONAS: Persona[] = [
  { key: "chef", label: "Chef", icon: "Utensils", bookType: personaToBookType.chef },
  { key: "coach", label: "Coach", icon: "Dumbbell", bookType: personaToBookType.coach },
  { key: "creator", label: "Creator", icon: "Sparkles", bookType: personaToBookType.creator },
  { key: "consultant", label: "Consultant", icon: "Briefcase", bookType: personaToBookType.consultant },
  { key: "founder", label: "Founder", icon: "Rocket", bookType: personaToBookType.founder },
  { key: "author", label: "Author", icon: "BookOpen", bookType: personaToBookType.author },
  { key: "other", label: "Other", icon: "BookText", bookType: personaToBookType.other },
];

/** Look up a persona by key (returns undefined for unknown/null keys). */
export function getPersona(key: string | null | undefined): Persona | undefined {
  return PERSONAS.find((p) => p.key === key);
}

/** Human label for a persona key, safe for null (returns ""). */
export function personaLabel(key: string | null | undefined): string {
  return getPersona(key)?.label ?? "";
}
