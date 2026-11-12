import Link from "next/link";
import { HeaderStats } from "./HeaderStats";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-cream">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
        <Link href="/" className="font-display text-xl uppercase tracking-tight" aria-label="StackPacks, inicio">
          Stack<span className="ml-0.5 inline-block -rotate-3 border-2 border-ink bg-yellow px-1">Packs</span>
        </Link>
        <HeaderStats />
      </div>
    </header>
  );
}
