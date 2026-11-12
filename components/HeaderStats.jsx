"use client";

import { Gem, Package } from "lucide-react";
import { useHydrated } from "@/hooks/useHydrated";
import { useProgress } from "@/store/useProgress";

function Chip({ icon: Icon, value, label, color }) {
  return (
    <span
      className={`inline-flex h-9 items-center gap-1.5 rounded-brutal-sm border-brutal px-2.5 font-display text-sm shadow-brutal-sm ${color}`}
      title={label}
    >
      <Icon size={16} strokeWidth={2.5} aria-hidden="true" />
      <span className="min-w-[1.5ch] text-center">{value}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Sobres y fragmentos del usuario (isla cliente). Skeleton hasta cargar el progreso. */
export function HeaderStats() {
  const hydrated = useHydrated();
  const packs = useProgress((s) => s.packs.available);
  const shards = useProgress((s) => s.shards);

  if (!hydrated) {
    return (
      <div className="flex gap-2" aria-hidden="true">
        <span className="h-9 w-14 animate-pulse rounded-brutal-sm border-brutal bg-cream-dark" />
        <span className="h-9 w-16 animate-pulse rounded-brutal-sm border-brutal bg-cream-dark" />
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Chip icon={Package} value={packs} label={`${packs} sobres disponibles hoy`} color="bg-yellow" />
      <Chip icon={Gem} value={shards} label={`${shards} fragmentos`} color="bg-lilac" />
    </div>
  );
}
