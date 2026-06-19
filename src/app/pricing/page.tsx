import { PricingCards } from "@/components/landing/PricingCards";

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Pricing</h1>
        <p className="mx-auto mt-3 max-w-xl text-subtle">
          Create your book blueprint for free. Upgrade to draft, edit, and
          publish every chapter. Cancel anytime.
        </p>
      </div>
      <div className="mt-10">
        <PricingCards />
      </div>
      <p className="mt-8 text-center text-sm text-subtle">
        Payments are not enabled in this preview. Upgrading unlocks the full
        studio instantly.
      </p>
    </main>
  );
}
