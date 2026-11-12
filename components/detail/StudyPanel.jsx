"use client";

import { BookOpen, Check, ExternalLink, Lock, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { useProgress } from "@/store/useProgress";
import { EVOLVED_EVENT } from "./CardStage";

// El quiz se carga aparte, solo cuando hace falta.
const Quiz = dynamic(() => import("./Quiz"), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse rounded-brutal border-brutal bg-cream-dark" aria-hidden="true" />,
});

function Step({ n, done, title, children }) {
  return (
    <li className="relative pl-12">
      <span
        className={cn(
          "absolute left-0 top-0 grid size-9 place-items-center rounded-full border-brutal font-display",
          done ? "bg-teal" : "bg-paper",
        )}
        aria-hidden="true"
      >
        {done ? <Check size={18} strokeWidth={3} /> : n}
      </span>
      <h3 className="pt-1.5 font-display text-lg uppercase leading-tight">
        {title}
        {done && <span className="sr-only"> (hecho)</span>}
      </h3>
      <div className="mt-2">{children}</div>
    </li>
  );
}

/** Pasos para evolucionar: abrir la documentación → responder el quiz. */
export function StudyPanel({ cardId, docUrl, docLabel, quiz }) {
  const entry = useProgress((s) => s.cards[cardId]);
  const markDocOpened = useProgress((s) => s.markDocOpened);
  const evolveCard = useProgress((s) => s.evolveCard);
  const [announce, setAnnounce] = useState("");

  const docOpened = Boolean(entry?.docOpened);
  const evolved = Boolean(entry?.evolved);

  const onPass = () => {
    if (evolveCard(cardId)) {
      window.dispatchEvent(new CustomEvent(EVOLVED_EVENT, { detail: cardId }));
      setAnnounce("¡Carta evolucionada!");
    }
  };

  return (
    <section aria-labelledby="estudiar" className="rounded-brutal-lg border-brutal bg-cream p-5 shadow-brutal">
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
      <h2 id="estudiar" className="flex items-center gap-2 font-display text-2xl uppercase">
        <Sparkles size={22} aria-hidden="true" /> Hazla evolucionar
      </h2>

      <ol className="mt-5 space-y-6">
        <Step n={1} done={docOpened} title="Lee la documentación">
          <a
            href={docUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => markDocOpened(cardId)}
            onAuxClick={() => markDocOpened(cardId)}
            className={cn(
              "press inline-flex min-h-12 items-center gap-2 rounded-brutal border-brutal px-4 py-2 font-display uppercase",
              docOpened ? "bg-paper" : "bg-yellow",
            )}
          >
            <BookOpen size={20} aria-hidden="true" />
            Leer documentación
            <ExternalLink size={16} aria-hidden="true" />
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
          <p className="mt-2 text-sm">{docLabel}</p>
        </Step>

        <Step n={2} done={evolved} title="Supera el quiz">
          {evolved ? (
            <p className="inline-flex items-center gap-2 rounded-brutal-sm border-brutal bg-yellow px-3 py-2 font-bold shadow-brutal-sm">
              <Sparkles size={18} aria-hidden="true" /> ¡Evolucionada! Ya tiene su acabado holográfico.
            </p>
          ) : docOpened ? (
            <Quiz questions={quiz} onPass={onPass} />
          ) : (
            <p className="flex items-center gap-2 rounded-brutal-sm border-2 border-dashed border-ink/50 px-3 py-3 text-sm font-bold">
              <Lock size={16} aria-hidden="true" /> Abre la documentación para desbloquear el quiz.
            </p>
          )}
        </Step>
      </ol>
    </section>
  );
}
