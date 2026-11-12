"use client";

import { motion } from "motion/react";

const COLORS = ["#FFD23F", "#FF6B9E", "#3BCEAC", "#4D7CFE", "#FF8C42", "#B28DFF"];
const LEVEL = { rare: 1, epic: 2, legendary: 3 };

// Pseudoaleatorio estable por índice (sin Math.random en render).
const jitter = (i, salt) => {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Estallido detrás de una carta al revelarla: rayos + confeti, según rareza.
 * Solo anima transform y opacity. Con reduced-motion, MotionConfig lo deja estático.
 */
export function RevealBurst({ rarity }) {
  const level = LEVEL[rarity] ?? 0;
  if (!level) return null;

  const pieces = [0, 0, 10, 20][level];
  const reach = [0, 0, 120, 170][level];

  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      {/* Rayos */}
      <motion.div
        className="sp-rays absolute left-1/2 top-1/2 aspect-square"
        style={{ width: `${[0, 150, 190, 240][level]}%`, x: "-50%", y: "-50%" }}
        initial={{ scale: 0, opacity: 0, rotate: 0 }}
        animate={
          level === 3
            ? { scale: 1, opacity: 1, rotate: 360 }
            : { scale: [0, 1, 1.05], opacity: [0, 1, 0], rotate: 45 }
        }
        transition={
          level === 3
            ? {
                scale: { duration: 0.5, ease: "backOut" },
                opacity: { duration: 0.3 },
                rotate: { duration: 14, ease: "linear", repeat: Infinity },
              }
            : { duration: 1.1, ease: "easeOut" }
        }
      />

      {/* Confeti */}
      {Array.from({ length: pieces }, (_, i) => {
        const angle = (i / pieces) * Math.PI * 2 + jitter(i, 1) * 0.6;
        const dist = reach * (0.6 + jitter(i, 2) * 0.6);
        const shape = i % 3;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 grid place-items-center border-2 border-ink"
            style={{
              width: shape === 2 ? 0 : 12,
              height: shape === 2 ? 0 : 12,
              marginLeft: -6,
              marginTop: -6,
              background: shape === 2 ? "transparent" : COLORS[i % COLORS.length],
              borderRadius: shape === 1 ? 999 : 2,
              borderWidth: shape === 2 ? 0 : 2,
            }}
            initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist + 50,
              scale: [0, 1.2, 1],
              rotate: (i % 2 ? 1 : -1) * (180 + jitter(i, 3) * 180),
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 1.3, delay: 0.2 + jitter(i, 4) * 0.15, ease: [0.15, 0.8, 0.3, 1] }}
          >
            {shape === 2 && (
              <span className="font-display text-xl leading-none" style={{ color: COLORS[i % COLORS.length] }}>
                ✦
              </span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
}
