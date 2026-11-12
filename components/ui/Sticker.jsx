import { cn } from "@/lib/cn";
import { BG } from "./colors";

/** Etiqueta ladeada tipo pegatina. `rotate` en grados (por defecto -4). */
export function Sticker({ color = "pink", rotate = -4, wiggle = false, className, children, style }) {
  return (
    <span
      className={cn(
        "inline-block rounded-brutal-sm border-brutal px-3 py-1 shadow-brutal",
        "font-display text-sm uppercase",
        BG[color],
        wiggle && "motion-safe:animate-wiggle",
        className,
      )}
      style={{ rotate: `${rotate}deg`, ...style }}
    >
      {children}
    </span>
  );
}
