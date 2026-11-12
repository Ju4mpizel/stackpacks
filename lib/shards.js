// Fragmentos: las repetidas dan fragmentos y con ellos se canjea una carta que falte.

export const SHARD_VALUE = {
  common: 5,
  uncommon: 10,
  rare: 20,
  epic: 40,
  legendary: 80,
};

/** Fragmentos que da una repetida de esa rareza. */
export function shardsForDuplicate(rarity) {
  return SHARD_VALUE[rarity] ?? 0;
}

/** Canjear cuesta el doble de lo que da una repetida. */
export function redeemCost(rarity) {
  return shardsForDuplicate(rarity) * 2;
}
