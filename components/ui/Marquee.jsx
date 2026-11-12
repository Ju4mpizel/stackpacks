import { cn } from "@/lib/cn";
import { BG } from "./colors";

/**
 * Cinta con texto que se desplaza. Se duplica el contenido para un bucle continuo;
 * la copia está oculta a lectores de pantalla. Con reduced-motion queda estática.
 */
export function Marquee({ items, color = "yellow", rotate = 0, className }) {
  const row = (hidden) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-6 px-3 font-display text-lg uppercase">
          <span>{item}</span>
          <span aria-hidden="true">✦</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={cn("overflow-hidden border-y-[3px] border-ink py-2", BG[color], className)}
      style={rotate ? { rotate: `${rotate}deg` } : undefined}
    >
      <div className="flex w-max motion-safe:animate-marquee">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
