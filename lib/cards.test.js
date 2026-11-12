import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GLYPHS, BRAND_ICONS } from "@/components/card/icons.generated";
import { formatCardNumber, hashString } from "./cards";

describe("formatCardNumber", () => {
  it("rellena con ceros a 2 dígitos", () => {
    expect(formatCardNumber(7, 14)).toBe("07/14");
    expect(formatCardNumber(1, 9)).toBe("01/09");
  });

  it("usa 3 dígitos si el total los tiene", () => {
    expect(formatCardNumber(5, 120)).toBe("005/120");
  });
});

describe("hashString", () => {
  it("es estable y distingue cadenas", () => {
    expect(hashString("js-fetch")).toBe(hashString("js-fetch"));
    expect(hashString("js-fetch")).not.toBe(hashString("js-dom"));
  });
});

describe("icons.generated.js", () => {
  const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
  const series = read("../data/series.json");
  const cards = readdirSync(new URL("../data/cards/", import.meta.url)).flatMap((f) => read(`../data/cards/${f}`));

  it("incluye todos los glyphs de las cartas (si falla: pnpm icons)", () => {
    const missing = cards.map((c) => c.glyph).filter((g) => !GLYPHS[g]);
    expect(missing).toEqual([]);
  });

  it("incluye todos los iconos de las series (si falla: pnpm icons)", () => {
    const missing = series
      .map((s) => s.icon)
      .filter((icon) => (icon.startsWith("lucide:") ? !GLYPHS[icon.slice(7)] : !BRAND_ICONS[icon]));
    expect(missing).toEqual([]);
  });
});
