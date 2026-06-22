"use client";
// The leanest useful onboarding (ADR-4): two beats — (1) persona/role, then
// (2) consent (+ optional attribution) — that captures who the user is and
// drops them into a pre-filled builder (ADR-5). Mobile-first with a sticky CTA;
// styled with the in-studio design tokens (slate brand, ivory canvas).
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Utensils,
  Dumbbell,
  Sparkles,
  Briefcase,
  Rocket,
  BookOpen,
  BookText,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PERSONAS,
  personaToBookType,
  type PersonaKey,
} from "@/lib/personas";
import {
  completeOnboardingAction,
  logEventAction,
} from "@/lib/data/actions";

const ICONS: Record<string, LucideIcon> = {
  Utensils,
  Dumbbell,
  Sparkles,
  Briefcase,
  Rocket,
  BookOpen,
  BookText,
};

const REFERRAL_OPTIONS = [
  { value: "search", label: "Search" },
  { value: "social", label: "Social" },
  { value: "friend", label: "Friend" },
  { value: "youtube", label: "YouTube" },
  { value: "other", label: "Other" },
] as const;

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [persona, setPersona] = useState<PersonaKey | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [referralSource, setReferralSource] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Funnel: fire once when the user lands on onboarding (ADR-6).
  useEffect(() => {
    void logEventAction("onboarding_started");
  }, []);

  function pickPersona(key: PersonaKey) {
    setPersona(key);
    setStep(1);
  }

  async function submit() {
    if (!persona || !agreed || submitting) return;
    setSubmitting(true);
    try {
      await completeOnboardingAction({
        persona,
        referralSource: referralSource || undefined,
        marketingOptIn,
      });
      router.push(`/builder?type=${personaToBookType[persona]}`);
    } catch (err) {
      console.error("Failed to complete onboarding", err);
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-canvas">
      {/* Editorial hero band — premium, calm, on-brand. */}
      <div className="bg-brand-gradient px-5 pb-10 pt-16 text-white sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wide text-white/70">
            Welcome to Book Studio
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {step === 0 ? "Which best describes you?" : "One last thing"}
          </h1>
          <p className="mt-2 max-w-md text-white/80">
            {step === 0
              ? "We'll tailor your studio to your kind of book."
              : "Agree to get started — then we'll build your blueprint."}
          </p>
          <ProgressDots current={step} total={2} className="mt-6" />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 pb-32 pt-8 sm:px-8 sm:pb-10">
        {step === 0 ? (
          <PersonaGrid selected={persona} onSelect={pickPersona} />
        ) : (
          <ConsentStep
            agreed={agreed}
            onAgreedChange={setAgreed}
            marketingOptIn={marketingOptIn}
            onMarketingChange={setMarketingOptIn}
            referralSource={referralSource}
            onReferralChange={setReferralSource}
          />
        )}
      </div>

      {/* Sticky CTA: only on step 2 (step 1 advances on tap). */}
      {step === 1 && (
        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-canvas/95 px-5 py-4 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:px-8 sm:pb-10">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep(0)}
              disabled={submitting}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={submit} disabled={!agreed || submitting} size="lg">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Start my book
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

function ProgressDots({
  current,
  total,
  className,
}: {
  current: number;
  total: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === current ? "w-7 bg-white" : "w-3 bg-white/40"
          )}
        />
      ))}
    </div>
  );
}

function PersonaGrid({
  selected,
  onSelect,
}: {
  selected: PersonaKey | null;
  onSelect: (key: PersonaKey) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {PERSONAS.map((p) => {
        const Icon = ICONS[p.icon] ?? BookText;
        const isSelected = selected === p.key;
        return (
          <button
            key={p.key}
            type="button"
            onClick={() => onSelect(p.key)}
            aria-pressed={isSelected}
            className={cn(
              "group flex flex-col items-start gap-3.5 rounded-xl border bg-card p-5 text-left shadow-card transition-all duration-150 hover:shadow-lift",
              isSelected
                ? "border-brand ring-1 ring-brand/20"
                : "border-line hover:border-brand/40"
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
                isSelected
                  ? "border-brand/30 bg-brand-soft text-brand"
                  : "border-line bg-canvas text-ink group-hover:border-brand/30 group-hover:text-brand"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="font-semibold tracking-tight">{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ConsentStep({
  agreed,
  onAgreedChange,
  marketingOptIn,
  onMarketingChange,
  referralSource,
  onReferralChange,
}: {
  agreed: boolean;
  onAgreedChange: (v: boolean) => void;
  marketingOptIn: boolean;
  onMarketingChange: (v: boolean) => void;
  referralSource: string;
  onReferralChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <CheckboxRow checked={agreed} onChange={onAgreedChange} required>
        I agree to the{" "}
        <Link href="/terms" className="font-medium text-brand underline">
          Terms
        </Link>{" "}
        &amp;{" "}
        <Link href="/privacy" className="font-medium text-brand underline">
          Privacy Policy
        </Link>
      </CheckboxRow>

      <CheckboxRow checked={marketingOptIn} onChange={onMarketingChange}>
        Email me product tips{" "}
        <span className="text-subtle">(optional)</span>
      </CheckboxRow>

      <div className="rounded-xl border border-line bg-card p-4">
        <label
          htmlFor="referral"
          className="block text-sm font-medium text-ink"
        >
          How did you hear about us?{" "}
          <span className="font-normal text-subtle">(optional)</span>
        </label>
        <select
          id="referral"
          value={referralSource}
          onChange={(e) => onReferralChange(e.target.value)}
          className="mt-2 h-11 w-full rounded-xl border border-line bg-card px-3.5 text-sm text-ink transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        >
          <option value="">Select…</option>
          {REFERRAL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function CheckboxRow({
  checked,
  onChange,
  required,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:border-brand/40",
        checked ? "border-brand ring-1 ring-brand/20" : "border-line"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          checked ? "border-brand bg-brand text-white" : "border-line"
        )}
      >
        {checked && <Check className="h-3 w-3" />}
      </span>
      <span className="text-sm text-ink">
        {children}
        {required && <span className="ml-1 text-brand">*</span>}
      </span>
    </button>
  );
}
