#!/usr/bin/env node
// Simula jugadores constantes para ver el ritmo del sorteo con las cartas reales.
// Supuesto: abre sus 2 sobres diarios en la misma serie, evoluciona todo lo que obtiene
// y canjea con fragmentos la carta que le falta más barata en cuanto puede.
// Uso: pnpm simulate [runs]

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRng, isRareOrBetter } from "../lib/packs.js";
import { redeemCost } from "../lib/shards.js";
import { applyOpenPack, applyRedeem, createInitialState, PACKS_PER_DAY } from "../lib/state.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runs = Number(process.argv[2]) || 300;
const cardsDir = path.join(root, "data", "cards");

const pct = (n) => `${(n * 100).toFixed(1)} %`;
const rows = [];

for (const file of (await readdir(cardsDir)).filter((f) => f.endsWith(".json")).sort()) {
  const cards = JSON.parse(await readFile(path.join(cardsDir, file), "utf8"));
  const days = [];
  let packs = 0;
  let dupes = 0;
  let avoidableDupes = 0;
  let drawnTotal = 0;
  let pityHits = 0;
  let maxDryStreak = 0;
  let redeemed = 0;

  for (let run = 0; run < runs; run++) {
    const rng = createRng(run * 7919 + file.length);
    let state = createInitialState();
    let day = 0;
    let dry = 0;
    while (Object.keys(state.cards).length < cards.length && day < 365) {
      const now = new Date(2026, 0, 1 + day, 12);
      for (let p = 0; p < PACKS_PER_DAY; p++) {
        const res = applyOpenPack(state, cards, rng, now);
        if (!res.opened) break;
        state = res.state;
        packs++;
        drawnTotal += res.opened.length;
        const dupesHere = res.opened.filter((o) => !o.isNew).length;
        dupes += dupesHere;
        // Evitable: salió repetida y, aun así, siguen faltando cartas de la serie.
        if (Object.keys(state.cards).length < cards.length) avoidableDupes += dupesHere;
        if (res.pityTriggered) pityHits++;
        const gotRare = res.opened.some((o) => isRareOrBetter(cards.find((c) => c.id === o.id)));
        dry = gotRare ? 0 : dry + 1;
        maxDryStreak = Math.max(maxDryStreak, dry);
      }
      // Canje: la carta que falte más barata, si llega.
      const missing = cards
        .filter((c) => !state.cards[c.id])
        .sort((a, b) => redeemCost(a.rarity) - redeemCost(b.rarity));
      if (missing.length && state.shards >= redeemCost(missing[0].rarity)) {
        state = applyRedeem(state, missing[0], now).state;
        redeemed++;
      }
      day++;
    }
    days.push(day);
  }

  days.sort((a, b) => a - b);
  const avg = days.reduce((a, b) => a + b, 0) / days.length;
  rows.push({
    serie: path.basename(file, ".json"),
    cartas: cards.length,
    "días (media)": avg.toFixed(1),
    "días (p10–p90)": `${days[Math.floor(runs * 0.1)]}–${days[Math.floor(runs * 0.9)]}`,
    "repetidas (total)": pct(dupes / drawnTotal),
    "repetidas con nuevas disponibles": pct(avoidableDupes / drawnTotal),
    "garantía activada": pct(pityHits / packs),
    "máx. sobres sin rara": maxDryStreak,
    "canjes/partida": (redeemed / runs).toFixed(2),
  });
}

console.log(`Simulación: ${runs} partidas por serie, ${PACKS_PER_DAY} sobres al día en la misma serie.\n`);
console.table(rows);
