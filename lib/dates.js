// Fechas en la zona horaria LOCAL del usuario. Todas reciben `now` para poder testearlas.

/** "2026-11-11" según el calendario local (no UTC). */
export function localDateKey(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Próxima medianoche local (respeta cambios de horario de verano). */
export function nextLocalMidnight(now = new Date()) {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next;
}

export function msUntilNextReset(now = new Date()) {
  return nextLocalMidnight(now).getTime() - now.getTime();
}

/** ¿Toca reiniciar? Sí si nunca se reinició o el último reinicio fue otro día local. */
export function needsDailyReset(lastReset, now = new Date()) {
  return lastReset !== localDateKey(now);
}

/** 3_725_000 ms → "01:02:05" */
export function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}
