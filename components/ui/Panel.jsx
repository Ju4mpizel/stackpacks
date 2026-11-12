import { cn } from "@/lib/cn";
import { BG } from "./colors";

/** Contenedor base: borde 3px, sombra dura. `interactive` añade el efecto presionar. */
export function Panel({
  as: Tag = "div",
  color = "paper",
  interactive = false,
  className,
  children,
  ...props
}) {
  return (
    <Tag
      className={cn(
        "border-brutal rounded-brutal-lg p-5",
        BG[color],
        interactive ? "press cursor-pointer" : "shadow-brutal",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
