"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

export function FinalCTA() {
  return (
    <section className="px-5 py-10 sm:px-8 sm:py-16">
      <div className="relative mx-auto max-w-content overflow-hidden rounded-[1.75rem] bg-brand px-6 py-20 text-center sm:py-28">
        {/* soft accent glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[34rem] max-w-full -translate-x-1/2 rounded-[50%] bg-accent/25 blur-3xl" />
        {/* faint keyline frame */}
        <div className="pointer-events-none absolute inset-4 rounded-[1.4rem] border border-white/10" />

        <Reveal className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-soft/90">
            Book Studio AI
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-balance font-heading text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
            Your First Book Starts Today.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-white/70">
            Turn your knowledge, stories, recipes, frameworks, and experiences into
            a professionally published book.
          </p>
          <div className="mt-9">
            <Link
              href="/builder"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-7 text-base font-semibold text-white shadow-lift transition-colors hover:bg-accent-dark"
            >
              Start My Book
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
