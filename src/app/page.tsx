import Link from "next/link";
import { BookMarked } from "lucide-react";
import { Hero } from "@/components/marketing/Hero";
import { NarrativeConverge } from "@/components/marketing/NarrativeConverge";
import { BlueprintBuild } from "@/components/marketing/BlueprintBuild";
import { BookComesAlive } from "@/components/marketing/BookComesAlive";
import { CategoryShowcase } from "@/components/marketing/CategoryShowcase";
import { PublishingJourney } from "@/components/marketing/PublishingJourney";
import { FeaturedBook } from "@/components/marketing/FeaturedBook";
import { SocialProof } from "@/components/marketing/SocialProof";
import { Pricing } from "@/components/marketing/Pricing";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { MobileCTABar } from "@/components/marketing/MobileCTABar";

export default function HomePage() {
  return (
    <main className="overflow-x-hidden pb-20 md:pb-0">
      <Hero />
      <NarrativeConverge />
      <BlueprintBuild />
      <BookComesAlive />
      <CategoryShowcase />
      <PublishingJourney />
      <FeaturedBook />
      <SocialProof />
      <Pricing />
      <FinalCTA />

      <footer className="border-t border-line bg-canvas">
        <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-6 px-5 py-12 sm:flex-row sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
              <BookMarked className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-ink">Book Studio AI</span>
          </Link>
          <p className="order-last text-sm text-subtle sm:order-none">
            © 2026 Book Studio AI · Turn years of knowledge into a published book.
          </p>
          <div className="flex items-center gap-6 text-sm text-subtle">
            <Link href="/pricing" className="hover:text-indigo">
              Pricing
            </Link>
            <Link href="/dashboard" className="hover:text-indigo">
              Dashboard
            </Link>
            <Link href="/builder" className="hover:text-indigo">
              Start Your Book
            </Link>
          </div>
        </div>
      </footer>

      <MobileCTABar />
    </main>
  );
}
