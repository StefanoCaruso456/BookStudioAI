import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Royal-indigo gradient text. `animate` adds the slow shimmer. */
export function GradientText({
  children,
  animate = false,
  className,
}: {
  children: ReactNode;
  animate?: boolean;
  className?: string;
}) {
  return (
    <span className={cn(animate ? "text-gradient-anim" : "text-gradient", className)}>
      {children}
    </span>
  );
}
