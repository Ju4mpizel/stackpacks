import { cn } from "@/lib/cn";
import { BG } from "./colors";

/** Barra de progreso brutalista. `value` y `max` numéricos. */
export function ProgressBar({ value, max = 100, color = "teal", label, className }) {
  const pct = max > 0 ? Math.round((Math.min(value, max) / max) * 100) : 0;
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="mb-1 flex items-baseline justify-between text-sm font-bold">
          <span>{label}</span>
          <span className="font-mono">{pct}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(value, max)}
        aria-label={label}
        className="h-5 overflow-hidden rounded-brutal-sm border-brutal bg-paper"
      >
        <div
          className={cn("h-full origin-left border-r-[3px] border-ink", BG[color], pct === 0 && "border-r-0")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
