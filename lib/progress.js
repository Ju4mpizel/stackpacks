// Progreso y desbloqueo. Funciones puras: reciben las cartas del usuario y el catálogo mínimo.
// `userCards` = { [cardId]: { obtainedAt, copies, docOpened, evolved } }

/** @returns {"silhouette" | "obtained" | "evolved"} */
export function cardState(userCards, cardId) {
  const entry = userCards[cardId];
  if (!entry) return "silhouette";
  return entry.evolved ? "evolved" : "obtained";
}

/** Progreso de una lista de ids. `pct` mide cartas EVOLUCIONADAS (es lo que completa la serie). */
export function progressOf(cardIds, userCards) {
  let obtained = 0;
  let evolved = 0;
  for (const id of cardIds) {
    const entry = userCards[id];
    if (entry) obtained++;
    if (entry?.evolved) evolved++;
  }
  const total = cardIds.length;
  return { total, obtained, evolved, pct: total ? Math.round((evolved / total) * 100) : 0 };
}

/** Barras por categoría, en el orden en que aparecen las categorías en la serie. */
export function categoryProgress(seriesCards, userCards) {
  const groups = new Map();
  for (const card of seriesCards) {
    if (!groups.has(card.category)) groups.set(card.category, []);
    groups.get(card.category).push(card.id);
  }
  return [...groups].map(([category, ids]) => ({ category, ...progressOf(ids, userCards) }));
}

/** Completada = TODAS sus cartas evolucionadas. Una serie sin cartas nunca está completa. */
export function isSeriesComplete(cardIds, userCards) {
  return cardIds.length > 0 && cardIds.every((id) => userCards[id]?.evolved);
}

/**
 * Estado de los requisitos de una serie.
 * @param {{requires: string[]}} series
 * @param {Record<string, {name: string}>} seriesById
 * @param {Record<string, string[]>} cardIdsBySeries
 * @returns {Array<{ id, name, complete, pct }>}
 */
export function requirementsStatus(series, seriesById, cardIdsBySeries, userCards) {
  return series.requires.map((id) => {
    const ids = cardIdsBySeries[id] ?? [];
    return {
      id,
      name: seriesById[id]?.name ?? id,
      complete: isSeriesComplete(ids, userCards),
      pct: progressOf(ids, userCards).pct,
    };
  });
}

/** Desbloqueada = todos sus requisitos completados (nivel 0: siempre). */
export function isSeriesUnlocked(series, cardIdsBySeries, userCards) {
  return series.requires.every((id) => isSeriesComplete(cardIdsBySeries[id] ?? [], userCards));
}

/** Se pueden abrir sobres si está desbloqueada y tiene contenido publicado. */
export function isSeriesPlayable(series, cardIdsBySeries, userCards) {
  return series.status === "available" && isSeriesUnlocked(series, cardIdsBySeries, userCards);
}

/**
 * Series que se desbloquean al pasar de `before` a `after` (para animar el árbol).
 * @returns {string[]} ids de series recién desbloqueadas
 */
export function newlyUnlocked(allSeries, cardIdsBySeries, before, after) {
  return allSeries
    .filter((s) => s.requires.length > 0)
    .filter((s) => !isSeriesUnlocked(s, cardIdsBySeries, before) && isSeriesUnlocked(s, cardIdsBySeries, after))
    .map((s) => s.id);
}
