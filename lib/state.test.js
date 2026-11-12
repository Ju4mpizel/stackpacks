import { describe, expect, it } from "vitest";
import { createRng } from "./packs";
import {
  applyDailyReset,
  applyDocOpened,
  applyEvolve,
  applyOpenPack,
  applyRedeem,
  applyToggleShowcase,
  createInitialState,
  migrateProgress,
  PACKS_PER_DAY,
  pickPersisted,
} from "./state";

const DAY1 = new Date(2026, 10, 11, 10, 0);
const DAY1_NIGHT = new Date(2026, 10, 11, 23, 59);
const DAY2 = new Date(2026, 10, 12, 0, 1);
const CARDS = [
  { id: "a", stage: 1, rarity: "common" },
  { id: "b", stage: 1, rarity: "legendary" },
  { id: "c", stage: 2, rarity: "rare" },
];

describe("reinicio diario", () => {
  it("da 2 sobres el primer día y fija la fecha", () => {
    const s = applyDailyReset(createInitialState(), DAY1);
    expect(s.packs).toEqual({ available: PACKS_PER_DAY, lastReset: "2026-11-11" });
  });

  it("no regala sobres extra el mismo día", () => {
    let s = applyDailyReset(createInitialState(), DAY1);
    s = { ...s, packs: { ...s.packs, available: 0 } };
    expect(applyDailyReset(s, DAY1_NIGHT)).toBe(s);
  });

  it("al cambiar de día vuelve a 2 (no se acumulan)", () => {
    const s = { ...createInitialState(), packs: { available: 1, lastReset: "2026-11-11" } };
    expect(applyDailyReset(s, DAY2).packs).toEqual({ available: 2, lastReset: "2026-11-12" });
  });
});

describe("abrir sobre", () => {
  it("añade cartas nuevas y gasta un sobre", () => {
    const { state, opened } = applyOpenPack(createInitialState(), CARDS, createRng(1), DAY1);
    expect(opened).toHaveLength(2);
    expect(opened.every((o) => o.isNew)).toBe(true);
    expect(Object.keys(state.cards)).toHaveLength(2);
    expect(state.packs.available).toBe(1);
    expect(state.stats.packsOpened).toBe(1);
    expect(state.cards[opened[0].id]).toMatchObject({ copies: 1, docOpened: false, evolved: false });
  });

  it("las repetidas suman copias y fragmentos según su rareza", () => {
    const owned = { obtainedAt: "x", copies: 1, docOpened: false, evolved: false };
    const start = { ...createInitialState(), cards: { a: owned, b: owned, c: owned } };
    const { state, opened } = applyOpenPack(start, CARDS, createRng(4), DAY1);
    const expected = opened.reduce((n, o) => n + { a: 5, b: 80, c: 20 }[o.id], 0);
    expect(opened.every((o) => !o.isNew)).toBe(true);
    expect(state.shards).toBe(expected);
    for (const o of opened) expect(state.cards[o.id].copies).toBe(2);
  });

  it("no abre si no quedan sobres hoy", () => {
    const start = { ...createInitialState(), packs: { available: 0, lastReset: "2026-11-11" } };
    const res = applyOpenPack(start, CARDS, createRng(1), DAY1);
    expect(res.opened).toBe(null);
    expect(res.state).toBe(start);
  });

  it("aplica el reinicio antes de abrir", () => {
    const start = { ...createInitialState(), packs: { available: 0, lastReset: "2026-11-11" } };
    const res = applyOpenPack(start, CARDS, createRng(1), DAY2);
    expect(res.opened).toHaveLength(2);
    expect(res.state.packs).toEqual({ available: 1, lastReset: "2026-11-12" });
  });
});

describe("evolución", () => {
  const withCard = { ...createInitialState(), cards: { a: { copies: 1, docOpened: false, evolved: false } } };

  it("no se puede evolucionar sin abrir la documentación", () => {
    expect(applyEvolve(withCard, "a").ok).toBe(false);
  });

  it("documentación → quiz → evolucionada", () => {
    const s1 = applyDocOpened(withCard, "a");
    expect(s1.cards.a.docOpened).toBe(true);
    const { state, ok } = applyEvolve(s1, "a", DAY1);
    expect(ok).toBe(true);
    expect(state.cards.a.evolved).toBe(true);
  });

  it("no evoluciona cartas que no tienes", () => {
    expect(applyEvolve(withCard, "zzz").ok).toBe(false);
    expect(applyDocOpened(withCard, "zzz")).toBe(withCard);
  });
});

describe("canje", () => {
  it("cuesta el doble de lo que da la repetida", () => {
    const start = { ...createInitialState(), shards: 45 };
    const { state, ok } = applyRedeem(start, { id: "c", rarity: "rare" }, DAY1);
    expect(ok).toBe(true);
    expect(state.shards).toBe(5);
    expect(state.cards.c).toMatchObject({ copies: 1, evolved: false });
  });

  it("falla sin fragmentos suficientes o si ya la tienes", () => {
    const start = { ...createInitialState(), shards: 10, cards: { a: { copies: 1 } } };
    expect(applyRedeem(start, { id: "c", rarity: "rare" }).reason).toBe("insufficient");
    expect(applyRedeem(start, { id: "a", rarity: "common" }).reason).toBe("owned");
  });
});

describe("vitrina", () => {
  it("añade y quita, máximo 6 y solo cartas obtenidas", () => {
    const cards = Object.fromEntries(["1", "2", "3", "4", "5", "6", "7"].map((id) => [id, { copies: 1 }]));
    let s = { ...createInitialState(), cards };
    for (const id of ["1", "2", "3", "4", "5", "6", "7"]) s = applyToggleShowcase(s, id);
    expect(s.profile.showcase).toEqual(["1", "2", "3", "4", "5", "6"]);
    s = applyToggleShowcase(s, "3");
    expect(s.profile.showcase).not.toContain("3");
    expect(applyToggleShowcase(s, "nope").profile.showcase).toHaveLength(5);
  });
});

describe("migración", () => {
  it("convierte la lista de ids de la v0 en el mapa de cartas", () => {
    const migrated = migrateProgress({ cards: ["js-fetch"], shards: 30 }, 0);
    expect(migrated.cards["js-fetch"]).toMatchObject({ copies: 1, evolved: false });
    expect(migrated.shards).toBe(30);
    expect(migrated.packs.available).toBe(PACKS_PER_DAY);
  });

  it("rellena campos ausentes y corrige valores inválidos", () => {
    const migrated = migrateProgress({ shards: -5, profile: { name: "Ana" } }, 0);
    expect(migrated.shards).toBe(0);
    expect(migrated.profile).toMatchObject({ name: "Ana", showcase: [] });
    expect(migrated.stats.packsOpened).toBe(0);
  });

  it("tolera datos nulos", () => {
    expect(migrateProgress(null, 0)).toEqual(createInitialState());
  });

  it("pickPersisted guarda solo los datos", () => {
    const s = { ...createInitialState(), openPack: () => {} };
    expect(Object.keys(pickPersisted(s)).sort()).toEqual(
      ["cards", "packs", "pityCounter", "profile", "shards", "stats"].sort(),
    );
  });
});
