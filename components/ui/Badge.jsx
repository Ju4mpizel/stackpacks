import { cn } from "@/lib/cn";
import { BG } from "./colors";

/** Etiqueta pequeña con borde y sombra corta. */
export function Badge({ color = "paper", className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-brutal-sm border-2 border-ink px-2 py-0.5",
        "text-xs font-bold uppercase tracking-wider shadow-brutal-sm",
        BG[color],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
