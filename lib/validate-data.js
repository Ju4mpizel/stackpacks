// Validación pura de /data. La usan `pnpm validate:data` y los tests.
// No lee archivos ni hace red: recibe los datos y los catálogos de iconos ya cargados.

export const RARITIES = ["common", "uncommon", "rare", "epic", "legendary"];
export const STATUSES = ["available", "coming-soon"];
export const MIN_CARDS = 12;
export const MAX_CARDS = 20;
export const MAX_EXAMPLE_LINES = 5;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** "chart-column" → "ChartColumn" (nombre de componente en lucide-react). */
export function lucideComponentName(kebab) {
  return kebab
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/** Devuelve las series que forman un ciclo en `requires`, o [] si no hay. */
function findCycle(series) {
  const byId = new Map(series.map((s) => [s.id, s]));
  const state = new Map(); // 1 = visitando, 2 = terminado
  const stack = [];

  function visit(id) {
    if (state.get(id) === 2) return null;
    if (state.get(id) === 1) return stack.slice(stack.indexOf(id)).concat(id);
    state.set(id, 1);
    stack.push(id);
    for (const req of byId.get(id)?.requires ?? []) {
      if (!byId.has(req)) continue;
      const cycle = visit(req);
      if (cycle) return cycle;
    }
    stack.pop();
    state.set(id, 2);
    return null;
  }

  for (const s of series) {
    const cycle = visit(s.id);
    if (cycle) return cycle;
  }
  return [];
}

/**
 * @param {object} input
 * @param {Array} input.series                 contenido de series.json
 * @param {Record<string, Array>} input.cardsBySeries  { [seriesId]: cartas del archivo cards/<id>.json }
 * @param {Set<string>} [input.lucideNames]    nombres de componentes lucide válidos (PascalCase)
 * @param {Set<string>} [input.simpleIconSlugs] slugs válidos de simple-icons
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateData({ series, cardsBySeries, lucideNames, simpleIconSlugs }) {
  const errors = [];
  const warnings = [];
  const err = (msg) => errors.push(msg);

  // ── Series ──
  if (!Array.isArray(series)) {
    return { errors: ["series.json debe ser un array"], warnings };
  }

  const seriesIds = new Set();
  for (const s of series) {
    const where = `serie "${s.id}"`;
    if (!s.id || !ID.test(s.id)) err(`${where}: id inválido`);
    if (seriesIds.has(s.id)) err(`${where}: id repetido`);
    seriesIds.add(s.id);

    if (!s.name) err(`${where}: falta name`);
    if (!Number.isInteger(s.tier) || s.tier < 0) err(`${where}: tier debe ser un entero >= 0`);
    if (!Array.isArray(s.requires)) err(`${where}: requires debe ser un array`);
    if (!HEX_COLOR.test(s.color ?? "")) err(`${where}: color debe ser #RRGGBB`);
    if (!STATUSES.includes(s.status)) err(`${where}: status debe ser ${STATUSES.join(" | ")}`);

    if (typeof s.icon !== "string" || !s.icon) {
      err(`${where}: falta icon`);
    } else if (s.icon.startsWith("lucide:")) {
      const name = lucideComponentName(s.icon.slice(7));
      if (lucideNames && !lucideNames.has(name)) err(`${where}: icono lucide "${s.icon}" no existe`);
    } else if (simpleIconSlugs && !simpleIconSlugs.has(s.icon)) {
      err(`${where}: slug de simple-icons "${s.icon}" no existe`);
    }
  }

  const byId = new Map(series.map((s) => [s.id, s]));
  for (const s of series) {
    for (const req of s.requires ?? []) {
      const parent = byId.get(req);
      if (!parent) {
        err(`serie "${s.id}": requires "${req}" no existe`);
      } else if (parent.tier >= s.tier) {
        err(`serie "${s.id}": requiere "${req}" que no está en un nivel inferior`);
      }
    }
    if (s.tier === 0 && s.requires?.length) err(`serie "${s.id}": el nivel 0 no puede tener requires`);
    if (s.tier > 0 && !s.requires?.length) err(`serie "${s.id}": nivel ${s.tier} sin requires`);
  }

  const cycle = findCycle(series);
  if (cycle.length) err(`ciclo en requires: ${cycle.join(" → ")}`);

  // ── Cartas ──
  const cardIds = new Set();

  for (const [fileId, cards] of Object.entries(cardsBySeries)) {
    const file = `cards/${fileId}.json`;
    if (!seriesIds.has(fileId)) {
      err(`${file}: no hay ninguna serie con id "${fileId}"`);
      continue;
    }
    if (!Array.isArray(cards)) {
      err(`${file}: debe ser un array`);
      continue;
    }
    if (cards.length < MIN_CARDS || cards.length > MAX_CARDS) {
      err(`${file}: tiene ${cards.length} cartas (deben ser entre ${MIN_CARDS} y ${MAX_CARDS})`);
    }

    const stages = new Set();
    let lastStage = 0;

    for (const c of cards) {
      const where = `carta "${c.id}"`;
      if (!c.id || !ID.test(c.id)) err(`${where}: id inválido`);
      if (cardIds.has(c.id)) err(`${where}: id repetido`);
      cardIds.add(c.id);

      if (c.seriesId !== fileId) err(`${where}: seriesId "${c.seriesId}" no coincide con ${file}`);
      for (const field of ["title", "category", "summary", "example", "docLabel", "glyph"]) {
        if (typeof c[field] !== "string" || !c[field].trim()) err(`${where}: falta ${field}`);
      }

      if (!Number.isInteger(c.stage) || c.stage < 1) {
        err(`${where}: stage debe ser un entero >= 1`);
      } else {
        stages.add(c.stage);
        if (c.stage < lastStage) err(`${where}: las cartas deben estar ordenadas por stage`);
        lastStage = c.stage;
      }

      if (!RARITIES.includes(c.rarity)) err(`${where}: rarity "${c.rarity}" no válida`);

      if (!Array.isArray(c.keyPoints) || c.keyPoints.length < 2 || c.keyPoints.length > 4) {
        err(`${where}: keyPoints debe tener entre 2 y 4 elementos`);
      }

      if (typeof c.example === "string") {
        const lines = c.example.split("\n").length;
        if (lines > MAX_EXAMPLE_LINES) err(`${where}: el ejemplo tiene ${lines} líneas (máx. ${MAX_EXAMPLE_LINES})`);
      }

      if (typeof c.summary === "string") {
        const sentences = c.summary.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡<])/).length;
        if (sentences > 2) warnings.push(`${where}: el resumen parece tener más de 2 frases`);
      }

      if (!isHttpsUrl(c.docUrl)) err(`${where}: docUrl debe ser una URL https`);

      if (typeof c.glyph === "string" && lucideNames && !lucideNames.has(lucideComponentName(c.glyph))) {
        err(`${where}: glyph "${c.glyph}" no existe en lucide`);
      }

      if (!Array.isArray(c.quiz) || c.quiz.length < 1 || c.quiz.length > 2) {
        err(`${where}: quiz debe tener 1 o 2 preguntas`);
      } else {
        c.quiz.forEach((q, i) => {
          const qw = `${where}, pregunta ${i + 1}`;
          if (typeof q.q !== "string" || !q.q.trim()) err(`${qw}: falta el enunciado`);
          if (!Array.isArray(q.options) || q.options.length < 2) {
            err(`${qw}: necesita al menos 2 opciones`);
            return;
          }
          if (new Set(q.options).size !== q.options.length) err(`${qw}: opciones repetidas`);
          if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) {
            err(`${qw}: answer ${q.answer} fuera de rango (0..${q.options.length - 1})`);
          }
        });
      }
    }

    // Las etapas deben ser 1..n sin huecos.
    const sorted = [...stages].sort((a, b) => a - b);
    sorted.forEach((st, i) => {
      if (st !== i + 1) err(`${file}: las etapas deben ir de 1 a n sin huecos (encontradas: ${sorted.join(", ")})`);
    });
  }

  // Toda serie disponible necesita sus cartas.
  for (const s of series) {
    if (s.status === "available" && !cardsBySeries[s.id]) {
      err(`serie "${s.id}": está "available" pero no existe cards/${s.id}.json`);
    }
  }

  return { errors: [...new Set(errors)], warnings };
}
