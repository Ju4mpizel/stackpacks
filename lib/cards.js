// Utilidades puras de cartas (sirven en servidor y en cliente).

export const RARITY_ORDER = ["common", "uncommon", "rare", "epic", "legendary"];

/** 7 de 14 → "07/14". Rellena con ceros según los dígitos del total (mínimo 2). */
export function formatCardNumber(number, total) {
  const width = Math.max(2, String(total).length);
  return `${String(number).padStart(width, "0")}/${String(total).padStart(width, "0")}`;
}

/** Hash FNV-1a de 32 bits: estable entre servidor y cliente, para variar el arte por carta. */
export function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
