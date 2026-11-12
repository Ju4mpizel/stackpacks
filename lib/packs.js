// Sorteo de sobres. Función pura: mismo RNG → mismo resultado.

import { RARITY_ORDER } from "./cards.js";

export const CARDS_PER_PACK = 2;
export const NEXT_STAGE_CHANCE = 0.15;
export const DUPLICATE_CHANCE = 0.04; // dentro del 0–5 % de la guía
export const PITY_THRESHOLD = 4; // tras 4 sobres sin rara o superior, el siguiente la garantiza

const RARE_INDEX = RARITY_ORDER.indexOf("rare");
export const isRareOrBetter = (card) => RARITY_ORDER.indexOf(card.rarity) >= RARE_INDEX;

/** RNG determinista (mulberry32) para tests y simulaciones. Devuelve () => [0, 1). */
export function createRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (list, rng) => list[Math.floor(rng() * list.length)];

/** Etapa actual: la más baja con alguna carta sin obtener. `null` si están todas. */
export function currentStage(seriesCards, owned) {
  let stage = null;
  for (const card of seriesCards) {
    if (!owned.has(card.id) && (stage === null || card.stage < stage)) stage = card.stage;
  }
  return stage;
}

/**
 * Sortea un sobre de una serie.
 *
 * @param {Array<{id: string, stage: number, rarity: string}>} seriesCards  cartas de la serie
 * @param {Record<string, unknown>} userCards  cartas del usuario (solo importan las claves)
 * @param {() => number} [rng]  generador [0, 1); inyectable para tests
 * @param {object} [options]
 * @param {number} [options.pityCounter]  sobres seguidos sin rara o superior
 * @param {number} [options.cardsPerPack]
 * @param {number} [options.nextStageChance]
 * @param {number} [options.duplicateChance]
 * @returns {{ cardIds: string[], pityCounter: number, pityTriggered: boolean }}
 */
export function drawPack(seriesCards, userCards = {}, rng = Math.random, options = {}) {
  const {
    pityCounter = 0,
    cardsPerPack = CARDS_PER_PACK,
    nextStageChance = NEXT_STAGE_CHANCE,
    duplicateChance = DUPLICATE_CHANCE,
  } = options;

  if (!seriesCards.length) return { cardIds: [], pityCounter, pityTriggered: false };

  const byId = new Map(seriesCards.map((c) => [c.id, c]));
  const originallyOwned = new Set(Object.keys(userCards).filter((id) => byId.has(id)));
  const maxStage = Math.max(...seriesCards.map((c) => c.stage));
  const drawn = [];

  for (let slot = 0; slot < Math.min(cardsPerPack, seriesCards.length); slot++) {
    // Las cartas ya sacadas en este sobre cuentan como obtenidas para la etapa,
    // pero nunca se repiten dentro del mismo sobre.
    const owned = new Set([...originallyOwned, ...drawn]);
    const inPack = new Set(drawn);

    let stage = currentStage(seriesCards, owned);
    let group;
    if (stage === null) {
      // Serie completa: cualquier carta (todas serán repetidas).
      group = seriesCards;
    } else {
      group = seriesCards.filter((c) => c.stage === stage);
      if (stage < maxStage && rng() < nextStageChance) {
        // Adelanto de la etapa siguiente, solo si allí quedan cartas nuevas: si no,
        // daría una repetida habiendo nuevas en la etapa actual.
        const next = seriesCards.filter((c) => c.stage === stage + 1);
        if (next.some((c) => !owned.has(c.id) && !inPack.has(c.id))) group = next;
      }
    }
    group = group.filter((c) => !inPack.has(c.id));
    if (!group.length) group = seriesCards.filter((c) => !inPack.has(c.id));

    const fresh = group.filter((c) => !owned.has(c.id));
    const repeats = group.filter((c) => owned.has(c.id));

    let card;
    if (fresh.length && repeats.length && rng() < duplicateChance) card = pick(repeats, rng);
    else if (fresh.length) card = pick(fresh, rng);
    else card = pick(repeats, rng);

    drawn.push(card.id);
  }

  // Garantía: si toca y no salió nada raro o superior, se cambia la última carta por una rara+.
  let pityTriggered = false;
  const hasRare = () => drawn.some((id) => isRareOrBetter(byId.get(id)));
  if (pityCounter >= PITY_THRESHOLD && !hasRare()) {
    const replacement = pickPityCard(seriesCards, originallyOwned, new Set(drawn), rng);
    if (replacement) {
      drawn[drawn.length - 1] = replacement.id;
      pityTriggered = true;
    }
  }

  return { cardIds: drawn, pityCounter: hasRare() ? 0 : pityCounter + 1, pityTriggered };
}

/**
 * Carta rara+ para la garantía, por orden de preferencia:
 * 1) nueva de la etapa actual o la siguiente, 2) nueva de la etapa más baja disponible,
 * 3) repetida de la etapa actual, 4) cualquier rara+.
 */
function pickPityCard(seriesCards, owned, inPack, rng) {
  const rares = seriesCards.filter((c) => isRareOrBetter(c) && !inPack.has(c.id));
  if (!rares.length) return null;

  const stage = currentStage(seriesCards, owned);
  const fresh = rares.filter((c) => !owned.has(c.id));
  const near = fresh.filter((c) => stage !== null && (c.stage === stage || c.stage === stage + 1));
  if (near.length) return pick(near, rng);
  if (fresh.length) {
    const lowest = Math.min(...fresh.map((c) => c.stage));
    return pick(
      fresh.filter((c) => c.stage === lowest),
      rng,
    );
  }
  const repeatsHere = rares.filter((c) => stage !== null && c.stage === stage);
  return pick(repeatsHere.length ? repeatsHere : rares, rng);
}
