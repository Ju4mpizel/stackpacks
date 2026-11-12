import { describe, expect, it } from "vitest";
import { formatCountdown, localDateKey, msUntilNextReset, needsDailyReset, nextLocalMidnight } from "./dates";

// new Date(año, mes0, día, h, m) usa la hora LOCAL, así los tests valen en cualquier zona horaria.
const at = (h, m = 0, d = 11) => new Date(2026, 10, d, h, m);

describe("localDateKey", () => {
  it("usa el calendario local", () => {
    expect(localDateKey(at(0, 5))).toBe("2026-11-11");
    expect(localDateKey(at(23, 59))).toBe("2026-11-11");
  });
});

describe("nextLocalMidnight / msUntilNextReset", () => {
  it("apunta a la medianoche siguiente", () => {
    const next = nextLocalMidnight(at(22, 30));
    expect(localDateKey(next)).toBe("2026-11-12");
    expect(next.getHours()).toBe(0);
    expect(msUntilNextReset(at(22, 30))).toBe(90 * 60 * 1000);
  });

  it("a medianoche exacta faltan 24 h", () => {
    expect(msUntilNextReset(at(0, 0))).toBe(24 * 3600 * 1000);
  });
});

describe("needsDailyReset", () => {
  it("reinicia si nunca se reinició", () => {
    expect(needsDailyReset(null, at(10))).toBe(true);
  });

  it("no reinicia dos veces el mismo día", () => {
    expect(needsDailyReset("2026-11-11", at(23, 59))).toBe(false);
  });

  it("reinicia al pasar la medianoche local", () => {
    expect(needsDailyReset("2026-11-11", at(0, 1, 12))).toBe(true);
  });
});

describe("formatCountdown", () => {
  it("formatea HH:MM:SS y no baja de cero", () => {
    expect(formatCountdown(3_725_000)).toBe("01:02:05");
    expect(formatCountdown(-5)).toBe("00:00:00");
  });
});
