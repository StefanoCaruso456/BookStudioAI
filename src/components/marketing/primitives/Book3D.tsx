import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * A realistic CSS 3D book — cover face, thickness/pages on the right, and a
 * darker spine on the left. Pure CSS transforms (GPU-friendly). Compose the
 * cover with `children` or pass a gradient via `cover`.
 */
export function Book3D({
  title,
  subtitle,
  cover = "from-indigo-500 to-indigo-deep",
  spine = "bg-indigo-deep",
  className,
  children,
}: {
  title?: string;
  subtitle?: string;
  /** tailwind gradient color stops, e.g. "from-rose-500 to-rose-800" */
  cover?: string;
  /** tailwind bg class for the spine, e.g. "bg-rose-900" */
  spine?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("preserve-3d relative", className)}>
      {/* page block (right thickness) */}
      <div
        aria-hidden
        className="absolute right-0 top-[2.5%] h-[95%] w-3 translate-x-[2px] rounded-r-sm bg-gradient-to-l from-white to-slate-300"
        style={{ transform: "rotateY(28deg) translateZ(-2px)" }}
      />
      {/* cover face */}
      <div
        className={cn(
          "relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[6px] rounded-l-sm bg-gradient-to-br p-5 text-white shadow-book",
          cover
        )}
      >
        {/* spine */}
        <span
          aria-hidden
          className={cn("absolute inset-y-0 left-0 w-[6px] rounded-l-sm", spine)}
        />
        {/* sheen */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/25"
        />
        {children ?? (
          <>
            <div className="h-1.5 w-8 rounded-full bg-white/70" />
            <div>
              {title && (
                <h3 className="font-display text-lg font-bold leading-tight text-white">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-[11px] uppercase tracking-widest text-white/70">
                  {subtitle}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
