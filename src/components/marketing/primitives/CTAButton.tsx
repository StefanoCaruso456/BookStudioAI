import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Shared marketing CTA. `primary` = indigo gradient, `secondary` = outline. */
export function CTAButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  onDark = false,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
  className?: string;
  onDark?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo focus-visible:ring-offset-2";
  const sizes = {
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };
  const variants = {
    primary:
      "bg-brand-gradient text-white shadow-glow hover:-translate-y-0.5 hover:shadow-[0_16px_50px_-8px_rgba(79,70,229,0.6)]",
    secondary: onDark
      ? "border border-white/25 bg-white/5 text-white hover:bg-white/10"
      : "border border-line bg-white/70 text-ink hover:border-indigo/40 hover:text-indigo",
  };

  return (
    <Link href={href} className={cn(base, sizes[size], variants[variant], className)}>
      {children}
    </Link>
  );
}
