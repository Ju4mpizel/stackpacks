import "server-only";
// Acceso al contenido de /data. Solo en servidor: el JSON completo nunca llega al cliente,
// a los Client Components se les pasa únicamente lo que necesitan.

import seriesData from "@/data/series.json";
import css from "@/data/cards/css.json";
import git from "@/data/cards/git.json";
import html from "@/data/cards/html.json";
import javascript from "@/data/cards/javascript.json";
import python from "@/data/cards/python.json";
import sql from "@/data/cards/sql.json";

const CARDS_BY_SERIES = { html, css, javascript, python, git, sql };

const seriesById = new Map(seriesData.map((s) => [s.id, s]));
const cardIndex = new Map();
for (const [seriesId, cards] of Object.entries(CARDS_BY_SERIES)) {
  cards.forEach((card, i) => {
    cardIndex.set(card.id, { card, series: seriesById.get(seriesId), number: i + 1, total: cards.length });
  });
}

export function getAllSeries() {
  return seriesData;
}

export function getSeries(id) {
  return seriesById.get(id) ?? null;
}

export function getSeriesCards(seriesId) {
  return CARDS_BY_SERIES[seriesId] ?? [];
}

/** @returns {{ card, series, number, total } | null} */
export function getCardEntry(cardId) {
  return cardIndex.get(cardId) ?? null;
}

export function getAllCardIds() {
  return [...cardIndex.keys()];
}
