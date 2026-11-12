"use client";

import { Clock, Gem, Library, Lock, Package, Scissors, Sparkles } from "lucide-react";
import { animate, AnimatePresence, motion, MotionConfig, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { RARITY } from "@/components/card/rarity";
import { Arrow, Badge, Button, Sticker } from "@/components/ui";
import { useHydrated } from "@/hooks/useHydrated";
import { useNow } from "@/hooks/useNow";
import { formatCountdown, msUntilNextReset } from "@/lib/dates";
import { isSeriesComplete } from "@/lib/progress";
import { useProgress } from "@/store/useProgress";
import { FlipCard } from "./FlipCard";
import { PackBodyFace, PackTopFace } from "./PackArt";
import { SceneSkeleton } from "./SceneSkeleton";
import "./pack.css";

const TEAR_AT = 0.6; // fracción del recorrido para rasgar al soltar

/** Panel de aviso (sin sobres / bloqueada). */
function Notice({ icon: Icon, title, children, color = "bg-paper" }) {
  return (
    <div className={`mx-auto max-w-md rounded-brutal-lg border-brutal p-6 text-center shadow-brutal-lg ${color}`}>
      <Icon size={40} strokeWidth={2.5} className="mx-auto" aria-hidden="true" />
      <h2 className="mt-3 font-display text-2xl uppercase">{title}</h2>
      <div className="mt-3 space-y-4">{children}</div>
    </div>
  );
}

function NoPacks() {
  const now = useNow();
  return (
    <Notice icon={Clock} title="Sin sobres por hoy">
      <p>Mañana tendrás 2 sobres nuevos. Mientras tanto, estudia tus cartas para hacerlas evolucionar.</p>
      <p className="font-mono text-3xl font-bold tabular-nums">
        {now === null ? "--:--:--" : formatCountdown(msUntilNextReset(new Date(now)))}
      </p>
      <Button href="/" color="yellow">
        Volver al inicio
      </Button>
    </Notice>
  );
}

/** Sobre cerrado con la tira para rasgar arrastrando (o con el botón). */
function SealedPack({ series, iconNode, phase, onTear, back, reduce }) {
  const trackRef = useRef(null);
  const handleRef = useRef(null);
  const x = useMotionValue(0);
  const [maxX, setMaxX] = useState(1);
  const cut = useTransform(x, (v) => Math.min(1, Math.max(0, v / maxX)));
  const torn = phase !== "ready";

  useEffect(() => {
    const measure = () => {
      if (trackRef.current && handleRef.current) {
        setMaxX(Math.max(1, trackRef.current.offsetWidth - handleRef.current.offsetWidth));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, []);

  const onDrag = () => {
    if (x.get() / maxX >= 0.97) onTear();
  };
  const onDragEnd = () => {
    if (x.get() / maxX >= TEAR_AT) onTear();
    else animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
  };

  return (
    <div className="relative mx-auto w-[min(68vw,280px)]">
      <div className="sp-pack">
        {/* Cartas que asoman al rasgar (detrás del cuerpo) */}
        <div className="absolute inset-x-[12%] top-[16%] bottom-[20%]" aria-hidden="true">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-x-0 top-0"
              initial={false}
              animate={torn ? { y: "-38%", rotate: i ? 5 : -5, x: i ? "6%" : "-6%" } : { y: "8%", rotate: 0, x: 0 }}
              transition={{ delay: 0.25 + i * 0.08, type: "spring", stiffness: 180, damping: 18 }}
            >
              {back}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="sp-pack-top"
          initial={false}
          animate={torn ? { x: 90, y: -110, rotate: 32, opacity: 0 } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.3, 0.7, 0.4, 1] }}
        >
          <PackTopFace series={series} />
        </motion.div>

        <motion.div
          className="sp-pack-body"
          initial={false}
          animate={torn ? { scale: [1, 1.04, 1], y: [0, 6, 0] } : { scale: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <PackBodyFace series={series} iconNode={iconNode} />
        </motion.div>

        {/* Línea de corte + tirador */}
        {!torn && (
          <>
            <motion.div className="sp-pack-cut" style={{ scaleX: cut }} aria-hidden="true" />
            <div
              ref={trackRef}
              className="absolute left-[2%] right-[2%] h-12"
              style={{ top: "calc(44 / 300 * 100% - 24px)" }}
            >
              <motion.div
                ref={handleRef}
                className="grid size-12 cursor-grab touch-none place-items-center rounded-full border-brutal bg-paper shadow-brutal active:cursor-grabbing"
                style={{ x }}
                drag="x"
                dragConstraints={trackRef}
                dragElastic={0}
                dragMomentum={false}
                onDrag={onDrag}
                onDragEnd={onDragEnd}
                animate={reduce ? undefined : { rotate: [0, -12, 0] }}
                transition={{ rotate: { duration: 1.4, repeat: Infinity, ease: "easeInOut" } }}
                aria-hidden="true"
              >
                <Scissors size={22} strokeWidth={2.5} />
              </motion.div>
            </div>
          </>
        )}
      </div>

      {!torn && (
        <div className="pointer-events-none absolute -top-14 left-6 flex items-start gap-0" aria-hidden="true">
          <Arrow flip className="mt-5 h-9 w-14 rotate-[-35deg]" />
          <Sticker color="yellow" rotate={4} className="whitespace-nowrap text-xs">
            Desliza para rasgar
          </Sticker>
        </div>
      )}
    </div>
  );
}

/**
 * Escena de abrir sobre. Se carga con next/dynamic (solo cliente).
 * @param {object} props
 * @param {{id, name, color}} props.series
 * @param {Array<{id, stage, rarity}>} props.catalog  lo mínimo para sortear
 * @param {Record<string, React.ReactNode>} props.faces  caras de las cartas (renderizadas en servidor)
 * @param {Record<string, {title, rarity}>} props.meta
 * @param {Array<{id, name, cardIds}>} props.requirements
 * @param {React.ReactNode} props.back  reverso
 * @param {React.ReactNode} props.iconNode
 */
export default function PackScene({ series, catalog, faces, meta, requirements, back, iconNode }) {
  const hydrated = useHydrated();
  const packs = useProgress((s) => s.packs.available);
  const cards = useProgress((s) => s.cards);
  const openPack = useProgress((s) => s.openPack);
  const reduce = useReducedMotion();

  const [phase, setPhase] = useState("ready"); // ready → tearing → reveal
  const [result, setResult] = useState(null);
  const [flipped, setFlipped] = useState([]);
  const [announce, setAnnounce] = useState("");
  const timer = useRef(null);
  const doneRef = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const allFlipped = flipped.length > 0 && flipped.every(Boolean);
  useEffect(() => {
    if (allFlipped) doneRef.current?.focus({ preventScroll: true });
  }, [allFlipped]);

  if (!hydrated) return <SceneSkeleton />;

  const unlocked = requirements.every((r) => isSeriesComplete(r.cardIds, cards));
  if (!unlocked) {
    return (
      <Notice icon={Lock} title="Serie bloqueada">
        <p>
          Completa antes:{" "}
          {requirements.map((r) => `${r.name} ${isSeriesComplete(r.cardIds, cards) ? "✅" : "⏳"}`).join(" · ")}
        </p>
        <Button href="/" color="yellow">
          Volver al inicio
        </Button>
      </Notice>
    );
  }

  if (!result && packs <= 0) return <NoPacks />;

  const tear = () => {
    if (phase !== "ready") return;
    const res = openPack(catalog);
    if (!res) return;
    setResult(res);
    setFlipped(res.opened.map(() => false));
    setPhase("tearing");
    timer.current = setTimeout(() => setPhase("reveal"), reduce ? 50 : 1100);
  };

  const flipAt = (i) => {
    setFlipped((prev) => prev.map((v, j) => (j === i ? true : v)));
    const o = result.opened[i];
    const m = meta[o.id];
    setAnnounce(
      `${m.title}, ${RARITY[m.rarity].label}. ${o.isNew ? "¡Carta nueva!" : `Repetida: +${o.shards} fragmentos.`}`,
    );
  };

  const flipAll = () => {
    result.opened.forEach((_, i) => {
      if (!flipped[i]) setTimeout(() => flipAt(i), reduce ? 0 : i * 350);
    });
  };

  const again = () => {
    setResult(null);
    setFlipped([]);
    setAnnounce("");
    setPhase("ready");
  };

  const firstUnflipped = flipped.findIndex((v) => !v);

  return (
    <MotionConfig reducedMotion="user">
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      <AnimatePresence mode="wait" initial={false}>
        {phase !== "reveal" ? (
          <motion.section
            key="pack"
            aria-label={`Sobre de ${series.name}`}
            className="flex flex-col items-center gap-8 pt-14"
            exit={{ y: 220, rotate: 6, opacity: 0, transition: { duration: 0.35, ease: "easeIn" } }}
          >
            <SealedPack
              series={series}
              iconNode={iconNode}
              phase={phase}
              onTear={tear}
              back={back}
              reduce={reduce}
            />
            <Button size="lg" color="pink" onClick={tear} disabled={phase !== "ready"}>
              <Scissors size={22} aria-hidden="true" /> Rasgar sobre
            </Button>
            <p className="text-sm font-bold">
              Te quedan {packs} {packs === 1 ? "sobre" : "sobres"} hoy
            </p>
          </motion.section>
        ) : (
          <motion.section key="cards" aria-label="Cartas del sobre" className="space-y-8">
            {result.pityTriggered && (
              <div className="text-center">
                <Badge color="yellow">
                  <Sparkles size={14} aria-hidden="true" /> Garantía activada: ¡rara asegurada!
                </Badge>
              </div>
            )}

            <ul className="mx-auto grid max-w-xl grid-cols-2 gap-4 px-1 sm:gap-10">
              {result.opened.map((o, i) => {
                const m = meta[o.id];
                const rarity = RARITY[m.rarity];
                return (
                  <motion.li
                    key={o.id}
                    className="flex flex-col items-center gap-4"
                    initial={{ y: 120, scale: 0.7, opacity: 0, rotate: i ? 10 : -10 }}
                    animate={{ y: 0, scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 170, damping: 17, delay: i * 0.12 }}
                  >
                    <div className="w-full">
                      <FlipCard
                        back={back}
                        face={faces[o.id]}
                        flipped={flipped[i]}
                        onFlip={() => flipAt(i)}
                        rarity={m.rarity}
                        label={`Revelar carta ${i + 1} de ${result.opened.length}`}
                        reduce={reduce}
                        autoFocus={i === firstUnflipped && i > 0}
                      />
                    </div>

                    <div className="flex min-h-16 flex-col items-center gap-2 text-center">
                      {flipped[i] && (
                        <motion.div
                          className="flex flex-col items-center gap-2"
                          initial={{ y: -16, opacity: 0, scale: 0.8 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 14, delay: 0.45 }}
                        >
                          {m.rarity === "legendary" || m.rarity === "epic" ? (
                            <Sticker
                              color={m.rarity === "legendary" ? "yellow" : "lilac"}
                              rotate={-5}
                              className="whitespace-nowrap text-xs sm:text-sm"
                            >
                              ¡{rarity.label}! {rarity.symbol}
                            </Sticker>
                          ) : null}
                          {o.isNew ? (
                            <Sticker color="pink" rotate={3} className="text-xs">
                              ¡Nueva!
                            </Sticker>
                          ) : (
                            <Badge color="paper">
                              Repetida · +{o.shards} <Gem size={12} aria-label="fragmentos" />
                            </Badge>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </ul>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {!allFlipped ? (
                <Button color="yellow" onClick={flipAll}>
                  <Sparkles size={18} aria-hidden="true" /> Revelar todo
                </Button>
              ) : (
                <motion.div
                  className="flex flex-wrap items-center justify-center gap-4"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button ref={doneRef} href={`/series/${series.id}`} color="teal">
                    <Library size={18} aria-hidden="true" /> Ver mi colección
                  </Button>
                  {packs > 0 ? (
                    <Button color="pink" onClick={again}>
                      <Package size={18} aria-hidden="true" /> Abrir otro ({packs})
                    </Button>
                  ) : (
                    <Button href="/" color="paper">
                      Volver al inicio
                    </Button>
                  )}
                </motion.div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
