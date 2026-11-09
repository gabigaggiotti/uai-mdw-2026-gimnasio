import { Skeleton } from "@/components/ui/skeleton";

// El esqueleto de la grilla: un título, el buscador y unas tarjetas. No
// tiene que ser exacto, tiene que ocupar el mismo lugar que el contenido.
export default function CargandoGrilla() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72 max-w-full" />
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    </div>
  );
}
