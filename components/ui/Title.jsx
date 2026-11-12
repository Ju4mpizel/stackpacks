import { cn } from "@/lib/cn";

const SIZES = {
  xl: "text-5xl sm:text-7xl",
  lg: "text-4xl sm:text-5xl",
  md: "text-2xl sm:text-3xl",
};

/**
 * Título display. `highlight` pinta un bloque de color detrás; `rotate` lo ladea 1–2°.
 */
export function Title({ as: Tag = "h2", size = "lg", rotate = 0, highlight, className, children }) {
  const hl = {
    yellow: "bg-yellow",
    pink: "bg-pink",
    teal: "bg-teal",
    blue: "bg-blue",
    orange: "bg-orange",
    lilac: "bg-lilac",
  }[highlight];

  return (
    <Tag
      className={cn("font-display uppercase", SIZES[size], className)}
      style={rotate ? { rotate: `${rotate}deg` } : undefined}
    >
      {hl ? (
        <span className={cn("box-decoration-clone border-brutal px-2 shadow-brutal", hl)}>{children}</span>
      ) : (
        children
      )}
    </Tag>
  );
}
