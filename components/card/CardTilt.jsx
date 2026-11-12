"use client";

import { useEffect, useRef } from "react";

const MAX_TILT = 12; // grados

/**
 * Inclinación 3D + posición del brillo. No usa estado de React: escribe variables CSS
 * (--mx, --my, --rx, --ry, --holo) directamente en el nodo dentro de un requestAnimationFrame.
 * Ratón/lápiz siguen al puntero; con `gyro` también responde al giroscopio (si el navegador
 * lo permite sin pedir permiso). Con prefers-reduced-motion no hace nada.
 */
export function CardTilt({ children, gyro = false, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let frame = 0;
    const apply = (px, py, active) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${px * 100}%`);
        el.style.setProperty("--my", `${py * 100}%`);
        el.style.setProperty("--rx", `${(0.5 - py) * MAX_TILT * 2}deg`);
        el.style.setProperty("--ry", `${(px - 0.5) * MAX_TILT * 2}deg`);
        el.style.setProperty("--holo", active ? "1" : "0");
        el.dataset.tilting = active ? "true" : "false";
      });
    };

    const onMove = (e) => {
      if (e.pointerType === "touch") return; // en táctil manda el giroscopio
      const r = el.getBoundingClientRect();
      apply((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, true);
    };
    const onLeave = () => apply(0.5, 0.5, false);

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    let onOrient;
    const needsPermission =
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function";
    if (gyro && typeof DeviceOrientationEvent !== "undefined" && !needsPermission) {
      onOrient = (e) => {
        if (e.beta == null || e.gamma == null) return;
        const clamp = (v) => Math.min(1, Math.max(0, v));
        // beta ~45° es sujetar el móvil en la mano; ±25° cubre todo el rango.
        apply(clamp(0.5 + e.gamma / 50), clamp(0.5 + (e.beta - 45) / 50), true);
      };
      window.addEventListener("deviceorientation", onOrient);
    }

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (onOrient) window.removeEventListener("deviceorientation", onOrient);
    };
  }, [gyro]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
