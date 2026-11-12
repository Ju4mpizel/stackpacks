"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { RevealBurst } from "./RevealBurst";

/**
 * Carta boca abajo que se gira al pulsarla (o con Enter/Espacio).
 * Las legendarias "se cargan" (tiemblan y crecen) antes de girar.
 */
export function FlipCard({ back, face, flipped, onFlip, rarity, label, reduce, autoFocus }) {
  const [charging, setCharging] = useState(false);
  const timer = useRef(null);
  const ref = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (autoFocus) ref.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  const flip = () => {
    if (flipped || charging) return;
    if (rarity === "legendary" && !reduce) {
      setCharging(true);
      timer.current = setTimeout(() => {
        setCharging(false);
        onFlip();
      }, 800);
    } else {
      onFlip();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      flip();
    }
  };

  return (
    <div className="relative isolate" style={{ perspective: 1100 }}>
      {flipped && <RevealBurst rarity={rarity} />}
      <motion.div
        ref={ref}
        role="button"
        tabIndex={flipped ? -1 : 0}
        aria-label={flipped ? undefined : label}
        aria-hidden={flipped ? true : undefined}
        aria-disabled={flipped || undefined}
        onClick={flip}
        onKeyDown={onKeyDown}
        className={`relative block w-full rounded-[10px] ${flipped ? "" : "cursor-pointer"}`}
        animate={
          charging
            ? { rotate: [0, -3, 3, -4, 4, -3, 3, 0], scale: [1, 1.03, 1.04, 1.06, 1.07, 1.09, 1.1, 1.08] }
            : { rotate: 0, scale: flipped && rarity === "legendary" ? [1.12, 1] : 1 }
        }
        transition={charging ? { duration: 0.8, ease: "easeInOut" } : { type: "spring", stiffness: 260, damping: 16 }}
        whileHover={flipped ? undefined : { y: -6 }}
        whileTap={flipped ? undefined : { scale: 0.96 }}
      >
        {/* Brillo de carga de las legendarias (solo opacity) */}
        {rarity === "legendary" && (
          <motion.span
            className="pointer-events-none absolute -inset-3 -z-10 rounded-2xl bg-yellow"
            initial={false}
            animate={{ opacity: charging ? [0, 0.9, 0.5, 1] : 0 }}
            transition={{ duration: 0.8 }}
            aria-hidden="true"
          />
        )}
        <motion.div
          className="relative"
          style={{ transformStyle: "preserve-3d" }}
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>{back}</div>
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            {face}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
