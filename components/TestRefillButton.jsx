"use client";

import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/cn";
import { PACKS_PER_DAY } from "@/lib/state";
import { useProgress } from "@/store/useProgress";

// Visible en desarrollo. En producción solo si NEXT_PUBLIC_TEST_TOOLS=true.
export const TEST_TOOLS_ENABLED =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_TEST_TOOLS === "true";

/** Botón de pruebas: recarga los sobres del día al instante. */
export function TestRefillButton({ className }) {
  const refill = useProgress((s) => s.refillPacksForTesting);
  if (!TEST_TOOLS_ENABLED) return null;

  return (
    <button
      type="button"
      onClick={() => refill()}
      className={cn(
        "press inline-flex items-center gap-1.5 rounded-brutal-sm border-2 border-dashed border-ink bg-paper px-2.5 py-1.5 text-xs font-bold uppercase",
        className,
      )}
    >
      <FlaskConical size={14} aria-hidden="true" /> Test: recargar {PACKS_PER_DAY} sobres
    </button>
  );
}
