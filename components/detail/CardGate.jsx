"use client";

import { Lock, Package } from "lucide-react";
import { Button } from "@/components/ui";
import { useHydrated } from "@/hooks/useHydrated";
import { useProgress } from "@/store/useProgress";

/** Muestra el contenido de la carta solo si el usuario la tiene. */
export function CardGate({ cardId, seriesId, seriesName, children }) {
  const hydrated = useHydrated();
  const owned = useProgress((s) => Boolean(s.cards[cardId]));

  if (!hydrated) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="h-10 w-2/3 animate-pulse rounded-brutal-sm bg-cream-dark" />
        <div className="h-24 animate-pulse rounded-brutal border-brutal bg-cream-dark" />
        <div className="h-40 animate-pulse rounded-brutal border-brutal bg-cream-dark" />
      </div>
    );
  }

  if (!owned) {
    return (
      <div className="rounded-brutal-lg border-brutal bg-paper p-6 shadow-brutal">
        <Lock size={32} strokeWidth={2.5} aria-hidden="true" />
        <h1 className="mt-3 font-display text-2xl uppercase">Carta sin descubrir</h1>
        <p className="mt-2">
          Todavía no tienes esta carta de {seriesName}. Consíguela abriendo sobres o canjéala con fragmentos.
        </p>
        <Button href={`/abrir/${seriesId}`} color="pink" className="mt-5">
          <Package size={18} aria-hidden="true" /> Abrir sobre de {seriesName}
        </Button>
      </div>
    );
  }

  return children;
}
