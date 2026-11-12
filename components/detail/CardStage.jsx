"use client";

import { Smartphone } from "lucide-react";
import { useAnimate, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { motionNeedsPermission, requestMotionPermission } from "@/components/card/CardTilt";
import { RevealBurst } from "@/components/pack/RevealBurst";
import { useHydrated } from "@/hooks/useHydrated";
import { cardState } from "@/lib/progress";
import { useProgress } from "@/store/useProgress";

export const EVOLVED_EVENT = "sp:evolved";

/**
 * Carta grande del detalle. `card` es un <Card state="dynamic" gyro /> renderizado en servidor;
 * aquí se le da el estado real y se anima la evolución cuando el quiz la dispara.
 */
export function CardStage({ cardId, card, silhouette }) {
  const hydrated = useHydrated();
  const state = useProgress((s) => cardState(s.cards, cardId));
  const [celebrations, setCelebrations] = useState(0);
  const [motionAsked, setMotionAsked] = useState(false);
  const [scope, animate] = useAnimate();
  const reduce = useReducedMotion();

  useEffect(() => {
    let timer;
    const onEvolved = (e) => {
      if (e.detail !== cardId || !scope.current) return;
      // En móvil el quiz queda debajo: primero se sube la carta a la vista y luego se celebra.
      scope.current.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      timer = setTimeout(
        () => {
          setCelebrations((n) => n + 1);
          if (reduce || !scope.current) return;
          animate(
            scope.current,
            { scale: [1, 1.12, 0.94, 1.05, 1], rotateY: [0, 360] },
            { duration: 1.2, ease: [0.3, 0.7, 0.3, 1] },
          );
          animate(".sp-flash", { opacity: [0, 1, 0] }, { duration: 0.9, times: [0, 0.35, 1] });
        },
        reduce ? 0 : 500,
      );
    };
    window.addEventListener(EVOLVED_EVENT, onEvolved);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(EVOLVED_EVENT, onEvolved);
    };
  }, [cardId, reduce, animate, scope]);

  if (!hydrated) {
    return <div className="animate-pulse opacity-50">{silhouette}</div>;
  }
  if (state === "silhouette") return silhouette;

  return (
    <div className="space-y-4">
      <div className="relative isolate" style={{ perspective: 1200 }}>
        {celebrations > 0 && <RevealBurst key={celebrations} rarity="epic" />}
        <div ref={scope} data-card-state={state} className="relative">
          {card}
          <span
            className="sp-flash pointer-events-none absolute inset-0 rounded-[10px] bg-paper opacity-0"
            aria-hidden="true"
          />
        </div>
      </div>
      {state === "evolved" && motionNeedsPermission() && !motionAsked && (
        <button
          type="button"
          onClick={async () => {
            await requestMotionPermission();
            setMotionAsked(true);
          }}
          className="press mx-auto flex items-center gap-2 rounded-brutal-sm border-brutal bg-paper px-3 py-2 text-sm font-bold"
        >
          <Smartphone size={16} aria-hidden="true" /> Mover el brillo con el móvil
        </button>
      )}
    </div>
  );
}
