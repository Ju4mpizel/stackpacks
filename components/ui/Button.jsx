import Link from "next/link";
import { cn } from "@/lib/cn";
import { BG } from "./colors";

const SIZES = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-12 px-5 text-base gap-2",
  lg: "h-16 px-7 text-xl gap-3",
};

/**
 * Botón brutalista con interacción "presionar".
 * Si recibe `href` se renderiza como <Link>.
 */
export function Button({
  color = "yellow",
  size = "md",
  href,
  className,
  children,
  disabled,
  ...props
}) {
  const classes = cn(
    "inline-flex select-none items-center justify-center whitespace-nowrap",
    "border-brutal rounded-brutal font-display uppercase tracking-wide",
    BG[color],
    SIZES[size],
    disabled ? "cursor-not-allowed opacity-50 shadow-brutal-sm" : "press cursor-pointer",
    className,
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
