/** Placeholder de la escena mientras carga el progreso o el código. */
export function SceneSkeleton() {
  return (
    <div className="flex flex-col items-center gap-8 pt-14" aria-hidden="true">
      <div className="aspect-[2/3] w-[min(68vw,280px)] animate-pulse rounded-brutal-lg border-brutal border-dashed bg-cream-dark" />
      <div className="h-16 w-56 animate-pulse rounded-brutal border-brutal bg-cream-dark" />
    </div>
  );
}
