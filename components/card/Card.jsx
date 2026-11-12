import { Lock } from "lucide-react";
import { formatCardNumber } from "@/lib/cards";
import { cn } from "@/lib/cn";
import { CardArt } from "./CardArt";
import { CardTilt } from "./CardTilt";
import { RARITY } from "./rarity";
import { SeriesIcon } from "./SeriesIcon";
import "./card.css";

/**
 * Carta coleccionable (63:88). Componente de presentación: sirve en Server Components.
 *
 * @param {object}  props
 * @param {object}  props.card     { id, title, category, rarity, glyph, stage }
 * @param {object}  props.series   { name, color, icon }
 * @param {number}  props.number   posición en la serie (1..total)
 * @param {number}  props.total    cartas de la serie
 * @param {"silhouette"|"obtained"|"revealed"|"evolved"|"dynamic"} [props.state]
 *   "revealed": a todo color sin holo (al abrir el sobre).
 *   "dynamic": incluye las capas de apagada y evolucionada; el aspecto lo decide un ancestro con
 *   data-card-state="obtained|evolved" (así el servidor renderiza la carta una sola vez).
 * @param {boolean} [props.tilt]   inclinación 3D + brillo que sigue al puntero (solo evolucionadas)
 * @param {boolean} [props.gyro]   el brillo también sigue al giroscopio
 * @param {boolean} [props.link]   añade la interacción "presionar" (cuando va dentro de un enlace)
 * @param {"article"|"div"} [props.as]
 */
export function Card({
  card,
  series,
  number,
  total,
  state = "evolved",
  tilt = true,
  gyro = false,
  link = false,
  as: Tag = "article",
  className,
}) {
  const rarity = RARITY[card.rarity] ?? RARITY.common;
  const num = formatCardNumber(number, total);
  const style = { "--frame": rarity.frame, "--series": series.color };

  if (state === "silhouette") {
    return (
      <Tag
        className={cn("sp-card relative w-full", className)}
        data-state="silhouette"
        data-link={link || undefined}
        aria-label={`Carta ${num} de ${series.name}, sin descubrir`}
      >
        <div className="sp-tilt">
          <div className="sp-frame" style={style}>
            <div className="sp-silhouette" aria-hidden="true">
              <span className="sp-silhouette-mark">?</span>
              <span className="sp-silhouette-meta">{num}</span>
              <span className="sp-silhouette-meta">Etapa {card.stage}</span>
            </div>
          </div>
        </div>
      </Tag>
    );
  }

  const dynamic = state === "dynamic";
  const evolved = state === "evolved" || dynamic; // capas holográficas
  const locked = state === "obtained" || dynamic; // candado
  const frame = (
    <div className="sp-frame" style={style}>
      <div className="sp-inner">
        <div className="sp-header">
          <p className="sp-title">{card.title}</p>
          <span className="sp-series-icon">
            <SeriesIcon icon={series.icon} className="h-[62%] w-[62%] text-ink" />
          </span>
        </div>

        <div className="sp-art">
          <CardArt card={card} series={series} />
          {evolved && <div className="sp-holo" aria-hidden="true" />}
        </div>

        <div className="sp-info">
          <span className="truncate">{card.category}</span>
          <span className={cn("sp-stamp", rarity.stamp)} aria-hidden="true">
            {rarity.symbol}
          </span>
        </div>

        <div className="sp-footer">
          <span className="truncate">{series.name}</span>
          <span>{num}</span>
        </div>
      </div>

      {evolved && <div className="sp-glare" aria-hidden="true" />}
      {locked && (
        <span className="sp-lock" aria-hidden="true">
          <Lock className="h-[55%] w-[55%]" strokeWidth={2.75} />
        </span>
      )}
    </div>
  );

  const label = [
    card.title,
    series.name,
    rarity.label,
    `carta ${num}`,
    dynamic ? null : evolved ? "evolucionada" : "sin evolucionar",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Tag
      className={cn("sp-card relative w-full", className)}
      data-state={state}
      data-rarity={card.rarity}
      data-link={link || undefined}
      aria-label={label}
    >
      {evolved && tilt ? (
        <CardTilt className="sp-tilt" gyro={gyro}>
          {frame}
        </CardTilt>
      ) : (
        <div className="sp-tilt">{frame}</div>
      )}
    </Tag>
  );
}
