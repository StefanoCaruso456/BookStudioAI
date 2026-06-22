import { describe, expect, it } from "vitest";
import {
  PERSONAS,
  personaToBookType,
  getPersona,
  personaLabel,
  type PersonaKey,
} from "./personas";
import type { BookType } from "@/types/book";

const VALID_BOOK_TYPES: BookType[] = [
  "cookbook",
  "fitness_diet",
  "coaching_self_help",
  "travel_guide",
  "memoir_biography",
  "business_expert",
  "other",
];

describe("personaToBookType mapping", () => {
  it("maps every persona to a valid BookType", () => {
    for (const persona of PERSONAS) {
      const bookType = personaToBookType[persona.key];
      expect(VALID_BOOK_TYPES, `${persona.key} → ${bookType}`).toContain(
        bookType
      );
    }
  });

  it("uses the documented persona → book type mapping", () => {
    const expected: Record<PersonaKey, BookType> = {
      chef: "cookbook",
      coach: "coaching_self_help",
      consultant: "business_expert",
      founder: "business_expert",
      author: "memoir_biography",
      creator: "other",
      other: "other",
    };
    expect(personaToBookType).toEqual(expected);
  });

  it("keeps PERSONAS in sync with the mapping", () => {
    for (const persona of PERSONAS) {
      expect(persona.bookType).toBe(personaToBookType[persona.key]);
    }
  });
});

describe("PERSONAS data integrity", () => {
  it("has a unique key for every persona", () => {
    const keys = PERSONAS.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("includes an 'other' fallback persona", () => {
    expect(PERSONAS.some((p) => p.key === "other")).toBe(true);
  });

  it("gives every persona a non-empty label and icon", () => {
    for (const p of PERSONAS) {
      expect(p.label.length, `${p.key} label`).toBeGreaterThan(0);
      expect(p.icon.length, `${p.key} icon`).toBeGreaterThan(0);
    }
  });
});

describe("getPersona / personaLabel", () => {
  it("looks up a persona by key", () => {
    expect(getPersona("chef")?.label).toBe("Chef");
  });

  it("returns undefined for unknown or null keys", () => {
    expect(getPersona("unknown")).toBeUndefined();
    expect(getPersona(null)).toBeUndefined();
  });

  it("personaLabel is null-safe", () => {
    expect(personaLabel("coach")).toBe("Coach");
    expect(personaLabel(null)).toBe("");
    expect(personaLabel("nope")).toBe("");
  });
});
