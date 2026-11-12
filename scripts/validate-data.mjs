#!/usr/bin/env node
// Valida /data. Uso:
//   pnpm validate:data          → estructura, ids, requires, quiz, iconos, https
//   pnpm validate:urls          → lo anterior + comprueba que cada docUrl responde 200 (y su #ancla)

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { icons as lucideIcons } from "lucide-react";
import * as simpleIcons from "simple-icons";
import { validateData } from "../lib/validate-data.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "data");
const checkUrls = process.argv.includes("--urls");

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));

const series = await readJson(path.join(dataDir, "series.json"));
const cardsBySeries = {};
for (const file of (await readdir(path.join(dataDir, "cards"))).filter((f) => f.endsWith(".json"))) {
  cardsBySeries[path.basename(file, ".json")] = await readJson(path.join(dataDir, "cards", file));
}

const lucideNames = new Set(Object.keys(lucideIcons));
const simpleIconSlugs = new Set(
  Object.values(simpleIcons)
    .filter((icon) => icon && typeof icon === "object" && icon.slug)
    .map((icon) => icon.slug),
);

const { errors, warnings } = validateData({ series, cardsBySeries, lucideNames, simpleIconSlugs });

if (checkUrls) {
  const urls = [...new Set(Object.values(cardsBySeries).flat().map((c) => c.docUrl))];
  console.log(`Comprobando ${urls.length} URLs...`);
  const pageCache = new Map();

  async function fetchPage(url) {
    if (!pageCache.has(url)) {
      pageCache.set(
        url,
        fetch(url, { headers: { "user-agent": "Mozilla/5.0 (StackPacks link check)" } }).then(async (res) => ({
          status: res.status,
          finalUrl: res.url,
          html: res.ok ? await res.text() : "",
        })),
      );
    }
    return pageCache.get(url);
  }

  const results = await Promise.all(
    urls.map(async (url) => {
      const { hash } = new URL(url);
      const base = url.replace(/#.*$/, "");
      try {
        const page = await fetchPage(base);
        if (page.status !== 200) return `URL ${url} responde ${page.status}`;
        if (hash) {
          const id = decodeURIComponent(hash.slice(1));
          if (!page.html.includes(`id="${id}"`) && !page.html.includes(`name="${id}"`)) {
            return `URL ${url}: la página existe pero no tiene el ancla #${id}`;
          }
        }
        if (page.finalUrl !== base) warnings.push(`URL ${url} redirige a ${page.finalUrl}`);
        return null;
      } catch (e) {
        return `URL ${url}: ${e.message}`;
      }
    }),
  );
  errors.push(...results.filter(Boolean));
}

const totalCards = Object.values(cardsBySeries).reduce((n, cards) => n + cards.length, 0);
for (const w of warnings) console.warn(`⚠  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✗  ${e}`);
  console.error(`\n${errors.length} error(es).`);
  process.exit(1);
}
console.log(
  `✓ Datos válidos: ${series.length} series, ${Object.keys(cardsBySeries).length} con cartas, ${totalCards} cartas.`,
);
