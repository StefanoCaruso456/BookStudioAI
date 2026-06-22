"use client";
// ===========================================================================
// Upgrade CTA (Phase 5) — starts a Stripe Checkout Session for Pro and
// redirects to it. If the visitor isn't signed in, send them through sign-in
// first (callbackUrl back to /pricing), since Checkout needs a user to attach
// the customer to. Used by the pricing page Pro card.
// ===========================================================================
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { createCheckoutSessionAction } from "@/lib/data/billing";

export function UpgradeButton({
  children = "Upgrade to Pro",
  className,
  variant = "primary",
}: {
  children?: React.ReactNode;
  className?: string;
  variant?: ButtonProps["variant"];
}) {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (status !== "authenticated") {
      void signIn("google", { callbackUrl: "/pricing" });
      return;
    }
    setLoading(true);
    try {
      const { url } = await createCheckoutSessionAction();
      window.location.href = url;
    } catch (err) {
      console.error("Failed to start checkout", err);
      setLoading(false);
    }
  }

  return (
    <Button
      className={className}
      variant={variant}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </Button>
  );
}
