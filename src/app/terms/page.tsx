import type { Metadata } from "next";
import { CONSENT_VERSION } from "@/lib/consent";

export const metadata: Metadata = {
  title: "Terms of Service — Book Studio AI",
};

// Placeholder-but-reasonable Terms. Onboarding records consent to this page at
// CONSENT_VERSION, so it must exist; replace with reviewed legal copy before a
// public launch.
export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <p className="text-sm font-medium uppercase tracking-wide text-brand">
        Legal
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-subtle">Version {CONSENT_VERSION}</p>

      <div className="mt-8 space-y-6 text-ink/90 leading-relaxed">
        <p className="rounded-xl border border-line bg-card p-4 text-sm text-subtle">
          This is a starting-point draft, not final legal copy. Review with
          counsel before relying on it.
        </p>

        <Section title="1. Acceptance of terms">
          By creating an account or using Book Studio AI (&ldquo;the
          Service&rdquo;), you agree to these Terms. If you do not agree, do not
          use the Service.
        </Section>
        <Section title="2. Your content">
          You retain ownership of the content you upload and the books you
          create. You grant us a limited license to process that content solely
          to provide the Service to you.
        </Section>
        <Section title="3. Acceptable use">
          You agree not to use the Service to create unlawful, infringing, or
          harmful material, or to disrupt the Service for others.
        </Section>
        <Section title="4. AI-generated output">
          The Service uses AI to help structure and draft your book. Output may
          contain errors; you are responsible for reviewing it before
          publishing.
        </Section>
        <Section title="5. Changes">
          We may update these Terms from time to time. Material changes are
          versioned; continued use after an update constitutes acceptance.
        </Section>
        <Section title="6. Contact">
          Questions about these Terms can be sent to our support team.
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-subtle">{children}</p>
    </section>
  );
}
