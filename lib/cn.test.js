import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("une strings y descarta falsy", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("aplana arrays anidados", () => {
    expect(cn("a", ["b", [false, "c"]])).toBe("a b c");
  });

  it("devuelve string vacío sin argumentos válidos", () => {
    expect(cn(false, null)).toBe("");
  });
});
