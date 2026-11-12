"use client";

import { ArrowDown, Clock, Package } from "lucide-react";
import Link from "next/link";
import { PackArt } from "@/components/pack/PackArt";
import { Button, ProgressBar } from "@/components/ui";
import { useHydrated } from "@/hooks/useHydrated";
import { useNow } from "@/hooks/useNow";
import { formatCountdown, msUntilNextReset } from "@/lib/dates";
import { isSeriesComplete, isSeriesPlayable, progressOf } from "@/lib/progress";
import { PACKS_PER_DAY } from "@/lib/state";
import { useProgress } from "@/store/useProgress";

function Countdown() {
  const now = useNow();
  return (
    <span className="font-mono tabular-nums" suppressHydrationWarning>
      {now === null ? "--:--:--" : formatCountdown(msUntilNextReset(new Date(now)))}
    </span>
  );
}

function Skeleton() {
  return (
    <div aria-hidden="true" className="space-y-6">
      <div className="h-52 animate-pulse rounded-brutal-lg border-brutal bg-cream-dark" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-brutal-lg border-brutal bg-cream-dark" />
        ))}
      </div>
    </div>
  );
}

/**
 * Parte dinámica del inicio: sobres de hoy, cuenta atrás y series para abrir.
 * @param {{ series: Array<{id, name, color, tagline, status, requires, iconNode}>, cardIdsBySeries: Record<string, string[]> }} props
 */
export function HomeDashboard({ series, cardIdsBySeries }) {
  const hydrated = useHydrated();
  const packs = useProgress((s) => s.packs.available);
  const cards = useProgress((s) => s.cards);

  if (!hydrated) return <Skeleton />;

  const playable = series
    .filter((s) => isSeriesPlayable(s, cardIdsBySeries, cards))
    .map((s) => ({ ...s, progress: progressOf(cardIdsBySeries[s.id] ?? [], cards) }))
    // En progreso primero, luego sin empezar, al final las completadas.
    .sort((a, b) => {
      const rank = (s) =>
        isSeriesComplete(cardIdsBySeries[s.id] ?? [], cards) ? 2 : s.progress.obtained > 0 ? 0 : 1;
      return rank(a) - rank(b);
    });

  return (
    <div className="space-y-12">
      {/* Sobres de hoy */}
      <section aria-labelledby="hoy" className="relative">
        <div className="rounded-brutal-lg border-brutal bg-paper p-5 shadow-brutal-lg sm:p-7">
          <h2 id="hoy" className="font-display text-lg uppercase">
            Sobres de hoy
          </h2>
          <div className="mt-3 flex items-end gap-4">
            <p className="font-display text-7xl leading-none">
              {packs}
              <span className="text-3xl text-ink/50">/{PACKS_PER_DAY}</span>
            </p>
            <div className="flex gap-2 pb-2" aria-hidden="true">
              {Array.from({ length: PACKS_PER_DAY }, (_, i) => (
                <span
                  key={i}
                  className={`grid size-11 place-items-center rounded-brutal-sm border-brutal ${
                    i < packs ? "bg-yellow shadow-brutal-sm" : "bg-cream-dark opacity-60"
                  }`}
                >
                  <Package size={22} strokeWidth={2.5} />
                </span>
              ))}
            </div>
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm font-bold">
            <Clock size={16} aria-hidden="true" />
            {packs > 0 ? "Se reinician en" : "Vuelve en"} <Countdown />
          </p>
          <div className="mt-5">
            {packs > 0 ? (
              <Button href="#elegir" size="lg" color="pink" className="w-full sm:w-auto">
                <Package size={24} aria-hidden="true" /> Abrir sobre
                <ArrowDown size={20} aria-hidden="true" />
              </Button>
            ) : (
              <Button size="lg" color="paper" disabled className="w-full sm:w-auto">
                Sin sobres hasta mañana
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Series */}
      <section id="elegir" aria-labelledby="elegir-titulo" className="scroll-mt-24 space-y-5">
        <h2 id="elegir-titulo" className="font-display text-2xl uppercase sm:text-3xl">
          <span className="mr-2 inline-block bg-ink px-2 text-cream">#</span>
          Elige una serie
        </h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {playable.map((s) => {
            const done = s.progress.evolved === s.progress.total;
            return (
              <li key={s.id}>
                <Link
                  href={`/abrir/${s.id}`}
                  className="press flex h-full gap-4 rounded-brutal-lg border-brutal bg-paper p-4"
                  aria-label={`Abrir sobre de ${s.name}. ${s.progress.obtained} de ${s.progress.total} obtenidas, ${s.progress.evolved} evolucionadas.`}
                >
                  <PackArt series={s} iconNode={s.iconNode} className="w-[72px] shrink-0" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div>
                      <p className="font-display text-xl uppercase leading-tight">{s.name}</p>
                      <p className="text-sm">{s.tagline}</p>
                    </div>
                    <ProgressBar
                      value={s.progress.evolved}
                      max={s.progress.total}
                      color={done ? "yellow" : "teal"}
                      className="mt-auto"
                    />
                    <p className="font-mono text-xs font-bold">
                      {s.progress.obtained}/{s.progress.total} obtenidas · {s.progress.evolved} evolucionadas
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
