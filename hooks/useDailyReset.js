"use client";

import { useEffect } from "react";
import { msUntilNextReset } from "@/lib/dates";
import { useProgress } from "@/store/useProgress";
import { useHydrated } from "./useHydrated";

/**
 * Mantiene al día los sobres diarios: comprueba al cargar, a la medianoche local
 * y al volver a la pestaña (el temporizador puede dormirse con el móvil bloqueado).
 */
export function useDailyReset() {
  const hydrated = useHydrated();
  const ensureDailyReset = useProgress((s) => s.ensureDailyReset);

  useEffect(() => {
    if (!hydrated) return;
    let timer;
    const check = () => {
      ensureDailyReset();
      clearTimeout(timer);
      // +1 s de margen para caer ya en el día nuevo
      timer = setTimeout(check, msUntilNextReset() + 1000);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };

    check();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [hydrated, ensureDailyReset]);
}
