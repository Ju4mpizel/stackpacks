import { describe, expect, it } from "vitest";
import { lucideComponentName, validateData } from "./validate-data";

const lucideNames = new Set(["Plug", "Box", "Database"]);
const simpleIconSlugs = new Set(["javascript", "react"]);

function makeCard(i, overrides = {}) {
  return {
    id: `js-c${i}`,
    seriesId: "javascript",
    title: `Carta ${i}`,
    category: "Fundamentos",
    stage: i < 6 ? 1 : 2,
    rarity: "common",
    summary: "Una frase de resumen.",
    keyPoints: ["uno", "dos"],
    example: "const a = 1;",
    docUrl: "https://developer.mozilla.org/es/",
    docLabel: "MDN",
    glyph: "plug",
    quiz: [{ q: "¿Pregunta?", options: ["a", "b", "c"], answer: 1 }],
    ...overrides,
  };
}

function makeData({ cards, series } = {}) {
  return {
    series: series ?? [
      { id: "javascript", name: "JS", tier: 0, requires: [], color: "#FFD23F", icon: "javascript", status: "available" },
      { id: "react", name: "React", tier: 1, requires: ["javascript"], color: "#3BCEAC", icon: "react", status: "coming-soon" },
    ],
    cardsBySeries: { javascript: cards ?? Array.from({ length: 12 }, (_, i) => makeCard(i)) },
    lucideNames,
    simpleIconSlugs,
  };
}

describe("lucideComponentName", () => {
  it("convierte kebab-case a PascalCase", () => {
    expect(lucideComponentName("chart-column")).toBe("ChartColumn");
    expect(lucideComponentName("folder-git-2")).toBe("FolderGit2");
  });
});

describe("validateData", () => {
  it("acepta datos válidos", () => {
    expect(validateData(makeData()).errors).toEqual([]);
  });

  it("detecta ids de carta repetidos", () => {
    const cards = Array.from({ length: 12 }, (_, i) => makeCard(i));
    cards[3].id = cards[2].id;
    expect(validateData(makeData({ cards })).errors.join()).toMatch(/id repetido/);
  });

  it("detecta requires que no existen", () => {
    const data = makeData();
    data.series[1].requires = ["fantasma"];
    expect(validateData(data).errors.join()).toMatch(/requires "fantasma" no existe/);
  });

  it("detecta requires de un nivel igual o superior", () => {
    const data = makeData();
    data.series[1].tier = 0;
    expect(validateData(data).errors.join()).toMatch(/no está en un nivel inferior/);
  });

  it("detecta ciclos en requires", () => {
    const series = [
      { id: "a", name: "A", tier: 1, requires: ["b"], color: "#000000", icon: "react", status: "coming-soon" },
      { id: "b", name: "B", tier: 2, requires: ["a"], color: "#000000", icon: "react", status: "coming-soon" },
    ];
    const { errors } = validateData({ series, cardsBySeries: {}, lucideNames, simpleIconSlugs });
    expect(errors.join()).toMatch(/ciclo/);
  });

  it("detecta answer fuera de rango", () => {
    const cards = Array.from({ length: 12 }, (_, i) => makeCard(i));
    cards[0].quiz[0].answer = 3;
    expect(validateData(makeData({ cards })).errors.join()).toMatch(/fuera de rango/);
  });

  it("exige URLs https", () => {
    const cards = Array.from({ length: 12 }, (_, i) => makeCard(i));
    cards[0].docUrl = "http://example.com";
    expect(validateData(makeData({ cards })).errors.join()).toMatch(/https/);
  });

  it("exige entre 12 y 20 cartas por serie", () => {
    const cards = Array.from({ length: 5 }, (_, i) => makeCard(i));
    expect(validateData(makeData({ cards })).errors.join()).toMatch(/entre 12 y 20/);
  });

  it("limita el ejemplo a 5 líneas", () => {
    const cards = Array.from({ length: 12 }, (_, i) => makeCard(i));
    cards[0].example = "1\n2\n3\n4\n5\n6";
    expect(validateData(makeData({ cards })).errors.join()).toMatch(/6 líneas/);
  });

  it("detecta glyphs e iconos inexistentes", () => {
    const data = makeData();
    data.cardsBySeries.javascript[0].glyph = "no-existe";
    data.series[0].icon = "inventado";
    const msg = validateData(data).errors.join();
    expect(msg).toMatch(/glyph "no-existe"/);
    expect(msg).toMatch(/simple-icons "inventado"/);
  });

  it("acepta iconos lucide en series con el prefijo lucide:", () => {
    const data = makeData();
    data.series[0].icon = "lucide:database";
    expect(validateData(data).errors).toEqual([]);
  });

  it("detecta etapas con huecos", () => {
    const cards = Array.from({ length: 12 }, (_, i) => makeCard(i, { stage: i < 6 ? 1 : 3 }));
    expect(validateData(makeData({ cards })).errors.join()).toMatch(/sin huecos/);
  });

  it("exige cartas para las series disponibles", () => {
    const data = makeData();
    data.series[1].status = "available";
    expect(validateData(data).errors.join()).toMatch(/no existe cards\/react.json/);
  });
});
