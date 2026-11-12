import { BRAND_ICONS, GLYPHS } from "./icons.generated";

/** Icono de la tecnología: simple-icons por slug, o lucide con prefijo "lucide:". */
export function SeriesIcon({ icon, className, title }) {
  if (icon.startsWith("lucide:")) {
    const Glyph = GLYPHS[icon.slice(7)];
    return Glyph ? <Glyph className={className} strokeWidth={2.5} aria-hidden={title ? undefined : true} /> : null;
  }
  const brand = BRAND_ICONS[icon];
  if (!brand) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d={brand.path} />
    </svg>
  );
}
