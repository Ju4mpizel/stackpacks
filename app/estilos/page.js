import { Package, Sparkles, Lock, ArrowRight } from "lucide-react";
import {
  Arrow,
  Badge,
  Button,
  COLOR_NAMES,
  Marquee,
  Panel,
  ProgressBar,
  Sticker,
  Title,
} from "@/components/ui";

export const metadata = {
  title: "Guía de estilos",
  description: "Tokens y componentes neobrutalistas de StackPacks.",
};

const HEX = {
  yellow: "#FFD23F",
  pink: "#FF6B9E",
  teal: "#3BCEAC",
  blue: "#4D7CFE",
  orange: "#FF8C42",
  lilac: "#B28DFF",
};

const SWATCH = {
  yellow: "bg-yellow",
  pink: "bg-pink",
  teal: "bg-teal",
  blue: "bg-blue",
  orange: "bg-orange",
  lilac: "bg-lilac",
};

function Section({ title, children }) {
  return (
    <section className="space-y-5">
      <h2 className="font-display text-2xl uppercase">
        <span className="mr-2 inline-block bg-ink px-2 text-cream">#</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function EstilosPage() {
  return (
    <main className="overflow-x-clip pb-24">
      <Marquee
        items={["StackPacks", "Guía de estilos", "Neobrutalismo", "Sobres diarios", "Cartas que evolucionan"]}
        className="mb-10"
      />

      <div className="mx-auto max-w-5xl space-y-14 px-4">
        {/* Hero */}
        <header className="relative">
          <Sticker color="teal" rotate={-6} className="absolute -top-4 right-2 sm:right-10">
            Fase 1
          </Sticker>
          <Title as="h1" size="xl" rotate={-1.5}>
            Guía de <br />
            <Title as="span" size="xl" highlight="yellow">
              estilos
            </Title>
          </Title>
          <p className="mt-6 max-w-xl text-lg">
            Tokens, tipografías y componentes base. Bordes de 3px, sombras duras y nada de degradados
            violetas.
          </p>
        </header>

        {/* Colores */}
        <Section title="Paleta">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {COLOR_NAMES.map((c) => (
              <div key={c} className="overflow-hidden rounded-brutal border-brutal bg-paper shadow-brutal">
                <div className={`h-20 border-b-[3px] border-ink ${SWATCH[c]}`} />
                <div className="p-2 text-sm">
                  <div className="font-bold capitalize">{c}</div>
                  <code className="text-xs">{HEX[c]}</code>
                </div>
              </div>
            ))}
            <div className="overflow-hidden rounded-brutal border-brutal bg-paper shadow-brutal">
              <div className="h-20 border-b-[3px] border-ink bg-cream" />
              <div className="p-2 text-sm">
                <div className="font-bold">Crema</div>
                <code className="text-xs">#FFF6E5</code>
              </div>
            </div>
            <div className="overflow-hidden rounded-brutal border-brutal bg-paper shadow-brutal">
              <div className="h-20 border-b-[3px] border-ink bg-ink" />
              <div className="p-2 text-sm">
                <div className="font-bold">Tinta</div>
                <code className="text-xs">#111111</code>
              </div>
            </div>
          </div>
        </Section>

        {/* Tipografía */}
        <Section title="Tipografía">
          <Panel className="space-y-4">
            <div>
              <Badge color="yellow">Display · Archivo Black</Badge>
              <p className="mt-2 font-display text-4xl uppercase sm:text-5xl">Abre tu sobre</p>
            </div>
            <div>
              <Badge color="teal">Texto · Space Grotesk</Badge>
              <p className="mt-2 text-lg">
                fetch() pide datos a un servidor y devuelve una Promesa con la respuesta.{" "}
                <strong>Negrita para resaltar.</strong>
              </p>
            </div>
            <div>
              <Badge color="lilac">Código · JetBrains Mono</Badge>
              <pre className="mt-2 overflow-x-auto rounded-brutal-sm border-brutal bg-ink p-4 text-sm text-cream">
                {`const res = await fetch(url);\nconst data = await res.json();`}
              </pre>
            </div>
          </Panel>
        </Section>

        {/* Botones */}
        <Section title="Botones">
          <div className="flex flex-wrap items-center gap-4">
            {COLOR_NAMES.map((c) => (
              <Button key={c} color={c}>
                {c}
              </Button>
            ))}
            <Button color="paper">Paper</Button>
            <Button color="ink">Tinta</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm" color="teal">
              Pequeño
            </Button>
            <Button size="md" color="pink">
              <Sparkles size={18} aria-hidden="true" /> Mediano
            </Button>
            <Button size="lg" color="yellow">
              <Package size={24} aria-hidden="true" /> Abrir sobre
            </Button>
            <Button disabled color="blue">
              <Lock size={18} aria-hidden="true" /> Bloqueado
            </Button>
            <Button href="/" color="orange">
              Enlace <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>
          <p className="text-sm">
            Pasa el ratón para levantar la sombra a 6px y haz clic: el botón se hunde 4px.
          </p>
        </Section>

        {/* Badges y stickers */}
        <Section title="Etiquetas y stickers">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>● común</Badge>
            <Badge color="teal">◆ poco común</Badge>
            <Badge color="blue">★ rara</Badge>
            <Badge color="lilac">★★ épica</Badge>
            <Badge color="yellow">★★★ legendaria</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-6 py-4">
            <Sticker color="pink">¡Nuevo!</Sticker>
            <Sticker color="yellow" rotate={3}>
              2 sobres hoy
            </Sticker>
            <Sticker color="teal" rotate={-2} wiggle>
              Evoluciona
            </Sticker>
            <div className="flex items-center gap-2">
              <Arrow />
              <Sticker color="lilac" rotate={5}>
                ¡Mira!
              </Sticker>
            </div>
          </div>
        </Section>

        {/* Paneles */}
        <Section title="Paneles">
          <div className="grid gap-5 sm:grid-cols-3">
            <Panel>
              <h3 className="font-display text-xl uppercase">Panel</h3>
              <p className="mt-2">Contenedor base con borde de 3px y sombra dura.</p>
            </Panel>
            <Panel color="yellow" interactive tabIndex={0}>
              <h3 className="font-display text-xl uppercase">Interactivo</h3>
              <p className="mt-2">Se levanta en hover y se hunde al pulsar.</p>
            </Panel>
            <Panel color="pink" className="rotate-1">
              <h3 className="font-display text-xl uppercase">Ladeado</h3>
              <p className="mt-2">Desorden controlado: 1–2° de giro.</p>
            </Panel>
          </div>
        </Section>

        {/* Progreso */}
        <Section title="Progreso">
          <Panel className="space-y-4">
            <ProgressBar label="Selectores" value={6} max={6} color="teal" />
            <ProgressBar label="Layout" value={3} max={5} color="yellow" />
            <ProgressBar label="Asincronía" value={1} max={4} color="pink" />
            <ProgressBar label="Por empezar" value={0} max={4} color="blue" />
          </Panel>
        </Section>

        {/* Sombras */}
        <Section title="Sombras y radios">
          <div className="flex flex-wrap items-end gap-6">
            {[
              ["shadow-brutal-sm", "2px"],
              ["shadow-brutal", "4px"],
              ["shadow-brutal-lg", "6px"],
              ["shadow-brutal-xl", "8px"],
            ].map(([cls, label]) => (
              <div
                key={cls}
                className={`grid size-24 place-items-center rounded-brutal border-brutal bg-paper font-mono text-sm ${cls}`}
              >
                {label}
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Marquee
        items={["HTML", "CSS", "JavaScript", "Python", "Git", "SQL"]}
        color="pink"
        rotate={-1.5}
        className="mt-20"
      />
    </main>
  );
}
