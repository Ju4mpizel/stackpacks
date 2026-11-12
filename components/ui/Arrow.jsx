import { cn } from "@/lib/cn";

/** Flecha "dibujada a mano" en SVG. Decorativa. */
export function Arrow({ className, flip = false }) {
  return (
    <svg
      viewBox="0 0 120 60"
      fill="none"
      aria-hidden="true"
      className={cn("h-12 w-24 text-ink", flip && "-scale-x-100", className)}
    >
      <path
        d="M6 44 C 30 10, 70 6, 104 26"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M88 14 L106 27 L86 36"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
