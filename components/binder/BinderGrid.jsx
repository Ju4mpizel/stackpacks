"use client";

import Link from "next/link";
import { memo } from "react";
import { useHydrated } from "@/hooks/useHydrated";
import { cardState } from "@/lib/progress";
import { useProgress } from "@/store/useProgress";

/**
 * Una casilla del binder. `card` (Card state="dynamic") y `silhouette` llegan ya renderizados
 * desde el servidor; aquí solo se decide cuál mostrar. memo: al cambiar el progreso solo se
 * vuelven a pintar las casillas cuyo estado cambió.
 */
const BinderSlot = memo(function BinderSlot({ id, title, state, card, silhouette }) {
  if (state === "silhouette") return silhouette;
  return (
    <Link
      href={`/carta/${id}`}
      data-card-state={state}
      className="block rounded-[10px]"
      aria-label={`${title}: ${state === "evolved" ? "evolucionada" : "sin evolucionar, estúdiala"}`}
    >
      {card}
    </Link>
  );
});

/**
 * @param {{ stages: Array<{ stage: number, slots: Array<{ id, title, card, silhouette }> }> }} props
 */
export function BinderGrid({ stages }) {
  const hydrated = useHydrated();
  const cards = useProgress((s) => s.cards);

  return (
    <div className="space-y-10">
      {stages.map(({ stage, slots }) => {
        const got = hydrated ? slots.filter((s) => cards[s.id]).length : 0;
        return (
          <section key={stage} aria-labelledby={`etapa-${stage}`}>
            <div className="mb-4 flex items-baseline justify-between gap-3 border-b-[3px] border-ink pb-2">
              <h2 id={`etapa-${stage}`} className="font-display text-xl uppercase">
                Etapa {stage}
              </h2>
              <span className="font-mono text-sm font-bold" aria-label={`${got} de ${slots.length} obtenidas`}>
                {hydrated ? `${got}/${slots.length}` : "–"}
              </span>
            </div>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-5 lg:grid-cols-5">
              {slots.map((slot) => (
                <li key={slot.id} className={hydrated ? undefined : "animate-pulse opacity-50"}>
                  <BinderSlot
                    id={slot.id}
                    title={slot.title}
                    state={hydrated ? cardState(cards, slot.id) : "silhouette"}
                    card={slot.card}
                    silhouette={slot.silhouette}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
