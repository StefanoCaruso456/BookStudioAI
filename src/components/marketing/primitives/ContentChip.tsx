import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

/**
 * A floating "raw content" card (Notes, PDFs, Recipes…) that drifts in the hero
 * and converges in the narrative scenes. Frosted glass on any background.
 */
export function ContentChip({
  icon: Icon,
  label,
  className,
  style,
}: {
  icon: LucideIcon;
  label: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-2xl border border-white/60 bg-white/80 px-3.5 py-2.5 shadow-soft backdrop-blur-md",
        className
      )}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-soft text-indigo">
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-sm font-medium text-ink">{label}</span>
    </div>
  );
}
