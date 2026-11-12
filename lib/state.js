// Estado del usuario: forma, migraciones y transiciones puras.
// El store de Zustand (store/useProgress.js) solo conecta estas funciones.

import { localDateKey, needsDailyReset } from "./dates.js";
import { drawPack } from "./packs.js";
import { redeemCost, shardsForDuplicate } from "./shards.js";

export const STATE_VERSION = 1;
export const PACKS_PER_DAY = 2;
export const SHOWCASE_SIZE = 6;
export const AVATAR_COLORS = ["#FFD23F", "#FF6B9E", "#3BCEAC", "#4D7CFE", "#FF8C42", "#B28DFF"];

/** Campos que se guardan en localStorage. */
export const PERSISTED_KEYS = ["cards", "shards", "packs", "profile", "pityCounter", "stats"];

export function createInitialState() {
  return {
    cards: {},
    shards: 0,
    packs: { available: PACKS_PER_DAY, lastReset: null },
    profile: { name: "", avatarColor: AVATAR_COLORS[0], showcase: [] },
    pityCounter: 0,
    stats: { packsOpened: 0 },
  };
}

/** Rellena con valores por defecto lo que falte (datos antiguos o corruptos). */
function withDefaults(data) {
  const base = createInitialState();
  const src = data && typeof data === "object" ? data : {};
  return {
    cards: src.cards && typeof src.cards === "object" ? src.cards : base.cards,
    shards: Number.isFinite(src.shards) ? Math.max(0, src.shards) : base.shards,
    packs: { ...base.packs, ...(src.packs ?? {}) },
    profile: { ...base.profile, ...(src.profile ?? {}) },
    pityCounter: Number.isFinite(src.pityCounter) ? src.pityCounter : base.pityCounter,
    stats: { ...base.stats, ...(src.stats ?? {}) },
  };
}

/**
 * Migra datos guardados con una versión anterior.
 * Cada cambio de estructura sube STATE_VERSION y añade aquí su paso `if (version < N)`.
 */
export function migrateProgress(persisted, version) {
  let data = persisted && typeof persisted === "object" ? { ...persisted } : {};
  if (version < 1) {
    // v0 (prototipos): `cards` era una lista de ids obtenidos.
    if (Array.isArray(data.cards)) {
      data.cards = Object.fromEntries(
        data.cards.map((id) => [id, { obtainedAt: null, copies: 1, docOpened: false, evolved: false }]),
      );
    }
  }
  return withDefaults(data);
}

export function pickPersisted(state) {
  return Object.fromEntries(PERSISTED_KEYS.map((k) => [k, state[k]]));
}

/** Reinicia los sobres diarios si cambió el día local. Devuelve el mismo objeto si no hay cambios. */
export function applyDailyReset(state, now = new Date()) {
  if (!needsDailyReset(state.packs.lastReset, now)) return state;
  return { ...state, packs: { available: PACKS_PER_DAY, lastReset: localDateKey(now) } };
}

/**
 * Abre un sobre: aplica el reinicio diario, sortea y guarda el resultado.
 * @param {Array<{id, stage, rarity}>} seriesCards
 * @returns {{ state, opened: null | Array<{ id, isNew, shards }>, pityTriggered?: boolean }}
 */
export function applyOpenPack(state, seriesCards, rng = Math.random, now = new Date()) {
  const s = applyDailyReset(state, now);
  if (s.packs.available <= 0 || !seriesCards.length) return { state: s, opened: null };

  const draw = drawPack(seriesCards, s.cards, rng, { pityCounter: s.pityCounter });
  const byId = new Map(seriesCards.map((c) => [c.id, c]));
  const cards = { ...s.cards };
  let shards = s.shards;
  const opened = draw.cardIds.map((id) => {
    const existing = cards[id];
    if (!existing) {
      cards[id] = { obtainedAt: now.toISOString(), copies: 1, docOpened: false, evolved: false };
      return { id, isNew: true, shards: 0 };
    }
    const gained = shardsForDuplicate(byId.get(id).rarity);
    cards[id] = { ...existing, copies: existing.copies + 1 };
    shards += gained;
    return { id, isNew: false, shards: gained };
  });

  return {
    state: {
      ...s,
      cards,
      shards,
      pityCounter: draw.pityCounter,
      packs: { ...s.packs, available: s.packs.available - 1 },
      stats: { ...s.stats, packsOpened: s.stats.packsOpened + 1 },
    },
    opened,
    pityTriggered: draw.pityTriggered,
  };
}

/** Marca que se abrió la documentación (habilita el quiz). */
export function applyDocOpened(state, cardId) {
  const entry = state.cards[cardId];
  if (!entry || entry.docOpened) return state;
  return { ...state, cards: { ...state.cards, [cardId]: { ...entry, docOpened: true } } };
}

/** Evoluciona una carta: exige tenerla y haber abierto la documentación. */
export function applyEvolve(state, cardId, now = new Date()) {
  const entry = state.cards[cardId];
  if (!entry || !entry.docOpened || entry.evolved) return { state, ok: false };
  return {
    state: { ...state, cards: { ...state.cards, [cardId]: { ...entry, evolved: true, evolvedAt: now.toISOString() } } },
    ok: true,
  };
}

/**
 * Canjea una carta que falta con fragmentos.
 * @returns {{ state, ok: boolean, reason?: "owned" | "insufficient" }}
 */
export function applyRedeem(state, card, now = new Date()) {
  if (state.cards[card.id]) return { state, ok: false, reason: "owned" };
  const cost = redeemCost(card.rarity);
  if (state.shards < cost) return { state, ok: false, reason: "insufficient" };
  return {
    state: {
      ...state,
      shards: state.shards - cost,
      cards: {
        ...state.cards,
        [card.id]: { obtainedAt: now.toISOString(), copies: 1, docOpened: false, evolved: false, redeemed: true },
      },
    },
    ok: true,
  };
}

/** Añade o quita una carta de la vitrina (máx. 6, solo cartas obtenidas). */
export function applyToggleShowcase(state, cardId) {
  const showcase = state.profile.showcase;
  if (showcase.includes(cardId)) {
    return { ...state, profile: { ...state.profile, showcase: showcase.filter((id) => id !== cardId) } };
  }
  if (!state.cards[cardId] || showcase.length >= SHOWCASE_SIZE) return state;
  return { ...state, profile: { ...state.profile, showcase: [...showcase, cardId] } };
}
