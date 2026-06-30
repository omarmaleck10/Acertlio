import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded border border-rule bg-white px-3 text-sm text-ink placeholder:text-muted",
      "focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10",
      "disabled:opacity-50 disabled:bg-paper",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-sm font-medium text-ink mb-1.5", className)}
      {...props}
    />
  );
}
