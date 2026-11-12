"use client";

import { useEffect } from "react";
import { useDailyReset } from "@/hooks/useDailyReset";
import { useProgress } from "@/store/useProgress";

/**
 * Isla mínima montada en el layout raíz: carga el progreso guardado tras montar
 * y mantiene el reinicio diario. No renderiza nada.
 */
export function ProgressRuntime() {
  useEffect(() => {
    if (!useProgress.persist.hasHydrated()) useProgress.persist.rehydrate();
  }, []);
  useDailyReset();
  return null;
}
