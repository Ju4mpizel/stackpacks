import { cn } from "@/lib/cn";
import "./pack.css";

// Contornos del sobre en un viewBox de 200 × 300: tira superior (0–44) y cuerpo (44–300),
// con los bordes "crimpados" en zigzag arriba y abajo.
const topEdge = [];
for (let x = 0, i = 0; x <= 200; x += 10, i++) topEdge.push(`L${x} ${i % 2 === 0 ? 8 : 1}`);
const bottomEdge = [];
for (let x = 200, i = 0; x >= 0; x -= 10, i++) bottomEdge.push(`L${x} ${i % 2 === 0 ? 249 : 256}`);

const TOP_PATH = `M0 8 ${topEdge.join(" ")} L200 44 L0 44 Z`;
const BODY_PATH = `M0 0 L200 0 ${bottomEdge.join(" ")} Z`;

/** Tira superior que se arranca. */
export function PackTopFace({ series }) {
  return (
    <>
      <svg className="sp-pack-shape" viewBox="0 0 200 44" preserveAspectRatio="none" aria-hidden="true">
        <path d={TOP_PATH} fill={series.color} stroke="#111" strokeWidth="3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d="M6 44 H194" stroke="#111" strokeWidth="2" strokeDasharray="6 5" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="sp-pack-brand" aria-hidden="true">
        StackPacks
      </span>
    </>
  );
}

/** Cuerpo del sobre con la serie. `iconNode` llega ya renderizado desde el servidor. */
export function PackBodyFace({ series, iconNode, cardsPerPack = 2 }) {
  return (
    <>
      <svg className="sp-pack-shape" viewBox="0 0 200 256" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <pattern id={`pk-${series.id}`} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <rect width="16" height="16" fill={series.color} />
            <rect width="5" height="16" fill="#111" opacity="0.12" />
          </pattern>
        </defs>
        <path
          d={BODY_PATH}
          fill={`url(#pk-${series.id})`}
          stroke="#111"
          strokeWidth="3"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="sp-pack-label">
        <span className="sp-pack-icon">{iconNode}</span>
        <span className="sp-pack-name" style={{ fontSize: `${Math.min(13, 78 / series.name.length)}cqw` }}>
          {series.name}
        </span>
        <span className="sp-pack-badge">{cardsPerPack} cartas</span>
      </div>
    </>
  );
}

/** Sobre cerrado completo (estático). */
export function PackArt({ series, iconNode, className }) {
  return (
    <div className={cn("sp-pack", className)} role="img" aria-label={`Sobre de ${series.name}`}>
      <div className="sp-pack-top">
        <PackTopFace series={series} />
      </div>
      <div className="sp-pack-body">
        <PackBodyFace series={series} iconNode={iconNode} />
      </div>
    </div>
  );
}
