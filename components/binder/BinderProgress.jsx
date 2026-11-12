"use client";

import { Trophy } from "lucide-react";
import { Badge, ProgressBar } from "@/components/ui";
import { useHydrated } from "@/hooks/useHydrated";
import { progressOf } from "@/lib/progress";
import { useProgress } from "@/store/useProgress";

const COLORS = ["teal", "pink", "blue", "orange", "lilac", "yellow"];

/**
 * Progreso de la serie: total y barras por categoría (cuentan cartas evolucionadas).
 * @param {{ categories: Array<{ category: string, ids: string[] }> }} props
 */
export function BinderProgress({ categories }) {
  const hydrated = useHydrated();
  const cards = useProgress((s) => s.cards);

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-brutal-lg border-brutal bg-cream-dark" aria-hidden="true" />;
  }

  const allIds = categories.flatMap((c) => c.ids);
  const total = progressOf(allIds, cards);
  const complete = total.evolved === total.total;

  return (
    <div className="space-y-5 rounded-brutal-lg border-brutal bg-paper p-5 shadow-brutal">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-sm font-bold">
          {total.obtained}/{total.total} obtenidas · {total.evolved}/{total.total} evolucionadas
        </p>
        {complete && (
          <Badge color="yellow">
            <Trophy size={14} aria-hidden="true" /> Serie completada
          </Badge>
        )}
      </div>
      <ProgressBar label="Serie" value={total.evolved} max={total.total} color={complete ? "yellow" : "teal"} />
      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map(({ category, ids }, i) => {
          const p = progressOf(ids, cards);
          return (
            <ProgressBar
              key={category}
              label={`${category} (${p.evolved}/${p.total})`}
              value={p.evolved}
              max={p.total}
              color={COLORS[i % COLORS.length]}
            />
          );
        })}
      </div>
    </div>
  );
}
