import { Palette } from "lucide-react";
import { Button, Sticker, Title } from "@/components/ui";

// Inicio provisional (Fase 1). La pantalla real llega en fases posteriores.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-8 px-4 py-16">
      <Sticker color="pink" rotate={-5} className="self-start">
        En construcción
      </Sticker>
      <Title as="h1" size="xl" rotate={-1}>
        Stack
        <Title as="span" size="xl" highlight="yellow">
          Packs
        </Title>
      </Title>
      <p className="max-w-lg text-lg">
        Abre sobres cada día, estudia cada carta y hazla evolucionar. Completa series para desbloquear
        tecnologías más avanzadas.
      </p>
      <Button href="/estilos" size="lg" color="teal" className="self-start">
        <Palette size={24} aria-hidden="true" /> Ver guía de estilos
      </Button>
    </main>
  );
}
