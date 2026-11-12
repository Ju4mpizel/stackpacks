/**
 * Une clases condicionales: cn("a", cond && "b", ["c", null]) → "a b c".
 */
export function cn(...args) {
  const out = [];
  for (const arg of args) {
    if (!arg) continue;
    if (Array.isArray(arg)) {
      const inner = cn(...arg);
      if (inner) out.push(inner);
    } else if (typeof arg === "string" || typeof arg === "number") {
      out.push(String(arg));
    }
  }
  return out.join(" ");
}
