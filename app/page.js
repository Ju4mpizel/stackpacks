import { SeriesIcon } from "@/components/card";
import { HomeDashboard } from "@/components/home/HomeDashboard";
import { Marquee, Sticker } from "@/components/ui";
import { getAllSeries, getSeriesCards } from "@/lib/data";

export default function Home() {
  const all = getAllSeries();
  const cardIdsBySeries = Object.fromEntries(all.map((s) => [s.id, getSeriesCards(s.id).map((c) => c.id)]));
  // Al cliente solo le llega lo necesario para pintar y calcular el progreso.
  const series = all
    .filter((s) => s.status === "available")
    .map(({ id, name, color, tagline, status, requires, icon }) => ({
      id,
      name,
      color,
      tagline,
      status,
      requires,
      iconNode: <SeriesIcon icon={icon} className="h-3/5 w-3/5 text-ink" />,
    }));

  return (
    <main className="overflow-x-clip pb-20">
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:pt-12">
        <header className="relative mb-8">
          <Sticker color="teal" rotate={5} className="absolute -top-3 right-0">
            Nivel 0
          </Sticker>
          <h1 className="font-display text-[2.6rem] uppercase leading-[0.95] sm:text-7xl" style={{ rotate: "-1.5deg" }}>
            Abre.
            <br />
            <span className="inline-block border-brutal bg-yellow px-2 shadow-brutal">Estudia.</span>
            <br />
            Evoluciona.
          </h1>
          <p className="mt-6 max-w-lg text-lg">
            Cada día tienes 2 sobres. Cada carta es un tema corto: léelo, abre la documentación y supera el quiz
            para que evolucione.
          </p>
        </header>

        <HomeDashboard series={series} cardIdsBySeries={cardIdsBySeries} />
      </div>

      <Marquee
        items={["HTML", "CSS", "JavaScript", "Python", "Git", "SQL", "Próximamente: React"]}
        color="pink"
        rotate={-1.5}
        className="mt-20"
      />
    </main>
  );
}
