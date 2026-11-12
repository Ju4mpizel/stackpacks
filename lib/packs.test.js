import { describe, expect, it } from "vitest";
import { createRng, currentStage, drawPack, isRareOrBetter, PITY_THRESHOLD } from "./packs";

// Serie de prueba: 3 etapas × 4 cartas. Etapa 1 sin raras; la rara de la etapa 2 es s2-c.
const R = { 1: ["common", "common", "uncommon", "uncommon"], 2: ["common", "uncommon", "rare", "common"], 3: ["epic", "legendary", "common", "rare"] };
const SERIES = [1, 2, 3].flatMap((stage) =>
  R[stage].map((rarity, i) => ({ id: `s${stage}-${"abcd"[i]}`, stage, rarity })),
);
const own = (...ids) => Object.fromEntries(ids.map((id) => [id, { copies: 1 }]));
const stageOf = (id) => SERIES.find((c) => c.id === id).stage;
const NO_SURPRISES = { nextStageChance: 0, duplicateChance: 0 };

describe("createRng", () => {
  it("es determinista con la misma semilla", () => {
    const a = createRng(42);
    const b = createRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("devuelve valores en [0, 1)", () => {
    const rng = createRng(1);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("currentStage", () => {
  it("es la etapa más baja con cartas sin obtener", () => {
    expect(currentStage(SERIES, new Set())).toBe(1);
    expect(currentStage(SERIES, new Set(["s1-a", "s1-b", "s1-c", "s1-d"]))).toBe(2);
    expect(currentStage(SERIES, new Set(SERIES.map((c) => c.id)))).toBe(null);
  });
});

describe("drawPack", () => {
  it("trae 2 cartas distintas", () => {
    const { cardIds } = drawPack(SERIES, {}, createRng(7));
    expect(cardIds).toHaveLength(2);
    expect(new Set(cardIds).size).toBe(2);
  });

  it("es reproducible con una semilla fija", () => {
    const a = drawPack(SERIES, {}, createRng(123));
    const b = drawPack(SERIES, {}, createRng(123));
    expect(a).toEqual(b);
  });

  it("sin sorpresas, solo saca cartas de la etapa actual", () => {
    for (let seed = 0; seed < 200; seed++) {
      const { cardIds } = drawPack(SERIES, {}, createRng(seed), NO_SURPRISES);
      expect(cardIds.every((id) => stageOf(id) === 1)).toBe(true);
    }
  });

  it("avanza de etapa cuando la actual está completa", () => {
    const { cardIds } = drawPack(SERIES, own("s1-a", "s1-b", "s1-c", "s1-d"), createRng(1), NO_SURPRISES);
    expect(cardIds.every((id) => stageOf(id) === 2)).toBe(true);
  });

  it("las cartas nuevas tienen prioridad sobre las repetidas", () => {
    for (let seed = 0; seed < 200; seed++) {
      const { cardIds } = drawPack(SERIES, own("s1-a", "s1-b"), createRng(seed), NO_SURPRISES);
      expect(cardIds.sort()).toEqual(["s1-c", "s1-d"]);
    }
  });

  it("si en la etapa queda una sola nueva, la otra carta es de la etapa siguiente (que pasa a ser la actual)", () => {
    const { cardIds } = drawPack(SERIES, own("s1-a", "s1-b", "s1-c"), createRng(3), NO_SURPRISES);
    expect(cardIds[0]).toBe("s1-d");
    expect(stageOf(cardIds[1])).toBe(2);
  });

  it("con la serie completa saca repetidas", () => {
    const all = own(...SERIES.map((c) => c.id));
    const { cardIds } = drawPack(SERIES, all, createRng(9));
    expect(cardIds).toHaveLength(2);
    expect(cardIds.every((id) => all[id])).toBe(true);
  });

  it("~15 % de cartas vienen de la etapa siguiente", () => {
    const rng = createRng(2024);
    let next = 0;
    let total = 0;
    for (let i = 0; i < 4000; i++) {
      const { cardIds } = drawPack(SERIES, {}, rng, { duplicateChance: 0 });
      // Solo cuenta la primera carta: la segunda puede avanzar por haber agotado la etapa.
      if (stageOf(cardIds[0]) === 2) next++;
      total++;
    }
    expect(next / total).toBeGreaterThan(0.12);
    expect(next / total).toBeLessThan(0.18);
  });

  it("hay una probabilidad baja de repetida aunque queden nuevas", () => {
    const rng = createRng(77);
    const user = own("s1-a", "s1-b");
    let repeats = 0;
    const N = 5000;
    for (let i = 0; i < N; i++) {
      const { cardIds } = drawPack(SERIES, user, rng, { nextStageChance: 0, cardsPerPack: 1 });
      if (user[cardIds[0]]) repeats++;
    }
    expect(repeats / N).toBeGreaterThan(0.02);
    expect(repeats / N).toBeLessThan(0.06);
  });

  it("el adelanto de etapa no da repetidas si la etapa siguiente ya está completa", () => {
    const user = own("s1-a", "s2-a", "s2-b", "s2-c", "s2-d");
    for (let seed = 0; seed < 300; seed++) {
      const { cardIds } = drawPack(SERIES, user, createRng(seed), { nextStageChance: 1, duplicateChance: 0 });
      expect(cardIds.every((id) => !user[id])).toBe(true);
    }
  });

  it("no ofrece repetidas si duplicateChance es 0 y hay nuevas", () => {
    for (let seed = 0; seed < 300; seed++) {
      const { cardIds } = drawPack(SERIES, own("s1-a"), createRng(seed), NO_SURPRISES);
      expect(cardIds).not.toContain("s1-a");
    }
  });

  it("usa el RNG inyectado", () => {
    const always0 = () => 0;
    const { cardIds } = drawPack(SERIES, {}, always0, NO_SURPRISES);
    expect(cardIds).toEqual(["s1-a", "s1-b"]);
  });

  it("devuelve vacío si la serie no tiene cartas", () => {
    expect(drawPack([], {}, createRng(1)).cardIds).toEqual([]);
  });
});

describe("garantía de rara", () => {
  it("cuenta los sobres sin rara y se reinicia al salir una", () => {
    const a = drawPack(SERIES, {}, createRng(1), { ...NO_SURPRISES, pityCounter: 2 });
    expect(a.pityCounter).toBe(3); // etapa 1 no tiene raras

    const withRare = drawPack(SERIES, own("s1-a", "s1-b", "s1-c", "s1-d", "s2-a", "s2-b", "s2-d"), createRng(1), {
      ...NO_SURPRISES,
      pityCounter: 2,
    });
    expect(withRare.cardIds).toContain("s2-c");
    expect(withRare.pityCounter).toBe(0);
  });

  it(`tras ${PITY_THRESHOLD} sobres sin rara, el siguiente trae al menos una`, () => {
    for (let seed = 0; seed < 200; seed++) {
      const res = drawPack(SERIES, {}, createRng(seed), { ...NO_SURPRISES, pityCounter: PITY_THRESHOLD });
      expect(res.cardIds.some((id) => isRareOrBetter(SERIES.find((c) => c.id === id)))).toBe(true);
      expect(res.pityTriggered).toBe(true);
      expect(res.pityCounter).toBe(0);
      expect(new Set(res.cardIds).size).toBe(2);
    }
  });

  it("la garantía prefiere una rara nueva de la etapa actual o la siguiente", () => {
    const res = drawPack(SERIES, {}, createRng(5), { ...NO_SURPRISES, pityCounter: PITY_THRESHOLD });
    expect(res.cardIds).toContain("s2-c");
  });

  it("simulación: nunca pasan más de 4 sobres seguidos sin rara", () => {
    const rng = createRng(99);
    let user = {};
    let pity = 0;
    let streak = 0;
    for (let i = 0; i < 40; i++) {
      const res = drawPack(SERIES, user, rng, { pityCounter: pity });
      pity = res.pityCounter;
      const gotRare = res.cardIds.some((id) => isRareOrBetter(SERIES.find((c) => c.id === id)));
      streak = gotRare ? 0 : streak + 1;
      expect(streak).toBeLessThanOrEqual(PITY_THRESHOLD);
      user = { ...user, ...own(...res.cardIds) };
    }
  });
});
