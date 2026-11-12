import { describe, expect, it } from "vitest";
import {
  cardState,
  categoryProgress,
  isSeriesComplete,
  isSeriesPlayable,
  isSeriesUnlocked,
  newlyUnlocked,
  progressOf,
  requirementsStatus,
} from "./progress";
import { redeemCost, shardsForDuplicate } from "./shards";

const SERIES = [
  { id: "html", name: "HTML", tier: 0, requires: [], status: "available" },
  { id: "css", name: "CSS", tier: 0, requires: [], status: "available" },
  { id: "js", name: "JS", tier: 0, requires: [], status: "available" },
  { id: "react", name: "React", tier: 2, requires: ["html", "css", "js"], status: "available" },
  { id: "next", name: "Next", tier: 3, requires: ["react"], status: "coming-soon" },
];
const SERIES_BY_ID = Object.fromEntries(SERIES.map((s) => [s.id, s]));
const IDS = { html: ["h1", "h2"], css: ["c1", "c2"], js: ["j1", "j2", "j3"], react: ["r1"], next: [] };
const obtained = { copies: 1, docOpened: false, evolved: false };
const evolved = { copies: 1, docOpened: true, evolved: true };
const evolve = (...ids) => Object.fromEntries(ids.map((id) => [id, evolved]));

describe("cardState", () => {
  it("distingue silueta, obtenida y evolucionada", () => {
    const user = { a: obtained, b: evolved };
    expect(cardState(user, "x")).toBe("silhouette");
    expect(cardState(user, "a")).toBe("obtained");
    expect(cardState(user, "b")).toBe("evolved");
  });
});

describe("progressOf", () => {
  it("cuenta obtenidas y evolucionadas; pct usa evolucionadas", () => {
    expect(progressOf(["j1", "j2", "j3"], { j1: evolved, j2: obtained })).toEqual({
      total: 3,
      obtained: 2,
      evolved: 1,
      pct: 33,
    });
  });

  it("una lista vacía da 0 %", () => {
    expect(progressOf([], {}).pct).toBe(0);
  });
});

describe("categoryProgress", () => {
  it("agrupa por categoría en orden de aparición", () => {
    const cards = [
      { id: "a", category: "Base" },
      { id: "b", category: "Layout" },
      { id: "c", category: "Base" },
    ];
    expect(categoryProgress(cards, { a: evolved, b: obtained })).toEqual([
      { category: "Base", total: 2, obtained: 1, evolved: 1, pct: 50 },
      { category: "Layout", total: 1, obtained: 1, evolved: 0, pct: 0 },
    ]);
  });
});

describe("completar y desbloquear", () => {
  it("obtener todas no basta: hay que evolucionarlas", () => {
    expect(isSeriesComplete(IDS.html, { h1: obtained, h2: obtained })).toBe(false);
    expect(isSeriesComplete(IDS.html, evolve("h1", "h2"))).toBe(true);
  });

  it("una serie sin cartas nunca está completa", () => {
    expect(isSeriesComplete([], {})).toBe(false);
  });

  it("el nivel 0 está siempre desbloqueado", () => {
    expect(isSeriesUnlocked(SERIES_BY_ID.html, IDS, {})).toBe(true);
  });

  it("React se desbloquea al completar HTML, CSS y JS", () => {
    const almost = evolve("h1", "h2", "c1", "c2", "j1", "j2");
    expect(isSeriesUnlocked(SERIES_BY_ID.react, IDS, almost)).toBe(false);
    expect(isSeriesUnlocked(SERIES_BY_ID.react, IDS, { ...almost, ...evolve("j3") })).toBe(true);
  });

  it("requirementsStatus informa de cada requisito", () => {
    const status = requirementsStatus(SERIES_BY_ID.react, SERIES_BY_ID, IDS, evolve("h1", "h2", "j1"));
    expect(status).toEqual([
      { id: "html", name: "HTML", complete: true, pct: 100 },
      { id: "css", name: "CSS", complete: false, pct: 0 },
      { id: "js", name: "JS", complete: false, pct: 33 },
    ]);
  });

  it("una serie coming-soon no se puede jugar aunque esté desbloqueada", () => {
    expect(isSeriesUnlocked(SERIES_BY_ID.next, IDS, evolve("r1"))).toBe(true);
    expect(isSeriesPlayable(SERIES_BY_ID.next, IDS, evolve("r1"))).toBe(false);
  });

  it("newlyUnlocked detecta qué series se acaban de abrir", () => {
    const before = evolve("h1", "h2", "c1", "c2", "j1", "j2");
    const after = { ...before, ...evolve("j3") };
    expect(newlyUnlocked(SERIES, IDS, before, after)).toEqual(["react"]);
    expect(newlyUnlocked(SERIES, IDS, after, after)).toEqual([]);
  });
});

describe("fragmentos", () => {
  it("dan lo indicado por rareza y canjear cuesta el doble", () => {
    expect(shardsForDuplicate("common")).toBe(5);
    expect(shardsForDuplicate("legendary")).toBe(80);
    expect(redeemCost("rare")).toBe(40);
    expect(redeemCost("epic")).toBe(80);
  });
});
