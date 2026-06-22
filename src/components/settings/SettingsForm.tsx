"use client";
// Minimal profile editor (US-6): change persona, primary goal, and the
// marketing email preference. On-brand and intentionally small — the full
// account page comes in Phase 3.
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BOOK_GOALS } from "@/lib/genres";
import { PERSONAS, type PersonaKey } from "@/lib/personas";
import { updateProfileAction } from "@/lib/data/actions";
import type { BookGoal } from "@/types/book";

export function SettingsForm({
  persona,
  primaryGoal,
  marketingOptIn,
}: {
  persona: string | null;
  primaryGoal: string | null;
  marketingOptIn: boolean;
}) {
  const [personaValue, setPersonaValue] = useState<string>(persona ?? "");
  const [goalValue, setGoalValue] = useState<string>(primaryGoal ?? "");
  const [optIn, setOptIn] = useState(marketingOptIn);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await updateProfileAction({
        persona: (personaValue || undefined) as PersonaKey | undefined,
        primaryGoal: (goalValue || undefined) as BookGoal | undefined,
        marketingOptIn: optIn,
      });
      setSaved(true);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-subtle">Update how the studio tailors itself to you.</p>

      <Card className="mt-8 space-y-6 p-6">
        <Field label="Which best describes you?">
          <select
            value={personaValue}
            onChange={(e) => {
              setPersonaValue(e.target.value);
              setSaved(false);
            }}
            className={selectClass}
          >
            <option value="">Not set</option>
            {PERSONAS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Your main goal">
          <select
            value={goalValue}
            onChange={(e) => {
              setGoalValue(e.target.value);
              setSaved(false);
            }}
            className={selectClass}
          >
            <option value="">Not set</option>
            {BOOK_GOALS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>

        <button
          type="button"
          onClick={() => {
            setOptIn((v) => !v);
            setSaved(false);
          }}
          aria-pressed={optIn}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:border-brand/40",
            optIn ? "border-brand ring-1 ring-brand/20" : "border-line"
          )}
        >
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
              optIn ? "border-brand bg-brand text-white" : "border-line"
            )}
          >
            {optIn && <Check className="h-3 w-3" />}
          </span>
          <span className="text-sm text-ink">Email me product tips</span>
        </button>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-success">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </Card>
    </main>
  );
}

const selectClass =
  "h-11 w-full rounded-xl border border-line bg-card px-3.5 text-sm text-ink transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
