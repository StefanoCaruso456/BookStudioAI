"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StepProgress } from "./StepProgress";
import { GenreTile } from "@/components/landing/GenreTile";
import { BookGoalSelector } from "./BookGoalSelector";
import { AudienceInput } from "./AudienceInput";
import { SourceContentUploader } from "./SourceContentUploader";
import { GenreSpecificForm } from "./GenreSpecificForm";
import { BlueprintPreview } from "./BlueprintPreview";
import { PRIMARY_GENRES, getGenre } from "@/lib/genres";
import { useStore, useHydrated } from "@/lib/store";
import { generateBookBlueprint, type BlueprintDraft } from "@/lib/ai";
import { createProjectAction } from "@/lib/data/actions";
import type { BookType } from "@/types/book";

const STEPS = ["Book Type", "Goal", "Audience", "Source", "Details", "Blueprint"];

export function BookBuilderWizard() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { status } = useSession();
  const authed = status === "authenticated";

  const draft = useStore((s) => s.draft);
  const setDraft = useStore((s) => s.setDraft);
  const resetDraft = useStore((s) => s.resetDraft);

  const [step, setStep] = useState(0);
  const [blueprint, setBlueprint] = useState<BlueprintDraft | null>(null);
  const [generating, setGenerating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [approving, setApproving] = useState(false);

  const genre = getGenre(draft.bookType);

  // Returning from the sign-in redirect (?resume=1): restore the blueprint the
  // visitor built before signing in and drop them back on the review step.
  useEffect(() => {
    if (!hydrated) return;
    const resume =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("resume") === "1";
    if (resume && draft.blueprint) {
      setBlueprint(draft.blueprint);
      setStep(5);
    }
    // run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  function changeBookType(type: BookType) {
    if (type === draft.bookType) return;
    setDraft({ bookType: type, genreData: {} });
    setBlueprint(null);
  }

  async function runGenerate(regenerate = false) {
    regenerate ? setRegenerating(true) : setGenerating(true);
    try {
      const bp = await generateBookBlueprint({
        bookType: draft.bookType,
        goal: draft.goal,
        audience: draft.audience,
        sourceContent: draft.sourceContent,
        genreData: draft.genreData,
        initialPrompt: draft.initialPrompt,
      });
      setBlueprint(bp);
      // Persist so the visitor's work survives a sign-in redirect at approve.
      setDraft({ blueprint: bp });
    } finally {
      setGenerating(false);
      setRegenerating(false);
    }
  }

  function next() {
    if (step === 4) {
      setStep(5);
      if (!blueprint) void runGenerate();
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function approve() {
    if (!blueprint) return;
    // Action gate: a visitor can build the whole blueprint freely, but saving
    // it requires an account. Stash the work and route through Google sign-in;
    // ?resume=1 brings them straight back to this review step afterward.
    if (!authed) {
      setDraft({ blueprint });
      void signIn("google", { callbackUrl: "/builder?resume=1" });
      return;
    }
    setApproving(true);
    try {
      // Persist to the database (creates project + blueprint + chapters).
      const project = await createProjectAction({
        bookType: draft.bookType,
        goal: draft.goal,
        audience: draft.audience,
        initialPrompt: draft.initialPrompt,
        genreData: draft.genreData,
        sourceContent: draft.sourceContent.map(
          ({ projectId: _p, ...rest }) => rest
        ),
        blueprint,
      });
      resetDraft(draft.bookType);
      router.push(`/project/${project.id}`);
    } catch (err) {
      console.error("Failed to create project", err);
      setApproving(false);
    }
  }

  const canNext =
    step === 0
      ? true
      : step === 1
      ? !!draft.goal
      : step === 2
      ? draft.audience.description.trim().length > 0
      : true;

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-subtle">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-10 pt-24 sm:px-8">
      <div className="mb-8">
        <StepProgress steps={STEPS} current={step} onJump={(i) => i <= step && setStep(i)} />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-line bg-canvas/40 px-6 py-5">
          <div className="flex items-center gap-2 text-sm font-medium text-brand">
            <Sparkles className="h-4 w-4" />
            Step {step + 1} of {STEPS.length}
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {STEP_TITLES[step]}
          </h1>
          <p className="mt-1 text-sm text-subtle">{STEP_HINTS[step](genre.label)}</p>
        </div>

        <div className="p-6">
          {step === 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {PRIMARY_GENRES.map((g) => (
                <GenreTile
                  key={g.type}
                  genre={g}
                  selected={draft.bookType === g.type}
                  onSelect={(sel) => changeBookType(sel.type)}
                />
              ))}
              <GenreTile
                genre={getGenre("other")}
                selected={draft.bookType === "other"}
                onSelect={(sel) => changeBookType(sel.type)}
              />
            </div>
          )}

          {step === 1 && (
            <BookGoalSelector
              value={draft.goal}
              onChange={(goal) => setDraft({ goal })}
            />
          )}

          {step === 2 && (
            <AudienceInput
              value={draft.audience.description}
              examples={genre.audienceExamples}
              onChange={(v) => setDraft({ audience: { description: v } })}
            />
          )}

          {step === 3 && <SourceContentUploader hint={genre.sourceHint} />}

          {step === 4 && (
            <GenreSpecificForm
              genre={genre}
              values={draft.genreData}
              onChange={(key, value) =>
                setDraft({ genreData: { ...draft.genreData, [key]: value } })
              }
            />
          )}

          {step === 5 &&
            (generating || !blueprint ? (
              <BlueprintLoading />
            ) : (
              <BlueprintPreview
                blueprint={blueprint}
                onChange={(patch) =>
                  setBlueprint((b) => (b ? { ...b, ...patch } : b))
                }
                onApprove={approve}
                onRegenerate={() => runGenerate(true)}
                regenerating={regenerating}
                approving={approving}
                authed={authed}
              />
            ))}
        </div>

        {step < 5 && (
          <div className="flex items-center justify-between border-t border-line bg-canvas/40 px-6 py-4">
            <Button variant="ghost" onClick={back} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={next} disabled={!canNext}>
              {step === 4 ? "Generate blueprint" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

const STEP_TITLES = [
  "What kind of book are you creating?",
  "What is the main goal of this book?",
  "Who is this book for?",
  "Add your source content",
  "A few details to make it yours",
  "Your book blueprint",
];

const STEP_HINTS: ((genre: string) => string)[] = [
  () => "You can change this at any time.",
  () => "This shapes the tone, structure, and call to action.",
  (g) => `Be specific — it helps tailor your ${g.toLowerCase()}.`,
  () => "Add anything you'd like the book built from. You can skip this.",
  (g) => `These ${g.toLowerCase()} details enrich your chapters. All optional.`,
  () => "Review, edit anything, and approve to start writing.",
];

function BlueprintLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-line bg-brand-soft/40 px-4 py-3 text-sm text-brand-dark">
        <Loader2 className="h-4 w-4 animate-spin" />
        Building your blueprint from everything you shared…
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-line p-4">
            <div className="h-3 w-1/3 rounded bg-line/70" />
            <div className="mt-3 h-2.5 w-full rounded bg-line/50" />
            <div className="mt-2 h-2.5 w-4/5 rounded bg-line/50" />
          </div>
        ))}
      </div>
    </div>
  );
}
