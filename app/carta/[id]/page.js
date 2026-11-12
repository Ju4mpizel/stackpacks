import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Card, RARITY } from "@/components/card";
import { CardGate } from "@/components/detail/CardGate";
import { CardStage } from "@/components/detail/CardStage";
import { StudyPanel } from "@/components/detail/StudyPanel";
import { Badge } from "@/components/ui";
import { formatCardNumber } from "@/lib/cards";
import { getAllCardIds, getCardEntry, getSeriesCards } from "@/lib/data";

const CODE_LANG = { html: "HTML", css: "CSS", javascript: "JavaScript", python: "Python", git: "Terminal", sql: "SQL" };
const RARITY_BADGE = { common: "paper", uncommon: "teal", rare: "blue", epic: "lilac", legendary: "yellow" };

export function generateStaticParams() {
  return getAllCardIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const entry = getCardEntry(id);
  if (!entry) return { title: "Carta no encontrada" };
  return { title: `${entry.card.title} · ${entry.series.name}`, description: entry.card.summary };
}

export default function CartaPage({ params }) {
  return (
    <main className="mx-auto max-w-5xl overflow-x-clip px-4 pb-20 pt-6">
      <Suspense
        fallback={<div className="mt-10 h-96 animate-pulse rounded-brutal-lg border-brutal bg-cream-dark" aria-hidden="true" />}
      >
        <CartaContent params={params} />
      </Suspense>
    </main>
  );
}

async function CartaContent({ params }) {
  const { id } = await params;
  const entry = getCardEntry(id);
  if (!entry) notFound();

  const { card, series, number, total } = entry;
  const seriesView = { id: series.id, name: series.name, color: series.color, icon: series.icon };
  const rarity = RARITY[card.rarity];
  const siblings = getSeriesCards(series.id);
  const prev = siblings[number - 2];
  const next = siblings[number];

  const common = { card, series: seriesView, number, total, as: "div" };

  return (
    <>
      <Link
        href={`/series/${series.id}`}
        className="inline-flex items-center gap-1 font-bold underline-offset-4 hover:underline"
      >
        <ArrowLeft size={18} aria-hidden="true" /> Colección de {series.name}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[320px_1fr] lg:items-start">
        <div className="mx-auto w-full max-w-[280px] lg:sticky lg:top-24 lg:max-w-none">
          <CardStage
            cardId={card.id}
            card={<Card {...common} state="dynamic" gyro />}
            silhouette={<Card {...common} state="silhouette" />}
          />
        </div>

        <CardGate cardId={card.id} seriesId={series.id} seriesName={series.name}>
          <article className="space-y-8">
            <header className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge color={RARITY_BADGE[card.rarity]}>
                  {rarity.symbol} {rarity.label}
                </Badge>
                <Badge>{card.category}</Badge>
                <Badge>Etapa {card.stage}</Badge>
                <Badge>{formatCardNumber(number, total)}</Badge>
              </div>
              <h1 className="font-display text-4xl uppercase leading-none sm:text-5xl" style={{ rotate: "-1deg" }}>
                {card.title}
              </h1>
            </header>

            <p className="text-xl leading-relaxed">{card.summary}</p>

            <section aria-labelledby="claves">
              <h2 id="claves" className="mb-3 font-display text-lg uppercase">
                Puntos clave
              </h2>
              <ul className="space-y-2">
                {card.keyPoints.map((point) => (
                  <li key={point} className="flex gap-3 rounded-brutal-sm border-2 border-ink bg-paper px-3 py-2">
                    <span aria-hidden="true" className="font-display" style={{ color: series.color, WebkitTextStroke: "1px #111" }}>
                      ✦
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="ejemplo">
              <div className="mb-3 flex items-center justify-between">
                <h2 id="ejemplo" className="font-display text-lg uppercase">
                  Ejemplo
                </h2>
                <Badge color="ink">{CODE_LANG[series.id] ?? "Código"}</Badge>
              </div>
              <pre className="overflow-x-auto rounded-brutal border-brutal bg-ink p-4 text-sm leading-relaxed text-cream shadow-brutal">
                <code>{card.example}</code>
              </pre>
            </section>

            <StudyPanel cardId={card.id} docUrl={card.docUrl} docLabel={card.docLabel} quiz={card.quiz} />
          </article>
        </CardGate>
      </div>

      <nav aria-label="Otras cartas de la serie" className="mt-14 flex justify-between gap-4 border-t-[3px] border-ink pt-6">
        {prev ? (
          <Link href={`/carta/${prev.id}`} className="inline-flex items-center gap-2 font-bold hover:underline">
            <ArrowLeft size={18} aria-hidden="true" /> Anterior
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/carta/${next.id}`} className="inline-flex items-center gap-2 font-bold hover:underline">
            Siguiente <ArrowRight size={18} aria-hidden="true" />
          </Link>
        )}
      </nav>
    </>
  );
}
