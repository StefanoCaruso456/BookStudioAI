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
        <div className="mx-auto max-w-content px-5 py-12 sm:px-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xl">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-white">
                  <BookMarked className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-ink">
                  Book Studio AI
                </span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-subtle">
                Book Studio AI helps chefs, coaches, creators, founders, and
                experts turn recipes, notes, stories, and transcripts into clear,
                publish-ready books — with AI-assisted outlining, writing, editing,
                and publishing.
              </p>
            </div>
            <nav className="flex items-center gap-6 text-sm text-subtle">
              <Link href="/pricing" className="hover:text-indigo">
                Pricing
              </Link>
              <Link href="/dashboard" className="hover:text-indigo">
                Dashboard
              </Link>
              <Link href="/builder" className="hover:text-indigo">
                Start Your Book
              </Link>
            </nav>
          </div>
          <p className="mt-10 border-t border-line pt-6 text-xs text-subtle">
            © 2026 Book Studio AI. All rights reserved.
          </p>
        </div>
      </footer>

      <MobileCTABar />
    </main>
  );
}
