import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full h-11 rounded-xl border border-line bg-card px-3.5 text-sm text-ink placeholder:text-subtle/70 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
