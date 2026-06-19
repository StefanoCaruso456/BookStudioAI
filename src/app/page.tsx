import Link from "next/link";
import { PenLine, ListChecks, BookCheck } from "lucide-react";
import { LandingHero } from "@/components/landing/LandingHero";
import { PricingCards } from "@/components/landing/PricingCards";

const STEPS = [
  {
    icon: PenLine,
    title: "Share what you have",
    body: "Notes, recipes, posts, frameworks, or a simple idea — answer a few guided questions and we capture it.",
  },
  {
    icon: ListChecks,
    title: "Approve your blueprint",
    body: "Get titles, a table of contents, and chapter summaries. Edit anything, then approve before a word is drafted.",
  },
  {
    icon: BookCheck,
    title: "Write & publish",
    body: "Draft chapter by chapter with the AI assistant, polish with editing modes, and generate your publishing kit.",
  },
];

export default function HomePage() {
  return (
    <main>
      <LandingHero />

      {/* How it works */}
      <section className="mx-auto max-w-content px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            A guided publishing studio, not a blank page
          </h2>
          <p className="mt-3 text-subtle">
            Book Studio AI always shows you where you are, what to do next, and
            how close you are to a finished book.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="rounded-2xl border border-line bg-card p-6 shadow-card"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-copper-soft text-copper-dark">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-subtle">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-subtle">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section
        id="pricing"
        className="mx-auto max-w-content scroll-mt-20 px-5 py-16 sm:px-8"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Simple pricing for finishing your book
          </h2>
          <p className="mt-3 text-subtle">
            Start free and create your blueprint. Upgrade when you&rsquo;re ready
            to draft every chapter.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-3xl">
          <PricingCards />
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row sm:px-8">
          <p className="text-sm text-subtle">
            © {2026} Book Studio AI · Turn Content Into Books.
          </p>
          <div className="flex items-center gap-5 text-sm text-subtle">
            <Link href="/pricing" className="hover:text-ink">
              Pricing
            </Link>
            <Link href="/dashboard" className="hover:text-ink">
              Dashboard
            </Link>
            <Link href="/builder" className="hover:text-ink">
              Start My Book
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
