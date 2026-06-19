import Link from "next/link";
import { Hero } from "@/components/marketing/Hero";
import { TransformFlow } from "@/components/marketing/TransformFlow";
import { GenreShowcase } from "@/components/marketing/GenreShowcase";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { BeforeAfter } from "@/components/marketing/BeforeAfter";
import { BookGallery } from "@/components/marketing/BookGallery";
import { PricingSection } from "@/components/marketing/PricingSection";
import { FinalCTA } from "@/components/marketing/FinalCTA";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <TransformFlow />
      <GenreShowcase />
      <HowItWorks />
      <BeforeAfter />
      <BookGallery />
      <PricingSection />
      <FinalCTA />

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row sm:px-8">
          <p className="text-sm text-subtle">
            © 2026 Book Studio AI · Turn Content Into Books.
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
