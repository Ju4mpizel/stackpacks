import { ArrowLeft, Hourglass } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Card, SeriesIcon } from "@/components/card";
import { CardBack } from "@/components/pack/CardBack";
import { PackSceneLoader } from "@/components/pack/PackSceneLoader";
import { SceneSkeleton } from "@/components/pack/SceneSkeleton";
import { Button } from "@/components/ui";
import { getAllSeries, getSeries, getSeriesCards } from "@/lib/data";

export function generateStaticParams() {
  return getAllSeries().map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const series = getSeries(id);
  return { title: series ? `Abrir sobre de ${series.name}` : "Sobre no encontrado" };
}

function BackLink() {
  return (
    <Link href="/" className="inline-flex items-center gap-1 font-bold underline-offset-4 hover:underline">
      <ArrowLeft size={18} aria-hidden="true" /> Inicio
    </Link>
  );
}

// La página es un "App Shell" estático; lo que depende de `params` va dentro de <Suspense>
// para que la navegación sea instantánea (todas las rutas se prerenderizan igualmente).
export default function AbrirPage({ params }) {
  return (
    <main className="mx-auto max-w-3xl overflow-x-clip px-4 pb-20 pt-6">
      <Suspense
        fallback={
          <>
            <div className="mb-4 flex h-8 items-center">
              <BackLink />
            </div>
            <SceneSkeleton />
          </>
        }
      >
        <AbrirContent params={params} />
      </Suspense>
    </main>
  );
}

async function AbrirContent({ params }) {
  const { id } = await params;
  const series = getSeries(id);
  if (!series) notFound();

  const header = (
    <div className="mb-4 flex min-h-8 items-center justify-between gap-3">
      <BackLink />
      <h1 className="font-display text-xl uppercase sm:text-2xl">Sobre de {series.name}</h1>
    </div>
  );

  if (series.status !== "available") {
    return (
      <>
        {header}
        <div className="mx-auto mt-10 max-w-md rounded-brutal-lg border-brutal bg-paper p-6 text-center shadow-brutal-lg">
          <Hourglass size={40} className="mx-auto" aria-hidden="true" />
          <h2 className="mt-3 font-display text-2xl uppercase">Próximamente</h2>
          <p className="mt-3">Las cartas de {series.name} están en preparación.</p>
          <Button href="/" color="yellow" className="mt-5">
            Volver al inicio
          </Button>
        </div>
      </>
    );
  }

  const cards = getSeriesCards(id);
  const seriesView = { id: series.id, name: series.name, color: series.color, icon: series.icon };

  // Solo lo necesario viaja al cliente: catálogo mínimo para sortear y las caras ya renderizadas.
  const catalog = cards.map(({ id: cardId, stage, rarity }) => ({ id: cardId, stage, rarity }));
  const meta = Object.fromEntries(cards.map((c) => [c.id, { title: c.title, rarity: c.rarity }]));
  const faces = Object.fromEntries(
    cards.map((c, i) => [
      c.id,
      <Card
        key={c.id}
        as="div"
        card={c}
        series={seriesView}
        number={i + 1}
        total={cards.length}
        state="revealed"
        tilt={false}
      />,
    ]),
  );
  const requirements = series.requires.map((reqId) => ({
    id: reqId,
    name: getSeries(reqId)?.name ?? reqId,
    cardIds: getSeriesCards(reqId).map((c) => c.id),
  }));

  return (
    <>
      {header}
      <PackSceneLoader
        series={{ id: series.id, name: series.name, color: series.color }}
        catalog={catalog}
        faces={faces}
        meta={meta}
        requirements={requirements}
        back={<CardBack series={seriesView} />}
        iconNode={<SeriesIcon icon={series.icon} className="h-3/5 w-3/5 text-ink" />}
      />
    </>
  );
}
