"use client";

import { useSyncExternalStore } from "react";
import { useProgress } from "@/store/useProgress";

const subscribe = (onChange) => useProgress.persist.onFinishHydration(onChange);
const getSnapshot = () => useProgress.persist.hasHydrated();
const getServerSnapshot = () => false;

/**
 * `true` cuando el progreso guardado ya se cargó de localStorage.
 * En el servidor y en el primer render del cliente es `false`: muestra un skeleton.
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
