"use client";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BookCoverProps {
  title: string;
  eyebrow?: string;
  author?: string;
  color: string;
  className?: string;
}

/**
 * A realistic, editorial book cover rendered entirely in CSS — no images.
 * Vertical 2:3 trim, inked spine, fore-edge highlight, embossed title.
 */
export function BookCover({ title, eyebrow, author, color, className }: BookCoverProps) {
  return (
    <div
      className={cn(
        "relative aspect-[2/3] w-full overflow-hidden rounded-[4px] text-white",
        className
      )}
      style={{ backgroundColor: color, containerType: "inline-size" } as React.CSSProperties}
    >
      {/* spine shadow (left) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-black/35 to-transparent" />
      {/* top sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent" />
      {/* inner keyline */}
      <div className="pointer-events-none absolute inset-[7%] rounded-[2px] border border-white/15" />

      <div className="relative flex h-full flex-col justify-between p-[9%]">
        <div
          className="font-medium uppercase leading-tight text-white/70"
          style={{ fontSize: "clamp(7px, 4.4cqw, 13px)", letterSpacing: "0.16em" }}
        >
          {eyebrow}
        </div>
        <div>
          <h3
            className="font-heading font-extrabold leading-[1.04] tracking-tight"
            style={{ fontSize: "clamp(11px, 10.5cqw, 42px)" }}
          >
            {title}
          </h3>
          <div className="mt-[7%] h-px w-[22%] bg-white/45" />
          {author && (
            <div
              className="mt-[7%] font-medium tracking-wide text-white/75"
              style={{ fontSize: "clamp(7px, 4cqw, 13px)" }}
            >
              {author}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hero treatment: the same cover, given quiet dimensionality —
 * a fore-edge page block, a slight tilt, a soft float, and a grounded shadow.
 */
export function Book3D({
  title,
  eyebrow,
  author,
  color,
  className,
}: BookCoverProps) {
  const reduce = useReducedMotion();
  return (
    <div
      className={cn("relative", className)}
      style={{ perspective: "1400px", containerType: "inline-size" } as React.CSSProperties}
    >
      {/* grounded shadow */}
      <div className="pointer-events-none absolute -bottom-6 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-[50%] bg-black/25 blur-2xl" />

      <motion.div
        animate={reduce ? undefined : { y: [0, -10, 0] }}
        transition={reduce ? undefined : { duration: 6, ease: "easeInOut", repeat: Infinity }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="relative shadow-book"
          style={{ transform: "rotateX(4deg) rotateY(-11deg)", transformStyle: "preserve-3d", borderRadius: "4px" }}
        >
          {/* fore-edge pages (right) */}
          <div
            className="absolute inset-y-[2%] -right-[11px] w-[12px] rounded-r-[3px]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, #f2ece0 0px, #f2ece0 1px, #d8d0bf 1px, #d8d0bf 3px)",
              transform: "rotateY(34deg)",
              transformOrigin: "left center",
              boxShadow: "inset -1px 0 2px rgba(0,0,0,0.15)",
            }}
          />
          <BookCover title={title} eyebrow={eyebrow} author={author} color={color} className="w-full" />
        </div>
      </motion.div>
    </div>
  );
}
