import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full min-h-[96px] rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-subtle/70 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-y leading-relaxed",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
