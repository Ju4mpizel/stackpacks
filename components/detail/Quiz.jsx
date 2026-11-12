"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { hashString } from "@/lib/cards";
import { cn } from "@/lib/cn";
import { createRng } from "@/lib/packs";

/** Orden de opciones barajado de forma determinista por pregunta e intento (render puro). */
function shuffledOrder(question, attempt) {
  const rng = createRng(hashString(`${question.q}#${attempt}`));
  const order = question.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * Mini quiz. Llama a `onPass` si todas las respuestas son correctas.
 * Si falla, marca los errores y deja reintentar al momento (con las opciones rebarajadas).
 */
export default function Quiz({ questions, onPass }) {
  const [attempt, setAttempt] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const orders = useMemo(() => questions.map((q) => shuffledOrder(q, attempt)), [questions, attempt]);
  const complete = questions.every((_, i) => answers[i] !== undefined);

  const check = (e) => {
    e.preventDefault();
    const correct = questions.map((q, i) => answers[i] === q.answer);
    const passed = correct.every(Boolean);
    setResult({ correct, passed });
    if (passed) onPass();
  };

  const retry = () => {
    setAttempt((a) => a + 1);
    setAnswers({});
    setResult(null);
  };

  const failed = result && !result.passed;

  return (
    <motion.form
      key={attempt}
      onSubmit={check}
      className="space-y-5"
      animate={failed ? { x: [0, -12, 12, -8, 8, -4, 0] } : { x: 0 }}
      transition={{ duration: 0.45 }}
    >
      {questions.map((q, qi) => (
        <fieldset key={qi} className="space-y-2" disabled={Boolean(result)}>
          <legend className="mb-2 font-bold">{q.q}</legend>
          {orders[qi].map((oi) => {
            const chosen = answers[qi] === oi;
            const showRight = failed && result.correct[qi] && chosen;
            const showWrong = failed && !result.correct[qi] && chosen;
            return (
              <label
                key={oi}
                className={cn(
                  "relative flex min-h-12 cursor-pointer items-center gap-3 rounded-brutal-sm border-brutal px-3 py-2 transition-transform",
                  "has-[:focus-visible]:outline has-[:focus-visible]:outline-4 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue",
                  showWrong
                    ? "bg-pink shadow-brutal-sm"
                    : showRight
                      ? "bg-teal shadow-brutal-sm"
                      : chosen
                        ? "bg-yellow shadow-brutal-sm"
                        : "bg-paper hover:-translate-y-0.5",
                  result && "cursor-default",
                )}
              >
                <input
                  type="radio"
                  name={`q${qi}`}
                  value={oi}
                  checked={chosen}
                  onChange={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border-2 border-ink",
                    chosen ? "bg-ink text-cream" : "bg-paper",
                  )}
                  aria-hidden="true"
                >
                  {showRight ? <Check size={14} strokeWidth={3} /> : showWrong ? <X size={14} strokeWidth={3} /> : null}
                </span>
                <span>{q.options[oi]}</span>
                {showWrong && <span className="sr-only">(incorrecta)</span>}
                {showRight && <span className="sr-only">(correcta)</span>}
              </label>
            );
          })}
        </fieldset>
      ))}

      <div aria-live="polite">
        {failed && (
          <p className="mb-3 rounded-brutal-sm border-brutal bg-pink px-3 py-2 font-bold">
            {result.correct.filter(Boolean).length} de {questions.length} correctas. Repasa y vuelve a intentarlo.
          </p>
        )}
      </div>

      {failed ? (
        <Button color="yellow" onClick={retry}>
          <RotateCcw size={18} aria-hidden="true" /> Reintentar
        </Button>
      ) : (
        <Button type="submit" color="teal" disabled={!complete || Boolean(result)}>
          <Check size={18} aria-hidden="true" /> Comprobar
        </Button>
      )}
    </motion.form>
  );
}
