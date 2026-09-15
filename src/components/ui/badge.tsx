import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-white/10 px-2 py-0.5 text-xs font-medium",
        className,
      )}
      {...props}
    />
  );
}
