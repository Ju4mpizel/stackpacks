import { ArrowLeft, Hourglass, Package } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BinderGrid } from "@/components/binder/BinderGrid";
import { BinderProgress } from "@/components/binder/BinderProgress";
import { Card, SeriesIcon } from "@/components/card";
import { Button } from "@/components/ui";
import { getAllSeries, getSeries, getSeriesCards } from "@/lib/data";

export function generateStaticParams() {
  return getAllSeries().map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const series = getSeries(id);
  return series
    ? { title: `Colección de ${series.name}`, description: series.tagline }
    : { title: "Serie no encontrada" };
}

function BackLink() {
  return (
    <Link href="/" className="inline-flex items-center gap-1 font-bold underline-offset-4 hover:underline">
      <ArrowLeft size={18} aria-hidden="true" /> Inicio
    </Link>
  );
}

export default function SeriesPage({ params }) {
  return (
    <main className="mx-auto max-w-5xl overflow-x-clip px-4 pb-20 pt-6">
      <Suspense
        fallback={
          <>
            <BackLink />
            <div className="mt-6 h-40 animate-pulse rounded-brutal-lg border-brutal bg-cream-dark" aria-hidden="true" />
          </>
        }
      >
        <SeriesContent params={params} />
      </Suspense>
    </main>
  );
}

async function SeriesContent({ params }) {
  const { id } = await params;
  const series = getSeries(id);
  if (!series) notFound();

  const cards = getSeriesCards(id);
  const seriesView = { id: series.id, name: series.name, color: series.color, icon: series.icon };

  const header = (
    <header className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center gap-4">
        <span
          className="grid size-16 shrink-0 place-items-center rounded-brutal border-brutal shadow-brutal"
          style={{ background: series.color, rotate: "-4deg" }}
        >
          <SeriesIcon icon={series.icon} className="size-9 text-ink" />
        </span>
        <div>
          <h1 className="font-display text-4xl uppercase leading-none sm:text-5xl">{series.name}</h1>
          <p className="mt-1">{series.tagline}</p>
        </div>
      </div>
      {series.status === "available" && (
        <Button href={`/abrir/${series.id}`} color="pink" className="self-start sm:self-auto">
          <Package size={18} aria-hidden="true" /> Abrir sobre
        </Button>
      )}
    </header>
  );

  if (series.status !== "available" || !cards.length) {
    return (
      <>
        <BackLink />
        {header}
        <div className="mt-10 rounded-brutal-lg border-brutal bg-paper p-6 text-center shadow-brutal">
          <Hourglass size={36} className="mx-auto" aria-hidden="true" />
          <p className="mt-3 font-display text-2xl uppercase">Próximamente</p>
          <p className="mt-2">Las cartas de {series.name} están en preparación.</p>
        </div>
      </>
    );
  }

  // Categorías en orden de aparición
  const categoryMap = new Map();
  for (const c of cards) {
    if (!categoryMap.has(c.category)) categoryMap.set(c.category, []);
    categoryMap.get(c.category).push(c.id);
  }
  const categories = [...categoryMap].map(([category, ids]) => ({ category, ids }));

  // Cada carta se renderiza una sola vez (state="dynamic") + su silueta.
  const stageMap = new Map();
  cards.forEach((c, i) => {
    if (!stageMap.has(c.stage)) stageMap.set(c.stage, []);
    const common = { card: c, series: seriesView, number: i + 1, total: cards.length };
    stageMap.get(c.stage).push({
      id: c.id,
      title: c.title,
      card: <Card {...common} as="div" state="dynamic" link />,
      silhouette: <Card {...common} as="div" state="silhouette" />,
    });
  });
  const stages = [...stageMap].map(([stage, slots]) => ({ stage, slots }));

  return (
    <>
      <BackLink />
      {header}
      <div className="mt-8">
        <BinderProgress categories={categories} />
      </div>
      <div className="mt-10">
        <BinderGrid stages={stages} />
      </div>
    </>
  );
}
