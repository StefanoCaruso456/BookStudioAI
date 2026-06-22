import type { Metadata } from "next";
import { CONSENT_VERSION } from "@/lib/consent";

export const metadata: Metadata = {
  title: "Privacy Policy — Book Studio AI",
};

// Placeholder-but-reasonable Privacy Policy. Onboarding records consent to this
// page at CONSENT_VERSION, so it must exist; replace with reviewed legal copy
// before a public launch.
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <p className="text-sm font-medium uppercase tracking-wide text-brand">
        Legal
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-subtle">Version {CONSENT_VERSION}</p>

      <div className="mt-8 space-y-6 text-ink/90 leading-relaxed">
        <p className="rounded-xl border border-line bg-card p-4 text-sm text-subtle">
          This is a starting-point draft, not final legal copy. Review with
          counsel before relying on it.
        </p>

        <Section title="1. What we collect">
          Your account details (name, email), the profile you set during
          onboarding (persona, goal, preferences), the content you upload, and
          basic product analytics.
        </Section>
        <Section title="2. How we use it">
          To provide and personalize the Service, build your book, record legal
          consent, and improve the product. We do not sell your personal data.
        </Section>
        <Section title="3. AI processing">
          Content you provide may be sent to AI providers to generate outlines,
          drafts, and publishing assets on your behalf.
        </Section>
        <Section title="4. Email">
          We email you about your account. Product tips are sent only if you opt
          in, and you can opt out at any time from Settings.
        </Section>
        <Section title="5. Data retention &amp; deletion">
          Your data is retained while your account is active. Deleting your
          account removes your profile, consent records, and books.
        </Section>
        <Section title="6. Contact">
          Privacy questions can be sent to our support team.
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
