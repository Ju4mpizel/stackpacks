"use client";

// Progreso del usuario con Zustand + persist (localStorage).
// skipHydration: el estado guardado se carga DESPUÉS de montar (ver ProgressRuntime), así el
// primer render del cliente coincide con el del servidor y no hay errores de hidratación.
// Usa useHydrated() antes de mostrar nada que dependa de este store.

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  applyDailyReset,
  applyDocOpened,
  applyEvolve,
  applyOpenPack,
  applyRedeem,
  applyToggleShowcase,
  createInitialState,
  migrateProgress,
  pickPersisted,
  STATE_VERSION,
} from "@/lib/state";

export const useProgress = create(
  persist(
    (set, get) => ({
      ...createInitialState(),

      /** Reinicia los sobres si cambió el día local. */
      ensureDailyReset: (now = new Date()) => {
        const next = applyDailyReset(get(), now);
        if (next !== get()) set(next);
      },

      /**
       * Abre un sobre de una serie.
       * @param {Array<{id, stage, rarity}>} seriesCards  catálogo mínimo de la serie
       * @returns {null | { opened: Array<{id, isNew, shards}>, pityTriggered: boolean }}
       */
      openPack: (seriesCards, rng = Math.random, now = new Date()) => {
        const { state, opened, pityTriggered } = applyOpenPack(get(), seriesCards, rng, now);
        set(pickPersisted(state));
        return opened ? { opened, pityTriggered } : null;
      },

      markDocOpened: (cardId) => set((s) => pickPersisted(applyDocOpened(s, cardId))),

      /** @returns {boolean} si la carta evolucionó */
      evolveCard: (cardId, now = new Date()) => {
        const { state, ok } = applyEvolve(get(), cardId, now);
        if (ok) set(pickPersisted(state));
        return ok;
      },

      /** @param {{id, rarity}} card  @returns {{ ok, reason? }} */
      redeemCard: (card, now = new Date()) => {
        const { state, ok, reason } = applyRedeem(get(), card, now);
        if (ok) set(pickPersisted(state));
        return { ok, reason };
      },

      toggleShowcase: (cardId) => set((s) => pickPersisted(applyToggleShowcase(s, cardId))),

      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),

      resetProgress: () => set(createInitialState()),
    }),
    {
      name: "stackpacks-progress",
      version: STATE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: pickPersisted,
      migrate: migrateProgress,
      skipHydration: true,
    },
  ),
);
