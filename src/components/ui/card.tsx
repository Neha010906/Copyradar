import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes } from "react";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-white/10 bg-[#12121a] transition-shadow hover:border-cyan-400/30 hover:shadow-[0_0_32px_rgba(34,211,238,0.12)]",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";
