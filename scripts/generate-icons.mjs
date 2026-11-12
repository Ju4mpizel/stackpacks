#!/usr/bin/env node
// Genera components/card/icons.generated.js con SOLO los iconos que usan los datos:
// - glyphs de las cartas (lucide-react, import con nombre → tree-shaking)
// - iconos de las series (paths de simple-icons copiados, sin importar el paquete en runtime)
// Uso: pnpm icons   (vuelve a ejecutarlo al añadir cartas o series)

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { icons as lucideIcons } from "lucide-react";
import * as simpleIcons from "simple-icons";
import { lucideComponentName } from "../lib/validate-data.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "data");
const outFile = path.join(root, "components", "card", "icons.generated.js");

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));
const series = await readJson(path.join(dataDir, "series.json"));
const cards = [];
for (const file of (await readdir(path.join(dataDir, "cards"))).filter((f) => f.endsWith(".json"))) {
  cards.push(...(await readJson(path.join(dataDir, "cards", file))));
}

// Glyphs lucide: los de las cartas + los de series con prefijo "lucide:"
const glyphs = new Set(cards.map((c) => c.glyph));
for (const s of series) if (s.icon.startsWith("lucide:")) glyphs.add(s.icon.slice(7));
const sortedGlyphs = [...glyphs].sort();
for (const g of sortedGlyphs) {
  if (!lucideIcons[lucideComponentName(g)]) throw new Error(`Glyph "${g}" no existe en lucide`);
}

// Iconos de marca de simple-icons
const bySlug = new Map(
  Object.values(simpleIcons)
    .filter((icon) => icon && typeof icon === "object" && icon.slug)
    .map((icon) => [icon.slug, icon]),
);
const brand = {};
for (const s of series) {
  if (s.icon.startsWith("lucide:")) continue;
  const icon = bySlug.get(s.icon);
  if (!icon) throw new Error(`simple-icons no tiene "${s.icon}"`);
  brand[s.icon] = { title: icon.title, path: icon.path };
}

const components = sortedGlyphs.map(lucideComponentName);
const out = `// AUTO-GENERADO por scripts/generate-icons.mjs — no editar a mano. Ejecuta \`pnpm icons\`.
import {
${components.map((c) => `  ${c},`).join("\n")}
} from "lucide-react";

/** glyph (kebab-case) → componente de lucide-react */
export const GLYPHS = {
${sortedGlyphs.map((g) => `  ${JSON.stringify(g)}: ${lucideComponentName(g)},`).join("\n")}
};

/** slug de simple-icons → { title, path } (viewBox 0 0 24 24) */
export const BRAND_ICONS = ${JSON.stringify(brand, null, 2)};
`;

await writeFile(outFile, out);
console.log(`✓ ${sortedGlyphs.length} glyphs y ${Object.keys(brand).length} iconos de marca → ${path.relative(root, outFile)}`);
