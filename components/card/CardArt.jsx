import { hashString } from "@/lib/cards";
import { GLYPHS } from "./icons.generated";
import { SeriesIcon } from "./SeriesIcon";

const PALETTE = ["#FFD23F", "#FF6B9E", "#3BCEAC", "#4D7CFE", "#FF8C42", "#B28DFF"];
const INK = "#111111";
const S = { stroke: INK, strokeWidth: 2.2, strokeLinejoin: "round", strokeLinecap: "round" };

/** Formas geométricas de fondo. 4 composiciones; cuál toca depende del id de la carta. */
function Shapes({ variant, accent, paper }) {
  switch (variant) {
    case 0:
      return (
        <>
          <circle cx="82" cy="14" r="22" fill={accent} {...S} />
          <path d="M-5 70 L30 40 L42 52 L70 24" fill="none" {...S} strokeWidth={3} />
          <rect x="6" y="8" width="12" height="12" fill={paper} {...S} transform="rotate(12 12 14)" />
        </>
      );
    case 1:
      return (
        <>
          <path d="M-4 82 L22 30 L48 82 Z" fill={accent} {...S} />
          <rect x="74" y="8" width="16" height="16" fill={paper} {...S} transform="rotate(-10 82 16)" />
          <rect x="84" y="56" width="10" height="10" fill={accent} {...S} />
          <circle cx="62" cy="12" r="3" fill={INK} />
        </>
      );
    case 2:
      return (
        <>
          <circle cx="50" cy="96" r="34" fill={accent} {...S} />
          <path d="M4 14 l8 -6 l8 6 l8 -6 l8 6 l8 -6" fill="none" {...S} strokeWidth={2.6} />
          <circle cx="88" cy="18" r="8" fill={paper} {...S} />
        </>
      );
    default:
      return (
        <>
          <rect x="62" y="38" width="44" height="44" fill={accent} {...S} transform="rotate(18 84 60)" />
          <circle cx="16" cy="18" r="12" fill="none" {...S} strokeWidth={3} />
          <circle cx="16" cy="18" r="4" fill={paper} {...S} />
          <path d="M60 8 h22" {...S} strokeWidth={3} />
        </>
      );
  }
}

/**
 * Arte de la carta: color de la serie + formas + medallón con el glyph del tema
 * + pegatina con el icono de la tecnología. Todo SVG/CSS, sin imágenes externas.
 */
export function CardArt({ card, series }) {
  const h = hashString(card.id);
  const variant = h % 4;
  const others = PALETTE.filter((c) => c.toLowerCase() !== series.color.toLowerCase());
  const accent = others[(h >>> 3) % others.length];
  const tilt = ((h >>> 7) % 13) - 6; // -6..6 grados
  const Glyph = GLYPHS[card.glyph];
  const patternId = `dots-${card.id}`;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: series.color }}>
      <svg
        viewBox="0 0 100 80"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <pattern id={patternId} width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.9" fill={INK} opacity="0.22" />
          </pattern>
        </defs>
        <rect width="100" height="80" fill={`url(#${patternId})`} />
        <Shapes variant={variant} accent={accent} paper="#FFF6E5" />
      </svg>

      {/* Medallón con el glyph */}
      <div className="absolute inset-0 grid place-items-center">
        <div
          className="grid aspect-square w-[38cqw] place-items-center rounded-full border-[3px] border-ink bg-paper shadow-[3px_3px_0_#111]"
          style={{ rotate: `${tilt}deg` }}
        >
          {Glyph && <Glyph className="h-[55%] w-[55%] text-ink" strokeWidth={2.25} aria-hidden="true" />}
        </div>
      </div>

      {/* Pegatina de la tecnología */}
      <div
        className="absolute bottom-[3cqw] left-[3cqw] grid aspect-square w-[13cqw] place-items-center rounded-[5px] border-2 border-ink bg-paper"
        style={{ rotate: "-8deg" }}
      >
        <SeriesIcon icon={series.icon} className="h-[62%] w-[62%] text-ink" />
      </div>
    </div>
  );
}
